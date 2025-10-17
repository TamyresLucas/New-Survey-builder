import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { StartNode } from '../../../types';
import { OutputHandle } from './CustomNodeHandles';

const StartNodeComponent: React.FC<NodeProps<StartNode>> = ({ data, selected }) => {
  return (
    <div className={`w-44 h-[60px] bg-surface-container border-success rounded-full flex items-center justify-center transition-all ${
        selected ? 'border-4 shadow-xl' : 'border-2 shadow-md'
    }`}>
      <p className="text-lg font-bold text-on-surface">{data.label}</p>
      <OutputHandle />
    </div>
  );
};

export default memo(StartNodeComponent);