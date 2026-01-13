import React, { memo } from 'react';
import { CheckCircle } from 'lucide-react';
import { InputHandle } from './NodeHandles';
import type { EndNodeProps } from './types';
import { cn } from '../../lib/utils';

/**
 * End node component for survey diagrams.
 * Represents the end of a survey flow.
 */
const EndNode: React.FC<EndNodeProps> = ({ data, selected }) => {
    return (
        <div
            className={cn(
                'relative w-48 h-[60px] bg-card rounded-lg flex items-center justify-center gap-2 transition-all',
                selected
                    ? 'border-4 border-success shadow-xl'
                    : 'border-2 border-success shadow-md'
            )}
        >
            <InputHandle highlighted={data.highlightInputHandle} />
            <CheckCircle className="w-5 h-5 text-success" />
            <p className="text-base font-bold text-foreground">
                {data.label || 'End of Survey'}
            </p>
        </div>
    );
};

export default memo(EndNode);
