import React, { useMemo } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    Background,
    BackgroundVariant,
    type NodeTypes,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import StartNode from './StartNode';
import EndNode from './EndNode';
import MultipleChoiceNode from './MultipleChoiceNode';
import TextEntryNode from './TextEntryNode';
import DescriptionNode from './DescriptionNode';
import { cn } from '../../lib/utils';

// Register custom node types
const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    multipleChoice: MultipleChoiceNode,
    textEntry: TextEntryNode,
    description: DescriptionNode,
};

export interface DiagramCanvasProps {
    /** Array of nodes to display */
    nodes: Node[];
    /** Array of edges connecting nodes */
    edges: Edge[];
    /** Callback when nodes change (for controlled mode) */
    onNodesChange?: (changes: any) => void;
    /** Callback when edges change (for controlled mode) */
    onEdgesChange?: (changes: any) => void;
    /** Callback when a node is clicked */
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
    /** Whether to show the controls panel */
    showControls?: boolean;
    /** Whether to show the background grid */
    showBackground?: boolean;
    /** Background variant */
    backgroundVariant?: BackgroundVariant;
    /** Additional class names */
    className?: string;
    /** Whether nodes can be dragged */
    nodesDraggable?: boolean;
    /** Whether the canvas can be panned */
    panOnDrag?: boolean;
    /** Whether zoom is enabled */
    zoomOnScroll?: boolean;
    /** Fit view on initial render */
    fitView?: boolean;
}

/**
 * DiagramCanvas - A wrapper around ReactFlow for displaying survey flow diagrams.
 * Uses Shadcn design tokens for consistent styling.
 */
const DiagramCanvasInner: React.FC<DiagramCanvasProps> = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    showControls = true,
    showBackground = true,
    backgroundVariant = BackgroundVariant.Dots,
    className,
    nodesDraggable = true,
    panOnDrag = true,
    zoomOnScroll = true,
    fitView = true,
}) => {
    const defaultEdgeOptions = useMemo(
        () => ({
            style: {
                stroke: 'hsl(var(--border))',
                strokeWidth: 2,
            },
            markerEnd: {
                type: 'arrowclosed' as const,
                color: 'hsl(var(--border))',
            },
        }),
        []
    );

    return (
        <div className={cn('w-full h-full min-h-[400px]', className)}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                nodesDraggable={nodesDraggable}
                panOnDrag={panOnDrag}
                zoomOnScroll={zoomOnScroll}
                fitView={fitView}
                proOptions={{ hideAttribution: true }}
            >
                {showBackground && (
                    <Background
                        variant={backgroundVariant}
                        gap={16}
                        size={1}
                        className="bg-muted"
                    />
                )}
                {showControls && <Controls className="diagram-controls" />}
            </ReactFlow>
        </div>
    );
};

/**
 * DiagramCanvas with ReactFlowProvider wrapper.
 * This is the main export that should be used in applications.
 */
export const DiagramCanvas: React.FC<DiagramCanvasProps> = (props) => (
    <ReactFlowProvider>
        <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
);

export default DiagramCanvas;
