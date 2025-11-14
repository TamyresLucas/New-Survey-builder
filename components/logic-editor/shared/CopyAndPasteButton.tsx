import React from 'react';
import { ContentPasteIcon } from '../../icons';

export const CopyAndPasteButton: React.FC<{ onClick: () => void; className?: string; disabled?: boolean; }> = ({ onClick, className = 'text-sm', disabled = false }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`flex items-center gap-1 ${className} font-medium text-primary hover:underline transition-colors disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed`}
    >
        <ContentPasteIcon className="text-base" />
        <span>Copy and paste</span>
    </button>
);
