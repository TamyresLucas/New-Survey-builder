
import type { Survey, Block, Question, Choice } from '../../types.js';
import { Action, SurveyActionType } from '../actions.js';
import { generateId } from '../idProvider.js';
import { applyPagingAndRenumber } from '../surveyHelpers.js';

export const bulkReducer = (state: Survey, action: Action): Survey => {
    switch (action.type) {
        case SurveyActionType.BULK_DELETE_QUESTIONS: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionIds } = action.payload; // questionIds is a Set<string>
            newState.blocks.forEach((block: Block) => {
                block.questions = block.questions.filter((q: Question) => !questionIds.has(q.id));
            });
            // remove empty blocks
            newState.blocks = newState.blocks.filter((block: Block) => block.questions.length > 0 || newState.blocks.length === 1);
            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.BULK_UPDATE_QUESTIONS: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionIds, updates } = action.payload; // questionIds is a Set<string>
            newState.blocks.forEach((block: Block) => {
                block.questions.forEach((q: Question) => {
                    if (questionIds.has(q.id)) {
                        Object.assign(q, updates);
                    }
                });
            });
            return newState;
        }

        case SurveyActionType.BULK_DUPLICATE_QUESTIONS: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionIds } = action.payload; // questionIds is a Set<string>
            const questionsToCopy: Question[] = [];
            let lastQuestionBlockIndex = -1;
            let lastQuestionIndex = -1;

            // Find all questions to copy and the position of the last one
            for (let i = newState.blocks.length - 1; i >= 0; i--) {
                const block = newState.blocks[i];
                for (let j = block.questions.length - 1; j >= 0; j--) {
                    const question = block.questions[j];
                    if (questionIds.has(question.id)) {
                        questionsToCopy.unshift(JSON.parse(JSON.stringify(question))); // Keep original order
                        if (lastQuestionIndex === -1) {
                            lastQuestionIndex = j;
                            lastQuestionBlockIndex = i;
                        }
                    }
                }
            }

            if (questionsToCopy.length === 0 || lastQuestionBlockIndex === -1) {
                return state;
            }

            const duplicatedQuestions = questionsToCopy.map((q: Question) => ({
                ...q,
                id: generateId('q'),
                choices: q.choices?.map((c: Choice) => ({ ...c, id: generateId('c') }))
            }));

            newState.blocks[lastQuestionBlockIndex].questions.splice(lastQuestionIndex + 1, 0, ...duplicatedQuestions);

            return applyPagingAndRenumber(newState);
        }

        case SurveyActionType.BULK_MOVE_TO_NEW_BLOCK: {
            const newState = JSON.parse(JSON.stringify(state));
            const { questionIds } = action.payload; // questionIds is a Set<string>
            const questionsToMove: Question[] = [];
            let firstQuestionBlockIndex = -1;

            // Extract questions to move
            newState.blocks.forEach((block: Block, blockIndex: number) => {
                const questionsInBlock = block.questions.filter(q => questionIds.has(q.id));
                if (questionsInBlock.length > 0 && firstQuestionBlockIndex === -1) {
                    firstQuestionBlockIndex = blockIndex;
                }
                questionsToMove.push(...questionsInBlock);
                block.questions = block.questions.filter(q => !questionIds.has(q.id));
            });

            if (questionsToMove.length === 0) return state;

            const newBlock: Block = {
                id: generateId('block'),
                title: 'New block',
                questions: questionsToMove,
            };

            const insertionIndex = firstQuestionBlockIndex !== -1 ? firstQuestionBlockIndex + 1 : newState.blocks.length;
            newState.blocks.splice(insertionIndex, 0, newBlock);

            // Cleanup any empty blocks
            newState.blocks = newState.blocks.filter((block: Block) => block.questions.length > 0);

            return applyPagingAndRenumber(newState);
        }

        default:
            return state;
    }
}
