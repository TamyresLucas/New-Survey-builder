import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { TextEntryNode } from '../../../types';
import { OpenEndAnswerIcon as TextEntryIcon } from '../../icons';
import { InputHandle, OutputHandle } from './CustomNodeHandles';

const TextEntryNodeComponent: React.FC<NodeProps<TextEntryNode>> = ({ data, selected }) => {
  return (
    <div className={`w-80 bg-surface-container border-primary rounded-lg transition-all ${
        selected ? 'border-4 shadow-xl' : 'border-2 shadow-md'
    }`}>
      <InputHandle />
      <header className="bg-primary-container p-3 rounded-t-md">
        <div className="flex items-center gap-2">
          <TextEntryIcon className="text-lg text-on-primary-container" />
          <p className="text-sm font-semibold text-on-primary-container truncate">{data.question}</p>
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