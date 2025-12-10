import React from 'react';
import { Handle, Position } from '@xyflow/react';

const handleStyle = {
  width: 10,
  height: 10,
  background: 'var(--background--surface-bg-def)',
  border: '2px solid var(--diagram-edge-def)',
  zIndex: 50,
};

// FIX: Add highlighted prop and dynamic styling to InputHandle.
export const InputHandle: React.FC<{ highlighted?: boolean }> = ({ highlighted }) => (
  <Handle
    type="target"
    position={Position.Left}
    id="input"
    style={{
      ...handleStyle,
      borderColor: highlighted ? 'var(--semantic-pri)' : 'var(--diagram-edge-def)',
      background: 'var(--background--surface-bg-def)', // Always hollow (surface color)
      left: '-5px',
      top: '50%',
      transform: 'translateY(-50%)',
    }}
  />
);

// FIX: Add OutputHandle component.
export const OutputHandle: React.FC<{ highlighted?: boolean }> = ({ highlighted }) => (
  <Handle
    type="source"
    position={Position.Right}
    id="output"
    style={{
      ...handleStyle,
      borderColor: highlighted ? 'var(--semantic-pri)' : 'var(--diagram-edge-def)',
      background: 'var(--background--surface-bg-def)', // Always hollow (surface color)
      right: '-5px',
      top: '50%',
      transform: 'translateY(-50%)',
    }}
  />
);