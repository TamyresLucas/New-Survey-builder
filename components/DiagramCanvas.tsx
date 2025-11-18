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
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react';

import type { Survey, Question, SkipLogicRule, SkipLogic, EndNode, TextEntryNode, DescriptionNode, MultipleChoiceNode, StartNode } from '../types';
import type { Node as DiagramNode, Edge as DiagramEdge } from '../types';

import { generateId, parseChoice, isBranchingLogicExhaustive } from '../utils';
import { QuestionType } from '../types';

import StartNodeComponent from './diagram/nodes/StartNodeComponent';
import MultipleChoiceNodeComponent from './diagram/nodes/MultipleChoiceNodeComponent';
import TextEntryNodeComponent from './diagram/nodes/TextEntryNodeComponent';
import DescriptionNodeComponent from './diagram/nodes/DescriptionNodeComponent';
import EndNodeComponent from './diagram/nodes/EndNodeComponent';
import DiagramToolbar from './diagram/DiagramToolbar';

const nodeTypes: NodeTypes = {
  start: StartNodeComponent,
  multiple_choice: MultipleChoiceNodeComponent,
  text_entry: TextEntryNodeComponent,
  description_node: DescriptionNodeComponent,
  end: EndNodeComponent,
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
    const { layoutNodes, layoutEdges } = useMemo(() => {
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        const questionMap: Map<string, Question> = new Map(allQuestions.map(q => [q.id, q]));
        
        const questionIdToBlockIdMap = new Map<string, string>();
        survey.blocks.forEach(b => {
            b.questions.forEach(q => {
                questionIdToBlockIdMap.set(q.id, b.id);
            });
        });
        const allQuestionsOrder = new Map(allQuestions.map((q, i) => [q.id, i]));

        if (allQuestions.length === 0) {
            return { layoutNodes: [], layoutEdges: [] };
        }
        
        const findNextQuestion = (startIndex: number, allQs: Question[]): Question | undefined => {
            for (let i = startIndex + 1; i < allQs.length; i++) {
                if (allQs[i].type !== QuestionType.PageBreak) {
                    return allQs[i];
                }
            }
            return undefined;
        };
        
        const resolveDestination = (dest: string, currentIndex: number): string | undefined => {
            if (dest === 'end') return 'end-node';
            const nextQ = findNextQuestion(currentIndex, allQuestions);
            if (dest === 'next') return nextQ ? nextQ.id : 'end-node';
            if (dest.startsWith('block:')) {
                const blockId = dest.substring(6);
                const targetBlock = survey.blocks.find(b => b.id === blockId);
                return targetBlock?.questions.find(q => q.type !== QuestionType.PageBreak)?.id;
            }
            const qById = allQuestions.find(q => q.id === dest);
            if (qById) return qById.id;
            return undefined;
        };
        
        // --- Graph Representation for Layout Algorithm ---
        const adj: Record<string, string[]> = {};
        const revAdj: Record<string, string[]> = {};
        allQuestions.forEach(q => {
            if (q.type !== QuestionType.PageBreak) {
                adj[q.id] = [];
                revAdj[q.id] = [];
            }
        });

        allQuestions.forEach((q, index) => {
            if (q.type === QuestionType.PageBreak) return;

            if (q.type === QuestionType.Description) {
                const nextQ = findNextQuestion(index, allQuestions);
                if (nextQ) {
                    adj[q.id].push(nextQ.id);
                    revAdj[nextQ.id].push(q.id);
                }
                return;
            }

            const targets = new Map<string, 'explicit' | 'fallthrough'>();

            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            const skipLogic: SkipLogic | undefined = q.draftSkipLogic ?? q.skipLogic;

            let hasExplicitLogic = false;

            if (branchingLogic) {
                hasExplicitLogic = true;
                branchingLogic.branches.forEach(branch => {
                    if (branch.thenSkipToIsConfirmed && branch.thenSkipTo) {
                        const targetId = resolveDestination(branch.thenSkipTo, index);
                        if (targetId) targets.set(targetId, 'explicit');
                    }
                });
                if (branchingLogic.otherwiseIsConfirmed && branchingLogic.otherwiseSkipTo) {
                    const targetId = resolveDestination(branchingLogic.otherwiseSkipTo, index);
                    if (targetId) targets.set(targetId, 'explicit');
                }
            } else if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                    hasExplicitLogic = true;
                    const targetId = resolveDestination(skipLogic.skipTo, index);
                    if (targetId) targets.set(targetId, 'explicit');
                } else if (skipLogic.type === 'per_choice') {
                    hasExplicitLogic = true; // Assume explicit even if some fall through
                    const rulesChoices = new Set<string>();
                    skipLogic.rules.forEach(rule => {
                        rulesChoices.add(rule.choiceId);
                        if (rule.isConfirmed) {
                            const targetId = resolveDestination(rule.skipTo, index);
                            if (targetId) targets.set(targetId, 'explicit');
                        } else {
                            const targetId = resolveDestination('next', index);
                            if (targetId) targets.set(targetId, 'fallthrough');
                        }
                    });
                    const hasChoiceWithoutRule = q.choices?.some(c => !rulesChoices.has(c.id));
                    if (hasChoiceWithoutRule) {
                        const targetId = resolveDestination('next', index);
                        if (targetId) targets.set(targetId, 'fallthrough');
                    }
                }
            }

            if (!hasExplicitLogic) {
                const blockOfQuestion = survey.blocks.find(b => b.questions.some(bq => bq.id === q.id));
                const interactiveQuestionsInBlock = blockOfQuestion?.questions.filter(iq => iq.type !== QuestionType.PageBreak && iq.type !== QuestionType.Description);
                const lastInteractiveInBlock = interactiveQuestionsInBlock?.[interactiveQuestionsInBlock.length - 1];
                
                if (blockOfQuestion && lastInteractiveInBlock?.id === q.id && blockOfQuestion.continueTo && blockOfQuestion.continueTo !== 'next') {
                    const targetId = resolveDestination(blockOfQuestion.continueTo, index);
                    if (targetId) {
                        targets.set(targetId, 'explicit');
                    }
                } else {
                    const targetId = resolveDestination('next', index);
                    if (targetId) targets.set(targetId, 'fallthrough');
                }
            }

            if (targets.size === 0) {
                 const targetId = resolveDestination('next', index);
                 if (targetId) targets.set(targetId, 'fallthrough');
            }

            targets.forEach((type, targetId) => {
                if (targetId && (questionMap.has(targetId) || targetId === 'end-node')) {
                    let shouldAddToLayout = true;
                    if (type === 'fallthrough') {
                        const sourceBlock = questionIdToBlockIdMap.get(q.id);
                        const targetBlock = questionIdToBlockIdMap.get(targetId);
                        if (sourceBlock !== targetBlock) {
                            shouldAddToLayout = false;
                        }
                    }
                    if (shouldAddToLayout) {
                        adj[q.id].push(targetId);
                        if (revAdj[targetId]) {
                            revAdj[targetId].push(q.id);
                        } else {
                            revAdj[targetId] = [q.id];
                        }
                    }
                }
            });
        });
        
        // --- Longest Path Algorithm (for column placement) ---
        const longestPath = new Map<string, number>();
        const inDegree: Record<string, number> = {};
        allQuestions.forEach(q => {
            longestPath.set(q.id, 0);
            inDegree[q.id] = revAdj[q.id]?.length || 0;
        });
        
        const queue: string[] = allQuestions.filter(q => (inDegree[q.id] || 0) === 0).map(q => q.id);
        
        while(queue.length > 0) {
            const u = queue.shift()!;
            for(const v of (adj[u] || [])) {
                if (!longestPath.has(v)) continue;
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

        // --- Branch-Aware Layouting ---
        const branchRoot = new Map<string, string>(); // Maps node ID -> branch root ID
        const branchQueue: string[] = allQuestions.filter(q => (revAdj[q.id]?.length || 0) === 0).map(q => q.id);
        const visitedForBranching = new Set<string>();
        branchQueue.forEach(qId => branchRoot.set(qId, qId));

        let head = 0;
        while(head < branchQueue.length) {
            const u = branchQueue[head++];
            
            const children = (adj[u] || []).sort((a,b) => {
                const orderA = allQuestionsOrder.get(a) ?? 0;
                const orderB = allQuestionsOrder.get(b) ?? 0;
                return orderA > orderB ? 1 : (orderA < orderB ? -1 : 0);
            });
            const uIsFork = children.length > 1;

            children.forEach(v => {
                if (!questionMap.has(v)) return; // Don't process 'end-node' here
                const newRoot = uIsFork ? v : (branchRoot.get(u) || v);
                if (!branchRoot.has(v)) {
                    branchRoot.set(v, newRoot);
                }
                if (!visitedForBranching.has(v)) {
                    visitedForBranching.add(v);
                    branchQueue.push(v);
                }
            });
        }
        
        // --- Column Grouping & Vertical Placement ---
        const columns: string[][] = [];
        longestPath.forEach((col, qId) => {
            if (questionMap.has(qId)) {
                if (!columns[col]) columns[col] = [];
                columns[col].push(qId);
            }
        });

        const nodePositions = new Map<string, { x: number, y: number }>();
        const nodeHeights = new Map<string, number>();

        allQuestions.forEach(q => {
            let height = 120;
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                height = 100 + (q.choices?.length || 0) * 40;
            } else if (q.type === QuestionType.Description) {
                height = 120;
            }
            nodeHeights.set(q.id, height);
        });

        columns.forEach((column, colIndex) => {
            const sortedColumn = column.sort((a, b) => {
                const rootA = branchRoot.get(a);
                const rootB = branchRoot.get(b);
                
                const rootOrderA = rootA ? allQuestionsOrder.get(rootA) ?? Infinity : Infinity;
                const rootOrderB = rootB ? allQuestionsOrder.get(rootB) ?? Infinity : Infinity;
                
                if (rootOrderA !== rootOrderB) {
                    return rootOrderA > rootOrderB ? 1 : -1;
                }
        
                const pathA = longestPath.get(a) ?? 0;
                const pathB = longestPath.get(b) ?? 0;
                if (pathA !== pathB) {
                    return pathA > pathB ? 1 : -1;
                }
        
                const orderA = allQuestionsOrder.get(a) ?? 0;
                const orderB = allQuestionsOrder.get(b) ?? 0;
                return orderA > orderB ? 1 : (orderA < orderB ? -1 : 0);
            });
            
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
            if (q.type === QuestionType.PageBreak) return;

            const position = nodePositions.get(q.id) || { x: (longestPath.get(q.id) || 0) * X_SPACING, y: 0 };
            
            if (q.type === QuestionType.Description) {
                 flowNodes.push({
                    id: q.id, type: 'description_node', position,
                    data: {
                        question: q.text
                    },
                    width: NODE_WIDTH, height: nodeHeights.get(q.id) || 0,
                });
            } else if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
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
        });
        
        allQuestions.forEach((q, index) => {
            if (q.type === QuestionType.PageBreak) return;
        
            if (q.type === QuestionType.Description) {
                const targetId = resolveDestination('next', index);
                if (targetId && (questionMap.has(targetId) || targetId === 'end-node')) {
                    flowEdges.push({
                        id: `e-${q.id}-output-${targetId}`,
                        source: q.id,
                        sourceHandle: 'output',
                        target: targetId,
                        targetHandle: 'input',
                        label: q.qid,
                        className: 'structural',
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
                return;
            }
        
            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            const skipLogic: SkipLogic | undefined = q.draftSkipLogic ?? q.skipLogic;
            let logicHandled = false;
            const hasChoices = q.choices && q.choices.length > 0;
        
            if (branchingLogic) {
                logicHandled = true;
                const hasConfirmedBranches = branchingLogic.branches.some(b => b.thenSkipToIsConfirmed);
        
                // 1. Create edges for explicit 'IF' branches
                branchingLogic.branches.forEach(branch => {
                    if (!branch.thenSkipToIsConfirmed) return;
                    const condition = branch.conditions.find(c => c.questionId === q.qid && c.isConfirmed);
                    if (condition) {
                        const choice = q.choices?.find(c => c.text === condition.value);
                        if (choice) {
                            const targetId = resolveDestination(branch.thenSkipTo, index);
                            if (targetId) {
                                flowEdges.push({
                                    id: `e-${branch.id}-${targetId}`,
                                    source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                    label: branch.pathName || parseChoice(choice.text).variable,
                                    markerEnd: { type: MarkerType.ArrowClosed }
                                });
                            }
                        }
                    }
                });
        
                // 2. Create a single edge for the 'otherwise' case
                const isExhaustive = isBranchingLogicExhaustive(q);
                if (branchingLogic.otherwiseIsConfirmed && branchingLogic.otherwiseSkipTo && !isExhaustive) {
                    const isStructural = !hasConfirmedBranches;
                    const targetId = resolveDestination(branchingLogic.otherwiseSkipTo, index);
                    if (targetId) {
                        if (hasChoices && isStructural) {
                             q.choices!.forEach(choice => {
                                flowEdges.push({
                                    id: `e-${q.id}-${choice.id}-otherwise-${targetId}`,
                                    source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                    label: parseChoice(choice.text).variable,
                                    markerEnd: { type: MarkerType.ArrowClosed }
                                });
                            });
                        } else {
                            flowEdges.push({
                                id: `e-${q.id}-otherwise-${targetId}`,
                                source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                                label: isStructural ? q.qid : (branchingLogic.otherwisePathName || 'Otherwise'),
                                className: isStructural ? 'structural' : undefined,
                                markerEnd: { type: MarkerType.ArrowClosed }
                            });
                        }
                    }
                }
            } else if (skipLogic) {
                logicHandled = true;
                if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                    const targetId = resolveDestination(skipLogic.skipTo, index);
                    if (targetId) {
                        if (hasChoices) {
                            q.choices!.forEach(choice => {
                                flowEdges.push({
                                    id: `e-${q.id}-${choice.id}-simple-skip-${targetId}`,
                                    source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                    label: parseChoice(choice.text).variable,
                                    markerEnd: { type: MarkerType.ArrowClosed }
                                });
                            });
                        } else {
                            flowEdges.push({
                                id: `e-${q.id}-skip-${targetId}`,
                                source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                                label: q.qid,
                                markerEnd: { type: MarkerType.ArrowClosed }
                            });
                        }
                    }
                } else if (skipLogic.type === 'per_choice') {
                    (q.choices || []).forEach(choice => {
                        const rule = skipLogic.rules.find(r => r.choiceId === choice.id);
                        const isConfirmedRule = rule && rule.isConfirmed;
                        const dest = isConfirmedRule ? rule.skipTo : 'next';
                        const targetId = resolveDestination(dest, index);
            
                        if (targetId) {
                            flowEdges.push({
                                id: `e-${q.id}-${choice.id}-${isConfirmedRule ? 'skip' : 'fallthrough'}-${targetId}`,
                                source: q.id,
                                sourceHandle: choice.id,
                                target: targetId,
                                targetHandle: 'input',
                                label: isConfirmedRule ? parseChoice(choice.text).variable : '',
                                markerEnd: { type: MarkerType.ArrowClosed }
                            });
                        }
                    });
                }
            }
        
            // 3. Handle fallthrough (no explicit logic at all)
            if (!logicHandled) {
                const targetId = resolveDestination('next', index);
                if (targetId) {
                    if (q.choices && q.choices.length > 0) {
                        q.choices.forEach(choice => {
                            flowEdges.push({
                                id: `e-${q.id}-${choice.id}-fallthrough-${targetId}`,
                                source: q.id,
                                sourceHandle: choice.id,
                                target: targetId,
                                targetHandle: 'input',
                                label: parseChoice(choice.text).variable,
                                markerEnd: { type: MarkerType.ArrowClosed }
                            });
                        });
                    } else {
                        flowEdges.push({
                            id: `e-${q.id}-fallthrough-${targetId}`,
                            source: q.id,
                            sourceHandle: 'output',
                            target: targetId,
                            targetHandle: 'input',
                            label: q.qid,
                            className: 'structural',
                            markerEnd: { type: MarkerType.ArrowClosed }
                        });
                    }
                }
            }
        });

        const maxColumn = Math.max(0, ...Array.from(longestPath.values()));
        const endNode: EndNode = {
            id: 'end-node',
            type: 'end',
            position: { x: (maxColumn + 1) * X_SPACING, y: 0 },
            data: { label: 'End of Survey' },
            width: 180,
            height: 60,
        };
        flowNodes.push(endNode);

        return { layoutNodes: flowNodes, layoutEdges: flowEdges };
    }, [survey]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);
    const reactFlowInstance = useReactFlow();
    const prevActiveTabRef = useRef<string>();
    const prevSelectedQuestionRef = useRef<Question | null>(null);

    // Memoize the flat list of all questions and a map of their indices for efficient validation.
    const questionIndexMap = useMemo(() => {
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        return new Map(allQuestions.map((q, i) => [q.id, i]));
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

        if (connection.target === 'end-node') {
            return true;
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
            
            const target = connection.target === 'end-node' ? 'end' : connection.target;
    
            if (sourceQuestion.type === QuestionType.Radio || sourceQuestion.type === QuestionType.Checkbox) {
                let newRules: SkipLogicRule[];
                if (existingLogic?.type === 'per_choice') {
                    newRules = [...existingLogic.rules];
                    const ruleIndex = newRules.findIndex(r => r.choiceId === connection.sourceHandle);
                    if (ruleIndex !== -1) {
                        newRules[ruleIndex] = { ...newRules[ruleIndex], skipTo: target, isConfirmed: false };
                    } else {
                        newRules.push({
                            id: generateId('slr'),
                            choiceId: connection.sourceHandle,
                            skipTo: target,
                            isConfirmed: false
                        });
                    }
                } else {
                    newRules = (sourceQuestion.choices || []).map(choice => ({
                        id: generateId('slr'),
                        choiceId: choice.id,
                        skipTo: choice.id === connection.sourceHandle ? target : 'next',
                        isConfirmed: false,
                    }));
                }
                newLogic = { type: 'per_choice', rules: newRules };
            } else if (sourceQuestion.type === QuestionType.TextEntry) {
                newLogic = { type: 'simple', skipTo: target, isConfirmed: false };
            }
    
            if (newLogic) {
                onUpdateQuestion(sourceQuestion.id, { skipLogic: newLogic });
                onSelectQuestion(sourceQuestion, { tab: 'Behavior', focusOn: connection.sourceHandle || undefined });
            }
        },
        [survey, onUpdateQuestion, onSelectQuestion]
    );
    const onNodeClick = useCallback((_event: React.MouseEvent, node: DiagramNode) => {
        if (node.type === 'end') return;
        const fullQuestion = survey.blocks.flatMap(b => b.questions).find(q => q.id === node.id);
        if (fullQuestion) {
            onSelectQuestion(fullQuestion);
        }
    }, [survey, onSelectQuestion]);

    const onPaneClick = useCallback((_event?: React.MouseEvent) => {
        onSelectQuestion(null);
    }, [onSelectQuestion]);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: DiagramEdge) => {
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
            const target = newConnection.target === 'end-node' ? 'end' : newConnection.target;
    
            if (sourceQuestion.type === QuestionType.Radio || sourceQuestion.type === QuestionType.Checkbox) {
                let newRules: SkipLogicRule[];
                if (existingLogic?.type === 'per_choice') {
                    newRules = [...existingLogic.rules];
                    const ruleIndex = newRules.findIndex(r => r.choiceId === newConnection.sourceHandle);
                    if (ruleIndex !== -1) {
                        newRules[ruleIndex] = { ...newRules[ruleIndex], skipTo: target, isConfirmed: false };
                    } else {
                        newRules.push({
                            id: generateId('slr'),
                            choiceId: newConnection.sourceHandle,
                            skipTo: target,
                            isConfirmed: false,
                        });
                    }
                } else {
                    newRules = (sourceQuestion.choices || []).map(choice => ({
                        id: generateId('slr'),
                        choiceId: choice.id,
                        skipTo: choice.id === newConnection.sourceHandle ? target : 'next',
                        isConfirmed: false,
                    }));
                }
                newLogic = { type: 'per_choice', rules: newRules };
            } else {
                newLogic = { type: 'simple', skipTo: target, isConfirmed: false };
            }
    
            if (newLogic) {
                onUpdateQuestion(sourceQuestion.id, { skipLogic: newLogic });
                onSelectQuestion(sourceQuestion, { tab: 'Behavior', focusOn: newConnection.sourceHandle || undefined });
            }
        },
        [survey, onUpdateQuestion, onSelectQuestion]
    );


    return (
        <div className="w-full h-full">
            <DiagramToolbar onAddNode={(type) => console.log(type)} />
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