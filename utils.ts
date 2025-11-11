import type { Survey, Block, Question, PathAnalysisResult, Choice, BranchingLogicCondition, LogicIssue, DisplayLogic, SkipLogic, SkipLogicRule, BranchingLogic, BranchingLogicBranch, DisplayLogicCondition } from './types';
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

      // Update Carry Forward Logic
      if (question.carryForwardStatements) {
        const newQid = oldToNewQidMap.get(question.carryForwardStatements.sourceQuestionId);
        if (newQid) {
          question.carryForwardStatements.sourceQuestionId = newQid;
        }
      }
      // FIX: The 'carryForwardScalePoints' property does not exist on the Question type. This block of code is removed.
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
      if (q.type === 'Description') {
        output += `${q.label || 'Description'}: ${stripHtml(q.text)}\n\n`;
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

export const generateSurveyCsv = (survey: Survey): string => {
  const allQuestions = survey.blocks.flatMap(b => b.questions);
  const allQuestionsWithBlock = survey.blocks.flatMap(block =>
    block.questions.map(question => ({ question, block }))
  );

  const header = [
    'Block BID', 'Block Title', 'Question ID / Label', 'Question Text', 'Question Type', 'Choices', 'Scale Points', 'Force Response',
    'Display Logic', 'Skip Logic', 'Branching Logic'
  ];

  const escapeCsvField = (field: string | undefined | null): string => {
    if (field === undefined || field === null) return '""';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

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

  const dataRows = allQuestionsWithBlock.map(({ question, block }) => {
    if (question.type === QuestionType.PageBreak) {
      return [
        escapeCsvField(block.bid),
        escapeCsvField(block.title),
        escapeCsvField(''),
        escapeCsvField(question.pageName || (question.isAutomatic ? 'Automatic Page Break' : 'Page Break')),
        escapeCsvField(question.type),
        escapeCsvField(''), escapeCsvField(''), escapeCsvField('No'),
        escapeCsvField(''), escapeCsvField(''), escapeCsvField(''),
      ].join(',');
    }

    if (question.type === QuestionType.Description) {
      return [
        escapeCsvField(block.bid),
        escapeCsvField(block.title),
        escapeCsvField(question.label),
        escapeCsvField(stripHtml(question.text)),
        escapeCsvField(question.type),
        escapeCsvField(''), escapeCsvField(''), escapeCsvField('No'),
        escapeCsvField(''), escapeCsvField(''), escapeCsvField(''),
      ].join(',');
    }

    const choices = question.choices?.map(c => parseChoice(c.text).label).join('; ') || '';
    const scalePoints = question.scalePoints?.map(sp => sp.text).join('; ') || '';

    // Format display logic
    let displayLogicStr = '';
    const displayLogic = question.displayLogic;
    if (displayLogic && displayLogic.conditions.filter(c => c.isConfirmed).length > 0) {
      displayLogicStr = 'SHOW IF ' + displayLogic.conditions
        .filter(c => c.isConfirmed)
        .map(c => `${c.questionId} ${c.operator} "${c.value}"`)
        .join(` ${displayLogic.operator} `);
    }

    // Format skip logic
    let skipLogicStr = '';
    const skipLogic = question.skipLogic;
    if (skipLogic) {
      if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
        skipLogicStr = `IF answered, skip to ${formatDestination(skipLogic.skipTo)}`;
      } else if (skipLogic.type === 'per_choice') {
        const rules = skipLogic.rules.filter(r => r.isConfirmed);
        if (rules.length > 0) {
          skipLogicStr = rules.map(rule => {
            const choice = question.choices?.find(c => c.id === rule.choiceId);
            if (!choice) return '';
            const { label: rowLabel } = parseChoice(choice.text);
            
            if (question.type === QuestionType.ChoiceGrid && rule.operator && rule.valueChoiceId) {
                const scalePoint = question.scalePoints?.find(sp => sp.id === rule.valueChoiceId);
                if (scalePoint) {
                    const operatorMap: { [key: string]: string } = {
                        'is_answered_with': 'is answered with',
                        'is_not_answered_with': 'is not answered with',
                        'is_answered_after': 'is after',
                        'is_answered_before': 'is before',
                        'is_answered': 'is answered',
                        'is_not_answered': 'is not answered'
                    };
                    const operatorStr = operatorMap[rule.operator] || rule.operator;
                    return `IF "${stripHtml(rowLabel)}" ${operatorStr} "${scalePoint.text}" -> ${formatDestination(rule.skipTo)}`;
                }
            }
            return `IF "${stripHtml(rowLabel)}" -> ${formatDestination(rule.skipTo)}`;
          }).filter(Boolean).join('; ');
        }
      }
    }

    // Format branching logic
    let branchingLogicStr = '';
    const branchingLogic = question.branchingLogic;
    if (branchingLogic) {
        const formatBranchingCondition = (c: BranchingLogicCondition) => {
            const sourceQuestion = allQuestions.find(q => q.qid === c.questionId);
            if (sourceQuestion?.type === QuestionType.ChoiceGrid && c.gridValue) {
                const rowLabel = parseChoice(c.value).label;
                const col = sourceQuestion.scalePoints?.find(sp => sp.id === c.gridValue);
                const colText = col ? col.text : '...';
                return `${c.questionId} "${rowLabel}" ${c.operator} "${colText}"`;
            }
            return `${c.questionId} ${c.operator} "${c.value}"`;
        };

      const branches = branchingLogic.branches.filter(b => b.thenSkipToIsConfirmed);
      const parts = [];
      if (branches.length > 0) {
        branches.forEach(branch => {
          const conditionsStr = branch.conditions.filter(c => c.isConfirmed).map(formatBranchingCondition).join(` ${branch.operator} `);
          parts.push(`IF ${conditionsStr} THEN -> ${formatDestination(branch.thenSkipTo)}`);
        });
      }
      if (branchingLogic.otherwiseIsConfirmed) {
        parts.push(`OTHERWISE -> ${formatDestination(branchingLogic.otherwiseSkipTo)}`);
      }
      branchingLogicStr = parts.join('; ');
    }

    return [
      escapeCsvField(block.bid),
      escapeCsvField(block.title),
      escapeCsvField(question.qid),
      escapeCsvField(stripHtml(question.text)),
      escapeCsvField(question.type),
      escapeCsvField(choices),
      escapeCsvField(scalePoints),
      escapeCsvField(question.forceResponse ? 'Yes' : 'No'),
      escapeCsvField(displayLogicStr),
      escapeCsvField(skipLogicStr),
      escapeCsvField(branchingLogicStr),
    ].join(',');
  });

  return [header.join(','), ...dataRows].join('\n');
};

const parseDestinationString = (
  destStr: string,
  qidToQuestionMap: Map<string, Question>,
  bidToBlockMap: Map<string, Block>
): string => {
  const trimmed = destStr.trim();
  if (trimmed.toLowerCase() === 'next question') return 'next';
  if (trimmed.toLowerCase() === 'end of survey') return 'end';

  const blockMatch = trimmed.match(/^Block (BL\d+)/i);
  if (blockMatch) {
    const block = bidToBlockMap.get(blockMatch[1].toUpperCase());
    return block ? `block:${block.id}` : '';
  }

  const questionMatch = trimmed.match(/^(Q\d+)/i);
  if (questionMatch) {
    const question = qidToQuestionMap.get(questionMatch[0].toUpperCase());
    return question ? question.id : '';
  }

  return '';
};

const parseDisplayLogicString = (
  rawLogic: string
): Omit<DisplayLogic, 'conditions'> & { conditions: Omit<DisplayLogicCondition, 'id'>[] } | undefined => {
  const match = rawLogic.match(/^SHOW IF (.*)$/i);
  if (!match) return undefined;

  const conditionsStr = match[1];
  const operator = conditionsStr.toUpperCase().includes(' OR ') ? 'OR' : 'AND';
  const conditionParts = conditionsStr.split(new RegExp(` ${operator} `, 'i'));

  const conditions: Omit<DisplayLogicCondition, 'id'>[] = [];
  const conditionRegex = /(Q\d+)\s+([a-z_]+)\s*(?:"([^"]*)")?/i;

  for (const part of conditionParts) {
    const condMatch = part.trim().match(conditionRegex);
    if (condMatch) {
      const [, questionId, op, value] = condMatch;
      conditions.push({
        questionId: questionId.toUpperCase(),
        operator: op.toLowerCase() as DisplayLogicCondition['operator'],
        value: value || '',
        isConfirmed: true,
      });
    }
  }
  if (conditions.length === 0) return undefined;
  return { operator, conditions };
};

const parseSkipLogicString = (
  rawLogic: string,
  currentQuestion: Question,
  qidToQuestionMap: Map<string, Question>,
  bidToBlockMap: Map<string, Block>
): SkipLogic | undefined => {
  if (rawLogic.toLowerCase().startsWith('if answered, skip to')) {
    const destStr = rawLogic.substring('if answered, skip to'.length).trim();
    const skipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
    if (skipTo) {
      return { type: 'simple', skipTo, isConfirmed: true };
    }
  } else {
    const rules: Omit<SkipLogicRule, 'id'>[] = [];
    const parts = rawLogic.split('; ');

    for (const part of parts) {
      const match = part.match(/^IF "([^"]+)"(?:\s(is answered with|is not answered with|is after|is before|is answered|is not answered)\s"([^"]+)")?\s*->\s*(.*)$/i);
      if (!match) continue;

      const [, choiceLabel, operatorStr, scalePointLabel, destStr] = match;

      const choice = currentQuestion.choices?.find(c => parseChoice(c.text).label.trim().toLowerCase() === choiceLabel.trim().toLowerCase());
      if (!choice) continue;

      const skipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
      if (!skipTo) continue;
      
      const newRule: Omit<SkipLogicRule, 'id'> = { choiceId: choice.id, skipTo, isConfirmed: true };

      if (operatorStr && scalePointLabel) {
        const operatorMap: { [key: string]: SkipLogicRule['operator'] } = {
            'is answered with': 'is_answered_with', 'is not answered with': 'is_not_answered_with',
            'is after': 'is_answered_after', 'is before': 'is_answered_before',
            'is answered': 'is_answered', 'is not answered': 'is_not_answered'
        };
        newRule.operator = operatorMap[operatorStr.toLowerCase()];
        const scalePoint = currentQuestion.scalePoints?.find(sp => sp.text.trim().toLowerCase() === scalePointLabel.trim().toLowerCase());
        if (scalePoint) {
            newRule.valueChoiceId = scalePoint.id;
        }
      }
      
      rules.push(newRule);
    }
    
    if (rules.length > 0) {
        return { type: 'per_choice', rules: rules.map(r => ({ ...r, id: generateId('slr') })) };
    }
  }
  return undefined;
};

const parseBranchingLogicString = (
  rawLogic: string,
  qidToQuestionMap: Map<string, Question>,
  bidToBlockMap: Map<string, Block>
): BranchingLogic | undefined => {
  const branches: Omit<BranchingLogicBranch, 'id'>[] = [];
  let otherwiseSkipTo: string | undefined;

  const parts = rawLogic.split('; ');

  for (const part of parts) {
    if (part.toUpperCase().startsWith('OTHERWISE ->')) {
      const destStr = part.substring('OTHERWISE ->'.length).trim();
      otherwiseSkipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
    } else if (part.toUpperCase().startsWith('IF')) {
      const branchMatch = part.match(/^IF (.*) THEN -> (.*)$/i);
      if (!branchMatch) continue;

      const [, conditionsStr, destStr] = branchMatch;
      const thenSkipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
      if (!thenSkipTo) continue;

      const operator = conditionsStr.toUpperCase().includes(' OR ') ? 'OR' : 'AND';
      const conditionParts = conditionsStr.split(new RegExp(` ${operator} `, 'i'));
      const conditions: Omit<BranchingLogicCondition, 'id'>[] = [];

      for (const condPart of conditionParts) {
        const gridMatch = condPart.trim().match(/^(Q\d+)\s+"([^"]+)"\s+([a-z_]+)\s+"([^"]+)"$/i);
        if (gridMatch) {
            const [, questionId, rowLabel, op, colText] = gridMatch;
            const sourceQ = qidToQuestionMap.get(questionId.toUpperCase());
            const value = sourceQ?.choices?.find(c => parseChoice(c.text).label.trim().toLowerCase() === rowLabel.trim().toLowerCase())?.text || '';
            const gridValue = sourceQ?.scalePoints?.find(sp => sp.text.trim().toLowerCase() === colText.trim().toLowerCase())?.id || '';
            conditions.push({ questionId: questionId.toUpperCase(), value, operator: op.toLowerCase() as BranchingLogicCondition['operator'], gridValue, isConfirmed: true });
        } else {
            const regularMatch = condPart.trim().match(/^(Q\d+)\s+([a-z_]+)\s*(?:"([^"]*)")?$/i);
            if (regularMatch) {
                const [, questionId, op, value] = regularMatch;
                conditions.push({ questionId: questionId.toUpperCase(), operator: op.toLowerCase() as BranchingLogicCondition['operator'], value: value || '', isConfirmed: true });
            }
        }
      }

      if (conditions.length > 0) {
        branches.push({
          operator,
          conditions: conditions.map(c => ({...c, id: generateId('cond')})),
          thenSkipTo, thenSkipToIsConfirmed: true
        });
      }
    }
  }

  if (branches.length > 0 || otherwiseSkipTo) {
    return {
      branches: branches.map(b => ({ ...b, id: generateId('branch') })),
      otherwiseSkipTo: otherwiseSkipTo || 'next',
      otherwiseIsConfirmed: true,
    };
  }
  return undefined;
};

export const parseSurveyCsv = (csvContent: string, surveyTitle: string): Survey | null => {
    try {
        const lines = csvContent.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return null;

        const parseCsvRow = (row: string): string[] => {
            const fields: string[] = [];
            let currentField = '';
            let inQuotes = false;
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                    if (inQuotes && row[i+1] === '"') { // Escaped quote
                        currentField += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    fields.push(currentField);
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            fields.push(currentField);
            return fields.map(f => f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1).replace(/""/g, '"') : f);
        };
        
        const header = parseCsvRow(lines[0]).map(h => h.trim());
        const headerMap: {[key: string]: string} = {};
        header.forEach(h => {
            headerMap[h] = h === 'Question ID / Label' ? 'Question ID' : h;
        });

        const dataRows = lines.slice(1);
        const blocksMap = new Map<string, Block>();

        for (const rowStr of dataRows) {
            if (!rowStr.trim()) continue;
            const row = parseCsvRow(rowStr);
            const rowData: {[key: string]: string} = {};
            header.forEach((h, i) => {
                const key = headerMap[h] || h;
                rowData[key] = row[i];
            });

            const blockBid = rowData['Block BID'];
            if (!blockBid) continue;

            if (!blocksMap.has(blockBid)) {
                blocksMap.set(blockBid, {
                    id: generateId('block'),
                    bid: blockBid,
                    title: rowData['Block Title'],
                    questions: [],
                });
            }

            const block = blocksMap.get(blockBid)!;
            const questionType = rowData['Question Type'] as QuestionType;
            const questionText = rowData['Question Text'];

            let newQuestion: any;

            if (questionType === QuestionType.Description) {
                newQuestion = {
                    id: generateId('q'), qid: '', label: rowData['Question ID'],
                    text: questionText, type: questionType,
                };
            } else if (questionType === QuestionType.PageBreak) {
                newQuestion = {
                    id: generateId('q'), qid: '', text: 'Page Break',
                    pageName: questionText, type: questionType,
                };
            } else {
                 newQuestion = {
                    id: generateId('q'), qid: rowData['Question ID'], text: questionText,
                    type: questionType, forceResponse: rowData['Force Response']?.toLowerCase() === 'yes',
                };
    
                if (rowData['Choices']) {
                    newQuestion.choices = rowData['Choices'].split('; ').map((text) => ({
                        id: generateId('c'), text: text.trim(),
                    }));
                }
                if (rowData['Scale Points']) {
                    newQuestion.scalePoints = rowData['Scale Points'].split('; ').map(text => ({
                        id: generateId('s'), text: text.trim(),
                    }));
                }
                
                if (rowData['Display Logic']) newQuestion._rawDisplayLogic = rowData['Display Logic'];
                if (rowData['Skip Logic']) newQuestion._rawSkipLogic = rowData['Skip Logic'];
                if (rowData['Branching Logic']) newQuestion._rawBranchingLogic = rowData['Branching Logic'];
            }
            block.questions.push(newQuestion);
        }

        const allBlocks = Array.from(blocksMap.values());
        const allQuestions = allBlocks.flatMap(b => b.questions);
        const qidToQuestionMap = new Map<string, Question>(allQuestions.filter(q => q.qid).map(q => [q.qid, q]));
        const bidToBlockMap = new Map<string, Block>(allBlocks.filter(b => b.bid).map(b => [b.bid!, b]));

        for (const question of allQuestions) {
            const q = question as any;
            if (q._rawDisplayLogic) {
                const parsedLogic = parseDisplayLogicString(q._rawDisplayLogic);
                if (parsedLogic) {
                    q.displayLogic = {
                        operator: parsedLogic.operator,
                        conditions: parsedLogic.conditions.map(c => ({ ...c, id: generateId('cond') }))
                    };
                }
                delete q._rawDisplayLogic;
            }
            if (q._rawSkipLogic) {
                q.skipLogic = parseSkipLogicString(q._rawSkipLogic, q, qidToQuestionMap, bidToBlockMap);
                delete q._rawSkipLogic;
            }
            if (q._rawBranchingLogic) {
                q.branchingLogic = parseBranchingLogicString(q._rawBranchingLogic, qidToQuestionMap, bidToBlockMap);
                delete q._rawBranchingLogic;
            }
        }

        const newSurvey: Survey = {
            title: surveyTitle.replace(/\.csv$/i, ''),
            blocks: allBlocks,
            pagingMode: 'one-per-page', // Default paging mode on import
        };

        return newSurvey;

    } catch (error) {
        console.error("Error parsing survey CSV:", error);
        return null;
    }
};


export const calculateQuestionPoints = (question: Question): number => {
    switch (question.type) {
        case QuestionType.Radio:
        case QuestionType.DropDownList:
        case QuestionType.NetPromoterNPS:
        case QuestionType.StarRating:
            return 8; // More realistic time
        case QuestionType.Checkbox:
        case QuestionType.ImageSelector:
            return Math.max(8, (question.choices?.length || 0) * 2); // Increased base time
        case QuestionType.ChoiceGrid:
        case QuestionType.HybridGrid:
        case QuestionType.ImageChoiceGrid:
            return (question.choices?.length || 1) * 5; // Increased time per row
        case QuestionType.TextEntry:
        case QuestionType.EmailAddressAnswer:
        case QuestionType.NumericAnswer:
        case QuestionType.Signature:
            return 15; // Significantly more time for text entry
        case QuestionType.CardSort:
        case QuestionType.DragAndDropRanking:
        case QuestionType.TextHighlighter:
            return 20; // More time for complex interactions
        case QuestionType.Description:
        case QuestionType.PageBreak:
            return 0;
        default:
            return 8; // Increased default
    }
};

export const analyzeSurveyPaths = (survey: Survey): PathAnalysisResult[] => {
    const allBlocks = survey.blocks;
    if (allBlocks.length === 0) return [];

    const blockMap = new Map(allBlocks.map(b => [b.id, b]));
    const blockIndexMap = new Map(allBlocks.map((b, i) => [b.id, i]));
    const finalResults: Omit<PathAnalysisResult, 'id'>[] = [];

    // Identify all unique, named branches to trace
    const namedBranches: { pathName: string; sourceQuestionId: string; targetBlockId: string }[] = [];
    const uniqueBranchCheck = new Set<string>();

    survey.blocks.forEach(block => {
        block.questions.forEach(q => {
            const branchingLogic = q.draftBranchingLogic ?? q.branchingLogic;
            if (branchingLogic) {
                branchingLogic.branches.forEach(branch => {
                    if (branch.pathName && branch.thenSkipToIsConfirmed && branch.thenSkipTo.startsWith('block:')) {
                        const targetBlockId = branch.thenSkipTo.substring(6);
                        const uniqueKey = `${branch.pathName}::${targetBlockId}`;
                        if (blockMap.has(targetBlockId) && !uniqueBranchCheck.has(uniqueKey)) {
                            namedBranches.push({ pathName: branch.pathName, sourceQuestionId: q.id, targetBlockId });
                            uniqueBranchCheck.add(uniqueKey);
                        }
                    }
                });
            }
        });
    });

    if (namedBranches.length === 0) {
        return [];
    }

    // Trace each named path from the beginning of the survey
    // Helper to find the next block ID given the current block, ignoring conditional logic.
    const getDefaultNextBlockId = (blockId: string): string | 'end' => {
        const block = blockMap.get(blockId);
        if (!block) return 'end';

        const lastInteractiveQ = [...block.questions].reverse().find(q => q.type !== QuestionType.PageBreak && q.type !== QuestionType.Description);

        if (lastInteractiveQ) {
            const branching = lastInteractiveQ.branchingLogic;
            if (branching && branching.branches.length === 0 && branching.otherwiseIsConfirmed && branching.otherwiseSkipTo) {
                if (branching.otherwiseSkipTo.startsWith('block:')) return branching.otherwiseSkipTo.substring(6);
                if (branching.otherwiseSkipTo === 'end') return 'end';
            }
            
            const skip = lastInteractiveQ.skipLogic;
            if (skip?.type === 'simple' && skip.isConfirmed && skip.skipTo) {
                if (skip.skipTo.startsWith('block:')) return skip.skipTo.substring(6);
                if (skip.skipTo === 'end') return 'end';
            }
        }
        
        if (block.continueTo && block.continueTo !== 'next') {
            if (block.continueTo.startsWith('block:')) return block.continueTo.substring(6);
            if (block.continueTo === 'end') return 'end';
        }
        
        const currentIndex = blockIndexMap.get(block.id);
        if (currentIndex !== undefined && currentIndex < allBlocks.length - 1) {
            return allBlocks[currentIndex + 1].id;
        }
        
        return 'end';
    };

    const questionIdToBlockId = new Map<string, string>();
    survey.blocks.forEach(b => b.questions.forEach(q => questionIdToBlockId.set(q.id, b.id)));


    namedBranches.forEach(branch => {
        const pathBlockIds: string[] = [];
        const visitedBlocks = new Set<string>();
        
        let currentBlockId: string | 'end' = allBlocks[0]?.id;
        if (!currentBlockId) return;
        
        const sourceBlockId = questionIdToBlockId.get(branch.sourceQuestionId);

        // Phase 1: Traverse from start until we hit the block that contains the branch
        while (currentBlockId !== 'end' && currentBlockId !== sourceBlockId) {
            if (visitedBlocks.has(currentBlockId)) {
                 // Loop detected, invalid path
                 return;
            }
            pathBlockIds.push(currentBlockId);
            visitedBlocks.add(currentBlockId);
            currentBlockId = getDefaultNextBlockId(currentBlockId);
        }

        if (currentBlockId !== sourceBlockId) {
            // Did not reach the source block, path is invalid
            return;
        }
        
        // Add the source block itself
        if (sourceBlockId) {
            pathBlockIds.push(sourceBlockId);
            visitedBlocks.add(sourceBlockId);
        }

        // Phase 2: Jump to the branch's target and traverse to the end
        let currentTraceId: string | 'end' = branch.targetBlockId;
        while(currentTraceId !== 'end') {
            if (visitedBlocks.has(currentTraceId)) {
                // Loop detected
                return;
            }
            pathBlockIds.push(currentTraceId);
            visitedBlocks.add(currentTraceId);
            currentTraceId = getDefaultNextBlockId(currentTraceId);
        }
        
        // Calculate stats for the valid path
        const pathBlocks = pathBlockIds.map(id => blockMap.get(id)!).filter(Boolean);
        const pathQuestions = pathBlocks.flatMap(b => b.questions);

        const countableQuestions = pathQuestions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
        const questionCount = countableQuestions.length;
        
        const points = countableQuestions.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);
        const minutes = Math.round(points / 8);
        const completionTimeString = questionCount === 0 ? "0 min" : (minutes < 1 ? "<1 min" : `${minutes} min`);

        let pageCount = 0;
        if (pathBlocks.length > 0) {
            let hasContentOnCurrentPage = false;
            pageCount = 1;
            pathQuestions.forEach((q) => {
                if (q.type === QuestionType.PageBreak) {
                    // Only count manual page breaks or auto-breaks in multi-page mode
                    const parentBlock = blockMap.get(questionIdToBlockId.get(q.id) || '');
                    if (!q.isAutomatic || (parentBlock && parentBlock.automaticPageBreaks)) {
                         pageCount++;
                         hasContentOnCurrentPage = false;
                    }
                } else if (q.type !== QuestionType.Description) {
                    if (survey.pagingMode === 'one-per-page' && hasContentOnCurrentPage) {
                        pageCount++;
                    }
                    hasContentOnCurrentPage = true;
                }
            });
        }


        finalResults.push({
            name: branch.pathName,
            blockIds: pathBlockIds,
            questionCount,
            completionTimeString,
            pageCount
        });
    });

    return finalResults.map((r, i) => ({
        ...r,
        id: `path-${i}-${r.name.replace(/\s+/g, '-')}`
    }));
};