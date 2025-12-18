import { Survey, Question, Block, DisplayLogicCondition, LogicIssue } from '../types';
import { QuestionType as QTEnum } from '../types';
import { generateId, parseChoice } from '../utils';

// Helper function to find the previous question in the survey flow
export const findPreviousQuestion = (startIndex: number, allQs: Question[]): Question | undefined => {
    for (let i = startIndex - 1; i >= 0; i--) {
        if (allQs[i].type !== QTEnum.PageBreak) {
            return allQs[i];
        }
    }
    return undefined;
};

// Helper function to find conditions required to reach a question (one level back)
export const findDirectEntryConditions = (questionId: string, survey: Survey): DisplayLogicCondition[] => {
    const allQuestions = survey.blocks.flatMap(b => b.questions);
    const targetQuestion = allQuestions.find(q => q.id === questionId);
    const targetQuestionIndex = allQuestions.findIndex(q => q.id === questionId);

    if (!targetQuestion || targetQuestionIndex === -1) return [];

    // Start with the question's own display logic
    const conditions: DisplayLogicCondition[] = targetQuestion.displayLogic?.conditions.filter(c => c.isConfirmed) || [];

    // Path 1: Explicit skips TO this question from any other question
    for (const sourceQuestion of allQuestions) {
        if (sourceQuestion.id === questionId) continue;
        const skipLogic = sourceQuestion.skipLogic;
        if (skipLogic?.type === 'per_choice' && skipLogic.rules) {
            for (const rule of skipLogic.rules) {
                if (rule.skipTo === questionId && rule.isConfirmed) {
                    const choice = sourceQuestion.choices?.find(c => c.id === rule.choiceId);
                    if (choice) {
                        conditions.push({
                            id: generateId('inferred'),
                            questionId: sourceQuestion.qid,
                            operator: 'equals',
                            value: choice.text,
                            isConfirmed: true,
                        });
                    }
                }
            }
        }
    }

    // Path 2: Implicit fall-through from the preceding question
    const prevQuestion = findPreviousQuestion(targetQuestionIndex, allQuestions);
    if (prevQuestion) {
        const prevLogic = prevQuestion.skipLogic;

        if (!prevLogic) {
            // If there's no logic, the only path is fall-through. This path doesn't add specific conditions from prevQuestion.
        } else {
            if (prevLogic.type === 'simple' && prevLogic.skipTo === 'next' && prevLogic.isConfirmed) {
                // Unconditional fall-through. No specific conditions are added from prevQuestion.
            } else if (prevLogic.type === 'per_choice') {
                // Add conditions for each choice that explicitly falls through to 'next'
                const fallThroughRules = prevLogic.rules.filter(r => r.skipTo === 'next' && r.isConfirmed);
                for (const rule of fallThroughRules) {
                    const choice = prevQuestion.choices?.find(c => c.id === rule.choiceId);
                    if (choice) {
                        conditions.push({
                            id: generateId('inferred'),
                            questionId: prevQuestion.qid,
                            operator: 'equals',
                            value: choice.text,
                            isConfirmed: true,
                        });
                    }
                }
            }
        }
    }

    // De-duplicate conditions
    const uniqueConditions = Array.from(new Map(conditions.map(c => [`${c.questionId}-${c.operator}-${c.value}`, c])).values());
    return uniqueConditions;
};

const formatDestination = (destinationId: string, allQuestions: Question[]): string => {
    if (destinationId === 'next' || destinationId === 'end') {
        return destinationId;
    }
    const q = allQuestions.find(q => q.id === destinationId);
    return q ? q.qid : 'an unknown question';
};

/**
 * Creates a structured, readable text summary of the entire survey for the Gemini model.
 * @param survey The survey object.
 * @returns A string representing the survey structure.
 */
export const generateSurveyContext = (survey: Survey, logicIssues: LogicIssue[]): string => {
    let context = "";
    const allQuestions = survey.blocks.flatMap(b => b.questions);

    survey.blocks.forEach(block => {
        context += `## Block ${block.bid}: ${block.title}\n`;
        block.questions.forEach(q => {
            if (q.type === QTEnum.PageBreak) {
                context += `- (Page Break)\n`;
                return;
            }
            context += `- **${q.qid}**: ${q.text} (*${q.type}*)\n`;

            if (q.choices && q.choices.length > 0) {
                context += `    - **Choices**: ${q.choices.map(c => `'${c.text}'`).join(', ')}\n`;
            }
            if (q.scalePoints && q.scalePoints.length > 0) {
                context += `    - **Columns**: ${q.scalePoints.map(c => `'${c.text}'`).join(', ')}\n`;
            }

            const displayLogic = q.draftDisplayLogic ?? q.displayLogic;
            if (displayLogic && displayLogic.conditions.length > 0) {
                const logicStr = displayLogic.conditions
                    .filter(c => c.isConfirmed)
                    .map(c => `${c.questionId} ${c.operator} '${c.value}'`)
                    .join(` ${displayLogic.operator} `);
                if (logicStr) {
                    context += `    - **Display Logic**: SHOW IF ${logicStr}\n`;
                }
            }

            const skipLogic = q.draftSkipLogic ?? q.skipLogic;
            if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                    const dest = formatDestination(skipLogic.skipTo, allQuestions);
                    context += `    - **Skip Logic**: IF answered -> ${dest}\n`;
                } else if (skipLogic.type === 'per_choice') {
                    const rulesStr = skipLogic.rules
                        .filter(r => r.isConfirmed)
                        .map(rule => {
                            const choice = q.choices?.find(c => c.id === rule.choiceId);
                            const choiceLabel = choice ? parseChoice(choice.text).label : 'Unknown Choice';
                            const dest = formatDestination(rule.skipTo, allQuestions);
                            return `IF '${choiceLabel}' -> ${dest}`;
                        })
                        .join('; ');
                    if (rulesStr) {
                        context += `    - **Skip Logic**: ${rulesStr}\n`;
                    }
                }
            }

            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            if (branchingLogic) {
                context += `    - **Branching Logic**:\n`;
                if (branchingLogic.branches) {
                    branchingLogic.branches.forEach(branch => {
                        if (branch.thenSkipToIsConfirmed) {
                            const conditionsStr = branch.conditions.filter(c => c.isConfirmed).map(c => `${c.questionId} ${c.operator} ${c.value}`).join(' AND ');
                            const dest = formatDestination(branch.thenSkipTo, allQuestions);
                            context += `      - IF ${conditionsStr} -> ${dest}\n`;
                        }
                    });
                }
                if (branchingLogic.otherwiseIsConfirmed) {
                    const dest = formatDestination(branchingLogic.otherwiseSkipTo, allQuestions);
                    context += `      - OTHERWISE -> ${dest}\n`;
                }
            }
        });

        // Block Branching Logic
        if (block.branchingLogic) {
            context += `  - **Block Branching**:\n`;
            if (block.branchingLogic.branches) {
                block.branchingLogic.branches.forEach(branch => {
                    if (branch.thenSkipToIsConfirmed) {
                        const conditionsStr = branch.conditions.filter(c => c.isConfirmed).map(c => `${c.questionId} ${c.operator} ${c.value}`).join(' AND ');
                        // Block destinations might be blocks or questions, simplified here
                        context += `      - IF ${conditionsStr} -> ${branch.thenSkipTo}\n`;
                    }
                });
            }
            if (block.branchingLogic.otherwiseIsConfirmed) {
                context += `      - OTHERWISE -> ${block.branchingLogic.otherwiseSkipTo}\n`;
            }
        }

        context += "\n";
    });

    if (logicIssues && logicIssues.length > 0) {
        context += `## Current Logic Issues\n`;
        context += "The following logic problems have been detected in the survey:\n";
        logicIssues.forEach(issue => {
            const q = allQuestions.find(q => q.id === issue.questionId);
            if (q) {
                context += `- On Question ${q.qid}: ${issue.message}\n`;
            }
        });
        context += "\n";
    }

    return context;
};
