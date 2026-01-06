import { QuestionType, Survey } from '../types';

export const customerFeedbackSurvey: Survey = {
    title: 'Customer Feedback',
    pagingMode: 'one-per-page',
    globalAutoAdvance: false,
    blocks: [
        {
            id: 'block1',
            title: 'Introduction.',
            pageName: 'Page 1',
            autoAdvance: false,
            questions: [
                {
                    id: 'q-welcome',
                    qid: '',
                    text: 'Welcome to our feedback survey! Your opinion is important to us.',
                    type: QuestionType.Description,
                    label: 'Description 1'
                },
                {
                    id: 'q1',
                    qid: 'Q1',
                    text: 'Have you purchased coffee from our café in the past month?',
                    type: QuestionType.Radio,
                    autoAdvance: false,
                    choices: [
                        { id: 'q1c1', text: 'Q1_1 Yes' },
                        { id: 'q1c2', text: 'Q1_2 No' }
                    ],
                    branchingLogic: {
                        branches: [
                            {
                                id: 'branch-q1-purchaser',
                                operator: 'AND',
                                conditions: [{ id: 'cond-q1-1', questionId: 'Q1', operator: 'equals', value: 'Q1_1 Yes', choiceId: 'q1c1', isConfirmed: true }],
                                thenSkipTo: 'block:block2',
                                thenSkipToIsConfirmed: true,
                                pathName: 'Purchaser Path',
                            },
                            {
                                id: 'branch-q1-nonpurchaser',
                                operator: 'AND',
                                conditions: [{ id: 'cond-q1-2', questionId: 'Q1', operator: 'equals', value: 'Q1_2 No', choiceId: 'q1c2', isConfirmed: true }],
                                thenSkipTo: 'block:block3',
                                thenSkipToIsConfirmed: true,
                                pathName: 'Non-Purchaser Path',
                            },
                        ],
                        otherwiseSkipTo: 'end',
                        otherwiseIsConfirmed: true,
                    },
                },
            ],
            bid: 'BL1'
        },
        {
            id: 'block2',
            title: 'Purchase Details',
            pageName: 'Page 2',
            branchName: 'Purchaser Path',
            continueTo: 'block:block4',
            autoAdvance: false,
            questions: [
                {
                    id: 'q2',
                    qid: 'Q2',
                    text: 'What type of coffee do you usually order?',
                    type: QuestionType.Checkbox,
                    choices: [
                        { id: 'q2c1', text: 'Q2_1 Espresso' },
                        { id: 'q2c2', text: 'Q2_2 Latte/Cappuccino' },
                        { id: 'q2c3', text: 'Q2_3 Cold Brew' },
                    ],
                    groupName: 'checkbox',
                },
                {
                    id: 'pb-1766078580119-dukdmg6',
                    qid: '',
                    text: 'Page Break',
                    type: QuestionType.PageBreak,
                    isAutomatic: true,
                },
                {
                    id: 'q3',
                    qid: 'Q3',
                    text: 'Please rate your experience:',
                    type: QuestionType.ChoiceGrid,
                    autoAdvance: false,
                    choices: [
                        { id: 'q3r1', text: 'Q3_1 Product' },
                        { id: 'q3r2', text: 'Q3_2 Service' },
                        { id: 'q3r3', text: 'Q3_3 Speed' },
                    ],
                    scalePoints: [
                        { id: 'q3s1', text: 'Very Dissatisfied' },
                        { id: 'q3s2', text: 'Dissatisfied' },
                        { id: 'q3s3', text: 'Neutral' },
                        { id: 'q3s4', text: 'Satisfied' },
                        { id: 'q3s5', text: 'Very Satisfied' },
                    ],
                    groupName: 'matrix',

                },
                {
                    id: 'pb-1766078580119-lnj9sy8',
                    qid: '',
                    text: 'Page Break',
                    type: QuestionType.PageBreak,
                    isAutomatic: true,
                },
                {
                    id: 'q3_why',
                    qid: 'Q4',
                    text: 'We are sorry to hear that. Can you tell us why?',
                    type: QuestionType.TextEntry,
                    groupName: 'checkbox',
                },
            ],
            bid: 'BL2'
        },
        {
            id: 'block3',
            title: 'Feedback for Non-Purchasers',
            pageName: 'Page 3',
            branchName: 'Non-Purchaser Path',
            continueTo: 'block:block4',
            autoAdvance: false,
            questions: [
                {
                    id: 'q4',
                    qid: 'Q5',
                    text: 'What are the main reasons for not purchasing?',
                    type: QuestionType.Radio,
                    autoAdvance: false,
                    choices: [
                        { id: 'q4c1', text: 'Q5_1 Price' },
                        { id: 'q4c2', text: 'Q5_2 Location' },
                        { id: 'q4c3', text: 'Q5_3 Variety' },
                    ],
                },
                {
                    id: 'pb-1766078580119-82fo389',
                    qid: '',
                    text: 'Page Break',
                    type: QuestionType.PageBreak,
                    isAutomatic: true,
                },
                {
                    id: 'q5',
                    qid: 'Q6',
                    text: 'What could we do to encourage you to visit?',
                    type: QuestionType.TextEntry,
                },
            ],
            bid: 'BL3'
        },
        {
            id: 'block4',
            title: 'Conclusion',
            pageName: 'Page 4',
            autoAdvance: false,
            questions: [
                {
                    id: 'q6',
                    qid: 'Q7',
                    text: 'Would you like to receive special offers?',
                    type: QuestionType.Radio,
                    autoAdvance: false,
                    choices: [
                        { id: 'q6c1', text: 'Q7_1 Yes' },
                        { id: 'q6c2', text: 'Q7_2 No' },
                    ],
                },
            ],
            bid: 'BL4'
        },
    ],
};


// --- TEST DATA FOR DIAGRAM VERIFICATION ---

export const TEST_SURVEYS: Record<string, Survey> = {
    linear: {
        title: 'Linear Survey',
        pagingMode: 'one-per-page',
        blocks: [
            {
                id: 'b1', title: 'Start', questions: [
                    { id: 'q1', qid: 'Q1', text: 'Question 1', type: QuestionType.TextEntry },
                    { id: 'q2', qid: 'Q2', text: 'Question 2', type: QuestionType.TextEntry }
                ]
            },
            {
                id: 'b2', title: 'Middle', questions: [
                    { id: 'q3', qid: 'Q3', text: 'Question 3', type: QuestionType.TextEntry }
                ]
            }
        ]
    },
    branching: {
        title: 'Simple Branching',
        pagingMode: 'one-per-page',
        blocks: [
            {
                id: 'b1', title: 'Root', questions: [
                    {
                        id: 'root_q', qid: 'Q1', text: 'Branch?', type: QuestionType.Radio,
                        choices: [{ id: 'c1', text: 'A' }, { id: 'c2', text: 'B' }],
                        branchingLogic: {
                            branches: [
                                { id: 'br1', thenSkipTo: 'block:b2', thenSkipToIsConfirmed: true, pathName: 'Path A', operator: 'AND', conditions: [{ id: 'cond1', questionId: 'Q1', operator: 'equals', value: 'A', isConfirmed: true }] },
                                { id: 'br2', thenSkipTo: 'block:b3', thenSkipToIsConfirmed: true, pathName: 'Path B', operator: 'AND', conditions: [{ id: 'cond2', questionId: 'Q1', operator: 'equals', value: 'B', isConfirmed: true }] }
                            ],
                            otherwiseSkipTo: 'end', otherwiseIsConfirmed: true
                        }
                    }
                ]
            },
            {
                id: 'b2', title: 'Branch A', branchName: 'Path A', questions: [
                    { id: 'q_a1', qid: 'QA1', text: 'You chose A', type: QuestionType.TextEntry }
                ]
            },
            {
                id: 'b3', title: 'Branch B', branchName: 'Path B', questions: [
                    { id: 'q_b1', qid: 'QB1', text: 'You chose B', type: QuestionType.TextEntry }
                ]
            }
        ]
    },
    convergence: {
        title: 'Convergence',
        pagingMode: 'one-per-page',
        blocks: [
            {
                id: 'b1', title: 'Root', questions: [
                    {
                        id: 'root_q', qid: 'Q1', text: 'Branch?', type: QuestionType.Radio,
                        choices: [{ id: 'c1', text: 'A' }, { id: 'c2', text: 'B' }],
                        branchingLogic: {
                            branches: [
                                { id: 'br1', thenSkipTo: 'block:b2', thenSkipToIsConfirmed: true, pathName: 'Path A', operator: 'AND', conditions: [{ id: 'cond1', questionId: 'Q1', operator: 'equals', value: 'A', isConfirmed: true }] }
                            ],
                            otherwiseSkipTo: 'block:b3', otherwiseIsConfirmed: true, otherwisePathName: 'Path B'
                        }
                    }
                ]
            },
            {
                id: 'b2', title: 'Path A', branchName: 'Path A', questions: [
                    { id: 'q_a1', qid: 'QA1', text: 'A Step', type: QuestionType.TextEntry }
                ],
                continueTo: 'block:b_shared'
            },
            {
                id: 'b3', title: 'Path B', branchName: 'Path B', questions: [
                    { id: 'q_b1', qid: 'QB1', text: 'B Step', type: QuestionType.TextEntry }
                ],
                continueTo: 'block:b_shared'
            },
            {
                id: 'b_shared', title: 'Shared Convergence', sharedConvergence: true, questions: [
                    { id: 'q_end', qid: 'QEnd', text: 'Everyone sees this', type: QuestionType.TextEntry }
                ]
            }
        ]
    }
};
