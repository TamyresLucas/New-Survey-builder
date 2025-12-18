import { Block, Question, QuestionType as QTEnum } from '../types';

/**
 * Splits a block's questions into pages based on PageBreak questions.
 * Returns an array of question arrays, where each inner array represents a page.
 */
export const getPagesForBlock = (block: Block): Question[][] => {
    const pages: Question[][] = [];
    let currentQuestions: Question[] = [];

    block.questions.forEach((q) => {
        if (q.type === QTEnum.PageBreak) {
            // Commit current page
            pages.push([...currentQuestions]);
            currentQuestions = [];
        } else {
            currentQuestions.push(q);
        }
    });

    // Commit remaining questions as the final page
    // If the block was completely empty, we still want one empty page?
    // Logic: If pages is empty, it means no PageBreaks encountered.
    // So we push whatever is in currentQuestions (even if empty).
    if (pages.length === 0) {
        pages.push([...currentQuestions]);
    } else if (currentQuestions.length > 0) {
        // If we have pages already, only push if there are remaining questions
        // This avoids creating an empty trailing page if the block ends with a PageBreak
        pages.push([...currentQuestions]);
    }

    return pages;
};
