import type { Survey, Block, Question } from './types';
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