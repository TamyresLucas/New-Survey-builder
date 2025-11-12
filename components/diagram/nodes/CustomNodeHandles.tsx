import React from 'react';
import { Handle, Position } from '@xyflow/react';

const handleStyle = {
    width: 10,
    height: 10,
    background: 'hsl(var(--color-surface-container))',
    border: '2px solid hsl(var(--color-primary))',
};

export const InputHandle: React.FC = () => (
  <Handle
    type="target"
    position={Position.Left}
    id="input"
    style={handleStyle}
  />
);

// FIX: Add missing OutputHandle component. It is used by StartNodeComponent and other nodes.
export const OutputHandle: React.FC = () => (
    <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={handleStyle}
    />
);
