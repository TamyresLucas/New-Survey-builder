
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
            const newBlock: Block = { id: generateId('block'), title: 'New block', questions: [] };
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
                    questions: []
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
            const newBlock: Block = { id: generateId('block'), title: 'New block', questions: [] };

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

        default:
            return state;
    }
}
