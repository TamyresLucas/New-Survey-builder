import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { TextEntryNode } from '../../../types';
import { OpenEndAnswerIcon as TextEntryIcon } from '../../icons';
import { InputHandle, OutputHandle } from './CustomNodeHandles';

const TextEntryNodeComponent: React.FC<NodeProps<TextEntryNode>> = ({ data, selected }) => {
  return (
    <div className={`relative w-80 bg-surface-container border rounded-lg shadow-lg transition-all ${
        selected ? 'border-primary shadow-2xl' : 'border-outline-variant'
    }`}>
      <InputHandle />
      <header className="p-3 border-b border-outline-variant">
        <div className="flex items-center gap-2 min-w-0">
            <TextEntryIcon className="text-lg text-on-surface-variant flex-shrink-0" />
            <span className="font-bold text-sm text-on-surface flex-shrink-0 mr-1">{data.variableName}</span>
            <p className="text-sm text-on-surface-variant truncate">
                {data.question}
            </p>
        </div>
      </header>
      <main className="p-3">
         <div className="bg-surface rounded p-2 text-sm text-on-surface-variant italic border border-outline-variant">
            Respondent provides a text-based answer.
         </div>
      </main>
      <OutputHandle />
    </div>
  );
};

export default memo(TextEntryNodeComponent);