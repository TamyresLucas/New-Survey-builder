import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { MultipleChoiceNode } from '../../../types';
import { CheckboxFilledIcon as CheckboxToolboxIcon } from '../../icons';
import { InputHandle, OutputHandle } from './CustomNodeHandles';

const optionHandleStyle = {
    width: 8,
    height: 8,
    background: 'hsl(var(--color-surface-container))',
    border: '1.5px solid hsl(var(--color-outline))',
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
            {data.options.map((option, index) => (
                <li key={option.id} className="relative bg-surface-container-high rounded p-2 text-sm text-on-surface">
                    {option.text}
                     <Handle
                        type="source"
                        position={Position.Right}
                        id={option.id}
                        style={{ ...optionHandleStyle, top: `${(index + 1) * 32 + 62}px` }}
                    />
                </li>
            ))}
        </ul>
      </main>
      <OutputHandle id="output" />
    </div>
  );
};

export default memo(MultipleChoiceNodeComponent);