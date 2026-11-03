import PropTypes from 'prop-types';
import React from 'react';

import styles from './ai-chat-panel.css';

class AIChatPanel extends React.Component {
    constructor (props) {
        super(props);
        this.state = {draft: '', messages: []};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange (event) {
        this.setState({draft: event.target.value});
    }

    handleSubmit (event) {
        event.preventDefault();
        const text = this.state.draft.trim();
        if (!text) return;
        this.setState(state => ({
            draft: '',
            messages: state.messages.concat([{id: Date.now(), text}])
        }));
    }

    render () {
        return (
            <aside aria-label="Snapcode AI chat" className={styles.panel}>
                <div className={styles.header}>
                    <div className={styles.heading}>
                        <span className={styles.sparkle}>✦</span>
                        <div>
                            <div className={styles.title}>Snapcode AI</div>
                            <div className={styles.subtitle}>Your creative coding assistant</div>
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
                                <span>Help me make a platformer</span>
                                <span>Explain this script</span>
                                <span>Find a bug in my project</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.messageList}>
                            {this.state.messages.map(message => (
                                <div className={styles.userMessage} key={message.id}>
                                    {message.text}
                                </div>
                            ))}
                            <div className={styles.setupNotice}>
                                Your message is ready. Connect an AI provider to enable replies.
                            </div>
                        </div>
                    )}
                </div>
                <form className={styles.composer} onSubmit={this.handleSubmit}>
                    <textarea
                        aria-label="Message Snapcode AI"
                        className={styles.input}
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
                        <span className={styles.hint}>AI replies will work once a provider is connected</span>
                        <button
                            aria-label="Send message"
                            className={styles.send}
                            disabled={!this.state.draft.trim()}
                            type="submit"
                        >↑</button>
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
