import React from 'react';
import { Sparkles, X } from '../ui/icons';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Thread, type Message } from './thread';

export interface AssistantSidebarProps {
    /** Title displayed in the header */
    title?: string;
    /** Array of messages to display */
    messages?: Message[];
    /** Whether to show loading indicator */
    isLoading?: boolean;
    /** Placeholder text for the composer */
    placeholder?: string;
    /** Callback when a message is submitted */
    onSubmit?: (message: string) => void;
    /** Callback when sidebar is closed */
    onClose?: () => void;
    /** Welcome message to show when empty */
    welcomeMessage?: string;
    /** Additional class names */
    className?: string;
}

/**
 * AssistantSidebar - Sidebar container with header and thread.
 * Provides a complete AI assistant panel layout.
 */
export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({
    title = 'AI Assistant',
    messages,
    isLoading,
    placeholder,
    onSubmit,
    onClose,
    welcomeMessage,
    className,
}) => {
    return (
        <div className={cn('flex flex-col h-full bg-card border-l border-border', className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                </div>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-hidden">
                <Thread
                    messages={messages}
                    isLoading={isLoading}
                    placeholder={placeholder}
                    onSubmit={onSubmit}
                    welcomeMessage={welcomeMessage}
                />
            </div>
        </div>
    );
};

export default AssistantSidebar;
