import React, { memo } from 'react';
import { Play } from '../ui/icons';
import { OutputHandle } from './NodeHandles';
import type { StartNodeProps } from './types';
import { cn } from '../../lib/utils';

/**
 * Start node component for survey diagrams.
 * Represents the beginning of a survey flow.
 */
const StartNode: React.FC<StartNodeProps> = ({ data, selected }) => {
    return (
        <div
            className={cn(
                'relative w-48 h-[60px] bg-card rounded-lg flex items-center justify-center gap-2 transition-all',
                selected
                    ? 'border-4 border-success shadow-xl'
                    : 'border-2 border-success shadow-md'
            )}
        >
            <Play className="w-5 h-5 text-foreground" />
            <p className="text-base font-bold text-foreground">
                {data.label || 'Start of Survey'}
            </p>
            <OutputHandle highlighted={data.highlightSourceHandles} />
        </div>
    );
};

export default memo(StartNode);
