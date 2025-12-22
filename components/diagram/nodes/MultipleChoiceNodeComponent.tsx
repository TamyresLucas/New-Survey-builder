import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MultipleChoiceNode } from '../../../types';
import { CheckboxFilledIcon as CheckboxToolboxIcon, RadioIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon } from '../../icons';
import { InputHandle } from './CustomNodeHandles';

// FIX: Add custom handle style for choice outputs.
const choiceHandleStyle = {
    width: 10,
    height: 10,
    background: 'var(--background--surface-bg-def)',
    border: '2px solid var(--diagram-edge-def)',
    zIndex: 50,
};

const MultipleChoiceNodeComponent: React.FC<NodeProps<MultipleChoiceNode>> = ({ data, selected }) => {
    const Icon = data.subtype === 'radio' ? RadioIcon : CheckboxToolboxIcon;

    return (
        <div className={`w-80 bg-surface-container border rounded-lg shadow-lg transition-all ${selected ? 'border-primary shadow-2xl' : 'border-outline'
            }`}>
            <header className="p-3 border-b border-outline">
                <div className="flex items-center gap-2 min-w-0">
                    <Icon className="text-lg text-on-surface-variant flex-shrink-0" />
                    <span className="font-bold text-sm text-on-surface flex-shrink-0 mr-1">{data.variableName}</span>
                    <p className="text-sm text-on-surface-variant truncate">
                        {data.question}
                    </p>
                </div>
            </header>
            <div className="relative">
                <InputHandle highlighted={data.highlightInputHandle} />
                <ul className="p-3 space-y-2">
                    {data.options.map((option) => (
                        <li key={option.id} className="relative flex items-center p-2 rounded bg-surface border border-outline">
                            <div className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${data.subtype === 'checkbox' ? 'rounded-sm' : ''
                                } border-on-surface-variant`} />
                            <span className="text-sm text-on-surface truncate flex-1">{option.text}</span>
                            {/* FIX: Add an output handle for each choice to allow branching logic to be visualized. */}
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={option.id}
                                style={{
                                    ...choiceHandleStyle,
                                    borderColor: data.highlightSourceHandles ? 'var(--semantic-pri)' : 'var(--diagram-edge-def)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    right: '-17px'
                                }}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default memo(MultipleChoiceNodeComponent);