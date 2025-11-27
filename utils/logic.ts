import type { Survey, Question, Block } from '../types';
import { QuestionType } from '../types';
import { generateId } from './id';

export const CHOICE_BASED_QUESTION_TYPES = new Set<QuestionType>([
    QuestionType.Radio,
    QuestionType.Checkbox,
    QuestionType.DropDownList,
    QuestionType.ImageSelector,
    QuestionType.ChoiceGrid,
]);

export const NON_CHOICE_BASED_QUESTION_TYPES_WITH_TEXT = new Set<QuestionType>([
    QuestionType.Description,
    QuestionType.TextEntry,
]);

/**
 * Checks if a question has branching logic that covers every possible choice.
 * @param question The question to check.
 * @returns True if the branching logic is exhaustive, false otherwise.
 */
export const isBranchingLogicExhaustive = (question: Question | undefined): boolean => {
    // 1. Must be a question with choices to be exhaustive.
    if (!question || !question.choices || question.choices.length === 0) {
        return false;
    }

    // 2. Must have branching logic.
    const logic = question.draftBranchingLogic ?? question.branchingLogic;
    if (!logic || !logic.branches || logic.branches.length === 0) {
        return false;
    }

    // 3. Collect all unique choice texts.
    const allChoiceTexts = new Set(question.choices.map(c => c.text));

    // 4. Collect all choice texts covered by a confirmed branch rule for this question.
    // This assumes simple `IF Q1 equals 'Q1_1 Yes'` conditions.
    const coveredChoiceTexts = new Set<string>();
    for (const branch of logic.branches) {
        // Only consider confirmed branches.
        if (branch.thenSkipToIsConfirmed) {
            for (const condition of branch.conditions) {
                // Only consider simple, confirmed "equals" conditions on the question itself.
                if (
                    condition.isConfirmed &&
                    condition.questionId === question.qid &&
                    condition.operator === 'equals' &&
                    condition.value
                ) {
                    coveredChoiceTexts.add(condition.value);
                }
            }
        }
    }

    // 5. If the number of covered choices doesn't match the total, it's not exhaustive.
    if (coveredChoiceTexts.size !== allChoiceTexts.size) {
        return false;
    }

    // 6. As a final check, ensure every choice is actually in the covered set.
    for (const choiceText of allChoiceTexts) {
        if (!coveredChoiceTexts.has(choiceText)) {
            return false;
        }
    }

    // If we get here, every choice is covered by a confirmed branch.
    return true;
};


/**
 * Iterates through the entire survey and renumbers all blocks and question QIDs and
 * their corresponding choice variables to be sequential.
 * It also intelligently updates all logic (Display, Branching, Carry Forward) that
 * references these QIDs to ensure logic integrity after reordering.
 * @param survey The survey object to process.
 * @returns A new survey object with updated variables and logic references.
 */
export const renumberSurveyVariables = (survey: Survey): Survey => {
    // 1. Before renumbering, create a map from the first-seen old QID to its stable internal ID.
    // This handles potential duplicate QIDs by assuming logic refers to the first instance.
    const oldQidToIdMap = new Map<string, string>();
    survey.blocks.flatMap(b => b.questions).forEach(q => {
        if (q.qid && !oldQidToIdMap.has(q.qid)) {
            oldQidToIdMap.set(q.qid, q.id);
        }
    });

    // 2. Deep clone the survey to avoid direct mutation.
    const newSurvey = JSON.parse(JSON.stringify(survey));

    // 3. Renumber block/question QIDs and choice variables, and create a map from ID to the new QID.
    let questionCounter = 1;
    let blockCounter = 1;
    let descriptionCounter = 1;
    const idToNewQidMap = new Map<string, string>();

    // Get all labels that were set by the user (i.e., not the default "Description X" pattern)
    const customLabels = new Set(
        newSurvey.blocks
            .flatMap((b: Block) => b.questions)
            .filter((q: Question) => q.type === QuestionType.Description && q.label && !/^Description \d+$/.test(q.label))
            .map((q: Question) => q.label!)
    );

    for (const block of newSurvey.blocks) {
        block.bid = `BL${blockCounter}`;
        blockCounter++;
        for (const question of block.questions) {
            if (question.type === QuestionType.PageBreak) {
                question.qid = '';
                idToNewQidMap.set(question.id, '');
                continue;
            }
            if (question.type === QuestionType.Description) {
                question.qid = '';
                idToNewQidMap.set(question.id, '');
                // Only assign a default label if the question doesn't have a custom one
                if (!question.label || /^Description \d+$/.test(question.label)) {
                    let newLabel = `Description ${descriptionCounter}`;
                    // If a user manually created a label like "Description 1", skip it
                    while (customLabels.has(newLabel)) {
                        descriptionCounter++;
                        newLabel = `Description ${descriptionCounter}`;
                    }
                    question.label = newLabel;
                }
                descriptionCounter++;
                continue;
            }

            const oldQid = question.qid;
            const newQid = `Q${questionCounter}`;
            question.qid = newQid;
            idToNewQidMap.set(question.id, newQid);

            if (question.choices) {
                question.choices.forEach((choice: any, choiceIndex: number) => {
                    const variableRegex = new RegExp(`^\\(?${oldQid}_\\d+\\)?\\s*`);
                    const label = choice.text.replace(variableRegex, '');
                    choice.text = `${newQid}_${choiceIndex + 1} ${label}`;
                });
            }
            questionCounter++;
        }
    }

    // 4. Create the final translation map from old QID to new QID.
    const oldToNewQidMap = new Map<string, string>();
    for (const [oldQid, id] of oldQidToIdMap.entries()) {
        const newQid = idToNewQidMap.get(id);
        if (newQid) {
            oldToNewQidMap.set(oldQid, newQid);
        }
    }

    // 5. Update all logic references throughout the newly renumbered survey.
    newSurvey.blocks.forEach((block: Block) => {
        block.questions.forEach((question: Question) => {
            // Helper to update any logic structure containing a 'conditions' array
            const updateConditions = (logic: any) => {
                if (!logic || !logic.conditions) return;
                logic.conditions.forEach((condition: { questionId: string, value: string }) => {
                    // --- Update the question the logic is based on ---
                    const newQid = oldToNewQidMap.get(condition.questionId);
                    if (newQid) {
                        condition.questionId = newQid;
                    }

                    // --- Update the value if it's a choice variable ---
                    // Matches a choice variable format like "Q1_1 Yes"
                    const valueMatch = condition.value.match(/^(Q\d+)_(\d+.*)/);
                    if (valueMatch) {
                        const oldValueQid = valueMatch[1];
                        const restOfValue = valueMatch[2];
                        const newValueQid = oldToNewQidMap.get(oldValueQid);
                        if (newValueQid) {
                            // Reconstruct the value with the new QID, e.g., "Q2_1 Yes"
                            condition.value = `${newValueQid}_${restOfValue}`;
                        }
                    }
                });
            };

            // Update Display Logic (both confirmed and draft)
            if (question.displayLogic) updateConditions(question.displayLogic);
            if (question.draftDisplayLogic) updateConditions(question.draftDisplayLogic);

            // Update Branching Logic (both confirmed and draft)
            if (question.branchingLogic) {
                question.branchingLogic.branches.forEach(branch => updateConditions(branch));
            }
            if (question.draftBranchingLogic) {
                question.draftBranchingLogic.branches.forEach(branch => updateConditions(branch));
            }
        });
    });

    return newSurvey;
};

export const analyzeSurveyPaths = (survey: Survey) => {
    const questionCount = survey.blocks.reduce((acc, b) => acc + b.questions.length, 0);
    const pageCount = survey.blocks.length;
    return [{
        id: 'default-path',
        name: 'Default Path',
        questionCount,
        completionTimeString: '10m',
        pageCount,
        blockIds: survey.blocks.map(b => b.id)
    }];
};

/**
 * Calculates the estimated "points" (effort/time) for a question.
 * Used for estimating survey completion time.
 */
export const calculateQuestionPoints = (question: Question): number => {
    switch (question.type) {
        case QuestionType.Radio:
        case QuestionType.Checkbox:
        case QuestionType.DropDownList:
        case QuestionType.ImageSelector:
            return 1;
        case QuestionType.TextEntry:
        case QuestionType.NumericAnswer:
        case QuestionType.EmailAddressAnswer:
        case QuestionType.RespondentPhone:
        case QuestionType.DateTimeAnswer:
            return 2;
        case QuestionType.ChoiceGrid:
        case QuestionType.HybridGrid:
            return 3;
        case QuestionType.Slider:
        case QuestionType.StarRating:
        case QuestionType.NetPromoterNPS:
        case QuestionType.NumericRanking:
        case QuestionType.DragAndDropRanking:
        case QuestionType.CardSort:
            return 2;
        case QuestionType.FileUpload:
        case QuestionType.Signature:
            return 3;
        default:
            return 1;
    }
};
