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
  MarkerType,
  Edge as XyflowEdge,
} from '@xyflow/react';

import type { Survey, Question } from '../types';
import type { Node as DiagramNode, Edge as DiagramEdge } from '../types';

import { generateId, parseChoice } from '../utils';
import { QuestionType } from '../types';

import StartNodeComponent from './diagram/nodes/StartNodeComponent';
import MultipleChoiceNodeComponent from './diagram/nodes/MultipleChoiceNodeComponent';
import TextEntryNodeComponent from './diagram/nodes/TextEntryNodeComponent';
import DiagramToolbar from './diagram/DiagramToolbar';

const nodeTypes: NodeTypes = {
  start: StartNodeComponent,
  multiple_choice: MultipleChoiceNodeComponent,
  text_entry: TextEntryNodeComponent,
};

const NODE_WIDTH = 320;
const NODE_HEIGHT = 180;
const X_SPACING = 450;
const VERTICAL_GAP = 80;


interface DiagramCanvasProps {
  survey: Survey;
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question | null, options?: { tab?: string; focusOn?: string }) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  activeMainTab: string;
}

const DiagramCanvasContent: React.FC<DiagramCanvasProps> = ({ survey, selectedQuestion, onSelectQuestion, onUpdateQuestion, activeMainTab }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<DiagramEdge>([]);
    const reactFlowInstance = useReactFlow();
    const prevActiveTabRef = useRef<string>();
    
    // Memoize the expensive layout calculation so it only runs when the survey structure changes, not on every selection.
    const { layoutNodes, layoutEdges } = useMemo(() => {
        const relevantQuestions = survey.blocks.flatMap(b => b.questions).filter(q =>
            q.type === QuestionType.Radio ||
            q.type === QuestionType.Checkbox ||
            q.type === QuestionType.TextEntry
        );

        if (relevantQuestions.length === 0) {
            return { layoutNodes: [], layoutEdges: [] };
        }
        
        const questionMap: Map<string, Question> = new Map(relevantQuestions.map(q => [q.id, q]));

        // Calculate node heights before layout to handle variable sizes
        const nodeHeights = new Map<string, number>();
        relevantQuestions.forEach(q => {
            let height = NODE_HEIGHT; // Default for text_entry
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox) {
                height = 100 + (q.choices?.length || 0) * 32; // Base height + height per option
            }
            nodeHeights.set(q.id, height);
        });
        
        // --- Auto-layout calculation ---
        const nodePositions = new Map<string, { x: number, y: number }>();
        const columns: string[][] = [];
        const questionToColumn = new Map<string, number>();

        // Find root nodes (first question is always a root)
        if (relevantQuestions[0]) {
            columns[0] = [relevantQuestions[0].id];
            questionToColumn.set(relevantQuestions[0].id, 0);
        }

        // Use a queue to traverse the graph and assign columns
        const queue: string[] = relevantQuestions[0] ? [relevantQuestions[0].id] : [];
        const visited = new Set<string>(queue);

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
        
        // Calculate final X, Y coordinates using dynamic heights
        columns.forEach((column, colIndex) => {
            // Calculate total height of the column for centering
            const totalColumnHeight = column.reduce((sum, qId) => sum + (nodeHeights.get(qId) || NODE_HEIGHT), 0) + Math.max(0, column.length - 1) * VERTICAL_GAP;
            let currentY = -totalColumnHeight / 2;
            column.forEach((qId) => {
                const nodeHeight = nodeHeights.get(qId) || NODE_HEIGHT;
                nodePositions.set(qId, {
                    x: colIndex * X_SPACING,
                    y: currentY
                });
                currentY += nodeHeight + VERTICAL_GAP;
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
                    width: NODE_WIDTH, height: nodeHeights.get(q.id) || NODE_HEIGHT,
                });
            } else { // Text Entry
                flowNodes.push({
                    id: q.id, type: 'text_entry', position,
                    data: { variableName: q.qid, question: q.text },
                    width: NODE_WIDTH, height: nodeHeights.get(q.id) || NODE_HEIGHT,
                });
            }

            // Create Edges
            const skipLogic = q.draftSkipLogic ?? q.skipLogic;
            if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.skipTo && skipLogic.skipTo !== 'end') {
                    const targetId = skipLogic.skipTo === 'next' ? relevantQuestions[index + 1]?.id : skipLogic.skipTo;
                    if (targetId && questionMap.has(targetId)) {
                        flowEdges.push({
                            id: `e-${q.id}-output-${targetId}`, source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                            markerEnd: { type: MarkerType.ArrowClosed },
                        });
                    }
                } else if (skipLogic.type === 'per_choice') {
                    skipLogic.rules.forEach(rule => {
                        if (rule.skipTo && rule.skipTo !== 'end') {
                            const targetId = rule.skipTo === 'next' ? relevantQuestions[index + 1]?.id : rule.skipTo;
                            if (targetId && questionMap.has(targetId)) {
                                const sourceChoice = q.choices?.find(c => c.id === rule.choiceId);
                                const edgeLabel = sourceChoice ? parseChoice(sourceChoice.text).variable : undefined;
                                
                                flowEdges.push({
                                    id: `e-${q.id}-${rule.choiceId}-${targetId}`,
                                    source: q.id,
                                    sourceHandle: rule.choiceId,
                                    target: targetId,
                                    targetHandle: 'input',
                                    label: edgeLabel,
                                    markerEnd: { type: MarkerType.ArrowClosed },
                                });
                            }
                        }
                    });
                }
            } else if (index < relevantQuestions.length - 1) { // Default sequential flow
                const nextQuestion = relevantQuestions[index + 1];
                if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox) {
                    q.choices?.forEach(choice => {
                        const { variable } = parseChoice(choice.text);
                        flowEdges.push({
                            id: `e-${q.id}-${choice.id}-${nextQuestion.id}`,
                            source: q.id,
                            sourceHandle: choice.id,
                            target: nextQuestion.id,
                            targetHandle: 'input',
                            label: variable,
                            markerEnd: { type: MarkerType.ArrowClosed },
                        });
                    });
                } else { // Text Entry
                    flowEdges.push({
                        id: `e-${q.id}-output-${nextQuestion.id}`,
                        source: q.id, 
                        sourceHandle: 'output',
                        target: nextQuestion.id,
                        targetHandle: 'input',
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
            }
        });
        
        return { layoutNodes: flowNodes, layoutEdges: flowEdges };
    }, [survey]);
    
    // This effect runs whenever the layout or the selection changes.
    // It applies selection highlights and handles auto-centering the view.
    useEffect(() => {
        const selectedId = selectedQuestion?.id;
        
        // Apply selection state to the memoized layout nodes and edges
        setNodes(layoutNodes.map(n => ({ ...n, selected: n.id === selectedId })));
        setEdges(layoutEdges.map(e => ({ ...e, selected: e.source === selectedId })));
        
        const justSwitchedToFlow = prevActiveTabRef.current !== 'Flow' && activeMainTab === 'Flow';
        
        // A small timeout allows the graph to render before fitting the view.
        const timer = setTimeout(() => {
            if (selectedId) {
                // When a question is selected, frame it and all its immediate children.
                const outgoingEdges = layoutEdges.filter(e => e.source === selectedId);
                const targetNodeIds = outgoingEdges.map(e => e.target);
                const nodesToFit = [...new Set([selectedId, ...targetNodeIds])];

                reactFlowInstance.fitView({
                    nodes: nodesToFit.map(id => ({ id })),
                    duration: 600,
                    padding: 0.25, // Add padding to ensure nodes aren't at the very edge.
                });
            } else if (justSwitchedToFlow) {
                // If no question is selected AND we just switched to the Flow tab, show the whole diagram.
                reactFlowInstance.fitView({ duration: 600, padding: 0.1 });
            }
        }, 100);
        
        return () => clearTimeout(timer);

    }, [layoutNodes, layoutEdges, selectedQuestion, activeMainTab, reactFlowInstance, setNodes, setEdges]);
    
    // This effect updates the previous tab ref *after* the main effect has run.
    useEffect(() => {
        prevActiveTabRef.current = activeMainTab;
    });

    const onConnect = useCallback(
        (connection: Connection) => {
            const newEdge = { ...connection, id: generateId('edge') } as DiagramEdge;
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: DiagramNode) => {
        const fullQuestion = survey.blocks.flatMap(b => b.questions).find(q => q.id === node.id);
        if (fullQuestion) {
            onSelectQuestion(fullQuestion);
        }
    }, [survey, onSelectQuestion]);

    const onPaneClick = useCallback(() => {
        onSelectQuestion(null);
    }, [onSelectQuestion]);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: XyflowEdge) => {
        event.stopPropagation();
        const sourceQuestion = survey.blocks.flatMap(b => b.questions).find(q => q.id === edge.source);
        if (sourceQuestion) {
            onSelectQuestion(sourceQuestion, { tab: 'Behavior', focusOn: edge.sourceHandle });
        }
    }, [survey, onSelectQuestion]);

    const onEdgeUpdate = useCallback(
        (oldEdge: DiagramEdge, newConnection: Connection) => {
            if (!newConnection.source || !newConnection.target || !newConnection.sourceHandle) {
                return;
            }
            
            const sourceQuestion = survey.blocks.flatMap(b => b.questions).find(q => q.id === newConnection.source);
            if (!sourceQuestion) return;

            const existingLogic = sourceQuestion.draftSkipLogic ?? sourceQuestion.skipLogic;
            let newLogic: Question['skipLogic'];

            if (existingLogic?.type === 'per_choice') {
                const newRules = existingLogic.rules.map(rule => {
                    if (rule.choiceId === newConnection.sourceHandle) {
                        return { ...rule, skipTo: newConnection.target!, isConfirmed: false };
                    }
                    return rule;
                });
                newLogic = { type: 'per_choice', rules: newRules };
            } else if (existingLogic?.type === 'simple') {
                newLogic = { type: 'simple', skipTo: newConnection.target!, isConfirmed: false };
            } else if (sourceQuestion.type === QuestionType.Radio || sourceQuestion.type === QuestionType.Checkbox) {
                // Create new logic if none exists
                const newRules = (sourceQuestion.choices || []).map(choice => ({
                    choiceId: choice.id,
                    skipTo: choice.id === newConnection.sourceHandle ? newConnection.target! : 'next',
                    isConfirmed: false,
                }));
                newLogic = { type: 'per_choice', rules: newRules };
            } else { // Text entry
                newLogic = { type: 'simple', skipTo: newConnection.target!, isConfirmed: false };
            }

            if (newLogic) {
                onUpdateQuestion(sourceQuestion.id, { skipLogic: newLogic });
            }

            setEdges((els) => els.filter(e => e.id !== oldEdge.id));
        },
        [setEdges, survey, onUpdateQuestion]
    );


    return (
        <div className="w-full h-full">
            <DiagramToolbar onAddNode={() => {}} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onEdgeClick={onEdgeClick}
                onEdgeUpdate={onEdgeUpdate}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                className="bg-surface"
                fitView
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


const DiagramCanvas: React.FC<DiagramCanvasProps> = memo(({ survey, selectedQuestion, onSelectQuestion, onUpdateQuestion, activeMainTab }) => {
    return (
        <ReactFlowProvider>
            <DiagramCanvasContent 
                survey={survey} 
                selectedQuestion={selectedQuestion} 
                onSelectQuestion={onSelectQuestion} 
                onUpdateQuestion={onUpdateQuestion}
                activeMainTab={activeMainTab}
            />
        </ReactFlowProvider>
    );
});

export default DiagramCanvas;