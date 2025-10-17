import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { MultipleChoiceNode } from '../../../types';
import { CheckboxFilledIcon as CheckboxToolboxIcon } from '../../icons';
import { InputHandle } from './CustomNodeHandles';

const handleStyle = {
    width: 10,
    height: 10,
    background: 'hsl(var(--color-surface-container))',
    border: '2px solid hsl(var(--color-primary))',
};

const MultipleChoiceNodeComponent: React.FC<NodeProps<MultipleChoiceNode>> = ({ data, selected }) => {
  return (
    <div className={`w-80 bg-surface-container border-primary rounded-lg transition-all ${
        selected ? 'border-4 shadow-xl' : 'border-2 shadow-md'
    }`}>
      <InputHandle />
      <header className="bg-primary-container p-3 rounded-t-md">
        <div className="flex items-center gap-2">
          <CheckboxToolboxIcon className="text-lg text-on-primary-container" />
          <p className="text-sm font-semibold text-on-primary-container truncate">{data.question}</p>
        </div>
      </header>
      <main className="p-3">
        <ul className="space-y-2">
            {data.options.map((option) => (
                <li key={option.id} className="relative bg-surface-container-high rounded p-2 text-sm text-on-surface flex items-center gap-2">
                    <span className="w-4 h-4 rounded-sm border-2 border-outline flex-shrink-0"></span>
                    <span>{option.text}</span>
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