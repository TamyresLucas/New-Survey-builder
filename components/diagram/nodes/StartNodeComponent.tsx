import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { StartNode } from '../../../types';
import { OutputHandle } from './CustomNodeHandles';

import { ContentPasteIcon } from '../../icons';

const StartNodeComponent: React.FC<NodeProps<StartNode>> = ({ data, selected }) => {
  return (
    <div className={`relative w-48 h-[60px] bg-surface-container border-success rounded-lg flex items-center justify-center gap-2 transition-all ${selected ? 'border-4 shadow-xl' : 'border-2 shadow-md'
      }`}>
      <ContentPasteIcon className="text-xl text-on-surface" />
      <p className="text-base font-bold text-on-surface">Start of Survey</p>
      <OutputHandle highlighted={data.highlightSourceHandles} />
    </div>
  );
};

export default memo(StartNodeComponent);