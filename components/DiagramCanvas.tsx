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
const SWIMLANE_SPACING = 400;

interface BranchNode {
    questionId: string;
    children: BranchNode[];
    connectorIndex: number;
    totalConnectors: number;
    descendantCount: number;
}


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
        // [DEBUG] Log full survey structure
        console.group('DEBUG: Survey Structure');
        survey.blocks.forEach(b => {
            console.log(`Block ${b.id} (${b.title}):`, {
                branchName: b.branchName,
                continueTo: b.continueTo,
                sharedConvergence: b.sharedConvergence,
                questions: b.questions.map(q => ({
                    id: q.id, qid: q.qid, type: q.type,
                    branching: q.draftBranchingLogic ?? q.branchingLogic,
                    skip: q.draftSkipLogic ?? q.skipLogic
                }))
            });
        });
        console.groupEnd();

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
        const allQuestionsOrder = new Map<string, number>(allQuestions.map((q, i) => [q.id, i])); // Early init for logic use

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
                            // Find associated choice for handle mapping if possible
                            const condition = branch.conditions.find(c => c.questionId === q.qid && c.isConfirmed);
                            // FIX: Use choiceId for stable matching if available, otherwise fallback to text value
                            const choice = condition
                                ? (condition.choiceId
                                    ? q.choices?.find(c => c.id === condition.choiceId)
                                    : q.choices?.find(c => c.text === condition.value))
                                : null;
                            const sourceHandle = choice ? choice.id : 'output';

                            adj[q.id].push(targetId);
                            (revAdj[targetId] = revAdj[targetId] || []).push(q.id);

                            edgesDraft.push({
                                id: `e-${branch.id}-${targetId}`,
                                source: q.id, sourceHandle, target: targetId, targetHandle: 'input',
                                label: branch.pathName || (choice ? parseChoice(choice.text).variable : 'Branch'),
                                type: 'default',
                                style: { strokeDasharray: '5, 5' },
                                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--diagram-edge-def)' },
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
                        if (condition) {
                            // FIX: Use choiceId logic here too for strict fan-out check
                            const choice = condition.choiceId
                                ? q.choices?.find(c => c.id === condition.choiceId)
                                : (condition.value ? q.choices?.find(c => c.text === condition.value) : undefined);

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

                    // Detect if otherwiseSkipTo is just mirroring block's natural continueTo
                    const currentBlockId = questionIdToBlockIdMap.get(q.id);
                    const currentBlock = survey.blocks.find(b => b.id === currentBlockId);
                    const isLastQuestionInBlock = currentBlock?.questions
                        .filter(bq => bq.type !== QuestionType.PageBreak)
                        .slice(-1)[0]?.id === q.id;
                    const blockContinueTo = currentBlock?.continueTo;

                    const isRedundantBlockFlow = isLastQuestionInBlock &&
                        branchingLogic.otherwiseSkipTo === blockContinueTo;

                    const isExplicitOtherwise = !isImplicitNext && !isRedundantBlockFlow; // Only explicit non-redundant otherwise gets dashed style
                    // User wants "Flow Customization". If I set "Otherwise -> End", that's a BRANCH.
                    // So if it's NOT implicit next, it should be a branch style (solid or labeled?)
                    // The "Otherwise" branch usually implies "Everything else".
                    // If we fan it out, each edge represents that "Otherwise" path.

                    // Let's stick to: Implicit 'next' = sequence style. Explicit 'Otherwise' = branch style.

                    q.choices.forEach(c => {
                        if (!handledChoiceIds.has(c.id)) {
                            adj[q.id].push(fallbackTargetId);
                            (revAdj[fallbackTargetId] = revAdj[fallbackTargetId] || []).push(q.id);

                            edgesDraft.push({
                                id: `e-${q.id}-fallback-${c.id}-${fallbackTargetId}`,
                                source: q.id,
                                sourceHandle: c.id,
                                target: fallbackTargetId,
                                targetHandle: 'input',
                                label: isExplicitOtherwise && branchingLogic.otherwisePathName ? branchingLogic.otherwisePathName : undefined,
                                type: 'default',
                                style: isExplicitOtherwise ? { stroke: 'var(--diagram-edge-def)', strokeDasharray: '5, 5' } : undefined,
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

                    adj[q.id].push(fallbackTargetId);
                    (revAdj[fallbackTargetId] = revAdj[fallbackTargetId] || []).push(q.id);

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

        // --- 4. Compute Columns (Longest Path in DAG) ---
        const longestPath = new Map<string, number>();
        const inDegrees: Record<string, number> = {};
        allQuestions.forEach(q => {
            longestPath.set(q.id, 0);
            inDegrees[q.id] = revAdj[q.id]?.length || 0;
        });

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


        // === SWIMLANE ASSIGNMENT (Generic Algorithm) ===

        // Track which branch paths can reach each node
        const reachableFrom = new Map<string, Set<string>>();
        allQuestions.forEach(q => {
            if (q.type !== QuestionType.PageBreak) {
                reachableFrom.set(q.id, new Set());
            }
        });

        // Find fork points dynamically (nodes with multiple outgoing edges)
        const forkPoints = new Set<string>();
        Object.entries(adj).forEach(([nodeId, children]) => {
            if (children.length > 1) {
                forkPoints.add(nodeId);
            }
        });

        // Propagate branch identity from each fork's children
        forkPoints.forEach(forkId => {
            const children = adj[forkId] || [];
            children.forEach(childId => {
                // BFS: propagate this branch identity to all descendants
                const branchId = childId;
                const queue = [childId];
                const visited = new Set<string>();

                while (queue.length > 0) {
                    const nodeId = queue.shift()!;
                    if (visited.has(nodeId)) continue;
                    visited.add(nodeId);

                    if (reachableFrom.has(nodeId)) {
                        reachableFrom.get(nodeId)!.add(branchId);
                    }

                    (adj[nodeId] || []).forEach(child => {
                        if (questionMap.has(child) && !visited.has(child)) {
                            queue.push(child);
                        }
                    });
                }
            });
        });

        // Identify convergence nodes (reachable from multiple branches)
        const convergenceNodes = new Set<string>();
        reachableFrom.forEach((branches, nodeId) => {
            if (branches.size > 1) {
                convergenceNodes.add(nodeId);
            }
        });

        // Assign swimlanes
        const nodeSwimlane = new Map<string, string>();

        // Convergence nodes and their descendants → 'shared'
        const propagateShared = (nodeId: string, visited: Set<string>) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            nodeSwimlane.set(nodeId, 'shared');
            (adj[nodeId] || []).forEach(child => {
                if (questionMap.has(child)) {
                    propagateShared(child, visited);
                }
            });
        };
        convergenceNodes.forEach(nodeId => propagateShared(nodeId, new Set()));

        // Single-branch nodes → their branch's lane
        allQuestions.forEach(q => {
            if (q.type === QuestionType.PageBreak) return;
            if (nodeSwimlane.has(q.id)) return; // Already assigned

            const branches = reachableFrom.get(q.id);
            if (branches && branches.size === 1) {
                const branchRootId = [...branches][0];

                // Get branch name from the fork's branching logic
                const forkId = [...forkPoints].find(fp => (adj[fp] || []).includes(branchRootId));
                if (forkId) {
                    const forkQ = questionMap.get(forkId);
                    const logic = forkQ?.draftBranchingLogic ?? forkQ?.branchingLogic;
                    const branch = logic?.branches.find(b => {
                        const targetId = resolveDestination(b.thenSkipTo, allQuestionsOrder.get(forkId) || 0);
                        return targetId === branchRootId;
                    });
                    nodeSwimlane.set(q.id, branch?.pathName || `branch-${branchRootId}`);
                } else {
                    nodeSwimlane.set(q.id, 'shared');
                }
            } else {
                // No branches reach this node (before any fork) → shared
                nodeSwimlane.set(q.id, 'shared');
            }
        });

        // Calculate Y offsets for each unique lane
        const uniqueLanes = [...new Set(nodeSwimlane.values())].filter(l => l !== 'shared');
        const swimlaneYOffset = new Map<string, number>();
        swimlaneYOffset.set('shared', 0);

        uniqueLanes.forEach((lane, index) => {
            // Alternate: -SPACING, +SPACING, -2*SPACING, +2*SPACING...
            const direction = index % 2 === 0 ? -1 : 1;
            const magnitude = Math.floor(index / 2) + 1;
            swimlaneYOffset.set(lane, direction * magnitude * SWIMLANE_SPACING);
        });



        // --- 6. Final Positioning (X/Y) ---
        const flowNodes: DiagramNode[] = [];
        const nodeHeights = new Map<string, number>();


        allQuestions.forEach(q => {
            let h = 120;
            if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                h = 100 + (q.choices?.length || 0) * 40;
            } else if (q.type === QuestionType.Description) {
                h = 120;
            }
            nodeHeights.set(q.id, h);
        });

        // Start Node
        const startNode: StartNode = {
            id: 'start-node',
            type: 'start',
            position: { x: -300, y: 0 },
            data: { label: 'Start of Survey' },
            width: 180, height: 60,
        };
        flowNodes.push(startNode);

        // --- Column Grouping with Swimlane-Aware Vertical Placement ---
        const columns: string[][] = [];
        longestPath.forEach((col, qId) => {
            if (questionMap.has(qId)) {
                if (!columns[col]) columns[col] = [];
                columns[col].push(qId);
            }
        });

        const nodePositions = new Map<string, { x: number, y: number }>();

        // Position nodes using swimlane Y offsets
        columns.forEach((column, colIndex) => {
            if (!column) return;

            // Group by swimlane within this column
            const laneGroups = new Map<string, string[]>();
            column.forEach(qId => {
                const lane = nodeSwimlane.get(qId) || 'shared';
                if (!laneGroups.has(lane)) laneGroups.set(lane, []);
                laneGroups.get(lane)!.push(qId);
            });

            // Position each lane group centered around its Y offset
            laneGroups.forEach((nodesInLane, lane) => {
                const laneOffset = swimlaneYOffset.get(lane) || 0;

                const sortedNodes = nodesInLane.sort((a, b) => {
                    const orderA = allQuestionsOrder.get(a) ?? 0;
                    const orderB = allQuestionsOrder.get(b) ?? 0;
                    return orderA - orderB;
                });

                const totalHeight = sortedNodes.reduce((sum, qId) =>
                    sum + (nodeHeights.get(qId) || 0), 0) +
                    Math.max(0, sortedNodes.length - 1) * VERTICAL_GAP;

                let currentY = laneOffset - totalHeight / 2;

                sortedNodes.forEach(qId => {
                    const height = nodeHeights.get(qId) || 0;
                    const x = colIndex * X_SPACING;

                    // Center Y is currentY + height/2.
                    // ReactFlow default is top-left, so we might want top-left.
                    // User requested generic algorithm. Let's use Top-Left logic for ReactFlow.
                    // My previous code used `y: currentY`.
                    // The proposed logic used `y: currentY + height / 2`.
                    // Let's stick to consistent top-left if possible, but the snippet says centered.
                    // I will use `y: currentY` which places the Top at Y.
                    // Wait, if `laneOffset` is 0 (Center), and total height is 200.
                    // Top is -100.
                    // If I put node at -100, its center is -100 + h/2.

                    // Let's use Top Left logic:
                    const position = { x, y: currentY };

                    const q = questionMap.get(qId);
                    if (q) {
                        if (q.type === QuestionType.Description) {
                            flowNodes.push({
                                id: q.id, type: 'description_node', position,
                                data: { question: q.text }, width: NODE_WIDTH, height: height,
                            });
                        } else if (q.type === QuestionType.Radio || q.type === QuestionType.Checkbox || q.type === QuestionType.ChoiceGrid) {
                            flowNodes.push({
                                id: q.id, type: 'multiple_choice', position,
                                data: {
                                    variableName: q.qid, question: q.text,
                                    subtype: q.type === QuestionType.Checkbox ? 'checkbox' : 'radio',
                                    options: q.choices?.map(c => ({ id: c.id, text: parseChoice(c.text).label, variableName: parseChoice(c.text).variable })) || [],
                                },
                                width: NODE_WIDTH, height: height,
                            });
                        } else {
                            flowNodes.push({
                                id: q.id, type: 'text_entry', position,
                                data: { variableName: q.qid, question: q.text },
                                width: NODE_WIDTH, height: height,
                            });
                        }
                    }

                    currentY += height + VERTICAL_GAP;
                });
            });
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
        const maxColumn = Math.max(0, ...Array.from(longestPath.values()));
        const endNode: EndNode = {
            id: 'end-node',
            type: 'end',
            position: {
                x: (maxColumn + 1) * X_SPACING,
                y: swimlaneYOffset.get('shared') || 0  // Align with shared lane
            },
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
                style: {
                    ...e.style,
                    stroke: isSelected ? 'var(--semantic-pri)' : 'var(--diagram-edge-def)',
                    strokeWidth: isSelected ? 2 : 1,
                },
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