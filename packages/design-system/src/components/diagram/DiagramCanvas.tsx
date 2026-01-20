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
                stroke: 'hsl(var(--foreground))',
                strokeWidth: 2,
            },
            markerEnd: {
                type: 'arrowclosed' as const,
                color: 'hsl(var(--foreground))',
            },
        }),
        []
    );

    // Inject styles for selected edges to use primary color
    // This is necessary because ReactFlow applies the 'selected' class to the edge group
    // and we need to target the path and marker within it.
    // The marker color is trickier with CSS variables because markers are defined in <defs>,
    // but ReactFlow might handle marker color updates if we update the edge style props dynamically.
    // simpler approach for now is CSS targeting path.
    // For markers to change color on selection without JS, we might rely on the fact that markerEnd can take a color.
    // If we want FULL CSS control, we might need a custom edge.
    // However, let's try to set the default to foreground.
    // AND add a style tag or className to ReactFlow to handle selection.

    // Actually, to change marker color on selection via CSS is hard because it's an SVG marker reference.
    // But changing the STROKE is easy.
    return (
        <div className={cn('w-full h-full min-h-[400px]', className)}>
            <style>
                {`
                    .react-flow__edge.selected .react-flow__edge-path {
                        stroke: hsl(var(--primary)) !important;
                    }
                    .react-flow__edge.selected .react-flow__arrowhead {
                        fill: hsl(var(--primary)) !important;
                        stroke: hsl(var(--primary)) !important; 
                    }
                `}
            </style>
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
                        className="bg-[color-mix(in_oklab,hsl(var(--primary)),hsl(var(--background))_90%)]"
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
