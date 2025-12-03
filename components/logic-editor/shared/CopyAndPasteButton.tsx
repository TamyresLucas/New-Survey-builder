import React from 'react';
import { ContentPasteIcon, EditIcon } from '../../icons';

export const CopyAndPasteButton: React.FC<{ onClick: () => void; className?: string; disabled?: boolean; label?: string }> = ({ onClick, className = 'text-sm', disabled = false, label = 'Paste' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-1 ${className} font-semibold text-primary hover:underline transition-colors disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed`}
    >
        {label === 'Write expression' ? <EditIcon className="text-base" /> : <ContentPasteIcon className="text-base" />}
        <span>{label}</span>
    </button>
);
