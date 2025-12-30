import { questionReducer } from '../state/reducers/questionReducer';
import { isBranchingLogicExhaustive } from '../utils/logic';
import { QuestionType } from '../types';
import { SurveyActionType } from '../state/actions';

// Mock Data
const mockQuestion = {
    id: 'q1',
    qid: 'Q1',
    type: QuestionType.Radio,
    text: 'Did you purchase?',
    choices: [
        { id: 'c1', text: 'Yes' },
        { id: 'c2', text: 'No' }
    ],
    // Initial State: No logic
    branchingLogic: undefined
};

const mockSurveyState = {
    title: 'Test Survey',
    blocks: [{
        id: 'b1',
        title: 'Block 1',
        questions: [mockQuestion]
    }]
};

// SIMULATED VISUAL COMPONENT LOGIC (BranchingLogicEditor)
// We copy the "processLogicUpdate" function here to verify its output matches expectations
const processLogicUpdate = (question: any, branchingLogic: any, newBranches: any[]) => {
    console.log('[DEBUG 1] processLogicUpdate START', {
        questionType: question.type,
        questionId: question.id,
        newBranches: newBranches.map(b => ({
            conditions: b.conditions,
            thenSkipTo: b.thenSkipTo,
            thenSkipToIsConfirmed: b.thenSkipToIsConfirmed
        }))
    });

    const isChoiceQuestion = true; // Hardcoded for this test case

    // Calculate exhaustive state dynamically
    const updatedLogicState = { ...branchingLogic, branches: newBranches };

    // Create temp question for exhaustive check
    const tempQuestion = {
        ...question,
        draftBranchingLogic: updatedLogicState,
        branchingLogic: updatedLogicState
    };

    // Mocking the utility if needed, or using real one if import worked (it should)
    const isExhaustive = isBranchingLogicExhaustive(tempQuestion);

    console.log('[DEBUG 2] Exhaustiveness Result', {
        exhaustive: isExhaustive,
        isChoiceQuestion,
        choiceCount: question.choices?.length,
        branchCount: newBranches.length
    });

    const newLogic = {
        ...branchingLogic,
        branches: newBranches,
        isExhaustive
    };

    if (isExhaustive) {
        // STRICT RULE
        delete newLogic.otherwiseSkipTo;
        delete newLogic.otherwiseIsConfirmed;
        delete newLogic.otherwisePathName;
    } else {
        if (!newLogic.otherwiseSkipTo) {
            newLogic.otherwiseSkipTo = 'end'; // Helper mock
            newLogic.otherwiseIsConfirmed = true;
        }
    }

    console.log('[DEBUG 3] Final newLogic', {
        isExhaustive: newLogic.isExhaustive,
        otherwiseSkipTo: newLogic.otherwiseSkipTo,
        otherwiseIsConfirmed: newLogic.otherwiseIsConfirmed,
        branchCount: newLogic.branches.length
    });

    return newLogic;
};

// --- SIMULATION ---

console.log('--- STARTING SIMULATION ---');

// Step 1: Initialize State (Start with Q1)
let state = JSON.parse(JSON.stringify(mockSurveyState));
let q1 = state.blocks[0].questions[0];

// Step 2: "Open Branching Logic" -> Likely creates a draft or we start editing.
// Assuming we start with empty logic.
let currentLogic = {
    branches: [],
    otherwiseSkipTo: 'end',
    otherwiseIsConfirmed: true
};

// Step 3: Add Branch YES -> Q5 (Confirmed)
console.log('\n--- Action: Add Branch YES (Confirmed) ---');
const branchYes = {
    id: 'b_yes',
    conditions: [{ id: 'cond1', questionId: 'Q1', operator: 'equals', value: 'Yes', isConfirmed: true }],
    thenSkipTo: 'Q5',
    thenSkipToIsConfirmed: true
};
let newBranches = [branchYes];

// Run Editor Logic
let payload1 = processLogicUpdate(q1, currentLogic, newBranches);
currentLogic = payload1; // Update local logic state

// Dispatch to Reducer
let action1 = {
    type: SurveyActionType.UPDATE_QUESTION,
    payload: {
        questionId: 'q1',
        updates: { branchingLogic: payload1 }
    }
};
state = questionReducer(state, action1);
q1 = state.blocks[0].questions[0];

console.log('State after YES branch:', {
    hasDraft: !!q1.draftBranchingLogic,
    hasMain: !!q1.branchingLogic
});


// Step 4: Add Branch NO -> Q7 (Confirmed)
console.log('\n--- Action: Add Branch NO (Confirmed) -> Should be EXHAUSTIVE ---');
const branchNo = {
    id: 'b_no',
    conditions: [{ id: 'cond2', questionId: 'Q1', operator: 'equals', value: 'No', isConfirmed: true }],
    thenSkipTo: 'Q7',
    thenSkipToIsConfirmed: true
};
newBranches = [branchYes, branchNo];

// Run Editor Logic
let payload2 = processLogicUpdate(q1, currentLogic, newBranches);

// Dispatch to Reducer
let action2 = {
    type: SurveyActionType.UPDATE_QUESTION,
    payload: {
        questionId: 'q1',
        updates: { branchingLogic: payload2 }
    }
};
state = questionReducer(state, action2);
q1 = state.blocks[0].questions[0];

console.log('\n--- FINAL RESULT ---');
console.log('Draft Logic exists?', !!q1.draftBranchingLogic);
console.log('Main Logic exists?', !!q1.branchingLogic);

if (q1.branchingLogic) {
    console.log('SUCCESS: Logic was promoted to Main.');
    console.log('Main Logic:', JSON.stringify(q1.branchingLogic, null, 2));
} else {
    console.log('FAILURE: Logic stuck in Draft.');
    console.log('Draft Logic:', JSON.stringify(q1.draftBranchingLogic, null, 2));
}
