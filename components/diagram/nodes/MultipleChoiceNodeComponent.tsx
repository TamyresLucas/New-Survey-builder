import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { MultipleChoiceNode } from '../../../types';
import { CheckboxFilledIcon as CheckboxToolboxIcon, RadioIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon } from '../../icons';
import { InputHandle } from './CustomNodeHandles';

const handleStyle = {
    width: 10,
    height: 10,
    background: 'hsl(var(--color-surface-container))',
    border: '2px solid hsl(var(--color-primary))',
};

const MultipleChoiceNodeComponent: React.FC<NodeProps<MultipleChoiceNode>> = ({ data, selected }) => {
  const Icon = data.subtype === 'radio' ? RadioIcon : CheckboxToolboxIcon;
  
  return (
    <div className={`w-80 bg-surface-container border-2 rounded-lg transition-all ${
        selected ? 'border-primary shadow-xl' : 'border-outline-variant shadow-md'
    }`}>
      <InputHandle />
      <header className="bg-surface-container-highest p-3 rounded-t-lg">
        <div className="flex items-center gap-2 min-w-0">
            <Icon className="text-lg text-on-surface flex-shrink-0" />
            <span className="font-bold text-sm text-on-surface flex-shrink-0 mr-1">{data.variableName}</span>
            <p className="text-sm text-on-surface truncate">
                {data.question}
            </p>
        </div>
      </header>
      <main className="p-3">
        <ul className="space-y-2">
            {data.options.map((option) => (
                <li key={option.id} className="relative bg-surface-container-high rounded p-2 text-sm text-on-surface flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {data.subtype === 'radio' ? (
                            <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant flex-shrink-0" />
                        ) : (
                            <CheckboxOutlineIcon className="text-xl text-on-surface-variant flex-shrink-0" />
                        )}
                        <span className="flex-grow">{option.text}</span>
                    </div>
                    <span className="bg-surface text-on-surface-variant text-xs font-mono py-1 px-2 rounded">{option.variableName}</span>
                     <Handle
                        type="source"
                        position={Position.Right}
                        id={option.id}
                        style={{
                            ...handleStyle,
                            position: 'absolute',
                            right: '-16px',
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