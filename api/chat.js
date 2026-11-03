const MODEL = 'gemini-3.8-flash';
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 4000;
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return sendJson(res, 503, {error: 'Gemini is not configured yet. Add GEMINI_API_KEY to the server environment.'});
    }

    const messages = req.body && req.body.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
        return sendJson(res, 400, {error: 'Send between 1 and 12 chat messages.'});
    }

    const contents = [];
    for (const message of messages) {
        if (!message || (message.role !== 'user' && message.role !== 'assistant') ||
            typeof message.content !== 'string' ||
            !message.content.trim() ||
            message.content.length > MAX_MESSAGE_LENGTH) {
            return sendJson(res, 400, {error: 'A message was invalid or too long.'});
        }
        contents.push({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{text: message.content.trim()}]
        });
    }

    try {
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: 'You are Snapcode AI, a friendly assistant for learning and creating with Scratch-style visual programming. Explain ideas clearly for beginners. Give safe, age-appropriate help. Do not claim to inspect or change the user project unless tools actually provide that ability. When describing Scratch code, explain which blocks to use and how to connect them.'
                        }]
                    },
                    contents,
                    generationConfig: {
                        maxOutputTokens: 900,
                        temperature: 0.7
                    }
                }),
                signal: AbortSignal.timeout(30000)
            }
        );

        const result = await response.json();
        if (!response.ok) {
            const providerMessage = result && result.error && result.error.message;
            console.error('Gemini API request failed:', response.status, providerMessage || 'No provider details');
            if (response.status === 429) {
                return sendJson(res, 429, {error: 'Gemini usage is temporarily limited. Please try again later.'});
            }
            return sendJson(res, 502, {error: 'Gemini could not answer right now. Please try again later.'});
        }

        const answer = result && result.candidates && result.candidates[0] &&
            result.candidates[0].content && result.candidates[0].content.parts
                .map(part => part.text || '')
                .join('')
                .trim();

        if (!answer) {
            return sendJson(res, 502, {error: 'Gemini did not return a text response. Try rephrasing your message.'});
        }

        return sendJson(res, 200, {text: answer, model: MODEL});
    } catch (error) {
        console.error('Gemini request error:', error.message);
        return sendJson(res, 502, {error: 'Could not reach Gemini. Check the connection and try again.'});
    }
};
