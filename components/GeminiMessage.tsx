import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../types';

interface GeminiMessageProps {
    message: ChatMessage;
}

export const GeminiMessage: React.FC<GeminiMessageProps> = ({ message }) => {
    const isModel = message.role === 'model';
    // User messages use Primary brand color.
    // Model messages use Surface background and Outline border.
    // We add inline style for surface background as a failsafe for the CSS variable.

    return (
        <div className={`flex ${!isModel ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`
                    max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${!isModel
                        ? 'bg-primary text-on-primary rounded-br-none'
                        : 'bg-surface-container border border-outline text-on-surface rounded-bl-none'
                    }
                `}
                style={isModel ? { backgroundColor: 'var(--background--surface-bg-def)' } : undefined}
            >
                {isModel ? (
                    <div className="markdown-content">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                ) : (
                    message.text
                )}
            </div>
        </div>
    );
};
