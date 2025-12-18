
import { surveyReducer, SurveyActionType } from '../state/surveyReducer.js';
import { setGenerateId } from '../state/idProvider.js';
import { Survey, QuestionType } from '../types.js';
import * as fs from 'fs';
import * as path from 'path';

// Mock ID Generation
let mockCounter = 0;
setGenerateId((prefix) => `${prefix}_${mockCounter++}`);


// Initial Survey State
const initialState: Survey = {
    title: 'Test Survey',
    blocks: [
        {
            id: 'block_0',
            bid: 'BL1',
            title: 'Initial Block',
            questions: []
        }
    ],
    pagingMode: 'one-per-page'
};

const actions = [
    // 1. Add Questions
    {
        type: SurveyActionType.ADD_QUESTION,
        payload: { questionType: QuestionType.Radio, targetBlockId: 'block_0', targetQuestionId: null }
    },
    {
        type: SurveyActionType.ADD_QUESTION,
        payload: { questionType: QuestionType.TextEntry, targetBlockId: 'block_0', targetQuestionId: null }
    },
    // 2. Add Block
    {
        type: SurveyActionType.ADD_BLOCK,
        payload: { blockId: 'block_0', position: 'below' }
    },
    // 3. Move Question to New Block (we don't know IDs easily, so we rely on state inspection in a real test, 
    // but here we can't easily get the ID generated in step 1. 
    // Wait, the reducer returns new state. We can inspect it!)
];

function runVerification() {
    let state = initialState;
    const history: any[] = [];

    // Step 1: Add Radio Question
    const action1 = {
        type: SurveyActionType.ADD_QUESTION,
        payload: { questionType: QuestionType.Radio, targetBlockId: 'block_0', targetQuestionId: null }
    };
    state = surveyReducer(state, action1);
    history.push({ step: 'ADD_QUESTION_RADIO', state });

    const q1Id = state.blocks[0].questions[0].id;

    // Step 2: Add Text Question
    const action2 = {
        type: SurveyActionType.ADD_QUESTION,
        payload: { questionType: QuestionType.TextEntry, targetBlockId: 'block_0', targetQuestionId: null }
    };
    state = surveyReducer(state, action2);
    history.push({ step: 'ADD_QUESTION_TEXT', state });

    const q2Id = state.blocks[0].questions[1].id;

    // Step 3: Add Block
    const action3 = {
        type: SurveyActionType.ADD_BLOCK,
        payload: { blockId: 'block_0', position: 'below' }
    };
    state = surveyReducer(state, action3);
    history.push({ step: 'ADD_BLOCK', state });

    const block2Id = state.blocks[1].id;

    // Step 4: Move Q2 to Block 2
    const action4 = {
        type: SurveyActionType.MOVE_QUESTION_TO_EXISTING_BLOCK,
        payload: { questionId: q2Id, targetBlockId: block2Id }
    };
    state = surveyReducer(state, action4);
    history.push({ step: 'MOVE_Q2_TO_BLOCK2', state });

    // Step 5: Duplicate Q1 (Bulk)
    const action5 = {
        type: SurveyActionType.BULK_DUPLICATE_QUESTIONS,
        payload: { questionIds: new Set([q1Id]) }
    };
    // Note: Set might not serialize well in JSON if we logged action, but we log state.
    state = surveyReducer(state, action5);
    history.push({ step: 'DUPLICATE_Q1', state });

    // Save Golden Master
    const outputPath = path.join(__dirname, 'golden_master.json');
    fs.writeFileSync(outputPath, JSON.stringify(history, null, 2));
    console.log(`Golden Master saved to ${outputPath}`);
}

runVerification();
