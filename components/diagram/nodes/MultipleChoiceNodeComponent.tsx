import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { MultipleChoiceNode } from '../../../types';
import { CheckboxFilledIcon as CheckboxToolboxIcon, RadioIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon } from '../../icons';
import { InputHandle } from './CustomNodeHandles';

const handleStyle = {
    width: 12,
    height: 12,
    background: 'hsl(var(--color-surface))',
    border: '2px solid hsl(var(--color-on-surface-variant))',
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
            {data.options.map((option) => (
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
                     <Handle
                        type="source"
                        position={Position.Right}
                        id={option.id}
                        style={{
                            ...handleStyle,
                            position: 'absolute',
                            right: '-18px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    />
                </li>
            ))}
        </ul>
      </main>
    </div>
  );
};

export default memo(MultipleChoiceNodeComponent);