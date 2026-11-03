import PropTypes from 'prop-types';
import React from 'react';

import styles from './ai-chat-panel.css';

class AIChatPanel extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            draft: '',
            messages: [],
            isSending: false,
            error: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange (event) {
        this.setState({draft: event.target.value});
    }

    async handleSubmit (event) {
        event.preventDefault();
        const text = this.state.draft.trim();
        if (!text || this.state.isSending) return;

        const messages = this.state.messages.concat([{id: Date.now(), role: 'user', text}]);
        this.setState({draft: '', messages, isSending: true, error: ''});

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    messages: messages.slice(-12).map(message => ({
                        role: message.role,
                        content: message.text
                    }))
                })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'The AI request failed.');
            }
            this.setState(state => ({
                messages: state.messages.concat([{
                    id: Date.now() + 1,
                    role: 'assistant',
                    text: result.text
                }]),
                isSending: false
            }));
        } catch (error) {
            this.setState({
                isSending: false,
                error: error.message || 'Something went wrong. Please try again.'
            });
        }
    }

    render () {
        return (
            <aside aria-label="Snapcode AI chat" className={styles.panel}>
                <div className={styles.header}>
                    <div className={styles.heading}>
                        <span className={styles.sparkle}>✦</span>
                        <div>
                            <div className={styles.title}>Snapcode AI</div>
                            <div className={styles.subtitle}>Gemini 3.8 Flash</div>
                        </div>
                    </div>
                    <button
                        aria-label="Close AI chat"
                        className={styles.close}
                        onClick={this.props.onClose}
                        type="button"
                    >×</button>
                </div>
                <div aria-live="polite" className={styles.conversation}>
                    {this.state.messages.length === 0 ? (
                        <div className={styles.welcome}>
                            <div className={styles.welcomeIcon}>✦</div>
                            <h2>What are we making?</h2>
                            <p>Ask for help with Scratch blocks, ideas, or debugging your project.</p>
                            <div className={styles.suggestions}>
                                <button onClick={() => this.setState({draft: 'Help me make a platformer'})} type="button">Help me make a platformer</button>
                                <button onClick={() => this.setState({draft: 'Explain how Scratch variables work'})} type="button">Explain this script</button>
                                <button onClick={() => this.setState({draft: 'How can I find bugs in my Scratch project?'})} type="button">Find a bug in my project</button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.messageList}>
                            {this.state.messages.map(message => (
                                <div
                                    className={message.role === 'user' ? styles.userMessage : styles.assistantMessage}
                                    key={message.id}
                                >
                                    {message.text}
                                </div>
                            ))}
                            {this.state.isSending ? (
                                <div className={styles.assistantMessage}>Thinking…</div>
                            ) : null}
                        </div>
                    )}
                    {this.state.error ? (
                        <div className={styles.error} role="alert">{this.state.error}</div>
                    ) : null}
                </div>
                <form className={styles.composer} onSubmit={this.handleSubmit}>
                    <textarea
                        aria-label="Message Snapcode AI"
                        className={styles.input}
                        disabled={this.state.isSending}
                        onChange={this.handleChange}
                        onKeyDown={event => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                this.handleSubmit(event);
                            }
                        }}
                        placeholder="Message Snapcode AI..."
                        rows="2"
                        value={this.state.draft}
                    />
                    <div className={styles.composerFooter}>
                        <span className={styles.hint}>Powered by Google Gemini</span>
                        <button
                            aria-label="Send message"
                            className={styles.send}
                            disabled={!this.state.draft.trim() || this.state.isSending}
                            type="submit"
                        >{this.state.isSending ? '…' : '↑'}</button>
                    </div>
                </form>
            </aside>
        );
    }
}

AIChatPanel.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default AIChatPanel;
