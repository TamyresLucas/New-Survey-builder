
import type { Survey } from '../types.js';
import { SurveyActionType, Action } from './actions.js';
import { blockReducer } from './reducers/blockReducer.js';
import { questionReducer } from './reducers/questionReducer.js';
import { choiceReducer } from './reducers/choiceReducer.js';
import { bulkReducer } from './reducers/bulkReducer.js';
import { metaReducer } from './reducers/metaReducer.js';

export { SurveyActionType };
export type { Action };

// Helper to update timestamp
const updateTimestamp = (state: Survey): Survey => ({
    ...state,
    lastSaved: new Date().toISOString()
});

export function surveyReducer(state: Survey, action: Action): Survey {
    // Actions that should NOT update the timestamp
    if (action.type === SurveyActionType.RESTORE_STATE || action.type === SurveyActionType.CLEAR_LOGIC_VALIDATION_MESSAGE) {
        return metaReducer(state, action);
    }

    let newState = state;

    switch (action.type) {
        // Block Actions
        case SurveyActionType.UPDATE_BLOCK_TITLE:
        case SurveyActionType.UPDATE_BLOCK:
        case SurveyActionType.ADD_BLOCK:
        case SurveyActionType.DELETE_BLOCK:
        case SurveyActionType.COPY_BLOCK:
        case SurveyActionType.REORDER_BLOCK:
        case SurveyActionType.MOVE_BLOCK_UP:
        case SurveyActionType.MOVE_BLOCK_DOWN:
        case SurveyActionType.ADD_BLOCK_FROM_TOOLBOX:
        case SurveyActionType.ADD_BLOCK_FROM_AI:
            newState = blockReducer(state, action);
            break;

        // Question Actions
        case SurveyActionType.UPDATE_QUESTION:
        case SurveyActionType.ADD_QUESTION:
        case SurveyActionType.ADD_QUESTION_FROM_AI:
        case SurveyActionType.DELETE_QUESTION:
        case SurveyActionType.COPY_QUESTION:
        case SurveyActionType.REORDER_QUESTION:
        case SurveyActionType.ADD_PAGE_BREAK_AFTER_QUESTION:
        case SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK:
        case SurveyActionType.MOVE_QUESTION_TO_EXISTING_BLOCK:
        case SurveyActionType.REPOSITION_QUESTION:
        case SurveyActionType.CLEANUP_UNCONFIRMED_LOGIC:
            newState = questionReducer(state, action);
            break;

        // Choice Actions
        case SurveyActionType.ADD_CHOICE:
        case SurveyActionType.DELETE_CHOICE:
            newState = choiceReducer(state, action);
            break;

        // Bulk Actions
        case SurveyActionType.BULK_DELETE_QUESTIONS:
        case SurveyActionType.BULK_DUPLICATE_QUESTIONS:
        case SurveyActionType.BULK_UPDATE_QUESTIONS:
        case SurveyActionType.BULK_MOVE_TO_NEW_BLOCK:
            newState = bulkReducer(state, action);
            break;

        // Meta/Global Actions
        case SurveyActionType.UPDATE_SURVEY_TITLE:
        case SurveyActionType.SET_PAGING_MODE:
        case SurveyActionType.REPLACE_SURVEY:
        case SurveyActionType.SET_GLOBAL_AUTOADVANCE:
            newState = metaReducer(state, action);
            break;

        // Explicit Timestamp Update
        case SurveyActionType.UPDATE_TIMESTAMP:
            return updateTimestamp(state);

        default:
            return state;
    }

    // Automatic timestamp update removed to disable autosave-like behavior on every edit.
    // Timestamp is now only updated explicitly via UPDATE_TIMESTAMP (e.g., on Publish).

    if (newState !== state) {
        return updateTimestamp(newState);
    }


    return newState;
}