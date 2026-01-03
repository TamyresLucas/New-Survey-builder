import type { Survey, Question, Block, PathAnalysisResult } from '../types';
import { QuestionType } from '../types';
import { generateId } from './id';
import { parseChoice } from './parser';

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

    // 3. Check each choice against confirmed conditions
    return question.choices.every(choice => {
        const choiceLabel = parseChoice(choice.text).label.trim();

        // Find if this choice is covered by any confirmed branch condition
        return logic.branches.some(branch => {
            if (!branch.thenSkipToIsConfirmed) return false;

            return branch.conditions.some(condition => {
                if (!condition.isConfirmed || condition.questionId !== question.qid || !condition.value) return false;

                // Check using normalized labels
                const conditionLabel = parseChoice(condition.value).label.trim();
                return conditionLabel === choiceLabel;
            });
        });
    });
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

export const analyzeSurveyPaths = (survey: Survey): PathAnalysisResult[] => {
    const paths = new Map<string, PathAnalysisResult>();
    const createPath = (name: string): PathAnalysisResult => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        questionCount: 0,
        requiredQuestionCount: 0,
        completionTimeString: '<1 min',
        pageCount: 0,
        blockIds: []
    });

    // 1. Identify all defined path names from logic
    survey.blocks.forEach(block => {
        block.questions.forEach(q => {
            if (q.branchingLogic) {
                q.branchingLogic.branches.forEach(branch => {
                    if (branch.pathName && !paths.has(branch.pathName)) {
                        paths.set(branch.pathName, createPath(branch.pathName));
                    }
                });
                if (q.branchingLogic.otherwisePathName && !paths.has(q.branchingLogic.otherwisePathName)) {
                    paths.set(q.branchingLogic.otherwisePathName, createPath(q.branchingLogic.otherwisePathName));
                }
            }
        });
    });

    // 2. Also ensure any pathNames currently assigned to blocks exist in our map
    survey.blocks.forEach(block => {
        if (block.branchName && !paths.has(block.branchName)) {
            paths.set(block.branchName, createPath(block.branchName));
        }
    });

    // 3. Aggregate stats for each path
    paths.forEach((pathResult, pathName) => {
        let totalPoints = 0;
        let qCount = 0;
        let requiredCount = 0;
        let pageCount = 0;

        survey.blocks.forEach(block => {
            if (block.branchName === pathName) {
                pathResult.blockIds.push(block.id);

                // Count pages (1 for block itself if not auto-breaks, plus manual breaks)
                // Using simplified logic similar to SurveyStructureWidget
                if (block.automaticPageBreaks) {
                    pageCount += block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak).length;
                } else {
                    pageCount += (block.questions.length > 0 ? 1 : 0) + block.questions.filter(q => q.type === QuestionType.PageBreak && !q.isAutomatic).length;
                }

                block.questions.forEach(q => {
                    if (q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak) {
                        qCount++;
                        if (q.forceResponse) {
                            requiredCount++;
                        }
                        totalPoints += calculateQuestionPoints(q);
                    }
                });
            }
        });

        pathResult.questionCount = qCount;
        pathResult.requiredQuestionCount = requiredCount;
        pathResult.pageCount = pageCount;

        const minutes = Math.round(totalPoints / 8); // simplified calc
        pathResult.completionTimeString = minutes < 1 ? "<1 min" : `${minutes} min`;
    });

    return Array.from(paths.values());
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
