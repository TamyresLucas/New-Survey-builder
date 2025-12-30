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
    Edge,
} from '@xyflow/react';
import { toPng, toBlob } from 'html-to-image';
// import { toast } from 'react-toastify';

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
import { MIN_ZOOM, MAX_ZOOM } from '../constants';

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


export interface DiagramCanvasHandle {
    exportAsPng: () => Promise<void>;
}

interface DiagramCanvasProps {
    survey: Survey;
    selectedQuestion: Question | null;
    onSelectQuestion: (question: Question | null, options?: { tab?: string; focusOn?: string }) => void;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    activeMainTab: string;
}

const DiagramCanvasContent = React.forwardRef<DiagramCanvasHandle, DiagramCanvasProps>(({ survey, selectedQuestion, onSelectQuestion, onUpdateQuestion, activeMainTab }, ref) => {
    const { layoutNodes, layoutEdges } = useMemo(() => {
        const allQuestionsRaw = survey.blocks.flatMap(b => b.questions);
        const questionIdToBlockIdMap = new Map<string, string>();

        // Populate maps with ALL questions (including PageBreaks)
        survey.blocks.forEach(b => {
            b.questions.forEach(q => questionIdToBlockIdMap.set(q.id, b.id));
        });

        // Compute "Next Visual Node" map
        const nextVisualNodeMap = new Map<string, string>();
        let nextVisualId = 'end-node';

        for (let i = allQuestionsRaw.length - 1; i >= 0; i--) {
            const q = allQuestionsRaw[i];
            if (q.type === QuestionType.PageBreak) {
                nextVisualNodeMap.set(q.id, nextVisualId);
            } else {
                nextVisualId = q.id;
                nextVisualNodeMap.set(q.id, q.id);
            }
        }

        // Filtered list (No PageBreaks)
        const allQuestions = allQuestionsRaw.filter(q => q.type !== QuestionType.PageBreak);
        const questionMap = new Map(allQuestions.map(q => [q.id, q]));

        // --- 1. Map Branch IDs & Lanes ---
        const branchMap = new Map<string, string>();
        const blockToBranchId = new Map<string, string>();

        survey.blocks.forEach(b => {
            if (b.branchName) {
                branchMap.set(b.branchName, b.branchName);
                blockToBranchId.set(b.id, b.branchName);
            }
        });

        if (allQuestions.length === 0) return { layoutNodes: [], layoutEdges: [] };

        // --- 2. Build Graph (Adjacency List) & Edges Draft ---
        // We do this first to analyze structure
        const adj: Record<string, string[]> = {};
        const revAdj: Record<string, string[]> = {};
        const edgesDraft: DiagramEdge[] = [];

        // Helper: Find next sequential question
        const findNextQuestion = (startIndex: number, allQs: Question[]): Question | undefined => {
            // Simply return the next question since list is filtered
            return startIndex + 1 < allQs.length ? allQs[startIndex + 1] : undefined;
        };

        // Helper: Classify Blocks (Exclusive vs Normal)
        // A block is exclusive if it is the target of an explicit jump (branch or skip).
        const exclusiveBlockIds = new Set<string>();
        allQuestions.forEach(q => {
            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            const skipLogic = q.draftSkipLogic ?? q.skipLogic;

            const markTarget = (dest: string | undefined) => {
                if (!dest || dest === 'next' || dest === 'end') return;
                let blockId: string | undefined;
                if (dest.startsWith('block:')) {
                    blockId = dest.substring(6);
                } else {
                    const targetQ = questionMap.get(dest);
                    if (targetQ) blockId = questionIdToBlockIdMap.get(targetQ.id);
                }
                if (blockId) {
                    const block = survey.blocks.find(b => b.id === blockId);
                    // Only mark as exclusive if it is NOT a shared module (i.e., has a branch name)
                    // Shared modules should be accessible by 'next' flow from anywhere.
                    if (block && block.branchName) {
                        exclusiveBlockIds.add(blockId);
                    }
                }
            };

            if (branchingLogic) {
                branchingLogic.branches.forEach(b => {
                    if (b.thenSkipToIsConfirmed) markTarget(b.thenSkipTo);
                });
                if (branchingLogic.otherwiseIsConfirmed) markTarget(branchingLogic.otherwiseSkipTo);
            }
            if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                    markTarget(skipLogic.skipTo);
                } else if (skipLogic.type === 'per_choice') {
                    skipLogic.rules.forEach(r => {
                        if (r.isConfirmed) markTarget(r.skipTo);
                    });
                }
            }

            // Block ContinueTo logic
            const block = survey.blocks.find(b => b.questions.some(bq => bq.id === q.id));
            if (block && block.continueTo && block.continueTo !== 'next') {
                markTarget(block.continueTo);
            }
        });

        // Refine Exclusive Blocks: Removing Shared Convergence Blocks
        // If a block is marked sharedConvergence, it is NOT exclusive even if targeted by jumps.
        if (exclusiveBlockIds.size > 0) {
            survey.blocks.forEach(b => {
                if (b.sharedConvergence && exclusiveBlockIds.has(b.id)) {
                    exclusiveBlockIds.delete(b.id);
                }
            });
        }

        // Helper: Resolve destination ID
        const resolveDestination = (dest: string | undefined, currentIndex: number): string | undefined => {
            if (!dest) return undefined;
            if (dest === 'end') return 'end-node';
            if (dest === 'next') {
                const currentQ = allQuestions[currentIndex];
                const currentBlockId = questionIdToBlockIdMap.get(currentQ.id);

                // Traversal for "next" / fallthrough
                // allQuestions is already filtered, so simply iterate
                for (let i = currentIndex + 1; i < allQuestions.length; i++) {
                    const candidate = allQuestions[i];
                    const candidateBlockId = questionIdToBlockIdMap.get(candidate.id);

                    // 1. Same Block: Always flow to next question
                    if (candidateBlockId === currentBlockId) return candidate.id;

                    // 2. Different Block: Only flow if NOT exclusive
                    if (candidateBlockId && !exclusiveBlockIds.has(candidateBlockId)) {
                        return candidate.id;
                    }
                }
                return 'end-node';
            }
            if (dest.startsWith('block:')) {
                const blockId = dest.substring(6);
                const targetBlock = survey.blocks.find(b => b.id === blockId);
                const firstId = targetBlock?.questions[0]?.id;
                return firstId ? nextVisualNodeMap.get(firstId) : undefined;
            }
            // Resolve ID (potentially PageBreak) to next visual node
            return nextVisualNodeMap.get(dest);
        };

        allQuestions.forEach(q => {
            adj[q.id] = [];
            revAdj[q.id] = revAdj[q.id] || [];
        });

        // Edge Generation & Graph Building
        allQuestions.forEach((q, index) => {
            // No need to check for PageBreak, it is filtered.

            // Description Node Logic
            if (q.type === QuestionType.Description) {
                const nextQ = findNextQuestion(index, allQuestions);
                if (nextQ) {
                    const targetId = nextQ.id;
                    adj[q.id].push(targetId);
                    (revAdj[targetId] = revAdj[targetId] || []).push(q.id);
                    edgesDraft.push({
                        id: `e-${q.id}-${targetId}`,
                        source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                        type: 'default',
                        className: 'structural',
                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--input-field-input-bd-def)' },
                        data: { edgeType: 'sequence' }
                    });
                }
                return;
            }

            // Logic Handling
            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            const skipLogic = q.draftSkipLogic ?? q.skipLogic;
            const hasChoices = q.choices && q.choices.length > 0;
            let logicHandled = false;

            // --- BRANCHING LOGIC ---
            if (branchingLogic) {
                const hasConfirmedBranches = branchingLogic.branches.some(b => b.thenSkipToIsConfirmed);
                const isOtherwiseConfirmed = branchingLogic.otherwiseIsConfirmed && branchingLogic.otherwiseSkipTo;

                if (hasConfirmedBranches || isOtherwiseConfirmed) logicHandled = true;

                // Branches
                branchingLogic.branches.forEach(branch => {
                    if (branch.thenSkipToIsConfirmed && branch.thenSkipTo) {
                        const targetId = resolveDestination(branch.thenSkipTo, index);
                        if (targetId) {
                            // Find associated choice for handle mapping if possible
                            const condition = branch.conditions.find(c => c.questionId === q.qid && c.isConfirmed);
                            const choice = condition ? q.choices?.find(c => c.text === condition.value) : null;
                            const sourceHandle = choice ? choice.id : 'output';

                            adj[q.id].push(targetId);
                            (revAdj[targetId] = revAdj[targetId] || []).push(q.id);

                            edgesDraft.push({
                                id: `e-${branch.id}-${targetId}`,
                                source: q.id, sourceHandle, target: targetId, targetHandle: 'input',
                                label: branch.pathName || (choice ? parseChoice(choice.text).variable : 'Branch'),
                                type: 'default',
                                style: { strokeWidth: 2, stroke: 'var(--semantic-pri)' },
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--semantic-pri)' },
                                data: { edgeType: 'branch', logicType: 'branch' }
                            });
                        }
                    }
                });

                // Strict "Fan-Out" Logic:
                // We must ensure EVERY choice has a path.
                // 1. Collect all choice IDs that have explicit logic.
                const handledChoiceIds = new Set<string>();
                branchingLogic.branches.forEach(b => {
                    if (b.thenSkipToIsConfirmed) {
                        const condition = b.conditions.find(c => c.questionId === q.qid && c.isConfirmed);
                        if (condition && condition.value) {
                            const choice = q.choices?.find(c => c.text === condition.value);
                            if (choice) handledChoiceIds.add(choice.id);
                        }
                    }
                });

                // 2. Determine the "Fallback" target for choices NOT in the set.
                // Priority: Otherwise -> Next (Implicit)
                // STRICT DATA SOURCE TRUTH: Only use 'otherwiseSkipTo' if it exists in the JSON.
                // If it is missing (undefined/null), it means "No Otherwise Path" (likely exhuastive).
                // However, we still need 'next' as implicit fallthrough for non-exhaustive cases where explicit otherwise is missing?
                // User said: "Otherwise edge only exists if otherwise skip to exists".
                // So if otherwiseSkipTo is undefined, we do NOT draw an otherwise edge.

                // Wait, what about "Next"? 
                // If I have Choice A -> Jump. Choice B -> (Nothing defined).
                // Is this "Exhaustive"? No.
                // Does it have "Otherwise"? Maybe defaults to 'next'.
                // If `otherwiseSkipTo` is undefined, does that mean "Next" or "Nothing"?
                // In my logic editor update, I set `otherwiseSkipTo = 'next'` if non-exhaustive.
                // So reliable data should have `otherwiseSkipTo` if it wants a path.

                const fallbackTargetStr = branchingLogic.otherwiseSkipTo;
                const fallbackTargetId = fallbackTargetStr ? resolveDestination(fallbackTargetStr, index) : null;

                // 3. Draw edges for UNHANDLED choices to the fallback target
                if (fallbackTargetId && q.choices) {
                    const isImplicitNext = fallbackTargetStr === 'next';
                    const isExplicitOtherwise = !isImplicitNext; // Only implicit next gets sequence style now? Or unconditional otherwise too?
                    // User wants "Flow Customization". If I set "Otherwise -> End", that's a BRANCH.
                    // So if it's NOT implicit next, it should be a branch style (solid or labeled?)
                    // The "Otherwise" branch usually implies "Everything else".
                    // If we fan it out, each edge represents that "Otherwise" path.

                    // Let's stick to: Implicit 'next' = sequence style. Explicit 'Otherwise' = branch style.

                    q.choices.forEach(c => {
                        if (!handledChoiceIds.has(c.id)) {
                            adj[q.id].push(fallbackTargetId);
                            (revAdj[fallbackTargetId] = revAdj[fallbackTargetId] || []).push(q.id);

                            // Label: If explicit otherwise, maybe label "Otherwise"? Or leave blank to reduce clutter?
                            // User said "without sacrificing flow customization".
                            // Clutter risk. If 5 lines say "Otherwise", it's messy.
                            // Decision: No label on individual fan-out lines for otherwise to keep clean,
                            // unless it's a specific single path.
                            // BUT, if we don't label, how do we know it's "Otherwise" logic?
                            // The destination (e.g. End Node) makes it clear it's not normal flow if it deviates.

                            edgesDraft.push({
                                id: `e-${q.id}-fallback-${c.id}-${fallbackTargetId}`,
                                source: q.id,
                                sourceHandle: c.id,
                                target: fallbackTargetId,
                                targetHandle: 'input',
                                label: isExplicitOtherwise && branchingLogic.otherwisePathName ? branchingLogic.otherwisePathName : undefined,
                                type: 'default',
                                style: isExplicitOtherwise ? { stroke: 'var(--diagram-edge-def)', strokeDasharray: '5, 5' } : undefined, // Dashed for explicit otherwise? Or solid?
                                // Let's keep consistent: "Otherwise" was dashed in my previous code for general.
                                // But "Skip" is dashed. "Branch" is solid color.
                                // Let's use dashed for "Otherwise" fan-out to distinguish from explicit "Branch".
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                data: { edgeType: isExplicitOtherwise ? 'branch' : 'sequence' }
                            });
                        }
                    });
                } else if (fallbackTargetId && !hasChoices) {
                    // Non-choice questions (TextEntry) with "Otherwise" logic (which acts as main logic)
                    const isImplicitNext = fallbackTargetStr === 'next';
                    const isExplicitOtherwise = !isImplicitNext;

                    edgesDraft.push({
                        id: `e-${q.id}-fallback-${fallbackTargetId}`,
                        source: q.id,
                        sourceHandle: 'output',
                        target: fallbackTargetId,
                        targetHandle: 'input',
                        label: isExplicitOtherwise && branchingLogic.otherwisePathName ? branchingLogic.otherwisePathName : undefined,
                        type: 'default',
                        style: isExplicitOtherwise ? { stroke: 'var(--diagram-edge-def)', strokeDasharray: '5, 5' } : undefined,
                        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                        data: { edgeType: isExplicitOtherwise ? 'branch' : 'sequence' }
                    });
                }
            }

            // --- SKIP LOGIC ---
            else if (skipLogic) {
                // Simplified Implementation for visual consistency
                if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                    logicHandled = true;
                    const targetId = resolveDestination(skipLogic.skipTo, index);
                    if (targetId) {
                        adj[q.id].push(targetId);
                        (revAdj[targetId] = revAdj[targetId] || []).push(q.id);
                        edgesDraft.push({
                            id: `e-${q.id}-skip-${targetId}`,
                            source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                            label: 'Skip',
                            type: 'default',
                            style: { strokeDasharray: '5, 5' },
                            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                            data: { edgeType: 'conditional' }
                        });
                    }
                } else if (skipLogic.type === 'per_choice') {
                    logicHandled = true;
                    q.choices?.forEach(c => {
                        const rule = skipLogic.rules.find(r => r.choiceId === c.id);
                        const dest = (rule && rule.isConfirmed) ? rule.skipTo : 'next';
                        const targetId = resolveDestination(dest, index);

                        if (targetId) {
                            adj[q.id].push(targetId);
                            (revAdj[targetId] = revAdj[targetId] || []).push(q.id);

                            const isSpecialSkip = dest !== 'next';
                            edgesDraft.push({
                                id: `e-${q.id}-${c.id}-${targetId}`,
                                source: q.id, sourceHandle: c.id, target: targetId, targetHandle: 'input',
                                label: isSpecialSkip ? parseChoice(c.text).variable : undefined,
                                type: 'default',
                                style: isSpecialSkip ? { strokeDasharray: '5, 5' } : undefined,
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                data: { edgeType: isSpecialSkip ? 'conditional' : 'sequence' }
                            });
                        }
                    });
                }
            }


            // --- SEQUENCE / FALLTHROUGH (NO LOGIC) ---
            if (!logicHandled) {
                const targetId = resolveDestination('next', index);
                if (targetId) {
                    adj[q.id].push(targetId);
                    (revAdj[targetId] = revAdj[targetId] || []).push(q.id);

                    if (hasChoices) {
                        // FAN OUT for simple sequence
                        q.choices!.forEach(c => {
                            edgesDraft.push({
                                id: `e-${q.id}-${c.id}-seq-${targetId}`,
                                source: q.id, sourceHandle: c.id, target: targetId, targetHandle: 'input',
                                type: 'default',
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                                data: { edgeType: 'sequence' }
                            });
                        });
                    } else {
                        // Text Entry / Description (Keep Structural/Generic output)
                        edgesDraft.push({
                            id: `e-${q.id}-seq-${targetId}`,
                            source: q.id, sourceHandle: 'output', target: targetId, targetHandle: 'input',
                            type: 'default',
                            className: 'structural',
                            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                            data: { edgeType: 'sequence' }
                        });
                    }
                }
            }
        });

        // --- 4. Reachability & Swimlane Convergence Analysis ---
        // We traverse to determine which branches reach each node
        const nodeReachability = new Map<string, Set<string>>(); // qId -> Set<laneId>
        const initialQueue: string[] = [];

        // Initialize roots
        // Start Node is virtual, but its targets are the entry points.
        // We can treat questions with in-degree 0 (excluding structural) as roots.
        // Better: Start with 'start-node' concept. The first question usually.
        // Actually, we can just iterate top-down using our topological queue logic later, 
        // OR simply do a BFS propagation now with the `adj` list we built.

        // Initialize all to empty sets
        allQuestions.forEach(q => nodeReachability.set(q.id, new Set()));

        // Seed roots: Questions with no internal incomings (revAdj empty or from Start)
        // Actually, let's look at `allQuestions[0]` if exists.
        if (allQuestions.length > 0) {
            // The first question is reachable from "shared" (Start)
            const firstQ = allQuestions[0];
            nodeReachability.get(firstQ.id)?.add('shared');
            initialQueue.push(firstQ.id);
        }

        const reachQueue = [...initialQueue];
        const processedForReach = new Set<string>(initialQueue); // Simple BFS visitation check might not be enough for DAG prop?
        // DAG propagation requires processing parents before children.
        // Let's use the inDegree counts to drive a topological sort propagation.

        const reachInDegrees: Record<string, number> = {};
        allQuestions.forEach(q => reachInDegrees[q.id] = revAdj[q.id]?.length || 0);
        const topoQueue = allQuestions.filter(q => (reachInDegrees[q.id] || 0) === 0).map(q => q.id);

        // Ensure first question is in queue if not already
        if (allQuestions.length > 0 && reachInDegrees[allQuestions[0].id] > 0) {
            // It has incoming edges (loops?), but conceptually it's a root.
            // Cyclic graphs break topo sort. Survey flows *can* loop (randomization/loops).
            // For layout, we often ignore back-edges.
            // Fallback: Use standard BFS with Set merging which stabilizes? 
            // Or just stick to the simple "longest path" topo queue logic we used for columns.
            // Let's reuse the logic structure we're about to use for columns, but for reachability.
        }

        // Let's do a robust propagation (iterative calculation until stable? or just topological)
        // Given surveys are mostly DAGs, Topo is fine.
        // For loops, we break them (ignore back edges). We haven't identified back edges here yet.
        // Let's treat it as a BFS propagation. If a node is visited again with NEW info, re-queue it.

        // Logic replaced with Strict Block Property Enforcement below

        // Determine final Lane Assignment based on Strict Block Properties (User Request)
        // If a block does NOT have a branch name, it is forced to 'shared'.
        const nodeLanes = new Map<string, string>(); // qId -> laneId

        allQuestions.forEach(q => {
            const blockId = questionIdToBlockIdMap.get(q.id);
            const branchName = blockId ? blockToBranchId.get(blockId) : undefined;

            // Strict enforcement:
            if (branchName) {
                nodeLanes.set(q.id, branchName);
            } else {
                nodeLanes.set(q.id, 'shared');
            }
        });


        // --- 5. Compute Columns (Longest Path in DAG) ---
        const longestPath = new Map<string, number>();
        const inDegrees: Record<string, number> = {};
        allQuestions.forEach(q => {
            longestPath.set(q.id, 0);
            inDegrees[q.id] = revAdj[q.id]?.length || 0;
        });

        // "Start Node" virtual handling
        // If we have questions with in-degree 0, they are effectively roots.
        // We initialize them at col 0. 
        const queue: string[] = allQuestions.filter(q => (inDegrees[q.id] || 0) === 0).map(q => q.id);

        while (queue.length > 0) {
            const u = queue.shift()!;
            const uDist = longestPath.get(u) || 0;

            (adj[u] || []).forEach(v => {
                const currentDist = longestPath.get(v) || 0;
                if (uDist + 1 > currentDist) {
                    longestPath.set(v, uDist + 1);
                }
                inDegrees[v]--;
                if (inDegrees[v] === 0) queue.push(v);
            });
        }

        // --- 6. Swimlane Indexing ---
        // Map unique lanes to Y-indices
        const distinctLanes = Array.from(new Set(nodeLanes.values())).sort();
        // Ensure 'shared' is always 0
        const laneIndexMap = new Map<string, number>();
        laneIndexMap.set('shared', 0);
        let laneCounter = 1;
        distinctLanes.forEach(l => {
            if (l !== 'shared') laneIndexMap.set(l, laneCounter++);
        });

        // --- 7. Final Positioning (X/Y) ---
        const flowNodes: DiagramNode[] = [];
        const LANE_HEIGHT = 200; // Vertical separation between lanes override
        const nodeHeights = new Map<string, number>();

        allQuestions.forEach(q => {
            let h = 120;
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                h = 100 + (q.choices?.length || 0) * 40;
            }
            nodeHeights.set(q.id, h);
        });

        // Start Node Position
        const startNode: StartNode = {
            id: 'start-node',
            type: 'start',
            position: { x: -300, y: 0 },
            data: { label: 'Start of Survey' },
            width: 180,
            height: 60,
        };
        flowNodes.push(startNode);

        // Questions
        allQuestions.forEach(q => {
            const col = longestPath.get(q.id) || 0;
            const laneId = nodeLanes.get(q.id) || 'shared';
            const laneIdx = laneIndexMap.get(laneId) || 0;

            // X = column * spacing
            // Y = lane * height + offset?
            // To prevent overlap within same lane at same column (if DAG allows parallel nodes in same lane),
            // we might need "local rows". But for survey flows, usually simple sequential within lane.
            // If multiple nodes have same (Lane, Col), we stack them locally?
            // Simplification: DAG usually resolves X separation.

            const x = col * X_SPACING;
            const y = laneIdx * (LANE_HEIGHT + 100); // Simple lane stacking

            // Adjust y slightly if multiple nodes in same (lane, col)?
            // For now, raw lane y.

            const position = { x, y };

            // Push Node
            if (q.type === QuestionType.Description) {
                flowNodes.push({
                    id: q.id, type: 'description_node', position,
                    data: { question: q.text }, width: NODE_WIDTH, height: nodeHeights.get(q.id),
                });
            } else if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                flowNodes.push({
                    id: q.id, type: 'multiple_choice', position,
                    data: {
                        variableName: q.qid, question: q.text,
                        subtype: q.type === QuestionType.Checkbox ? 'checkbox' : 'radio',
                        options: q.choices?.map(c => ({ id: c.id, text: parseChoice(c.text).label, variableName: parseChoice(c.text).variable })) || [],
                    },
                    width: NODE_WIDTH, height: nodeHeights.get(q.id),
                });
            } else {
                flowNodes.push({
                    id: q.id, type: 'text_entry', position,
                    data: { variableName: q.qid, question: q.text },
                    width: NODE_WIDTH, height: nodeHeights.get(q.id),
                });
            }
        });

        // Connect Start Node
        if (allQuestions.length > 0) {
            edgesDraft.push({
                id: `e-start-${allQuestions[0].id}`,
                source: 'start-node', sourceHandle: 'output', target: allQuestions[0].id, targetHandle: 'input',
                type: 'default',
                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
                data: { edgeType: 'sequence' }
            });
        }

        // Add End Node if needed or mapped
        const maxCol = Math.max(0, ...Array.from(longestPath.values()));
        const endNode: EndNode = {
            id: 'end-node',
            type: 'end',
            position: { x: (maxCol + 1) * X_SPACING, y: 0 }, // Place on shared lane?
            data: { label: 'End of Survey' },
            width: 180, height: 60
        };
        flowNodes.push(endNode);

        return { layoutNodes: flowNodes, layoutEdges: edgesDraft };
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


    React.useImperativeHandle(ref, () => ({
        exportAsPng: async () => {
            // We use the viewport class from React Flow to only capture the canvas content
            // However, to capture the *entire* graph (not just visible area), we might need to adjust viewport temporarily or just use bounding box.
            // A common approach for React Flow:
            // 1. Get bounding box of all nodes
            // 2. Calculate transform to fit them
            // 3. Temporarily style the viewport or clone it
            //
            // Simpler approach for "Copy as PNG" often desired: Capture current view or fit view first.
            // Let's try capturing the .react-flow__viewport element.

            const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement;
            if (!viewportEl) return;

            try {
                const element = document.querySelector('.react-flow') as HTMLElement;
                if (!element) return;

                const dataUrl = await toPng(element, {
                    backgroundColor: '#ffffff', // survey-surface color usually white or light
                    filter: (node) => {
                        // Exclude controls from the screenshot
                        return (!node.classList?.contains('react-flow__controls') && !node.classList?.contains('react-flow__panel'));
                    }
                });

                // Write to Clipboard
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);

            } catch (error) {
                console.error('Failed to export diagram', error);
                throw error; // Re-throw to let App handle toast
            }
        }
    }));

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
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
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
});


const DiagramCanvas: React.FC<DiagramCanvasProps & { exportRef?: React.Ref<DiagramCanvasHandle> }> = memo(({ survey, selectedQuestion, onSelectQuestion, onUpdateQuestion, activeMainTab, exportRef }) => {
    return (
        <ReactFlowProvider>
            <DiagramCanvasContent
                ref={exportRef}
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