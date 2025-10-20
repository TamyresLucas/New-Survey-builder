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

import type { Survey, Question, SkipLogicRule, SkipLogic } from '../types';
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

    // Memoize the flat list of all questions and a map of their indices for efficient validation.
    const questionIndexMap = useMemo(() => {
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        return new Map(allQuestions.map((q, i) => [q.id, i]));
    }, [survey]);
    
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

        const nodeHeights = new Map<string, number>();
        relevantQuestions.forEach(q => {
            let height = NODE_HEIGHT;
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox) {
                height = 100 + (q.choices?.length || 0) * 32;
            }
            nodeHeights.set(q.id, height);
        });
        
        const nodePositions = new Map<string, { x: number, y: number }>();
        const columns: string[][] = [];
        const questionToColumn = new Map<string, number>();

        if (relevantQuestions[0]) {
            columns[0] = [relevantQuestions[0].id];
            questionToColumn.set(relevantQuestions[0].id, 0);
        }

        const queue: string[] = relevantQuestions[0] ? [relevantQuestions[0].id] : [];
        const visited = new Set<string>(queue);

        const allQuestions = survey.blocks.flatMap(b => b.questions);

        while(queue.length > 0) {
            const currentId = queue.shift()!;
            const currentQuestion = questionMap.get(currentId)!;
            const currentColumn = questionToColumn.get(currentId)!;
            const nextColumn = currentColumn + 1;

            const targets = new Set<string>();
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
            
            const currentIdxInAll = allQuestions.findIndex(q => q.id === currentId);
            const nextQuestionInSurvey = allQuestions[currentIdxInAll + 1];

            // Default "next" logic
            let hasExplicitTerminalLogic = false; // Check if logic explicitly goes to 'end' or if all paths are defined
            if (skipLogic?.type === 'simple' && skipLogic.skipTo !== 'next') {
                hasExplicitTerminalLogic = true;
            } else if (skipLogic?.type === 'per_choice' && skipLogic.rules.every(r => r.skipTo && r.skipTo !== 'next')) {
                hasExplicitTerminalLogic = true;
            }

            if (nextQuestionInSurvey && !hasExplicitTerminalLogic) {
                targets.add(nextQuestionInSurvey.id);
            }


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
        
        columns.forEach((column, colIndex) => {
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

        const flowNodes: DiagramNode[] = [];
        const flowEdges: DiagramEdge[] = [];

        relevantQuestions.forEach((q) => {
            const position = nodePositions.get(q.id) || { x: 0, y: 0 };
            const index = allQuestions.findIndex(aq => aq.id === q.id);
            
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
            } else {
                flowNodes.push({
                    id: q.id, type: 'text_entry', position,
                    data: { variableName: q.qid, question: q.text },
                    width: NODE_WIDTH, height: nodeHeights.get(q.id) || NODE_HEIGHT,
                });
            }

            const sourceHandles: { id: string; choice?: any }[] =
                (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox)
                    ? (q.choices || []).map(c => ({ id: c.id, choice: c }))
                    : [{ id: 'output' }];

            sourceHandles.forEach(handle => {
                let targetId: string | null = null;
                let isDraft = false;

                const logicToUse = q.draftSkipLogic ?? q.skipLogic;

                if (logicToUse) {
                    if (logicToUse.type === 'simple' && handle.id === 'output') {
                        targetId = logicToUse.skipTo === 'next' ? allQuestions[index + 1]?.id : logicToUse.skipTo;
                    } else if (logicToUse.type === 'per_choice') {
                        const rule = logicToUse.rules.find(r => r.choiceId === handle.id);
                        if (rule && rule.skipTo) {
                           targetId = rule.skipTo === 'next' ? allQuestions[index + 1]?.id : rule.skipTo;
                        }
                    }
                }
                
                isDraft = !!q.draftSkipLogic;

                // Default logic if no skip logic is defined for this handle
                if (!targetId && index < allQuestions.length - 1) {
                    // Check if *any* other rule on this question is terminal. If so, don't draw a default.
                    let isImplicitlyTerminal = false;
                    if (logicToUse?.type === 'simple') {
                        isImplicitlyTerminal = logicToUse.skipTo !== 'next';
                    }
                    if (!isImplicitlyTerminal) {
                        targetId = allQuestions[index + 1].id;
                    }
                }

                if (targetId && targetId !== 'end' && questionMap.has(targetId)) {
                    const edgeLabel = handle.choice ? parseChoice(handle.choice.text).variable : undefined;
                    flowEdges.push({
                        id: `e-${q.id}-${handle.id}-${targetId}`,
                        source: q.id,
                        sourceHandle: handle.id,
                        target: targetId,
                        targetHandle: 'input',
                        label: edgeLabel,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        className: isDraft ? 'draft' : undefined,
                    });
                }
            });
        });
        
        return { layoutNodes: flowNodes, layoutEdges: flowEdges };
    }, [survey]);
    
    useEffect(() => {
        const selectedId = selectedQuestion?.id;
        
        setNodes(layoutNodes.map(n => ({ ...n, selected: n.id === selectedId })));
        setEdges(layoutEdges.map(e => ({ ...e, selected: e.source === selectedId })));
        
        const justSwitchedToFlow = prevActiveTabRef.current !== 'Flow' && activeMainTab === 'Flow';
        
        const timer = setTimeout(() => {
            if (selectedId) {
                const outgoingEdges = layoutEdges.filter(e => e.source === selectedId);
                const targetNodeIds = outgoingEdges.map(e => e.target);
                const nodesToFit = [...new Set([selectedId, ...targetNodeIds])];

                reactFlowInstance.fitView({
                    nodes: nodesToFit.map(id => ({ id })),
                    duration: 600,
                    padding: 0.25,
                });
            } else if (justSwitchedToFlow) {
                reactFlowInstance.fitView({ duration: 600, padding: 0.1 });
            }
        }, 100);
        
        return () => clearTimeout(timer);

    }, [layoutNodes, layoutEdges, selectedQuestion, activeMainTab, reactFlowInstance, setNodes, setEdges]);
    
    useEffect(() => {
        prevActiveTabRef.current = activeMainTab;
    });

    const isValidConnection = useCallback((connection: Connection) => {
        if (!connection.source || !connection.target) {
            return false;
        }

        // Prevent self-connections
        if (connection.source === connection.target) {
            return false;
        }

        const sourceIndex = questionIndexMap.get(connection.source);
        const targetIndex = questionIndexMap.get(connection.target);

        if (sourceIndex === undefined || targetIndex === undefined) {
            return false; // Should not happen with valid nodes
        }
        
        // A connection is valid only if the target question comes after the source question.
        return targetIndex > sourceIndex;
    }, [questionIndexMap]);

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target || !connection.sourceHandle) {
                return;
            }
    
            const sourceQuestion = survey.blocks.flatMap(b => b.questions).find(q => q.id === connection.source);
            if (!sourceQuestion) return;
            
            const existingLogic = sourceQuestion.draftSkipLogic ?? sourceQuestion.skipLogic;
            let newLogic: Question['skipLogic'];
    
            if (sourceQuestion.type === QuestionType.Radio || sourceQuestion.type === QuestionType.Checkbox) {
                let newRules: SkipLogicRule[];
                if (existingLogic?.type === 'per_choice') {
                    newRules = [...existingLogic.rules];
                    const ruleIndex = newRules.findIndex(r => r.choiceId === connection.sourceHandle);
                    if (ruleIndex !== -1) {
                        newRules[ruleIndex] = { ...newRules[ruleIndex], skipTo: connection.target!, isConfirmed: false };
                    } else {
                        newRules.push({
                            choiceId: connection.sourceHandle,
                            skipTo: connection.target!,
                            isConfirmed: false
                        });
                    }
                } else {
                    newRules = (sourceQuestion.choices || []).map(choice => ({
                        choiceId: choice.id,
                        skipTo: choice.id === connection.sourceHandle ? connection.target! : 'next',
                        isConfirmed: false,
                    }));
                }
                newLogic = { type: 'per_choice', rules: newRules };
            } else if (sourceQuestion.type === QuestionType.TextEntry) {
                newLogic = { type: 'simple', skipTo: connection.target!, isConfirmed: false };
            }
    
            if (newLogic) {
                onUpdateQuestion(sourceQuestion.id, { skipLogic: newLogic });
                onSelectQuestion(sourceQuestion, { tab: 'Behavior', focusOn: connection.sourceHandle });
            }
        },
        [survey, onUpdateQuestion, onSelectQuestion]
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
    
            if (sourceQuestion.type === QuestionType.Radio || sourceQuestion.type === QuestionType.Checkbox) {
                let newRules: SkipLogicRule[];
                if (existingLogic?.type === 'per_choice') {
                    newRules = [...existingLogic.rules];
                    const ruleIndex = newRules.findIndex(r => r.choiceId === newConnection.sourceHandle);
                    if (ruleIndex !== -1) {
                        newRules[ruleIndex] = { ...newRules[ruleIndex], skipTo: newConnection.target!, isConfirmed: false };
                    } else {
                        newRules.push({
                            choiceId: newConnection.sourceHandle,
                            skipTo: newConnection.target!,
                            isConfirmed: false,
                        });
                    }
                } else {
                    newRules = (sourceQuestion.choices || []).map(choice => ({
                        choiceId: choice.id,
                        skipTo: choice.id === newConnection.sourceHandle ? newConnection.target! : 'next',
                        isConfirmed: false,
                    }));
                }
                newLogic = { type: 'per_choice', rules: newRules };
            } else {
                newLogic = { type: 'simple', skipTo: newConnection.target!, isConfirmed: false };
            }
    
            if (newLogic) {
                onUpdateQuestion(sourceQuestion.id, { skipLogic: newLogic });
                onSelectQuestion(sourceQuestion, { tab: 'Behavior', focusOn: newConnection.sourceHandle });
            }
            
            setEdges((els) => els.filter(e => e.id !== oldEdge.id));
        },
        [setEdges, survey, onUpdateQuestion, onSelectQuestion]
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
                isValidConnection={isValidConnection}
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
                <Controls />
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