import type { Question } from '../types';
import { QuestionType as QTEnum } from '../types';

/**
 * Known default/preset text values for question text when a new question is created.
 * If the question text matches one of these, it is considered placeholder content.
 */
const PLACEHOLDER_QUESTION_TEXTS = new Set([
    'Click to write the question text',
    'Page Break',
    'Please rate your experience:',
]);

/**
 * Determines whether a question still has default/placeholder text.
 *
 * Returns `true` if the question text has not been edited from its default —
 * such questions can be deleted without showing a confirmation modal.
 *
 * Returns `false` if the user has changed the question text, indicating
 * content that would be lost on deletion.
 */
export function isPlaceholderQuestion(question: Question): boolean {
    // PageBreak questions are always considered placeholder
    if (question.type === QTEnum.PageBreak) {
        return true;
    }

    // Only check whether the question text is still a known placeholder
    const isTextPlaceholder = PLACEHOLDER_QUESTION_TEXTS.has(question.text);

    // If it's a Description question, also check descriptionLines
    if (question.type === QTEnum.Description) {
        const hasEditedLines = question.descriptionLines?.some(l => l.text && l.text !== 'Click to write the description');
        return !hasEditedLines;
    }

    return isTextPlaceholder;
}
