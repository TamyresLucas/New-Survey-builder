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
    const prevSelectedQuestionRef = useRef<Question | null>(null);

    // Memoize the flat list of all questions and a map of their indices for efficient validation.
    const questionIndexMap = useMemo(() => {
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        return new Map(allQuestions.map((q, i) => [q.id, i]));
    }, [survey]);
    
    const { layoutNodes, layoutEdges } = useMemo(() => {
        const findNextQuestion = (startIndex: number, allQs: Question[]): Question | undefined => {
            for (let i = startIndex + 1; i < allQs.length; i++) {
                if (allQs[i].type !== QuestionType.PageBreak) {
                    return allQs[i];
                }
            }
            return undefined;
        };
        
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        const questionMap: Map<string, Question> = new Map(allQuestions.map(q => [q.id, q]));

        if (allQuestions.length === 0) {
            return { layoutNodes: [], layoutEdges: [] };
        }
        
        // --- Graph Representation ---
        const adj: Record<string, string[]> = {};
        const revAdj: Record<string, string[]> = {};
        allQuestions.forEach(q => {
            adj[q.id] = [];
            revAdj[q.id] = [];
        });

        allQuestions.forEach((q, index) => {
            const targets = new Set<string>();
            const skipLogic = q.draftSkipLogic ?? q.skipLogic;
            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;

            if (branchingLogic) {
                branchingLogic.branches.forEach(branch => {
                    if (branch.thenSkipTo && branch.thenSkipTo !== 'next' && branch.thenSkipTo !== 'end') targets.add(branch.thenSkipTo);
                });
                if (branchingLogic.otherwiseSkipTo && branchingLogic.otherwiseSkipTo !== 'next' && branchingLogic.otherwiseSkipTo !== 'end') {
                    targets.add(branchingLogic.otherwiseSkipTo);
                }
            } else if (skipLogic) {
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
            
            const nextQuestion = findNextQuestion(index, allQuestions);
            if(nextQuestion) targets.add(nextQuestion.id);

            targets.forEach(targetId => {
                let finalTargetId = targetId;
                if (targetId.startsWith('block:')) {
                    const blockId = targetId.substring(6);
                    const targetBlock = survey.blocks.find(b => b.id === blockId);
                    finalTargetId = targetBlock?.questions.find(q => q.type !== QuestionType.PageBreak)?.id || '';
                }

                if (finalTargetId && questionMap.has(finalTargetId)) {
                    adj[q.id].push(finalTargetId);
                    revAdj[finalTargetId].push(q.id);
                }
            });
        });
        
        // --- Longest Path Algorithm (for column placement) ---
        const longestPath = new Map<string, number>();
        const inDegree: Record<string, number> = {};
        allQuestions.forEach(q => {
            longestPath.set(q.id, 0);
            inDegree[q.id] = revAdj[q.id].length;
        });
        
        const queue: string[] = allQuestions.filter(q => inDegree[q.id] === 0).map(q => q.id);
        
        while(queue.length > 0) {
            const u = queue.shift()!;
            for(const v of adj[u]) {
                const newPathLength = (longestPath.get(u) || 0) + 1;
                if (newPathLength > (longestPath.get(v) || 0)) {
                    longestPath.set(v, newPathLength);
                }
                inDegree[v]--;
                if(inDegree[v] === 0) {
                    queue.push(v);
                }
            }
        }
        
        // --- Column Grouping & Vertical Placement ---
        const columns: string[][] = [];
        longestPath.forEach((col, qId) => {
            if (!columns[col]) columns[col] = [];
            columns[col].push(qId);
        });

        const nodePositions = new Map<string, { x: number, y: number }>();
        const nodeHeights = new Map<string, number>();

        allQuestions.forEach(q => {
            let height = 120;
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                height = 100 + (q.choices?.length || 0) * 40;
            }
            nodeHeights.set(q.id, height);
        });

        columns.forEach((column, colIndex) => {
            const desiredY: Record<string, number> = {};
            column.forEach(qId => {
                const parents = revAdj[qId];
                if (parents.length > 0) {
                    const avgParentY = parents.reduce((sum, pId) => sum + (nodePositions.get(pId)?.y || 0), 0) / parents.length;
                    desiredY[qId] = avgParentY;
                } else {
                    desiredY[qId] = 0;
                }
            });

            const sortedColumn = column.sort((a, b) => desiredY[a] - desiredY[b]);
            
            let totalHeight = sortedColumn.reduce((sum, qId) => sum + (nodeHeights.get(qId) || 0), 0) + Math.max(0, sortedColumn.length - 1) * VERTICAL_GAP;
            let currentY = -totalHeight / 2;

            sortedColumn.forEach(qId => {
                const height = nodeHeights.get(qId) || 0;
                nodePositions.set(qId, { x: colIndex * X_SPACING, y: currentY + height / 2 });
                currentY += height + VERTICAL_GAP;
            });
        });

        // --- Create Nodes and Edges for React Flow ---
        const flowNodes: DiagramNode[] = [];
        const flowEdges: DiagramEdge[] = [];
        
        allQuestions.forEach((q) => {
            if (q.type === QuestionType.PageBreak || q.type === QuestionType.Description) return;

            const position = nodePositions.get(q.id) || { x: 0, y: 0 };
            
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                flowNodes.push({
                    id: q.id, type: 'multiple_choice', position,
                    data: {
                        variableName: q.qid,
                        question: q.text,
                        subtype: q.type === QuestionType.Checkbox ? 'checkbox' : 'radio',
                        options: q.choices?.map(c => ({
                            id: c.id, text: parseChoice(c.text).label, variableName: parseChoice(c.text).variable
                        })) || []
                    },
                    width: NODE_WIDTH, height: nodeHeights.get(q.id) || 0,
                });
            } else {
                flowNodes.push({
                    id: q.id, type: 'text_entry', position,
                    data: { variableName: q.qid, question: q.text },
                    width: NODE_WIDTH, height: nodeHeights.get(q.id) || 0,
                });
            }

            adj[q.id].forEach(targetId => {
                const sourceQuestion = q;
                let edgeLabel: string | undefined;
                let sourceHandle: string | undefined;
                
                // Determine source handle and label for choice-based questions
                const skipLogic = sourceQuestion.draftSkipLogic ?? sourceQuestion.skipLogic;
                if(skipLogic?.type === 'per_choice') {
                    const rule = skipLogic.rules.find(r => {
                        let destId = r.skipTo;
                        if (r.skipTo.startsWith('block:')) {
                            const blockId = r.skipTo.substring(6);
                            const targetBlock = survey.blocks.find(b => b.id === blockId);
                            destId = targetBlock?.questions.find(q => q.type !== QuestionType.PageBreak)?.id || '';
                        }
                        return destId === targetId;
                    });

                    if (rule) {
                        sourceHandle = rule.choiceId;
                        const choice = sourceQuestion.choices?.find(c => c.id === rule.choiceId);
                        if (choice) {
                            edgeLabel = parseChoice(choice.text).variable;
                        }
                    }
                }

                 if (!sourceHandle) {
                    sourceHandle = (sourceQuestion.choices && sourceQuestion.choices.length > 0) ? undefined : 'output';
                }

                if(targetId && questionMap.has(targetId)){
                    flowEdges.push({
                        id: `e-${q.id}-${sourceHandle || 'body'}-${targetId}`,
                        source: q.id,
                        sourceHandle: sourceHandle,
                        target: targetId,
                        targetHandle: 'input',
                        label: edgeLabel,
                        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--color-outline))' },
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
        const justDeselectedQuestion = !!prevSelectedQuestionRef.current && !selectedQuestion;
        
        if (selectedId) {
            const outgoingEdges = layoutEdges.filter(e => e.source === selectedId);
            const targetNodeIds = outgoingEdges.map(e => e.target);
            const nodesToFit = [...new Set([selectedId, ...targetNodeIds])];

            reactFlowInstance.fitView({
                nodes: nodesToFit.map(id => ({ id })),
                duration: 600,
                padding: 0.25,
            });
        } else if (justSwitchedToFlow || justDeselectedQuestion) {
            reactFlowInstance.fitView({ duration: 600, padding: 0.1 });
        }
    }, [layoutNodes, layoutEdges, selectedQuestion, activeMainTab, reactFlowInstance, setNodes, setEdges]);
    
    useEffect(() => {
        prevActiveTabRef.current = activeMainTab;
        prevSelectedQuestionRef.current = selectedQuestion;
    });

    const isValidConnection = useCallback((connection: Connection) => {
        if (!connection.source || !connection.target) {
            return false;
        }

        if (connection.source === connection.target) {
            return false;
        }

        const sourceIndex = questionIndexMap.get(connection.source);
        const targetIndex = questionIndexMap.get(connection.target);

        if (sourceIndex === undefined || targetIndex === undefined) {
            return false;
        }
        
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
                    color="hsl(var(--color-outline-variant))"
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