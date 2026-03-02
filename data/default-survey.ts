import { QuestionType, Survey } from '../types';

export const initialSurveyData: Survey = {
    title: 'Untitled survey',
    displayTitle: 'Untitled survey',
    blocks: [
        {
            id: 'b_default',
            title: 'Block',
            questions: [
                {
                    id: 'q_default',
                    qid: 'Q1',
                    text: 'Click to write the question text',
                    type: QuestionType.Checkbox,
                    choices: [
                        { id: 'c1', text: 'Click to write choice 1' },
                        { id: 'c2', text: 'Click to write choice 2' },
                        { id: 'c3', text: 'Click to write choice 3' }
                    ]
                }
            ]
        }
    ],
    pagingMode: 'multi-per-page',
    globalAutoAdvance: false,
};
