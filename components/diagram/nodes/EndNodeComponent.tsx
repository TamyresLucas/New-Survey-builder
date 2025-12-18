import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { EndNode } from '../../../types';
import { InputHandle } from './CustomNodeHandles';
import { CheckCircleIcon } from '../../icons';

const EndNodeComponent: React.FC<NodeProps<EndNode>> = ({ data, selected }) => {
  return (
    <div className={`w-48 h-[60px] bg-surface-container border-success rounded-lg flex items-center justify-center gap-2 transition-all ${selected ? 'border-4 shadow-xl' : 'border-2 shadow-md'
      }`}>
      <InputHandle highlighted={data.highlightInputHandle} />
      <CheckCircleIcon className="text-xl text-success" />
      <p className="text-base font-bold text-on-surface">{data.label}</p>
    </div>
  );
};

export default memo(EndNodeComponent);