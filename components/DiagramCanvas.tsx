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

                    // 2. Different Block: Always fall through to next physical block
                    // (Previous logic incorrectly skipped blocks if they were targets of jumps)
                    if (candidateBlockId) {
                        return candidate.id;
                    }
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
                const handledChoices = new Set<string>();

                branchingLogic.branches.forEach(branch => {
                    if (branch.thenSkipToIsConfirmed && branch.thenSkipTo) {
                        const targetId = resolveDestination(branch.thenSkipTo, index);
                        if (targetId) targets.set(targetId, 'explicit');

                        // Mark choices as handled
                        branch.conditions.forEach(c => {
                            if (c.questionId === q.qid && c.isConfirmed) {
                                const ch = q.choices?.find(choice => choice.text === c.value);
                                if (ch) handledChoices.add(ch.id);
                            }
                        });
                    }
                });

                if (branchingLogic.otherwiseIsConfirmed && branchingLogic.otherwiseSkipTo) {
                    const targetId = resolveDestination(branchingLogic.otherwiseSkipTo, index);
                    if (targetId) targets.set(targetId, 'explicit');
                    // Otherwise effectively handles everything remaining
                } else {
                    // If no global otherwise, unhandled choices fall through to Next
                    // We must add 'fallthrough' targets for them
                    if (q.choices) {
                        const hasUnhandled = q.choices.some(c => !handledChoices.has(c.id));
                        if (hasUnhandled) {
                            const targetId = resolveDestination('next', index);
                            if (targetId) targets.set(targetId, 'fallthrough');
                        }
                    } else {
                        // Text entry or no choices.
                        // We assume there is always a fallthrough path (Implicit Else -> Next)
                        // for text questions unless 'otherwise' serves that purpose.
                        const targetId = resolveDestination('next', index);
                        if (targetId) targets.set(targetId, 'fallthrough');
                    }
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
        // (Legacy 'branchRoot' logic removed in favor of Backbone Layout)

        // --- PRE-CALCULATE NODE HEIGHTS & IDENTIFY BACKBONE ---
        const nodeHeights = new Map<string, number>();
        allQuestions.forEach(q => {
            let height = 120;
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                height = 100 + (q.choices?.length || 0) * 40;
            } else if (q.type === QuestionType.Description) {
                const estimatedLines = Math.ceil((q.text?.length || 0) / 40);
                const contentHeight = Math.min(96, Math.max(20, estimatedLines * 20));
                height = 45 + 24 + contentHeight;
            }
            nodeHeights.set(q.id, height);
        });

        // --- BACKBONE & ZERO-ANCHOR LAYOUT ---
        // Goal: "Default Path" (Start -> Q1 -> ... -> Q7 -> End) stays on Lane 0.
        // Branches spread symmetrically around their parent.

        // 1. Identify Backbone (Solid Path from Start OR Solid Path to End)
        // Note: Edge styles are generated LATER in logic below.
        // We replicate 'isSolid' logic by checking if edge would be solid.
        // Condition: 'fallthrough' target is SOLID.

        const backboneNodes = new Set<string>();
        const adjSolid: Record<string, string[]> = {};
        const revAdjSolid: Record<string, string[]> = {};

        // Helper to infer solidity without generating flowEdges yet
        const getIsSolidConnection = (sourceId: string, targetId: string): boolean => {
            // Simplified: logic matches logic below
            // If we connected via 'fallthrough' logic or 'confirmed' logic that isn't conditional?
            // Actually, simplest is to check if it's a fallthrough path or standard flow.
            // But we don't have the edge object yet.
            // Let's assume ANY edge in 'adj' is potentially solid unless it's a 'skip'.
            // However, logic above filtered out 'fallthrough' across blocks unless main flow.
            // We can re-use the 'targets' map logic? No.
            // Let's trust that 'adj' contains the structure.
            // We'll iterate ALL adj connections and assume they are solid if they are SEQUENTIAL?
            // No.
            return true; // Simplified assumption: ALL connected nodes are candidates for backbone if they form the longest path.
            // WAIT: Dashed edges (skips) should NOT be backbone.
        };

        // BETTER: Generate the edges first! Then compute layout.
        // But edges depend on positions? NO.
        // Edges creation logic below depends on 'resolveDestination'. It positions handles.
        // It does NOT depend on X/Y.
        // So we can generate edges list first, then do layout, then return both.
        // Refactoring order:

        const flowEdges: DiagramEdge[] = [];

        // GENERATE EDGES (Moved up from bottom)
        allQuestions.forEach((q, index) => {
            if (q.type === QuestionType.PageBreak) return;

            if (q.type === QuestionType.Description) {
                const targetId = resolveDestination('next', index);
                if (targetId && (questionMap.has(targetId) || targetId === 'end-node')) {
                    flowEdges.push({
                        id: `e-${q.id}-output-${targetId}`,
                        source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                        label: q.qid, className: 'structural',
                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--input-field-input-bd-def)' }
                    });
                }
                return;
            }

            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            const skipLogic: SkipLogic | undefined = q.draftSkipLogic ?? q.skipLogic;
            let logicHandled = false;
            const hasChoices = q.choices && q.choices.length > 0;

            const getEdgeStyle = (targetId: string, isExplicitLogic: boolean) => {
                let isDashed = isExplicitLogic;
                const targetQ = questionMap.get(targetId);
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
                if (hasConfirmedBranches || isOtherwiseConfirmed) logicHandled = true;

                const handledChoiceIds = new Set<string>();

                branchingLogic.branches.forEach(branch => {
                    if (!branch.thenSkipToIsConfirmed) return;
                    const condition = branch.conditions.find(c => c.questionId === q.qid && c.isConfirmed);
                    if (condition) {
                        // Handle Choice-Based Questions
                        if (q.choices && q.choices.length > 0) {
                            const choice = q.choices.find(c => c.text === condition.value);
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
                        } else {
                            // Handle Text Entry / Non-Choice Questions
                            // (Previously skipped because it looked for choice)
                            const targetId = resolveDestination(branch.thenSkipTo, index);
                            if (targetId) {
                                flowEdges.push({
                                    id: `e-${branch.id}-${targetId}`,
                                    source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                                    label: branch.pathName || condition.operator, // Use logic name or operator
                                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                    type: 'default',
                                    style: getEdgeStyle(targetId, true)
                                });
                            }
                        }
                    }
                });

                let fallbackTarget: string | null = null;
                if (hasConfirmedBranches) {
                    fallbackTarget = isOtherwiseConfirmed ? branchingLogic.otherwiseSkipTo : 'next';
                } else if (isOtherwiseConfirmed) {
                    fallbackTarget = branchingLogic.otherwiseSkipTo;
                }

                if (fallbackTarget) {
                    const targetId = resolveDestination(fallbackTarget, index);
                    if (targetId) {
                        const nextTargetId = resolveDestination('next', index);
                        const isRedundant = targetId === nextTargetId;
                        const isDefaultNext = fallbackTarget === 'next' || isRedundant;
                        const isUnconditional = !hasConfirmedBranches;
                        let label: string | null = null;
                        if (!isDefaultNext) {
                            if (!isUnconditional) {
                                label = branchingLogic.otherwisePathName || 'Otherwise';
                            } else {
                                label = branchingLogic.otherwisePathName || null;
                            }
                        }

                        if (hasChoices) {
                            q.choices!.forEach(choice => {
                                if (!handledChoiceIds.has(choice.id)) {
                                    flowEdges.push({
                                        id: `e-${q.id}-${choice.id}-fallback-${targetId}`,
                                        source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                        label: isDefaultNext ? parseChoice(choice.text).variable : label,
                                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                        type: 'default',
                                        style: getEdgeStyle(targetId, !isDefaultNext)
                                    });
                                }
                            });
                        } else {
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
                        // For Simple Skip Logic, we add the skip edge.
                        // BUT we do NOT mark logicHandled = true.
                        // This allows the default "Fallthrough" edge (Line 530) to ALSO be added.
                        // This ensures Q4 -> Q8 (Skip) AND Q4 -> Q5 (Next) both appear.
                        // logicHandled = true; <--- REMOVED
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
                    logicHandled = true;
                    (q.choices || []).forEach(choice => {
                        const rule = skipLogic.rules.find(r => r.choiceId === choice.id);
                        const isConfirmedRule = rule && rule.isConfirmed;
                        const dest = isConfirmedRule ? rule.skipTo : 'next';
                        const targetId = resolveDestination(dest, index);

                        if (targetId) {
                            flowEdges.push({
                                id: `e-${q.id}-${choice.id}-${isConfirmedRule ? 'skip' : 'fallthrough'}-${targetId}`,
                                source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                label: isConfirmedRule ? parseChoice(choice.text).variable : '',
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                type: 'default',
                                style: getEdgeStyle(targetId, isConfirmedRule)
                            });
                        }
                    });
                }
            }

            if (!logicHandled) {
                const targetId = resolveDestination('next', index);
                if (targetId) {
                    if (q.choices && q.choices.length > 0) {
                        q.choices.forEach(choice => {
                            flowEdges.push({
                                id: `e-${q.id}-${choice.id}-fallthrough-${targetId}`,
                                source: q.id, sourceHandle: choice.id, target: targetId, targetHandle: 'input',
                                label: parseChoice(choice.text).variable,
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                type: 'default'
                            });
                        });
                    } else {
                        flowEdges.push({
                            id: `e-${q.id}-fallthrough-${targetId}`,
                            source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                            label: q.qid, className: 'structural',
                            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                            type: 'default',
                            style: getEdgeStyle(targetId, false)
                        });
                    }
                }
            }
        });


        const isSolid = (e: DiagramEdge) => !e.style || !e.style.strokeDasharray;

        flowEdges.forEach(e => {
            if (isSolid(e)) {
                if (!adjSolid[e.source]) adjSolid[e.source] = [];
                adjSolid[e.source].push(e.target);
            }
        });

        // Forward Trace
        if (allQuestions.length > 0) {
            const startQ = allQuestions[0].id;
            const queue = [startQ];
            backboneNodes.add(startQ);
            const visitedFwd = new Set([startQ]);
            while (queue.length > 0) {
                const u = queue.shift()!;
                (adjSolid[u] || []).forEach(v => {
                    if (!visitedFwd.has(v) && v !== 'end-node') {
                        visitedFwd.add(v);
                        backboneNodes.add(v);
                        queue.push(v);
                    }
                });
            }
        }

        // Backward Trace
        const visitedRev = new Set(['end-node']);
        const queueRev = ['end-node'];
        backboneNodes.add('end-node');
        while (queueRev.length > 0) {
            const target = queueRev.shift()!;
            flowEdges.forEach(e => {
                if (e.target === target && isSolid(e) && !visitedRev.has(e.source)) {
                    visitedRev.add(e.source);
                    backboneNodes.add(e.source);
                    queueRev.push(e.source);
                }
            });
        }

        // 2. BFS Layout with Symmetrical Branching
        const laneMap = new Map<string, number>();
        // Only Anchor Start (Q1) to Lane 0. 
        // We let the topology determine the rest (Symmetrical Splits).
        if (allQuestions.length > 0) laneMap.set(allQuestions[0].id, 0);

        const queueLayout = allQuestions.length > 0 ? [allQuestions[0].id] : [];
        const visitedLayout = new Set<string>(queueLayout);

        while (queueLayout.length > 0) {
            const u = queueLayout.shift()!;
            const currentLane = laneMap.get(u) ?? 0;

            // Get children
            const children = (adj[u] || []).filter(v => v !== 'end-node');

            if (children.length > 0) {
                const n = children.length;
                const offsets: number[] = [];
                for (let i = 0; i < n; i++) offsets.push(i - (n - 1) / 2);

                // Symmetrical Spread: No Backbone Shifting.
                // Fork (N > 1): Splits around center. (e.g. -0.5, 0.5)
                // Straight (N = 1): Offset is 0. Stays in lane.

                children.forEach((v, i) => {
                    let targetLane = currentLane + offsets[i];

                    // FORCE NEUTRAL NODES TO LANE 0
                    // If a node is NOT in a conditional block, it is part of the "Main Stem" (Backbone).
                    // It should always return to the center.
                    const qV = questionMap.get(v);
                    const blockId = qV ? questionIdToBlockIdMap.get(qV.id) : null;
                    if (blockId && !conditionalBlockIds.has(blockId)) {
                        targetLane = 0;
                    }

                    if (!laneMap.has(v)) {
                        laneMap.set(v, targetLane);
                        visitedLayout.add(v);
                        queueLayout.push(v);
                    }
                });
            }
        }

        // 3. Dynamic Lane Stacking (Fix Overlap)
        // Group nodes by Lane
        const nodesByLane = new Map<number, string[]>();
        laneMap.forEach((lane, id) => {
            if (!nodesByLane.has(lane)) nodesByLane.set(lane, []);
            nodesByLane.get(lane)!.push(id);
        });

        // Calculate Max Height per Lane
        const laneHeights = new Map<number, number>();
        nodesByLane.forEach((ids, lane) => {
            let maxH = 0;
            ids.forEach(id => {
                const h = nodeHeights.get(id) || 120;
                if (h > maxH) maxH = h;
            });
            laneHeights.set(lane, maxH);
        });

        // Calculate Y Positions
        const laneYPositions = new Map<number, number>();
        laneYPositions.set(0, 0);

        const sortedLanes = Array.from(laneHeights.keys()).sort((a, b) => a - b);
        const positiveLanes = sortedLanes.filter(l => l > 0);
        const negativeLanes = sortedLanes.filter(l => l < 0).reverse();

        // Stack Positive
        let currentY = 0;
        let prevLane = 0;
        positiveLanes.forEach(lane => {
            const prevH = laneHeights.get(prevLane) || 120;
            const currH = laneHeights.get(lane) || 120;
            const gap = VERTICAL_GAP;
            currentY += (prevH / 2) + gap + (currH / 2);
            laneYPositions.set(lane, currentY);
            prevLane = lane;
        });

        // Stack Negative
        currentY = 0;
        prevLane = 0;
        negativeLanes.forEach(lane => {
            const prevH = laneHeights.get(prevLane) || 120;
            const currH = laneHeights.get(lane) || 120;
            const gap = VERTICAL_GAP;
            currentY -= ((prevH / 2) + gap + (currH / 2));
            laneYPositions.set(lane, currentY);
            prevLane = lane;
        });

        const nodePositions = new Map<string, { x: number, y: number }>();
        allQuestions.forEach(q => {
            const colIndex = longestPath.get(q.id) || 0;
            const lane = laneMap.get(q.id) ?? 0;
            const laneCenterY = laneYPositions.get(lane) ?? (lane * 220);
            const nodeHeight = nodeHeights.get(q.id) || 120;

            nodePositions.set(q.id, {
                x: colIndex * X_SPACING,
                y: laneCenterY - (nodeHeight / 2)
            });
        });

        // --- Create Nodes for React Flow ---
        const flowNodes: DiagramNode[] = [];

        // START NODE
        const startNodeHeight = 60;
        const headerOffset = 23;

        let initialY = 0;
        if (allQuestions.length > 0) {
            const firstQ = allQuestions[0];
            const pos = nodePositions.get(firstQ.id);
            if (pos) {
                // Align Start Node: If Q1 is at lane 0 (usually), start is aligned.
                // If Q1 is shifted? (Unlikely for Q1).
                initialY = (pos.y + (nodeHeights.get(firstQ.id)! / 2)) + headerOffset - (startNodeHeight / 2);
            }
        }

        const startNode: StartNode = {
            id: 'start-node',
            type: 'start',
            position: { x: -300, y: initialY },
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

        // Set End Node Position
        const maxColumn = Math.max(0, ...Array.from(longestPath.values()));
        // Force End Node to Lane 0 Center
        let endNodeY = (laneYPositions.get(0) || 0) + headerOffset - (60 / 2);

        // Optional: If we want to align with "Last Element in Lane 0" if it exists? 
        // Or "Last Element on Longest Path"?
        // User wants global alignment. Center line (0) is safest.

        const endNode: EndNode = {
            id: 'end-node',
            type: 'end',
            position: { x: (maxColumn + 1) * X_SPACING, y: endNodeY },
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
            return false;
        }
        if (connection.source === 'start-node') {
            return false;
        }

        const sourceQ = survey.blocks.flatMap(b => b.questions).find(q => q.id === connection.source);
        const targetQ = survey.blocks.flatMap(b => b.questions).find(q => q.id === connection.target);

        if (!sourceQ || !targetQ) return false;

        const sIndex = questionIndexMap.get(sourceQ.id) ?? -1;
        const tIndex = questionIndexMap.get(targetQ.id) ?? -1;

        if (tIndex <= sIndex) {
            return false;
        }

        return true;
    }, [survey, questionIndexMap]);

    const onConnect = useCallback((connection: Connection) => {
        if (!isValidConnection(connection)) {
            return;
        }
        // Logic connection handlng... (omitted as not part of layout)
    }, [isValidConnection]);

    return (
        <div className="flex-1 w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-diagram-bg"
                minZoom={0.1}
                isValidConnection={isValidConnection}
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="var(--diagram-grid-dot)" />
                <Controls className="bg-surface border-outline shadow-sm" />
                <DiagramToolbar onAddNode={() => { }} />
            </ReactFlow>
        </div>
    );
};

const DiagramCanvas: React.FC<DiagramCanvasProps> = (props) => (
    <ReactFlowProvider>
        <DiagramCanvasContent {...props} />
    </ReactFlowProvider>
);

export default memo(DiagramCanvas);