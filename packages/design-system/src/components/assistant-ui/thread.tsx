import React from 'react';
import { cn } from '../../lib/utils';
import { AssistantMessage } from './assistant-message';
import { UserMessage } from './user-message';
import { Composer } from './composer';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export interface ThreadProps {
    /** Array of messages to display */
    messages?: Message[];
    /** Whether to show loading indicator */
    isLoading?: boolean;
    /** Placeholder text for the composer */
    placeholder?: string;
    /** Callback when a message is submitted */
    onSubmit?: (message: string) => void;
    /** Welcome message to show when empty */
    welcomeMessage?: string;
    /** Additional class names */
    className?: string;
}

/**
 * Thread - Main chat thread component.
 * Displays messages and composer input.
 */
export const Thread: React.FC<ThreadProps> = ({
    messages = [],
    isLoading = false,
    placeholder = 'Type a message...',
    onSubmit,
    welcomeMessage = 'How can I help you today?',
    className,
}) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className={cn('flex flex-col h-full bg-background', className)}>
            {/* Messages area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <p className="text-lg font-medium text-foreground">{welcomeMessage}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Ask me anything to get started.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            message.role === 'user' ? (
                                <UserMessage key={message.id} content={message.content} />
                            ) : (
                                <AssistantMessage key={message.id} content={message.content} />
                            )
                        ))}
                        {isLoading && (
                            <AssistantMessage content="" isLoading />
                        )}
                    </>
                )}
            </div>

            {/* Composer */}
            <Composer
                placeholder={placeholder}
                disabled={isLoading}
                onSubmit={onSubmit}
            />
        </div>
    );
};

export default Thread;
