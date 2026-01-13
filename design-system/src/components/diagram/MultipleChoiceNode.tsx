import React, { memo } from 'react';
import { Circle, Square } from 'lucide-react';
import { InputHandle, ChoiceOutputHandle } from './NodeHandles';
import type { MultipleChoiceNodeProps } from './types';
import { cn } from '../../lib/utils';

/**
 * Multiple choice node component for survey diagrams.
 * Displays radio or checkbox questions with individual output handles per choice.
 */
const MultipleChoiceNode: React.FC<MultipleChoiceNodeProps> = ({ data, selected }) => {
    const Icon = data.subtype === 'radio' ? Circle : Square;

    return (
        <div
            className={cn(
                'w-80 bg-card border rounded-lg shadow-lg transition-all',
                selected ? 'border-primary shadow-2xl' : 'border-border'
            )}
        >
            {/* Header */}
            <header className="p-3 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-bold text-sm text-foreground flex-shrink-0 mr-1">
                        {data.variableName}
                    </span>
                    <p className="text-sm text-muted-foreground truncate">
                        {data.question}
                    </p>
                </div>
            </header>

            {/* Options */}
            <div className="relative">
                <InputHandle highlighted={data.highlightInputHandle} />
                <ul className="p-3 space-y-2">
                    {data.options.map((option) => (
                        <li
                            key={option.id}
                            className="relative flex items-center p-2 rounded bg-background border border-border"
                        >
                            <div
                                className={cn(
                                    'w-4 h-4 border mr-2 flex items-center justify-center border-muted-foreground',
                                    data.subtype === 'checkbox' ? 'rounded-sm' : 'rounded-full'
                                )}
                            />
                            <span className="text-sm text-foreground truncate flex-1">
                                {option.text}
                            </span>
                            <ChoiceOutputHandle
                                id={option.id}
                                highlighted={data.highlightSourceHandles}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default memo(MultipleChoiceNode);
