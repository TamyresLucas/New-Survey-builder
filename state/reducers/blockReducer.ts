
import type { Survey, Block, Question, Choice } from '../../types.js';
import { Action, SurveyActionType } from '../actions.js';
import { generateId } from '../idProvider.js';
import { renumberSurveyVariables } from '../../utils/logic.js';
import { applyPagingAndRenumber } from '../surveyHelpers.js';
import { QuestionType as QTEnum } from '../../types.js';

export const blockReducer = (state: Survey, action: Action): Survey => {
    // Only create copy if we are potentially handling the action
    // But switch case matching is cheap.
    // Optimization: check action type first.
    // However, to keep it simple, we will init newState inside the case?
    // No, common pattern is cleaner. We'll rely on JS engine optimization or do it per case.

    switch (action.type) {
        case SurveyActionType.UPDATE_BLOCK_TITLE: {
            const newState = JSON.parse(JSON.stringify(state));
            const { blockId, title } = action.payload;
            const block = newState.blocks.find((b: Block) => b.id === blockId);
            if (block) {
                block.title = title;
            }
            return newState;
        }

        case SurveyActionType.UPDATE_BLOCK: {
            const newState = JSON.parse(JSON.stringify(state));
            const { blockId, updates } = action.payload;
            const block = newState.blocks.find((b: Block) => b.id === blockId);
            if (block) {
                Object.assign(block, updates);

                // If hideBackButton is updated on the block, propagate to all its questions.
                if ('hideBackButton' in updates) {
                    block.questions.forEach((q: Question) => {
                        q.hideBackButton = updates.hideBackButton;
                    });
                }

                if (updates.autoAdvance === false) {
                    newState.globalAutoAdvance = false;
                }

                // If continueTo is updated, sync to last question's branching logic otherwiseSkipTo
                if ('continueTo' in updates) {
                    const lastQuestion = block.questions[block.questions.length - 1];
                    if (lastQuestion && lastQuestion.branchingLogic) {
                        // We only sync if branchingLogic exists (implying user has enabled branching)
                        // and specifically if branches exist or it was already active.
                        // Based on previous logic, empty branchingLogic is undefined, so check is safe.
                        lastQuestion.branchingLogic.otherwiseSkipTo = updates.continueTo;
                        lastQuestion.branchingLogic.otherwiseIsConfirmed = true;
                    }
                }
            }
            // If the update affects paging, we need to re-apply rules.
            if ('automaticPageBreaks' in updates) {
                return applyPagingAndRenumber(newState, state.pagingMode);
            }
            return newState;
        }

        case SurveyActionType.ADD_BLOCK: {
            const newState = JSON.parse(JSON.stringify(state));
            const { blockId, position } = action.payload;
            const newBlock: Block = {
                id: generateId('block'),
                title: 'New block',
                questions: [{
                    id: generateId('q'),
                    qid: '', // Will be renumbered
                    text: 'This is a description question placeholder.',
                    type: QTEnum.Description
                }]
            };
            const targetIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (targetIndex === -1) return state;

            const insertionIndex = position === 'above' ? targetIndex : targetIndex + 1;
            newState.blocks.splice(insertionIndex, 0, newBlock);
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.DELETE_BLOCK: {
            const newState = JSON.parse(JSON.stringify(state));
            const { blockId } = action.payload;
            newState.blocks = newState.blocks.filter((b: Block) => b.id !== blockId);
            if (newState.blocks.length === 0) {
                newState.blocks.push({
                    id: generateId('block'),
                    title: 'Default Block',
                    questions: [{
                        id: generateId('q'),
                        qid: '',
                        text: 'This is a description question placeholder.',
                        type: QTEnum.Description
                    }]
                });
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.COPY_BLOCK: {
            const newState = JSON.parse(JSON.stringify(state));
            const { blockId } = action.payload;
            const blockToCopyIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (blockToCopyIndex === -1) return state;

            const blockToCopy = newState.blocks[blockToCopyIndex];
            const newBlock: Block = {
                ...blockToCopy,
                id: generateId('block'),
                title: `${blockToCopy.title} (Copy)`,
                questions: blockToCopy.questions.map((q: Question) => ({
                    ...q,
                    id: generateId('q'),
                    choices: q.choices?.map((c: Choice) => ({ ...c, id: generateId('c') }))
                }))
            };

            // Add logic to handle unique description labels on copy
            const allOtherLabels = new Set(
                newState.blocks
                    .flatMap((b: Block) => b.questions)
                    .filter((q: Question) => q.type === QTEnum.Description && q.label)
                    .map((q: Question) => q.label!)
            );

            // This set will track labels as we make them unique *within* the new block
            const labelsInNewBlock = new Set<string>();

            newBlock.questions.forEach((q: Question) => {
                if (q.type === QTEnum.Description && q.label) {
                    let finalLabel = q.label;
                    if (allOtherLabels.has(finalLabel) || labelsInNewBlock.has(finalLabel)) {
                        if (/^Description \d+$/.test(finalLabel)) {
                            q.label = undefined; // Let renumbering handle it
                        } else {
                            let copyNum = 1;
                            let newAttempt = `${q.label} (Copy)`;
                            while (allOtherLabels.has(newAttempt) || labelsInNewBlock.has(newAttempt)) {
                                copyNum++;
                                newAttempt = `${q.label} (Copy ${copyNum})`;
                            }
                            finalLabel = newAttempt;
                        }
                    }
                    q.label = finalLabel;
                    if (q.label) {
                        labelsInNewBlock.add(q.label);
                    }
                }
            });

            newState.blocks.splice(blockToCopyIndex + 1, 0, newBlock);
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.REORDER_BLOCK: {
            const newState = JSON.parse(JSON.stringify(state));
            const { draggedBlockId, targetBlockId } = action.payload;
            const blocks = newState.blocks;
            const draggedBlockIndex = blocks.findIndex((b: Block) => b.id === draggedBlockId);
            if (draggedBlockIndex === -1) return state;

            const [draggedBlock] = blocks.splice(draggedBlockIndex, 1);
            if (targetBlockId === null) {
                blocks.push(draggedBlock);
            } else {
                const targetBlockIndex = blocks.findIndex((b: Block) => b.id === targetBlockId);
                if (targetBlockIndex !== -1) {
                    blocks.splice(targetBlockIndex, 0, draggedBlock);
                } else {
                    blocks.push(draggedBlock);
                }
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.MOVE_BLOCK_UP: {
            const newState = JSON.parse(JSON.stringify(state));
            const { blockId } = action.payload;
            const blockIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (blockIndex > 0) {
                const temp = newState.blocks[blockIndex - 1];
                newState.blocks[blockIndex - 1] = newState.blocks[blockIndex];
                newState.blocks[blockIndex] = temp;
                return renumberSurveyVariables(newState);
            }
            return state;
        }

        case SurveyActionType.MOVE_BLOCK_DOWN: {
            const newState = JSON.parse(JSON.stringify(state));
            const { blockId } = action.payload;
            const blockIndex = newState.blocks.findIndex((b: Block) => b.id === blockId);
            if (blockIndex !== -1 && blockIndex < newState.blocks.length - 1) {
                const temp = newState.blocks[blockIndex + 1];
                newState.blocks[blockIndex + 1] = newState.blocks[blockIndex];
                newState.blocks[blockIndex] = temp;
                return renumberSurveyVariables(newState);
            }
            return state;
        }

        case SurveyActionType.ADD_BLOCK_FROM_TOOLBOX: {
            const newState = JSON.parse(JSON.stringify(state));
            const { targetBlockId } = action.payload;
            const newBlock: Block = {
                id: generateId('block'),
                title: 'New block',
                questions: [{
                    id: generateId('q'),
                    qid: '',
                    text: 'This is a description question placeholder.',
                    type: QTEnum.Description
                }]
            };

            if (targetBlockId === null) {
                // Dropped at the end
                newState.blocks.push(newBlock);
            } else {
                const targetIndex = newState.blocks.findIndex((b: Block) => b.id === targetBlockId);
                if (targetIndex !== -1) {
                    newState.blocks.splice(targetIndex, 0, newBlock);
                } else {
                    newState.blocks.push(newBlock);
                }
            }
            return renumberSurveyVariables(newState);
        }

        case SurveyActionType.ADD_BLOCK_FROM_AI: {
            const newState = JSON.parse(JSON.stringify(state));
            const { title, insertAfterBid } = action.payload;
            const newBlock: Block = {
                id: generateId('block'),
                title: title || 'New Block',
                questions: []
            };

            if (insertAfterBid) {
                const targetIndex = newState.blocks.findIndex((b: Block) => b.bid === insertAfterBid);
                if (targetIndex !== -1) {
                    newState.blocks.splice(targetIndex + 1, 0, newBlock);
                } else {
                    newState.blocks.push(newBlock);
                }
            } else {
                newState.blocks.push(newBlock);
            }

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.ADD_SURVEY_FROM_LIBRARY: {
            const newState = JSON.parse(JSON.stringify(state));
            const { sourceSurvey, targetBlockId } = action.payload;

            if (!sourceSurvey || !sourceSurvey.blocks) return state;

            // 1. Create ID Mappings
            const idMap = new Map<string, string>(); // Maps oldId -> newId

            // Generate new IDs for everything first
            sourceSurvey.blocks.forEach((block: Block) => {
                const newBlockId = generateId('block');
                idMap.set(block.id, newBlockId);

                block.questions.forEach((q: Question) => {
                    const newQuestionId = generateId('q');
                    idMap.set(q.id, newQuestionId);

                    q.choices?.forEach((c: Choice) => {
                        idMap.set(c.id, generateId('c'));
                    });
                });
            });

            // 2. Clone and Update IDs & References
            const newBlocks: Block[] = sourceSurvey.blocks.map((block: Block) => {
                const newBlockId = idMap.get(block.id)!;

                const newQuestions = block.questions.map((q: Question) => {
                    const newQuestionId = idMap.get(q.id)!;

                    const newChoices = q.choices?.map((c: Choice) => ({
                        ...c,
                        id: idMap.get(c.id)!
                    }));

                    // Logic Cloning (references update later)
                    // We need to deep copy logic to avoid referencing the original objects
                    let newBranchingLogic = q.branchingLogic ? JSON.parse(JSON.stringify(q.branchingLogic)) : undefined;
                    let newDisplayLogic = q.displayLogic ? JSON.parse(JSON.stringify(q.displayLogic)) : undefined;
                    let newSkipLogic = q.skipLogic ? JSON.parse(JSON.stringify(q.skipLogic)) : undefined;

                    return {
                        ...q,
                        id: newQuestionId,
                        choices: newChoices,
                        branchingLogic: newBranchingLogic,
                        displayLogic: newDisplayLogic,
                        skipLogic: newSkipLogic,
                    };
                });

                return {
                    ...block,
                    id: newBlockId,
                    questions: newQuestions,
                };
            });

            // 3. Second Pass: Resolve References (Logic & Skips)
            newBlocks.forEach((block: Block) => {
                // Update Block continueTo
                if (block.continueTo && block.continueTo.startsWith('block:')) {
                    const oldTarget = block.continueTo.substring(6);
                    if (idMap.has(oldTarget)) {
                        block.continueTo = `block:${idMap.get(oldTarget)}`;
                    } else {
                        // If it points outside the imported survey, we might want to clear it or keep it?
                        // For now, let's keep it if we can't find it (maybe it points to something not imported), 
                        // BUT since it's a library import, external refs are likely invalid.
                        // Ideally we clear it if it's internal-only import.
                        // Let's assume library items are self-contained or point to 'end'.
                        // If it points to 'end', we leave it.
                    }
                }

                block.questions.forEach((q: Question) => {
                    // Update Branching Logic
                    if (q.branchingLogic) {
                        q.branchingLogic.branches.forEach((b: any) => {
                            if (b.thenSkipTo.startsWith('block:')) {
                                const oldId = b.thenSkipTo.substring(6);
                                if (idMap.has(oldId)) {
                                    b.thenSkipTo = `block:${idMap.get(oldId)}`;
                                }
                            }
                            // Update conditions
                            b.conditions?.forEach((cond: any) => {
                                if (idMap.has(cond.questionId)) cond.questionId = idMap.get(cond.questionId);
                                // We also need to map value if it relies on choice IDs? 
                                // Usually choiceId is stored separately if it's a choice match
                                if (cond.choiceId && idMap.has(cond.choiceId)) cond.choiceId = idMap.get(cond.choiceId);
                            });
                        });
                        if (q.branchingLogic.otherwiseSkipTo && q.branchingLogic.otherwiseSkipTo.startsWith('block:')) {
                            const oldId = q.branchingLogic.otherwiseSkipTo.substring(6);
                            if (idMap.has(oldId)) {
                                q.branchingLogic.otherwiseSkipTo = `block:${idMap.get(oldId)}`;
                            }
                        }
                    }

                    // Update Display Logic
                    if (q.displayLogic) {
                        // Similar updates for display logic conditions
                        q.displayLogic.conditions?.forEach((cond: any) => {
                            if (idMap.has(cond.questionId)) cond.questionId = idMap.get(cond.questionId);
                            if (cond.choiceId && idMap.has(cond.choiceId)) cond.choiceId = idMap.get(cond.choiceId);
                        });
                    }

                    // Update Skip Logic
                    if (q.skipLogic) {
                        // Similar updates for skip logic
                        q.skipLogic.conditions?.forEach((cond: any) => {
                            if (idMap.has(cond.questionId)) cond.questionId = idMap.get(cond.questionId);
                            if (cond.choiceId && idMap.has(cond.choiceId)) cond.choiceId = idMap.get(cond.choiceId);
                        });
                        if (q.skipLogic.action === 'skipTo' && q.skipLogic.target && q.skipLogic.target.startsWith('block:')) {
                            const oldId = q.skipLogic.target.substring(6);
                            if (idMap.has(oldId)) {
                                q.skipLogic.target = `block:${idMap.get(oldId)}`;
                            }
                        }
                    }
                });
            });


            // 4. Insert New Blocks
            if (targetBlockId === null) {
                // Dropped at the end
                newState.blocks.push(...newBlocks);
            } else {
                const targetIndex = newState.blocks.findIndex((b: Block) => b.id === targetBlockId);
                // Insert AFTER the target block (or before? usually drop is "insert here")
                // SurveyCanvas drop logic sends the ID of the block *dropped onto*.
                // If we drop ON block A, do we insert BEFORE or AFTER?
                // Standard reorder puts it before if coming from top, after if bottom.
                // For simplified "Add" behavior, let's insert AFTER the target block to be safe, or simply splice at index.
                // If I use splice at targetIndex, it pushes targetBlock down, so it inserts BEFORE.
                if (targetIndex !== -1) {
                    newState.blocks.splice(targetIndex, 0, ...newBlocks);
                } else {
                    newState.blocks.push(...newBlocks);
                }
            }

            return renumberSurveyVariables(newState);
        }

        default:
            return state;
    }
}
