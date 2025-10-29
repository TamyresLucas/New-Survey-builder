import type { Survey, Block, Question, PathAnalysisResult } from './types';
import { QuestionType } from './types';

export const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Parses a choice string like "Q1_1 Yes" into its variable and label parts.
 * @param text The full choice text.
 * @returns An object with 'variable' and 'label' properties.
 */
export const parseChoice = (text: string): { variable: string; label: string } => {
    // Matches a variable like Q1_1 at the start of the string, followed by optional space.
    const match = text.match(/(^Q\d+_\d+)\s*/);
    if (match) {
        return {
            variable: match[1],
            label: text.substring(match[0].length)
        };
    }
    // If no variable is found, the entire string is considered the label.
    return { variable: '', label: text };
};


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
  const idToNewQidMap = new Map<string, string>();

  for (const block of newSurvey.blocks) {
    block.bid = `BL${blockCounter}`;
    blockCounter++;
    for (const question of block.questions) {
      if (question.type === QuestionType.PageBreak) {
        question.qid = '';
        idToNewQidMap.set(question.id, ''); // Store empty QID for page breaks
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

      // Update Carry Forward Logic
      if (question.carryForwardStatements) {
        const newQid = oldToNewQidMap.get(question.carryForwardStatements.sourceQuestionId);
        if (newQid) {
          question.carryForwardStatements.sourceQuestionId = newQid;
        }
      }
      if (question.carryForwardScalePoints) {
        const newQid = oldToNewQidMap.get(question.carryForwardScalePoints.sourceQuestionId);
        if (newQid) {
          question.carryForwardScalePoints.sourceQuestionId = newQid;
        }
      }
    });
  });

  return newSurvey;
};

export const truncate = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + '...';
};

export const stripHtml = (html: string): string => {
    if (typeof document === 'undefined') {
        return html.replace(/<[^>]*>?/gm, '');
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

export const generateSurveyTextCopy = (survey: Survey): string => {
  let output = `SURVEY: ${survey.title}\n`;
  output += `========================================\n\n`;

  const allQuestions = survey.blocks.flatMap(b => b.questions);

  const formatDestination = (destinationId: string): string => {
    if (destinationId === 'next') return 'Next Question';
    if (destinationId === 'end') return 'End of Survey';

    if (destinationId.startsWith('block:')) {
        const blockId = destinationId.substring(6);
        const block = survey.blocks.find(b => b.id === blockId);
        return block ? `Block ${block.bid}` : 'Unknown Block';
    }

    const question = allQuestions.find(q => q.id === destinationId);
    return question ? question.qid : 'Unknown Question';
  };

  survey.blocks.forEach(block => {
    output += `BLOCK ${block.bid}: ${block.title}\n`;
    output += `----------------------------------------\n`;

    block.questions.forEach(q => {
      if (q.type === 'Page Break') {
        output += `[PAGE BREAK]\n\n`;
        return;
      }

      output += `Question Variable: ${q.qid}\n`;
      output += `Question Text: ${stripHtml(q.text)}\n`;

      if (q.choices) {
        output += `Choices:\n`;
        q.choices.forEach(c => {
          const { variable, label } = parseChoice(c.text);
          output += `  ${variable || '(No Var)'}: ${stripHtml(label)}\n`;
        });
      }
      
      if (q.scalePoints) {
          output += `Scale Points (Columns):\n`;
          q.scalePoints.forEach(sp => {
              output += `  - ${stripHtml(sp.text)}\n`;
          });
      }

      const displayLogic = q.displayLogic;
      if (displayLogic && displayLogic.conditions.filter(c => c.isConfirmed).length > 0) {
        const logicStr = displayLogic.conditions
          .filter(c => c.isConfirmed)
          .map(c => `${c.questionId} ${c.operator} "${c.value}"`)
          .join(` ${displayLogic.operator} `);
        output += `  Display Logic: SHOW IF ${logicStr}\n`;
      }

      const skipLogic = q.skipLogic;
      if (skipLogic) {
        if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
            output += `  Skip Logic: IF answered, skip to ${formatDestination(skipLogic.skipTo)}\n`;
        } else if (skipLogic.type === 'per_choice') {
            const rules = skipLogic.rules.filter(r => r.isConfirmed);
            if(rules.length > 0) {
                output += `  Skip Logic:\n`;
                rules.forEach(rule => {
                    const choice = q.choices?.find(c => c.id === rule.choiceId);
                    if(choice) {
                        const { label } = parseChoice(choice.text);
                        output += `    IF "${stripHtml(label)}" is selected, skip to ${formatDestination(rule.skipTo)}\n`;
                    }
                });
            }
        }
      }

      const branchingLogic = q.branchingLogic;
      if (branchingLogic) {
          const hasConfirmedBranches = branchingLogic.branches.some(b => b.thenSkipToIsConfirmed);
          if (hasConfirmedBranches || branchingLogic.otherwiseIsConfirmed) {
              output += `  Branching Logic:\n`;
              branchingLogic.branches.forEach(branch => {
                  if (branch.thenSkipToIsConfirmed) {
                      const conditionsStr = branch.conditions.filter(c => c.isConfirmed).map(c => `${c.questionId} ${c.operator} "${c.value}"`).join(` ${branch.operator} `);
                      // FIX: Corrected property name from 'thenTo' to 'thenSkipTo' in branching logic text generation.
                      output += `    IF ${conditionsStr} THEN skip to ${formatDestination(branch.thenSkipTo)}\n`;
                  }
              });
              if (branchingLogic.otherwiseIsConfirmed) {
                   output += `    OTHERWISE skip to ${formatDestination(branchingLogic.otherwiseSkipTo)}\n`;
              }
          }
      }
      
      output += `\n`;
    });
  });

  return output;
};

export const calculateQuestionPoints = (question: Question): number => {
    switch (question.type) {
        case QuestionType.Radio:
        case QuestionType.DropDownList:
        case QuestionType.NetPromoterNPS:
        case QuestionType.StarRating:
            return 1;
        case QuestionType.Checkbox:
        case QuestionType.ImageSelector:
            return (question.choices?.length || 0) * 0.5;
        case QuestionType.ChoiceGrid:
        case QuestionType.HybridGrid:
        case QuestionType.ImageChoiceGrid:
            return question.choices?.length || 1;
        case QuestionType.TextEntry:
        case QuestionType.EmailAddressAnswer:
        case QuestionType.NumericAnswer:
        case QuestionType.Signature:
            return 3;
        case QuestionType.CardSort:
        case QuestionType.DragAndDropRanking:
        case QuestionType.TextHighlighter:
            return 4;
        case QuestionType.Description:
        case QuestionType.PageBreak:
            return 0;
        default:
            return 1;
    }
};

export const analyzeSurveyPaths = (survey: Survey): PathAnalysisResult[] => {
    const allQuestions = survey.blocks.flatMap(b => b.questions);
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));
    const questionIndexMap = new Map(allQuestions.map((q, i) => [q.id, i]));
    const questionIdToBlockIdMap = new Map<string, string>();
    survey.blocks.forEach(b => {
        b.questions.forEach(q => {
            questionIdToBlockIdMap.set(q.id, b.id);
        });
    });

    const results: Omit<PathAnalysisResult, 'id'>[] = [];

    const findNextQuestion = (startIndex: number): Question | undefined => {
        for (let i = startIndex + 1; i < allQuestions.length; i++) {
            if (allQuestions[i].type !== QuestionType.PageBreak) return allQuestions[i];
        }
        return undefined;
    };

    const resolveDestination = (dest: string, currentIndex: number): Question | undefined => {
        if (dest === 'next') return findNextQuestion(currentIndex);
        if (dest === 'end') return undefined;
        if (dest.startsWith('block:')) {
            const blockId = dest.substring(6);
            const targetBlock = survey.blocks.find(b => b.id === blockId);
            return targetBlock?.questions.find(q => q.type !== QuestionType.PageBreak);
        }
        return questionMap.get(dest);
    };

    const dfs = (currentQuestion: Question | undefined, currentPath: { questions: Question[], conditions: string[] }, visited: Set<string>) => {
        if (!currentQuestion || visited.has(currentQuestion.id)) {
            if (currentPath.questions.length > 0) {
                const totalPoints = currentPath.questions.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);
                const estimatedTimeInMinutes = Math.round(totalPoints / 8);
                const completionTimeString = estimatedTimeInMinutes < 1 ? (currentPath.questions.length > 0 ? "<1 min" : "0 min") : `${estimatedTimeInMinutes} min`;
                
                let pageCount: number;
                const pathQuestions = currentPath.questions;
                const countablePathQuestions = pathQuestions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);

                if (survey.pagingMode === 'one-per-page') {
                    pageCount = countablePathQuestions.length;
                } else {
                    pageCount = 1;
                    if (pathQuestions.length > 0) {
                        for (let i = 0; i < pathQuestions.length - 1; i++) {
                            const currentQ = pathQuestions[i];
                            const nextQ = pathQuestions[i + 1];

                            const currentQIndexInAll = questionIndexMap.get(currentQ.id);
                            const nextQIndexInAll = questionIndexMap.get(nextQ.id);

                            if (currentQIndexInAll !== undefined && nextQIndexInAll !== undefined) {
                                let hasIntermediatePageBreak = false;
                                for (let j = currentQIndexInAll + 1; j < nextQIndexInAll; j++) {
                                    if (allQuestions[j].type === QuestionType.PageBreak) {
                                        hasIntermediatePageBreak = true;
                                        break;
                                    }
                                }

                                if (hasIntermediatePageBreak) {
                                    pageCount++;
                                } else {
                                    const currentBlockId = questionIdToBlockIdMap.get(currentQ.id);
                                    const nextBlockId = questionIdToBlockIdMap.get(nextQ.id);
                                    if (currentBlockId !== nextBlockId) {
                                        const currentBlock = survey.blocks.find(b => b.id === currentBlockId);
                                        if (currentBlock && currentBlock.questions[currentBlock.questions.length - 1].type !== QuestionType.PageBreak) {
                                            pageCount++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                results.push({
                    name: currentPath.conditions.join(' & ') || 'Main Path',
                    questionCount: countablePathQuestions.length,
                    completionTimeString,
                    pageCount,
                });
            }
            return;
        }

        const newPath = { questions: [...currentPath.questions, currentQuestion], conditions: [...currentPath.conditions] };
        const newVisited = new Set(visited).add(currentQuestion.id);
        const currentIndex = questionIndexMap.get(currentQuestion.id)!;
        
        const branchingLogic = currentQuestion.branchingLogic;
        if (branchingLogic && branchingLogic.branches.some(b => b.thenSkipToIsConfirmed)) {
            branchingLogic.branches.forEach(branch => {
                if (branch.thenSkipToIsConfirmed) {
                    const conditionText = branch.pathName || branch.conditions.filter(c => c.isConfirmed).map(c => `${c.questionId} ${c.operator.replace('_', ' ')} "${parseChoice(c.value).label}"`).join(` ${branch.operator} `);
                    const nextQuestion = resolveDestination(branch.thenSkipTo, currentIndex);
                    dfs(nextQuestion, { ...newPath, conditions: [...newPath.conditions, `If ${conditionText}`] }, newVisited);
                }
            });
            if (branchingLogic.otherwiseIsConfirmed) {
                const nextQuestion = resolveDestination(branchingLogic.otherwiseSkipTo, currentIndex);
                dfs(nextQuestion, { ...newPath, conditions: [...newPath.conditions, branchingLogic.otherwisePathName || 'Otherwise'] }, newVisited);
            }
            return;
        }

        const skipLogic = currentQuestion.skipLogic;
        if (skipLogic && (skipLogic.type === 'simple' ? skipLogic.isConfirmed : skipLogic.rules.some(r => r.isConfirmed))) {
            if (skipLogic.type === 'simple') {
                dfs(resolveDestination(skipLogic.skipTo, currentIndex), newPath, newVisited);
            } else { // per_choice
                const handledChoices = new Set<string>();
                skipLogic.rules.forEach(rule => {
                    if (rule.isConfirmed) {
                        handledChoices.add(rule.choiceId);
                        const choice = currentQuestion.choices?.find(c => c.id === rule.choiceId);
                        const choiceLabel = choice ? parseChoice(choice.text).label : '...';
                        const nextQuestion = resolveDestination(rule.skipTo, currentIndex);
                        dfs(nextQuestion, { ...newPath, conditions: [...newPath.conditions, `${currentQuestion.qid} is "${choiceLabel}"`] }, newVisited);
                    }
                });
                const hasFallthrough = currentQuestion.choices?.some(c => !handledChoices.has(c.id));
                if (hasFallthrough) {
                    dfs(findNextQuestion(currentIndex), { ...newPath, conditions: [...newPath.conditions, `${currentQuestion.qid} is (other)`] }, newVisited);
                }
            }
            return;
        }

        dfs(findNextQuestion(currentIndex), newPath, newVisited);
    };

    const firstQuestion = allQuestions.find(q => q.type !== QuestionType.PageBreak);
    if (firstQuestion) {
        dfs(firstQuestion, { questions: [], conditions: [] }, new Set());
    }

    const uniqueResults = new Map<string, Omit<PathAnalysisResult, 'id'>>();
    results.forEach(res => {
        const key = `${res.name}-${res.questionCount}-${res.completionTimeString}-${res.pageCount}`;
        if (!uniqueResults.has(key)) uniqueResults.set(key, res);
    });

    return Array.from(uniqueResults.values()).map((res, i) => ({ ...res, id: `path-${i}` }));
};
