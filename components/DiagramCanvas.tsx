import React, { useState, useCallback, useMemo, useRef, memo, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  NodeTypes,
  addEdge,
} from '@xyflow/react';

import type { Survey, Question } from '../types';
import type { Node as DiagramNode, Edge as DiagramEdge } from '../types';

import { generateId, parseChoice } from '../utils';
import { QuestionType } from '../types';

import StartNodeComponent from './diagram/nodes/StartNodeComponent';
import MultipleChoiceNodeComponent from './diagram/nodes/MultipleChoiceNodeComponent';
import TextEntryNodeComponent from './diagram/nodes/TextEntryNodeComponent';
import LogicNodeComponent from './diagram/nodes/LogicNodeComponent';
import DiagramToolbar from './diagram/DiagramToolbar';
import PropertiesPanel from './diagram/PropertiesPanel';

const nodeTypes: NodeTypes = {
  start: StartNodeComponent,
  multiple_choice: MultipleChoiceNodeComponent,
  text_entry: TextEntryNodeComponent,
  logic: LogicNodeComponent,
};

const NODE_WIDTH = 320;
const NODE_HEIGHT = 180;
const X_SPACING = 450;
const Y_SPACING = 250;


interface DiagramCanvasProps {
  survey: Survey;
}

const DiagramCanvasContent: React.FC<DiagramCanvasProps> = ({ survey }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<DiagramEdge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const reactFlowInstance = useReactFlow();
    
    useEffect(() => {
        const relevantQuestions = survey.blocks.flatMap(b => b.questions).filter(q =>
            q.type === QuestionType.Radio ||
            q.type === QuestionType.Checkbox ||
            q.type === QuestionType.TextEntry
        );

        if (relevantQuestions.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }
        
        // FIX: Explicitly type questionMap to resolve a type inference issue.
        const questionMap: Map<string, Question> = new Map(relevantQuestions.map(q => [q.id, q]));
        
        // --- Auto-layout calculation ---
        const nodePositions = new Map<string, { x: number, y: number }>();
        const columns: string[][] = [];
        const questionToColumn = new Map<string, number>();

        // Find root nodes (first question is always a root)
        columns[0] = [relevantQuestions[0].id];
        questionToColumn.set(relevantQuestions[0].id, 0);

        // Use a queue to traverse the graph and assign columns
        const queue: string[] = [relevantQuestions[0].id];
        const visited = new Set<string>([relevantQuestions[0].id]);

        while(queue.length > 0) {
            const currentId = queue.shift()!;
            const currentQuestion = questionMap.get(currentId)!;
            const currentColumn = questionToColumn.get(currentId)!;
            const nextColumn = currentColumn + 1;

            const targets = new Set<string>();

            // Find explicit targets from skip logic
            const skipLogic = currentQuestion.draftSkipLogic ?? currentQuestion.skipLogic;
            if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.skipTo !== 'next' && skipLogic.skipTo !== 'end') {
                    targets.add(skipLogic.skipTo);
                } else if (skipLogic.type === 'per_choice') {
                    skipLogic.rules.forEach(rule => {
                        if (rule.skipTo !== 'next' && rule.skipTo !== 'end') {
                            targets.add(rule.skipTo);
                        }
                    });
                }
            }
            
            // Add sequential next question if it's not already a target and there's no unconditional skip
            const currentIdx = relevantQuestions.findIndex(q => q.id === currentId);
            if (currentIdx + 1 < relevantQuestions.length) {
                const nextQuestion = relevantQuestions[currentIdx + 1];
                if (skipLogic?.type !== 'simple' || (skipLogic.type === 'simple' && skipLogic.skipTo === 'next')) {
                     targets.add(nextQuestion.id);
                }
            }

            // Assign columns to targets
            if (!columns[nextColumn]) columns[nextColumn] = [];
            targets.forEach(targetId => {
                if (questionMap.has(targetId) && !visited.has(targetId)) {
                    visited.add(targetId);
                    questionToColumn.set(targetId, nextColumn);
                    columns[nextColumn].push(targetId);
                    queue.push(targetId);
                }
            });
        }
        
        // Calculate final X, Y coordinates
        columns.forEach((column, colIndex) => {
            const yOffset = - (column.length - 1) * Y_SPACING / 2;
            column.forEach((qId, nodeIndex) => {
                nodePositions.set(qId, {
                    x: colIndex * X_SPACING,
                    y: nodeIndex * Y_SPACING + yOffset
                });
            });
        });

        // --- Node and Edge creation ---
        const flowNodes: DiagramNode[] = [];
        const flowEdges: DiagramEdge[] = [];

        relevantQuestions.forEach((q, index) => {
            const position = nodePositions.get(q.id) || { x: index * X_SPACING, y: 0 };
            
            // Create Node
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox) {
                flowNodes.push({
                    id: q.id, type: 'multiple_choice', position,
                    data: {
                        variableName: q.qid,
                        question: q.text, subtype: q.type === QuestionType.Radio ? 'radio' : 'checkbox',
                        options: q.choices?.map(c => ({
                            id: c.id, text: parseChoice(c.text).label, variableName: parseChoice(c.text).variable
                        })) || []
                    },
                    width: NODE_WIDTH, height: 100 + (q.choices?.length || 0) * 32,
                });
            } else { // Text Entry
                flowNodes.push({
                    id: q.id, type: 'text_entry', position,
                    data: { variableName: q.qid, question: q.text },
                    width: NODE_WIDTH, height: NODE_HEIGHT
                });
            }

            // Create Edges
            const skipLogic = q.draftSkipLogic ?? q.skipLogic;
            if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.skipTo && skipLogic.skipTo !== 'end') {
                    const targetId = skipLogic.skipTo === 'next' ? relevantQuestions[index + 1]?.id : skipLogic.skipTo;
                    if (targetId && questionMap.has(targetId)) {
                        flowEdges.push({
                            id: `e-${q.id}-output-${targetId}`, source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input'
                        });
                    }
                } else if (skipLogic.type === 'per_choice') {
                    skipLogic.rules.forEach(rule => {
                        if (rule.skipTo && rule.skipTo !== 'end') {
                            const targetId = rule.skipTo === 'next' ? relevantQuestions[index + 1]?.id : rule.skipTo;
                            if (targetId && questionMap.has(targetId)) {
                                flowEdges.push({
                                    id: `e-${q.id}-${rule.choiceId}-${targetId}`, source: q.id, sourceHandle: rule.choiceId, target: targetId, targetHandle: 'input'
                                });
                            }
                        }
                    });
                }
            } else if (index < relevantQuestions.length - 1) { // Default sequential flow
                const nextQuestion = relevantQuestions[index + 1];
                flowEdges.push({
                    id: `e-${q.id}-output-${nextQuestion.id}`, source: q.id, 
                    sourceHandle: q.type === QuestionType.TextEntry ? 'output' : undefined,
                    target: nextQuestion.id, targetHandle: 'input'
                });
            }
        });
        
        setNodes(flowNodes);
        setEdges(flowEdges);

        setTimeout(() => reactFlowInstance.fitView({ duration: 300 }), 0);

    }, [survey, setNodes, setEdges, reactFlowInstance]);

    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdge = { ...connection, id: generateId('edge') } as DiagramEdge;
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: DiagramNode) => {
        setSelectedNodeId(node.id);
    }, []);
    
    const updateNode = useCallback((nodeId: string, data: any) => {
        // This is a view-only canvas now, so updates are disabled.
    }, []);

    const selectedNode = useMemo(() => {
        if (!selectedNodeId) return null;
        return nodes.find(n => n.id === selectedNodeId) || null;
    }, [selectedNodeId, nodes]);

    return (
        <div className="w-full h-full">
            <DiagramToolbar onAddNode={() => {}} />
            {selectedNode && (
                <PropertiesPanel
                    key={selectedNode.id}
                    node={selectedNode}
                    onUpdateNode={updateNode}
                    onClose={() => setSelectedNodeId(null)}
                />
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelectedNodeId(null)}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                className="bg-surface"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    className="bg-surface"
                />
                <Controls className="bg-surface-container rounded-lg shadow-md border border-outline-variant" />
            </ReactFlow>
        </div>
    );
};


const DiagramCanvas: React.FC<DiagramCanvasProps> = memo(({ survey }) => {
    return (
        <ReactFlowProvider>
            <DiagramCanvasContent survey={survey} />
        </ReactFlowProvider>
    );
});

export default DiagramCanvas;