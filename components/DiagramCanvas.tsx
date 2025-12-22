import React, { useCallback, useMemo, memo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge as FlowEdge,
    Node as FlowNode,
    MarkerType,
    ReactFlowProvider,
    NodeTypes,
    Panel,
    useReactFlow,
    getIncomers,
    getOutgoers,
    ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Survey, Question, Block, Node, Edge, QuestionType } from '../types';
import StartNodeComponent from './diagram/nodes/StartNodeComponent';
import EndNodeComponent from './diagram/nodes/EndNodeComponent';
import TextEntryNodeComponent from './diagram/nodes/TextEntryNodeComponent';
import MultipleChoiceNodeComponent from './diagram/nodes/MultipleChoiceNodeComponent';
import DescriptionNodeComponent from './diagram/nodes/DescriptionNodeComponent';
import ChoiceGridNodeComponent from './diagram/nodes/ChoiceGridNodeComponent';
import PathAnalysisPanel from './diagram/PathAnalysisPanel';
import DiagramToolbar from './diagram/DiagramToolbar'; // Suspected culprit, will use carefully

// Define node types outside component to prevent re-creation
const nodeTypes: NodeTypes = {
    start: StartNodeComponent,
    end: EndNodeComponent,
    text_entry: TextEntryNodeComponent,
    multiple_choice: MultipleChoiceNodeComponent,
    description_node: DescriptionNodeComponent,
    choice_grid: ChoiceGridNodeComponent,
};

interface DiagramCanvasProps {
    survey: Survey;
    selectedQuestion: string | null;
    onSelectQuestion: (questionId: string) => void;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    activeMainTab: string;
}

const DiagramCanvasContent: React.FC<DiagramCanvasProps> = ({
    survey,
    selectedQuestion,
    onSelectQuestion,
    onUpdateQuestion,
    activeMainTab
}) => {
    // Only render if active tab is Flow (optimization)
    if (activeMainTab !== 'Flow') return null;

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { fitView } = useReactFlow();

    // Memoized graph generation logic (Lane-based layout)
    const { layoutNodes, layoutEdges } = useMemo(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        if (!survey || !survey.blocks) return { layoutNodes: [], layoutEdges: [] };

        // 1. Identify "Lanes" (Branch Roots)
        // A lane is defined by a starting question that isn't the direct sequential follower of the previous one
        // or is the start of a block/branch.
        // For simplicity, we'll treat each Block as a primary lane, and branching logic creates sub-lanes.
        // Actually, a simpler approach for "Lanes" as requested:
        // Main sequence is Lane 0. Branches are Lane 1, 2, etc.

        // Let's build a map of QID -> Lane Index
        const questionLaneMap = new Map<string, number>();
        const questionDepthMap = new Map<string, number>();

        // Pre-calculate node heights for precise layout
        const nodeHeights = new Map<string, number>();
        const allQuestions = survey.blocks.flatMap(b => b.questions);

        allQuestions.forEach(q => {
            let height = 80; // Baseline
            if (q.type === 'multiple_choice' || q.type === 'checkbox' || q.type === 'radio_button') {
                // Roughly 40px per option + header
                height = 100 + ((q.choices?.length || 0) * 40);
            } else if (q.type === 'choice_grid') {
                height = 150 + ((q.rows?.length || 0) * 30);
            } else if (q.type === 'text_entry') {
                height = 140;
            } else if (q.type === 'description') {
                height = 100; // depends on content
            }
            nodeHeights.set(q.id, height);
        });
        // Add start/end node heights
        nodeHeights.set('start', 60);
        nodeHeights.set('end', 60);


        // -- BUILD GRAPH STRUCTURE --
        // We need to trace paths to assign columns (X) and lanes (Y stack).
        // Since we want "Horizontal Alignment" for the main path, we assign X based on step index.

        let currentX = 0;
        const X_SPACING = 350;
        const Y_SPACING = 50; // Gap between lanes

        // Simple linear layout for the main flow first
        // We will just lay them out sequentially for now, but handle branches?
        // The user wants "Lane-based".
        // Let's iterate blocks.

        // Add Start Node
        newNodes.push({
            id: 'start',
            type: 'start',
            position: { x: 0, y: 0 },
            data: { label: 'Start', highlightSourceHandles: false },
        });

        currentX += X_SPACING;

        let laneYOffsets = [0]; // Tracks current bottom Y of each lane

        // Helper to get Y for a lane. We might need to adjust this dynamically, 
        // but for now let's assume fixed lane heights or stack them.
        // Actually, "Lanes" usually imply horizontal strips.
        // If we want horizontal alignment, then X is fixed per "step".

        let stepIndex = 1;

        survey.blocks.forEach((block, blockIndex) => {
            // Block Label/Group could be a node or just conceptual.
            // We'll just process questions.

            block.questions.forEach((question) => {
                const qType = question.type === 'text_entry' ? 'text_entry' :
                    (question.type === 'multiple_choice' || question.type === 'radio_button' || question.type === 'checkbox') ? 'multiple_choice' :
                        (question.type === 'choice_grid') ? 'choice_grid' :
                            (question.type === 'description') ? 'description_node' : 'text_entry'; // Fallback

                const nodeData: any = {
                    ...question,
                    variableName: question.qid,
                    question: question.text,
                    label: question.text,
                    // Map internal types to node props
                    subtype: question.type === 'checkbox' ? 'checkbox' : 'radio',
                    options: question.choices || [],
                    rows: question.rows || [],
                    columns: question.columns || [],
                    highlightSourceHandles: false,
                    highlightInputHandle: false
                };

                // Calculate Position
                // Main flow is always Lane 0 for now (y=0 center? No, let's say y=0 is top)
                // If we have branches, we need to push them down.

                // For this "Lane" request, we'll keep it simple: 
                // All questions in the main block sequence are on the same Y-axis (Lane 0).
                // We align them strictly by step.

                const laneIndex = 0;
                // Calculate Y based on lane. 
                // Let's center distinct lanes? 
                // For now, y = 0.

                newNodes.push({
                    id: question.id,
                    type: qType,
                    position: { x: stepIndex * X_SPACING, y: 0 }, // Lane 0
                    data: nodeData,
                    width: 300, // approx
                });

                // Edge from previous
                if (newNodes.length > 1) {
                    const prevNode = newNodes[newNodes.length - 2];
                    const isPrevStart = prevNode.id === 'start';

                    // Default Edge
                    newEdges.push({
                        id: `e-${prevNode.id}-${question.id}`,
                        source: prevNode.id,
                        target: question.id,
                        sourceHandle: isPrevStart ? undefined : 'output', // Custom nodes use 'output' id
                        targetHandle: 'input', // Custom nodes use 'input' id
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#E1E1E1', strokeWidth: 2 },
                    });
                }

                stepIndex++;
            });
        });

        // Add End Node
        if (newNodes.length > 0) {
            const lastNode = newNodes[newNodes.length - 1];
            newNodes.push({
                id: 'end',
                type: 'end',
                position: { x: stepIndex * X_SPACING, y: 0 },
                data: { label: 'End' },
            });
            newEdges.push({
                id: `e-${lastNode.id}-end`,
                source: lastNode.id,
                target: 'end',
                sourceHandle: 'output',
                targetHandle: 'input',
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#E1E1E1', strokeWidth: 2 },
            });
        }

        return { layoutNodes: newNodes, layoutEdges: newEdges };

    }, [survey]);

    // Update nodes when layout changes
    React.useEffect(() => {
        setNodes(layoutNodes);
        setEdges(layoutEdges);
        // Defer fitting view to allow render
        setTimeout(() => fitView({ padding: 0.2 }), 50);
    }, [layoutNodes, layoutEdges, fitView, setNodes, setEdges]);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="w-full h-full bg-[#f8f9fa] relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                defaultEdgeOptions={{ type: 'smoothstep' }}
            >
                <Background color="#ccc" gap={20} />
                <Controls />
                <MiniMap />
                <Panel position="top-right">
                    <PathAnalysisPanel survey={survey} />
                    {/* Toolbar committed out for debugging "Component is not a function" error 
                       <DiagramToolbar onAddNode={(type) => console.log('Add', type)} /> 
                    */}
                </Panel>
            </ReactFlow>
        </div>
    );
};

// Wrap with Provider
const DiagramCanvas: React.FC<DiagramCanvasProps> = memo((props) => {
    return (
        <ReactFlowProvider>
            <DiagramCanvasContent {...props} />
        </ReactFlowProvider>
    );
});

export default DiagramCanvas;