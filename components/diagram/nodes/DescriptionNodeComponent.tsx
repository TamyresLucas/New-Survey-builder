import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { DescriptionNode } from '../../../types';
import { DescriptionIcon } from '../../icons';
// FIX: Import OutputHandle to use for the node's source connection.
import { InputHandle, OutputHandle } from './CustomNodeHandles';
import { stripHtml } from '../../../utils';

const DescriptionNodeComponent: React.FC<NodeProps<DescriptionNode>> = ({ data, selected }) => {
  return (
    <div className={`relative w-80 bg-surface-container border rounded-lg shadow-lg transition-all ${data.hasLogicError ? 'border-error border-2' : (selected ? 'border-primary shadow-2xl' : 'border-outline')
      }`}>
      <header className="p-3 border-b border-outline">
        <div className="flex items-center gap-2 min-w-0">
          <DescriptionIcon className="text-lg text-on-surface-variant flex-shrink-0" />
          <p className="font-bold text-sm text-on-surface truncate">
            Description / Info
          </p>
        </div>
      </header>
      <main className="p-3 relative">
        <InputHandle highlighted={data.highlightInputHandle} />
        <div className="bg-surface rounded p-2 text-sm text-on-surface border border-outline max-h-24 overflow-y-auto">
          {stripHtml(data.question)}
        </div>
        {/* FIX: Add the missing output handle for this node's connections. */}
        <OutputHandle highlighted={data.highlightSourceHandles} />
      </main>
    </div>
  );
};

export default memo(DescriptionNodeComponent);