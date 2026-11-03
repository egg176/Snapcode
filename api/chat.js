const GEMINI_MODEL = 'gemini-3.8-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 4000;
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;
const SYSTEM_PROMPT = 'You are Snapcode AI, a friendly assistant for learning and creating with Scratch-style visual programming. Explain ideas clearly for beginners. Give safe, age-appropriate help. Do not claim to inspect or change the user project unless tools actually provide that ability. When describing Scratch code, explain which blocks to use and how to connect them.';

// Best-effort per-instance limit. Configure provider and deployment-level
// usage limits as well; serverless instances do not share this memory.
const requestCounts = new Map();

function sendJson (res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
}

function getClientKey (req) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown';
    return ip || 'unknown';
}

function isRateLimited (req) {
    const now = Date.now();
    const key = getClientKey(req);
    const current = requestCounts.get(key);
    if (!current || now - current.startedAt >= WINDOW_MS) {
        requestCounts.set(key, {startedAt: now, count: 1});
        return false;
    }
    current.count += 1;
    return current.count > MAX_REQUESTS_PER_WINDOW;
}

function isSameOrigin (req) {
    const origin = req.headers.origin;
    const host = req.headers.host;
    if (!origin || !host) return true;
    try {
        return new URL(origin).host === host;
    } catch (error) {
        return false;
    }
}

function providerError (provider, status, message) {
    const error = new Error(message);
    error.provider = provider;
    error.status = status;
    error.retryable = status === 429 || status >= 500 || status === 0;
    return error;
}

async function callGemini (messages, apiKey) {
    const contents = messages.map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{text: message.content.trim()}]
    }));

    let response;
    try {
        response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    systemInstruction: {parts: [{text: SYSTEM_PROMPT}]},
                    contents,
                    generationConfig: {maxOutputTokens: 900, temperature: 0.7}
                }),
                signal: AbortSignal.timeout(30000)
            }
        );
    } catch (error) {
        throw providerError('Gemini', 0, error.message);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = result && result.error && result.error.message;
        console.error('Gemini API request failed:', response.status, message || 'No provider details');
        throw providerError('Gemini', response.status, 'Gemini could not answer right now.');
    }

    const answer = result && result.candidates && result.candidates[0] &&
        result.candidates[0].content && result.candidates[0].content.parts
            .map(part => part.text || '')
            .join('')
            .trim();

    if (!answer) {
        throw providerError('Gemini', 502, 'Gemini did not return a text response.');
    }
    return {text: answer, provider: 'gemini', model: GEMINI_MODEL};
}

async function callGroq (messages, apiKey) {
    let response;
    try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{role: 'system', content: SYSTEM_PROMPT}].concat(
                    messages.map(message => ({
                        role: message.role,
                        content: message.content.trim()
                    }))
                ),
                max_tokens: 900,
                temperature: 0.7
            }),
            signal: AbortSignal.timeout(30000)
        });
    } catch (error) {
        throw providerError('Groq', 0, error.message);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = result && result.error && result.error.message;
        console.error('Groq API request failed:', response.status, message || 'No provider details');
        throw providerError('Groq', response.status, 'Groq could not answer right now.');
    }

    const answer = result && result.choices && result.choices[0] &&
        result.choices[0].message && result.choices[0].message.content;

    if (typeof answer !== 'string' || !answer.trim()) {
        throw providerError('Groq', 502, 'Groq did not return a text response.');
    }
    return {text: answer.trim(), provider: 'groq', model: GROQ_MODEL};
}

module.exports = async function handler (req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return sendJson(res, 405, {error: 'Use POST to send a chat message.'});
    }

    if (!isSameOrigin(req)) {
        return sendJson(res, 403, {error: 'This request origin is not allowed.'});
    }

    if (isRateLimited(req)) {
        return sendJson(res, 429, {error: 'Too many messages too quickly. Please wait a minute and try again.'});
    }

    const messages = req.body && req.body.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
        return sendJson(res, 400, {error: 'Send between 1 and 12 chat messages.'});
    }

    for (const message of messages) {
        if (!message || (message.role !== 'user' && message.role !== 'assistant') ||
            typeof message.content !== 'string' ||
            !message.content.trim() ||
            message.content.length > MAX_MESSAGE_LENGTH) {
            return sendJson(res, 400, {error: 'A message was invalid or too long.'});
        }
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
        return sendJson(res, 503, {
            error: 'AI is not configured yet. Add GEMINI_API_KEY and/or GROQ_API_KEY to the server environment.'
        });
    }

    let primaryError = null;
    if (geminiKey) {
        try {
            const result = await callGemini(messages, geminiKey);
            return sendJson(res, 200, result);
        } catch (error) {
            primaryError = error;
            console.warn('Gemini unavailable; checking backup provider:', error.status || 'network error');
            if (!error.retryable) {
                return sendJson(res, 502, {error: 'Gemini is not configured correctly. Please check its server-side API key.'});
            }
        }
    }

    if (groqKey) {
        try {
            const result = await callGroq(messages, groqKey);
            return sendJson(res, 200, result);
        } catch (error) {
            console.error('Groq backup failed:', error.status || 'network error');
            return sendJson(res, 503, {
                error: 'Both AI providers are unavailable right now. Please try again later.'
            });
        }
    }

    return sendJson(res, 503, {
        error: primaryError
            ? 'Gemini is temporarily unavailable and no backup AI is configured yet.'
            : 'No AI provider is configured.'
    });
};
