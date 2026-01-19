import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, FileText, Image as ImageIcon } from '../ui/icons';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export interface Attachment {
    id: string;
    name: string;
    type: 'image' | 'document';
    file?: File;
}

export interface ComposerProps {
    /** Placeholder text for the input */
    placeholder?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Whether to show the attachment button */
    showAttachButton?: boolean;
    /** Accepted file types for attachments */
    acceptedFileTypes?: string;
    /** Maximum number of attachments */
    maxAttachments?: number;
    /** Callback when a message is submitted */
    onSubmit?: (message: string, attachments?: Attachment[]) => void;
    /** Callback when attachments change */
    onAttachmentsChange?: (attachments: Attachment[]) => void;
    /** Additional class names */
    className?: string;
}

/**
 * Composer - Chat input area with send and optional attachment button.
 * Styled with rounded border and primary send button.
 */
export const Composer: React.FC<ComposerProps> = ({
    placeholder = 'Ask AI',
    disabled = false,
    showAttachButton = true,
    acceptedFileTypes = 'image/*,.pdf,.doc,.docx,.txt',
    maxAttachments = 5,
    onSubmit,
    onAttachmentsChange,
    className,
}) => {
    const [value, setValue] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback(() => {
        if ((value.trim() || attachments.length > 0) && onSubmit) {
            onSubmit(value.trim(), attachments.length > 0 ? attachments : undefined);
            setValue('');
            setAttachments([]);
        }
    }, [value, attachments, onSubmit]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    const handleAttachClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newAttachments: Attachment[] = [];
        const remaining = maxAttachments - attachments.length;

        for (let i = 0; i < Math.min(files.length, remaining); i++) {
            const file = files[i];
            newAttachments.push({
                id: `${Date.now()}-${i}`,
                name: file.name,
                type: file.type.startsWith('image/') ? 'image' : 'document',
                file,
            });
        }

        const updated = [...attachments, ...newAttachments];
        setAttachments(updated);
        onAttachmentsChange?.(updated);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [attachments, maxAttachments, onAttachmentsChange]);

    const handleRemoveAttachment = useCallback((id: string) => {
        const updated = attachments.filter(a => a.id !== id);
        setAttachments(updated);
        onAttachmentsChange?.(updated);
    }, [attachments, onAttachmentsChange]);

    return (
        <div className={cn('border-t border-border bg-card', className)}>
            {/* Attachments preview */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
                        >
                            {attachment.type === 'image' ? (
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <FileText className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="max-w-[120px] truncate text-foreground">
                                {attachment.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveAttachment(attachment.id)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input area */}
            <div className="flex items-center gap-2 p-4">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFileTypes}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Attach button */}
                {showAttachButton && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleAttachClick}
                        disabled={disabled || attachments.length >= maxAttachments}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                )}

                {/* Text input */}
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        id="composer-input"
                        className={cn(
                            'w-full h-12 px-5 pr-14 rounded-full composer-input',
                            'bg-background border border-input',
                            'text-sm text-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    />
                    <style>{`
                        .composer-input::placeholder {
                            color: var(--placeholder-foreground) !important;
                        }
                    `}</style>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Button
                            size="icon"
                            onClick={handleSubmit}
                            disabled={disabled || (!value.trim() && attachments.length === 0)}
                            className="rounded-full w-8 h-8"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Composer;

