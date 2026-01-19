import React, { memo } from 'react';
import { Type } from '../ui/icons';
import { InputHandle, OutputHandle } from './NodeHandles';
import type { TextEntryNodeProps } from './types';
import { cn } from '../../lib/utils';

/**
 * Text entry node component for survey diagrams.
 * Represents open-ended text questions.
 */
const TextEntryNode: React.FC<TextEntryNodeProps> = ({ data, selected }) => {
    return (
        <div
            className={cn(
                'relative w-80 bg-card border rounded-lg shadow-lg transition-all',
                selected ? 'border-primary shadow-2xl' : 'border-border'
            )}
        >
            {/* Header */}
            <header className="p-3 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                    <Type className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-bold text-sm text-foreground flex-shrink-0 mr-1">
                        {data.variableName}
                    </span>
                    <p className="text-sm text-muted-foreground truncate">
                        {data.question}
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="p-3 relative">
                <InputHandle highlighted={data.highlightInputHandle} />
                <div className="bg-background rounded p-2 text-sm text-muted-foreground italic border border-border">
                    Respondent provides a text-based answer.
                </div>
                <OutputHandle highlighted={data.highlightSourceHandles} />
            </main>
        </div>
    );
};

export default memo(TextEntryNode);
