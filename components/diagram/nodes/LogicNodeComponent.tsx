import React, { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { LogicNode } from '../../../types';
import { InputHandle, OutputHandle } from './CustomNodeHandles';

const LogicNodeComponent: React.FC<NodeProps<LogicNode>> = ({ data, selected }) => {
  return (
    <div className={`w-80 bg-surface-container border-primary rounded-lg transition-all ${
        selected ? 'border-4 shadow-xl' : 'border-2 shadow-md'
    }`}>
      <InputHandle />
      <div className="text-center p-4">
        <p className="text-base font-semibold text-on-surface">{data.label}</p>
        <p className="text-sm text-on-surface-variant">Logic Node (WIP)</p>
      </div>
      <OutputHandle />
    </div>
  );
};

export default memo(LogicNodeComponent);