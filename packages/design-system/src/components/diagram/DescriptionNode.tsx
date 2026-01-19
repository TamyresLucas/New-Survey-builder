import React, { memo } from 'react';
import { FileText } from '../ui/icons';
import { InputHandle, OutputHandle } from './NodeHandles';
import type { DescriptionNodeProps } from './types';
import { cn } from '../../lib/utils';

/**
 * Description node component for survey diagrams.
 * Represents informational or instructional content blocks.
 */
const DescriptionNode: React.FC<DescriptionNodeProps> = ({ data, selected }) => {
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
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-bold text-sm text-foreground truncate">
                        Description / Info
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="p-3 relative">
                <InputHandle highlighted={data.highlightInputHandle} />
                <div className="bg-background rounded p-2 text-sm text-foreground border border-border max-h-24 overflow-y-auto">
                    {data.question}
                </div>
                <OutputHandle highlighted={data.highlightSourceHandles} />
            </main>
        </div>
    );
};

export default memo(DescriptionNode);
