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

export const OutputHandle: React.FC<{ id?: string }> = ({ id = 'output' }) => (
  <Handle
    type="source"
    position={Position.Right}
    id={id}
    style={handleStyle}
  />
);
