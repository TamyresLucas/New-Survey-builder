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

        // 0. Pre-calculate Jump Targets to identify "Conditional Questions"
        const jumpTargetIds = new Set<string>();
        allQuestions.forEach(q => {
            const bl = q.draftBranchingLogic ?? q.branchingLogic;
            const sl = q.draftSkipLogic ?? q.skipLogic;
            if (bl) {
                bl.branches.forEach(b => { if (b.thenSkipTo) jumpTargetIds.add(b.thenSkipTo); });
                if (bl.otherwiseSkipTo) jumpTargetIds.add(bl.otherwiseSkipTo);
            }
            if (sl) {
                if (sl.type === 'simple' && sl.skipTo) jumpTargetIds.add(sl.skipTo);
                if (sl.type === 'per_choice') sl.rules.forEach(r => { if (r.skipTo) jumpTargetIds.add(r.skipTo); });
            }
            const block = survey.blocks.find(b => b.questions.some(bq => bq.id === q.id));
            if (block && block.continueTo && block.continueTo !== 'next' && block.continueTo !== 'end') {
                // Block jumps are block-level, but if they point to a question we should know?
                // Usually they point to a Block ID.
            }
        });

        const resolveDestination = (dest: string, currentIndex: number): string | undefined => {
            if (dest === 'end') return 'end-node';
            if (dest === 'next') {
                const currentQ = allQuestions[currentIndex];
                const currentBlockId = questionIdToBlockIdMap.get(currentQ.id);

                // Traverse forward to find next NEUTRAL question
                // A Neutral question is one that is NOT the target of a jump AND has NO display logic.
                for (let i = currentIndex + 1; i < allQuestions.length; i++) {
                    const candidate = allQuestions[i];
                    if (candidate.type === QuestionType.PageBreak) continue;

                    // Skip candidates that are strictly conditional
                    // 1. Has Display Logic
                    const hasDisplayLogic = (candidate.displayLogic?.conditions?.length ?? 0) > 0 ||
                        (candidate.choiceDisplayLogic?.showConditions?.length ?? 0) > 0;
                    if (hasDisplayLogic) continue;

                    // 2. Is a Jump Target (Branch Head)
                    // If a question is a target of a specific jump, it usually starts a branch.
                    // The default flow should skip it and find the merge point.
                    // EXCEPTION: If it is in the SAME BLOCK, we usually fall through?
                    // User says: "Q5 connecting to Q6 (separate branch)... Should never happen".
                    // This implies even in same block, we skip jump targets.
                    if (jumpTargetIds.has(candidate.id)) continue;

                    return candidate.id;
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


    };

    // BETTER: Generate the edges first! Then compute layout.
    // But edges depend on positions? NO.
    // Edges creation logic below depends on 'resolveDestination'. It positions handles.
    // It does NOT depend on X/Y.
    // So we can generate edges list first, then do layout, then return both.
    // Refactoring order:

    const flowEdges: DiagramEdge[] = [];

    // Initialize set to track questions with broken logic
    const brokenLogicQuestionIds = new Set<string>();

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

        const checkTargetValidity = (targetId: string | undefined, sourceQId: string) => {
            if (!targetId) return false;
            if (targetId === 'end-node') return true;
            if (questionMap.has(targetId)) return true;
            // If we resolved a target ID but it doesn't exist in the map, it's broken logic
            brokenLogicQuestionIds.add(sourceQId);
            return false;
        };

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
                            if (checkTargetValidity(targetId, q.id)) {
                                flowEdges.push({
                                    id: `e-${branch.id}-${targetId}`,
                                    source: q.id, sourceHandle: choice.id, target: targetId!, targetHandle: 'input',
                                    label: branch.pathName || parseChoice(choice.text).variable,
                                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                    type: 'default',
                                    style: getEdgeStyle(targetId!, true)
                                });
                            }
                        }
                    } else {
                        // Handle Text Entry / Non-Choice Questions
                        const targetId = resolveDestination(branch.thenSkipTo, index);
                        if (checkTargetValidity(targetId, q.id)) {
                            flowEdges.push({
                                id: `e-${branch.id}-${targetId}`,
                                source: q.id, sourceHandle: 'output', target: targetId!, targetHandle: 'input',
                                label: branch.pathName || condition.operator,
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                type: 'default',
                                style: getEdgeStyle(targetId!, true)
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
                // Check validity only if explicit logic. Next/Fallthrough usually valid unless block logic broken.
                if (isOtherwiseConfirmed && !checkTargetValidity(targetId, q.id)) {
                    // Logic broken. Do not add edge.
                } else if (targetId) {
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
                            // className: isDefaultNext ? 'structural' : undefined, // Removed to ensure visibility
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
                    if (checkTargetValidity(targetId, q.id)) {
                        if (hasChoices) {
                            q.choices!.forEach(choice => {
                                flowEdges.push({
                                    id: `e-${q.id}-${choice.id}-simple-skip-${targetId}`,
                                    source: q.id, sourceHandle: choice.id, target: targetId!, targetHandle: 'input',
                                    label: parseChoice(choice.text).variable,
                                    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                    type: 'default',
                                    style: getEdgeStyle(targetId!, true)
                                });
                            });
                        } else {
                            flowEdges.push({
                                id: `e-${q.id}-skip-${targetId}`,
                                source: q.id, sourceHandle: 'output', target: targetId!, targetHandle: 'input',
                                label: q.qid,
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                type: 'default',
                                style: getEdgeStyle(targetId!, true)
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

                    if (isConfirmedRule && !checkTargetValidity(targetId, q.id)) {
                        // Broken rule. No edge.
                    } else if (targetId) {
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
                        label: q.qid,
                        // className: 'structural', // Removed to ensure visibility
                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                        type: 'default',
                        style: getEdgeStyle(targetId, false)
                    });
                }
            }
        }
    });


    // --- SWIMLANE LAYOUT ALGORITHM (Module-Based) ---
    // Constants
    const MODULE_GAP = 48;
    const NODE_GAP = 24;
    const LANE_HEIGHT = 300;
    const START_NODE_WIDTH = 180;
    const END_NODE_WIDTH = 180;

    // 1. Group Questions by Module (Block)
    const modules = survey.blocks.map(b => ({
        id: b.id,
        questions: b.questions.filter(q => q.type !== QuestionType.PageBreak),
        width: 0,
        x: 0,
        lane: 0,
        isShared: true
    }));

    // Calculate Module Widths
    modules.forEach(m => {
        const count = m.questions.length;
        if (count > 0) {
            m.width = (count * NODE_WIDTH) + ((count - 1) * NODE_GAP);
        }
    });

    // 2. Lane Assignment Logic
    const incomingEdgesToModule = new Map<string, Array<{ type: 'default' | 'branch', label?: string }>>();

    flowEdges.forEach(e => {
        const targetQ = questionMap.get(e.target);
        if (!targetQ) return;
        const targetBlockId = questionIdToBlockIdMap.get(targetQ.id);
        const sourceQ = questionMap.get(e.source);
        const sourceBlockId = sourceQ ? questionIdToBlockIdMap.get(sourceQ.id) : null;

        if (targetBlockId && targetBlockId !== sourceBlockId) {
            if (!incomingEdgesToModule.has(targetBlockId)) {
                incomingEdgesToModule.set(targetBlockId, []);
            }
            const isBranch = e.label && e.label !== targetQ.qid && (!e.className || !e.className.includes('structural'));
            incomingEdgesToModule.get(targetBlockId)!.push({
                type: isBranch ? 'branch' : 'default',
                label: typeof e.label === 'string' ? e.label : undefined
            });
        }
    });

    const laneAllocation = new Map<string, number>();
    let nextUpperLane = -1;
    let nextLowerLane = 1;

    modules.forEach((m, index) => {
        if (index === 0) return; // Block 1 is always shared

        const incomings = incomingEdgesToModule.get(m.id) || [];
        const hasDefaultPath = incomings.some(e => e.type === 'default');

        if (!hasDefaultPath && incomings.length > 0) {
            m.isShared = false;
            const branchName = incomings[0].label || 'Branch';

            if (!laneAllocation.has(branchName)) {
                if (index % 2 !== 0) {
                    laneAllocation.set(branchName, nextUpperLane--);
                } else {
                    laneAllocation.set(branchName, nextLowerLane++);
                }
            }
            m.lane = laneAllocation.get(branchName)!;
        }
    });

    // 3. Coordinate Calculation (Grid)
    let currentX = 250;

    modules.forEach(m => {
        m.x = currentX;
        currentX += m.width + MODULE_GAP;
    });

    const nodePositions = new Map<string, { x: number, y: number }>();

    modules.forEach(m => {
        const laneY = m.lane * LANE_HEIGHT;
        let nodeRelX = 0;

        m.questions.forEach(q => {
            const nodeHeight = nodeHeights.get(q.id) || 120;
            // Center vertically in lane
            const nodeY = laneY - (nodeHeight / 2);

            nodePositions.set(q.id, {
                x: m.x + nodeRelX,
                y: nodeY
            });

            nodeRelX += NODE_WIDTH + NODE_GAP;
        });
    });

    // 4. Generate Layout Nodes
    const flowNodes: DiagramNode[] = [];

    // START NODE
    const startNodeY = -(60 / 2);
    const startNode: StartNode = {
        id: 'start-node',
        type: 'start',
        position: { x: 0, y: startNodeY },
        data: { label: 'Start of Survey' },
        width: START_NODE_WIDTH,
        height: 60,
    };
    flowNodes.push(startNode);

    // EDGE FROM START TO FIRST QUESTION
    if (allQuestions.length > 0) {
        // Check if edge already exists? No, flowEdges is for QUESTION connections.
        // We need to ensure Start -> First is present.
        // It was added in previous code, let's keep it safe.
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

        const pos = nodePositions.get(q.id) || { x: 0, y: 0 };

        if (q.type === QuestionType.Description) {
            flowNodes.push({
                id: q.id, type: 'description_node', position: pos,
                data: {
                    question: q.text,
                    hasLogicError: brokenLogicQuestionIds.has(q.id)
                },
                width: NODE_WIDTH, height: nodeHeights.get(q.id) || 0,
            });
        } else if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
            flowNodes.push({
                id: q.id, type: 'multiple_choice', position: pos,
                data: {
                    variableName: q.qid,
                    question: q.text,
                    subtype: q.type === QuestionType.Checkbox ? 'checkbox' : 'radio',
                    options: q.choices?.map(c => ({
                        id: c.id, text: parseChoice(c.text).label, variableName: parseChoice(c.text).variable
                    })) || [],
                    hasLogicError: brokenLogicQuestionIds.has(q.id)
                },
                width: NODE_WIDTH, height: nodeHeights.get(q.id) || 0,
            });
        } else {
            flowNodes.push({
                id: q.id, type: 'text_entry', position: pos,
                data: {
                    variableName: q.qid,
                    question: q.text,
                    hasLogicError: brokenLogicQuestionIds.has(q.id)
                },
                width: NODE_WIDTH, height: nodeHeights.get(q.id) || 0,
            });
        }
    });

    // Set End Node Position
    const lastModule = modules[modules.length - 1];
    const endNodeX = lastModule ? (lastModule.x + lastModule.width + MODULE_GAP) : 300;

    const endNode: EndNode = {
        id: 'end-node',
        type: 'end',
        position: { x: endNodeX, y: startNodeY },
        data: { label: 'End of Survey' },
        width: END_NODE_WIDTH,
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

const onNodeClick = useCallback((event: React.MouseEvent, node: DiagramNode) => {
    // Find the question object from the survey
    const question = survey.blocks.flatMap(b => b.questions).find(q => q.id === node.id);
    if (question) {
        // Open specifically on the Behavior tab
        onSelectQuestion(question, { tab: 'Behavior' });
    }
}, [survey, onSelectQuestion]);

return (
    <div className="flex-1 w-full h-full relative">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
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