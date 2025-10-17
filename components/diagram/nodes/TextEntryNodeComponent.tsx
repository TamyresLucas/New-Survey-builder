import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { TextEntryNode } from '../../../types';
import { OpenEndAnswerIcon as TextEntryIcon } from '../../icons';
import { InputHandle, OutputHandle } from './CustomNodeHandles';

const TextEntryNodeComponent: React.FC<NodeProps<TextEntryNode>> = ({ data, selected }) => {
  return (
    <div className={`relative w-80 bg-surface-container border-2 rounded-lg transition-all ${
        selected ? 'border-primary shadow-xl' : 'border-outline-variant shadow-md'
    }`}>
      <InputHandle />
      <header className="bg-surface-container-highest p-3 rounded-t-lg">
        <div className="flex items-center gap-2 min-w-0">
            <TextEntryIcon className="text-lg text-on-surface flex-shrink-0" />
            <span className="font-bold text-sm text-on-surface flex-shrink-0 mr-1">{data.variableName}</span>
            <p className="text-sm text-on-surface truncate">
                {data.question}
            </p>
        </div>
      </header>
      <main className="p-3">
         <div className="bg-surface-container-high rounded p-2 text-sm text-on-surface-variant italic">
            Respondent provides a text-based answer.
         </div>
      </main>
      <OutputHandle />
    </div>
  );
};

export default memo(TextEntryNodeComponent);