import type { Survey } from './types';
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
 * @param survey The survey object to process.
 * @returns A new survey object with updated variables.
 */
export const renumberSurveyVariables = (survey: Survey): Survey => {
  let questionCounter = 1;
  let blockCounter = 1;

  // Deep clone the survey to avoid direct mutation
  const newSurvey = JSON.parse(JSON.stringify(survey));

  for (const block of newSurvey.blocks) {
    block.bid = `BL${blockCounter}`;
    blockCounter++;

    for (const question of block.questions) {
      if (question.type === QuestionType.PageBreak) {
        question.qid = ''; // Page breaks don't get a QID
        continue;
      }

      const oldQid = question.qid;
      const newQid = `Q${questionCounter}`;
      
      question.qid = newQid;

      if (question.choices) {
        question.choices.forEach((choice: any, choiceIndex: number) => {
          // Regex to find a variable like (Q1_1), Q1_1, (Q15_3), or Q15_3 at the start of the string
          const variableRegex = new RegExp(`^\\(?${oldQid}_\\d+\\)?\\s*`);
          const label = choice.text.replace(variableRegex, '');
          choice.text = `${newQid}_${choiceIndex + 1} ${label}`;
        });
      }
      questionCounter++;
    }
  }

  return newSurvey;
};