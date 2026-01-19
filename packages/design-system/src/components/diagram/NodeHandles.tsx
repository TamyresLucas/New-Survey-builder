import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';

const baseHandleStyles = 'w-2.5 h-2.5 rounded-full border-2 bg-card';

interface HandleProps {
    highlighted?: boolean;
    className?: string;
}

/**
 * Input handle for diagram nodes (left side)
 */
export const InputHandle: React.FC<HandleProps> = ({ highlighted, className }) => (
    <Handle
        type="target"
        position={Position.Left}
        id="input"
        className={cn(
            baseHandleStyles,
            highlighted ? 'border-primary' : 'border-border',
            className
        )}
        style={{
            left: '-5px',
            top: '50%',
            transform: 'translateY(-50%)',
        }}
    />
);

/**
 * Output handle for diagram nodes (right side)
 */
export const OutputHandle: React.FC<HandleProps> = ({ highlighted, className }) => (
    <Handle
        type="source"
        position={Position.Right}
        id="output"
        className={cn(
            baseHandleStyles,
            highlighted ? 'border-primary' : 'border-border',
            className
        )}
        style={{
            right: '-5px',
            top: '50%',
            transform: 'translateY(-50%)',
        }}
    />
);

interface ChoiceHandleProps extends HandleProps {
    id: string;
}

/**
 * Choice-specific output handle for multiple choice nodes
 */
export const ChoiceOutputHandle: React.FC<ChoiceHandleProps> = ({
    id,
    highlighted,
    className
}) => (
    <Handle
        type="source"
        position={Position.Right}
        id={id}
        className={cn(
            baseHandleStyles,
            highlighted ? 'border-primary' : 'border-border',
            className
        )}
        style={{
            right: '-17px',
            top: '50%',
            transform: 'translateY(-50%)',
        }}
    />
);
