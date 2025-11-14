import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MultipleChoiceNode } from '../../../types';
import { CheckboxFilledIcon as CheckboxToolboxIcon, RadioIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon } from '../../icons';
import { InputHandle } from './CustomNodeHandles';

// FIX: Add custom handle style for choice outputs.
const choiceHandleStyle = {
    width: 10,
    height: 10,
    background: 'hsl(var(--color-surface-container))',
    border: '2px solid hsl(var(--color-primary))',
};

const MultipleChoiceNodeComponent: React.FC<NodeProps<MultipleChoiceNode>> = ({ data, selected }) => {
  const Icon = data.subtype === 'radio' ? RadioIcon : CheckboxToolboxIcon;
  
  return (
    <div className={`w-80 bg-surface-container border rounded-lg shadow-lg transition-all ${
        selected ? 'border-primary shadow-2xl' : 'border-outline-variant'
    }`}>
      <InputHandle />
      <header className="p-3 border-b border-outline-variant">
        <div className="flex items-center gap-2 min-w-0">
            <Icon className="text-lg text-on-surface-variant flex-shrink-0" />
            <span className="font-bold text-sm text-on-surface flex-shrink-0 mr-1">{data.variableName}</span>
            <p className="text-sm text-on-surface-variant truncate">
                {data.question}
            </p>
        </div>
      </header>
      <main className="p-3">
        <ul className="space-y-2">
            {data.options.map((option, index) => (
                <li key={option.id} className="relative bg-surface rounded p-2 text-sm text-on-surface flex items-center justify-between border border-outline-variant">
                    <div className="flex items-center gap-2">
                        {data.subtype === 'radio' ? (
                            <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant flex-shrink-0" />
                        ) : (
                            <CheckboxOutlineIcon className="text-xl text-on-surface-variant flex-shrink-0" />
                        )}
                        <span className="flex-grow">{option.text}</span>
                    </div>
                    <span className="bg-surface-container-high text-on-surface-variant text-xs font-mono py-1 px-2 rounded">{option.variableName}</span>
                    {/* FIX: Add an output handle for each choice to allow branching logic to be visualized. */}
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id={option.id} 
                        style={{ ...choiceHandleStyle, top: `${(100 / (data.options.length + 1)) * (index + 1)}%` }} 
                    />
                </li>
            ))}
        </ul>
      </main>
    </div>
  );
};

export default memo(MultipleChoiceNodeComponent);