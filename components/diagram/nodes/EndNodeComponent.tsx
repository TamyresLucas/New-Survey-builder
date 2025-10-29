import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { EndNode } from '../../../types';
import { InputHandle } from './CustomNodeHandles';

const EndNodeComponent: React.FC<NodeProps<EndNode>> = ({ data, selected }) => {
  return (
    <div className={`w-44 h-[60px] bg-surface-container border-error rounded-full flex items-center justify-center transition-all ${
        selected ? 'border-4 shadow-xl' : 'border-2 shadow-md'
    }`}>
      <p className="text-lg font-bold text-on-surface">{data.label}</p>
      <InputHandle />
    </div>
  );
};

export default memo(EndNodeComponent);
