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
    MarkerType,
    OnNodesChange,
    OnEdgesChange,
    Edge,
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

        // Identify Conditional Blocks (Target of Logic) to allow skipping them in default flow
        const conditionalBlockIds = new Set<string>();
        allQuestions.forEach(q => {
            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            const skipLogic = q.draftSkipLogic ?? q.skipLogic;

            const addTarget = (dest: string | undefined) => {
                if (!dest || dest === 'next' || dest === 'end') return;
                let blockId: string | undefined;
                if (dest.startsWith('block:')) {
                    blockId = dest.substring(6);
                } else {
                    const targetQ = questionMap.get(dest);
                    if (targetQ) blockId = questionIdToBlockIdMap.get(targetQ.id);
                }
                if (blockId) conditionalBlockIds.add(blockId);
            };

            if (branchingLogic) {
                branchingLogic.branches.forEach(b => {
                    if (b.thenSkipToIsConfirmed) addTarget(b.thenSkipTo);
                });
                // Note: We deliberately exclude 'otherwiseSkipTo', 'skipLogic', and 'block.continueTo'.
                // These points represent Merge Nodes or Shortcuts, not Exclusive Branches.
                // Only explicit 'IF' branches define an exclusive path that siblings must skip.
            }
        });

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
            if (dest === 'next') {
                const currentQ = allQuestions[currentIndex];
                const currentBlockId = questionIdToBlockIdMap.get(currentQ.id);

                // Traverse forward to find next NEUTRAL question/block
                for (let i = currentIndex + 1; i < allQuestions.length; i++) {
                    const candidate = allQuestions[i];
                    if (candidate.type === QuestionType.PageBreak) continue;

                    const candidateBlockId = questionIdToBlockIdMap.get(candidate.id);

                    // 1. Same Block: Always next (linear flow within block)
                    if (candidateBlockId === currentBlockId) {
                        return candidate.id;
                    }

                    // 2. Different Block: Only enter if NOT a conditional block
                    if (candidateBlockId && !conditionalBlockIds.has(candidateBlockId)) {
                        return candidate.id;
                    }

                    // If conditional, we skip this question (and effectively its block) and continue loop
                }
                return 'end-node';
            }
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

        while (queue.length > 0) {
            const u = queue.shift()!;
            for (const v of (adj[u] || [])) {
                if (!longestPath.has(v)) continue;
                const newPathLength = (longestPath.get(u) || 0) + 1;
                if (newPathLength > (longestPath.get(v) || 0)) {
                    longestPath.set(v, newPathLength);
                }
                inDegree[v]--;
                if (inDegree[v] === 0) {
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
        while (head < branchQueue.length) {
            const u = branchQueue[head++];

            const children = (adj[u] || []).sort((a, b) => {
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

        // --- PRE-CALCULATE NODE HEIGHTS ---
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

        // --- Lane-based Vertical Placement (Fix horizontal alignment) ---
        // Instead of centering columns, we assign each "Branch" (Chain) to a "Lane".
        // All nodes in a Lane share the same Y-center.

        // 1. Identify distinct Lanes (Branch Roots)
        const uniqueLanes = Array.from(new Set(branchRoot.values()));

        // 2. Sort Lanes to maintain vertical order (using the first node in the lane as proxy)
        uniqueLanes.sort((rootA, rootB) => {
            const orderA = allQuestionsOrder.get(rootA) ?? Infinity;
            const orderB = allQuestionsOrder.get(rootB) ?? Infinity;
            return orderA - orderB;
        });

        // 3. Calculate Height of each Lane
        // A lane's height is the maximum height of any node belonging to that lane/branchRoot
        const laneHeights = new Map<string, number>();
        allQuestions.forEach(q => {
            const root = branchRoot.get(q.id);
            if (root) {
                const h = nodeHeights.get(q.id) || 120;
                const currentMax = laneHeights.get(root) || 0;
                if (h > currentMax) {
                    laneHeights.set(root, h);
                }
            }
        });

        // 4. Calculate Y-position for each Lane (Stacking them)
        const laneYPositions = new Map<string, number>();
        let currentLaneY = 0;

        // Center the whole graph vertically around 0
        const totalGraphHeight = uniqueLanes.reduce((sum, root) => sum + (laneHeights.get(root) || 120) + VERTICAL_GAP, 0) - VERTICAL_GAP;
        let startY = -totalGraphHeight / 2;

        uniqueLanes.forEach(root => {
            const h = laneHeights.get(root) || 120;
            const centerY = startY + (h / 2);
            laneYPositions.set(root, centerY);
            startY += h + VERTICAL_GAP;
        });

        // 5. Assign Node Positions
        const nodePositions = new Map<string, { x: number, y: number }>();

        allQuestions.forEach(q => {
            const colIndex = longestPath.get(q.id) || 0;
            const root = branchRoot.get(q.id);
            const yPos = (root && laneYPositions.has(root)) ? laneYPositions.get(root)! : 0;

            nodePositions.set(q.id, {
                x: colIndex * X_SPACING,
                y: yPos
            });
        });

        // --- Create Nodes and Edges for React Flow ---
        const flowNodes: DiagramNode[] = [];
        const flowEdges: DiagramEdge[] = [];

        // START NODE
        const startNodeHeight = 60;
        const initialY = allQuestions.length > 0
            ? (nodePositions.get(allQuestions[0].id) || { y: 0 }).y
            : 0;

        const startNode: StartNode = {
            id: 'start-node',
            type: 'start',
            position: { x: -300, y: initialY }, // Position Start Node to the left of the graph
            data: { label: 'Start of Survey' },
            width: 180,
            height: startNodeHeight,
        };
        flowNodes.push(startNode);

        // EDGE FROM START TO FIRST QUESTION
        if (allQuestions.length > 0) {
            flowEdges.push({
                id: `e-start-${allQuestions[0].id}`,
                source: 'start-node',
                sourceHandle: 'output',
                target: allQuestions[0].id,
                targetHandle: 'input',
                type: 'default',
                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
            });
        }

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
                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--input-field-input-bd-def)' }
                    });
                }
                return;
            }

            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            const skipLogic: SkipLogic | undefined = q.draftSkipLogic ?? q.skipLogic;
            let logicHandled = false;
            const hasChoices = q.choices && q.choices.length > 0;

            // Helper to determine edge style
            const getEdgeStyle = (targetId: string, isExplicitLogic: boolean) => {
                let isDashed = isExplicitLogic;
                const targetQ = questionMap.get(targetId);

                // If target has display logic, it's conditional entry -> dashed
                if (targetQ && (
                    (targetQ.displayLogic && targetQ.displayLogic.conditions && targetQ.displayLogic.conditions.length > 0) ||
                    (targetQ.choiceDisplayLogic && (targetQ.choiceDisplayLogic.showConditions.length > 0 || targetQ.choiceDisplayLogic.hideConditions.length > 0))
                )) {
                    isDashed = true;
                }

                return isDashed ? { strokeDasharray: '5, 5' } : undefined;
            };

            if (branchingLogic) {
                const hasConfirmedBranches = branchingLogic.branches.some(b => b.thenSkipToIsConfirmed);
                const isOtherwiseConfirmed = branchingLogic.otherwiseIsConfirmed && branchingLogic.otherwiseSkipTo;


                // Logic is handled if we extend a branch OR if we have an unconditional "Otherwise" skip
                if (hasConfirmedBranches || isOtherwiseConfirmed) {
                    logicHandled = true;
                }

                const handledChoiceIds = new Set<string>();

                // 1. Create edges for explicit 'IF' branches
                branchingLogic.branches.forEach(branch => {
                    // ... existing loop ...
                    if (!branch.thenSkipToIsConfirmed) return;
                    const condition = branch.conditions.find(c => c.questionId === q.qid && c.isConfirmed);
                    if (condition) {
                        const choice = q.choices?.find(c => c.text === condition.value);
                        if (choice) {
                            handledChoiceIds.add(choice.id);
                            const targetId = resolveDestination(branch.thenSkipTo, index);
                            if (targetId) {
                                flowEdges.push({
                                    id: `e-${branch.id}-${targetId}`,
                                    source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                    label: branch.pathName || parseChoice(choice.text).variable,
                                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                    type: 'default',
                                    style: getEdgeStyle(targetId, true)
                                });
                            }
                        }
                    }
                });

                // 2. Handle 'Otherwise' OR Fallthrough
                // Fallback applies if explicit branches didn't cover everything, OR if we have no branches but do have otherwise.
                // If hasConfirmedBranches is true, fallback is 'next' (unless overridden by otherwise).
                // If hasConfirmedBranches is false, fallback is 'otherwise' (if confirmed) or null (if not).

                let fallbackTarget: string | null = null;
                if (hasConfirmedBranches) {
                    fallbackTarget = isOtherwiseConfirmed ? branchingLogic.otherwiseSkipTo : 'next';
                } else if (isOtherwiseConfirmed) {
                    fallbackTarget = branchingLogic.otherwiseSkipTo;
                }

                if (fallbackTarget) {
                    const targetId = resolveDestination(fallbackTarget, index);

                    if (targetId) {
                        // Check if this fallback effectively just goes to the next question anyway
                        const nextTargetId = resolveDestination('next', index);
                        const isRedundant = targetId === nextTargetId;

                        const isDefaultNext = fallbackTarget === 'next' || isRedundant;
                        const isUnconditional = !hasConfirmedBranches;

                        // Use a label only if:
                        // 1. It's NOT a default/redundant flow AND
                        // 2. Either it is a conditional fallback ("Otherwise") OR it has a custom name.
                        // If it is an unconditional skip (isUnconditional) and has NO custom name, we show NO label (just an arrow).
                        let label: string | null = null;
                        if (!isDefaultNext) {
                            if (!isUnconditional) {
                                label = branchingLogic.otherwisePathName || 'Otherwise';
                            } else {
                                label = branchingLogic.otherwisePathName || null;
                            }
                        }

                        const isDashed = !isDefaultNext; // Keep dashes for skips, solid for flow

                        if (hasChoices) {
                            // Wire up all unhandled choices
                            q.choices!.forEach(choice => {
                                if (!handledChoiceIds.has(choice.id)) {
                                    flowEdges.push({
                                        id: `e-${q.id}-${choice.id}-fallback-${targetId}`,
                                        source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                        label: isDefaultNext ? parseChoice(choice.text).variable : label,
                                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                        type: 'default',
                                        style: getEdgeStyle(targetId, !isDefaultNext) // Use isDashed logic essentially
                                    });
                                }
                            });
                        } else {
                            // Text Entry / single path fallback
                            flowEdges.push({
                                id: `e-${q.id}-fallback-${targetId}`,
                                source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                                label: label,
                                className: isDefaultNext ? 'structural' : undefined,
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                type: 'default',
                                style: getEdgeStyle(targetId, !isDefaultNext)
                            });
                        }
                    }
                }

            }
            if (skipLogic && !logicHandled) {
                if (skipLogic.type === 'simple') {
                    if (skipLogic.isConfirmed) {
                        logicHandled = true;
                        const targetId = resolveDestination(skipLogic.skipTo, index);
                        if (targetId) {
                            if (hasChoices) {
                                q.choices!.forEach(choice => {
                                    flowEdges.push({
                                        id: `e-${q.id}-${choice.id}-simple-skip-${targetId}`,
                                        source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                        label: parseChoice(choice.text).variable,
                                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                        type: 'default',
                                        style: getEdgeStyle(targetId, true)
                                    });
                                });
                            } else {
                                flowEdges.push({
                                    id: `e-${q.id}-skip-${targetId}`,
                                    source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                                    label: q.qid,
                                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                    type: 'default',
                                    style: getEdgeStyle(targetId, true)
                                });
                            }
                        }
                    }
                } else if (skipLogic.type === 'per_choice') {
                    logicHandled = true; // Per-choice logic always implies we handle edges, even if they fall through to 'next'
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
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                type: 'default',
                                style: getEdgeStyle(targetId, isConfirmedRule)
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
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                type: 'default'
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
                            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                            type: 'default',
                            style: getEdgeStyle(targetId, false)
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

    const questionIndexMap = useMemo(() => {
        const allQuestions = survey.blocks.flatMap(b => b.questions);
        return new Map(allQuestions.map((q, i) => [q.id, i]));
    }, [survey]);

    useEffect(() => {
        const selectedId = selectedQuestion?.id;

        setNodes(layoutNodes.map(n => {
            const isSelected = n.id === selectedId;
            const hasSourceConnection = layoutEdges.some(e => e.target === n.id && e.source === selectedId);
            return {
                ...n,
                selected: isSelected,
                data: {
                    ...n.data,
                    highlightSourceHandles: isSelected,
                    highlightInputHandle: hasSourceConnection,
                    label: (n.data as any).label || ''
                }
            };
        }) as any);

        setEdges(layoutEdges.map(e => {
            const isSelected = e.source === selectedId;
            return {
                ...e,
                selected: isSelected,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isSelected ? 'var(--semantic-pri)' : 'var(--diagram-edge-def)'
                }
            };
        }));

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

    const isValidConnection = useCallback((connection: Connection | Edge) => {
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
            if (!connection.source || !connection.target) {
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
                    } else if (connection.sourceHandle) {
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

    const onPaneClick = useCallback(() => {
        onSelectQuestion(null);
    }, [onSelectQuestion]);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        const sourceQuestion = survey.blocks.flatMap(b => b.questions).find(q => q.id === edge.source);
        if (sourceQuestion) {
            let focusTarget = edge.sourceHandle || undefined;

            const branches = sourceQuestion.draftBranchingLogic?.branches || sourceQuestion.branchingLogic?.branches;
            if (branches) {
                const matchedBranch = branches.find(b => edge.id.includes(b.id));
                if (matchedBranch) {
                    focusTarget = matchedBranch.id;
                }
            }

            onSelectQuestion(sourceQuestion, { tab: 'Behavior', focusOn: focusTarget });
        }
    }, [survey, onSelectQuestion]);

    const onReconnect = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            if (!newConnection.source || !newConnection.target) {
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
                    } else if (newConnection.sourceHandle) {
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
            <DiagramToolbar onAddNode={(type: 'multiple_choice' | 'text_entry' | 'logic') => console.log(type)} />
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
                onReconnect={onReconnect}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                className="bg-surface"
                fitView={true}
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