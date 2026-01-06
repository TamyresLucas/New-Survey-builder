import { useReducer, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type Survey, type SurveyStatus, QuestionType } from '../types';
import { initialSurveyData } from '../data/default-survey';
import { renumberSurveyVariables } from '../utils'; // Using the re-exported utils
import { surveyReducer, SurveyActionType, type Action } from '../state/surveyReducer';

const LOCAL_STORAGE_KEY = 'surveyBuilderAppState_v4';

const getInitialSurveyState = (): Survey => {
    try {
        const savedStateJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            // A simple check to ensure it's not totally invalid data
            if (savedState && savedState.title && Array.isArray(savedState.blocks)) {
                return savedState;
            }
        }
    } catch (error) {
        console.error("Failed to load or parse survey from localStorage:", error);
    }
    return initialSurveyData;
};

// Creates a "clean" version of the initial survey data to represent the "published" state
// before any changes are made.
const getInitialPublishedSurvey = (): Survey => {
    return JSON.parse(JSON.stringify(initialSurveyData));
};

export const useSurveyState = () => {
    const [survey, dispatch] = useReducer(surveyReducer, getInitialSurveyState(), renumberSurveyVariables);
    const [history, setHistory] = useState<Survey[]>([]);
    const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>('draft');
    const [publishedSurvey, setPublishedSurvey] = useState<Survey | null>(getInitialPublishedSurvey);
    const [isDirty, setIsDirty] = useState(false);

    // Ref to hold the latest history state to avoid stale closures in callbacks.
    const historyRef = useRef(history);
    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    // On first load, dispatch an action to apply the default paging mode and insert automatic page breaks.
    useEffect(() => {
        dispatch({ type: SurveyActionType.SET_PAGING_MODE, payload: { pagingMode: survey.pagingMode } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    useEffect(() => {
        // Compare current survey with published version to detect changes
        if (surveyStatus === 'active' && publishedSurvey) {
            if (JSON.stringify(survey) !== JSON.stringify(publishedSurvey)) {
                setIsDirty(true);
            } else {
                setIsDirty(false);
            }
        } else {
            setIsDirty(false); // If not active, it's not considered "dirty"
        }

        // Autosave logic: persist to local storage whenever survey changes
        // excluding publishedSurvey reference checks or status changes to be pure
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(survey));
    }, [survey, surveyStatus, publishedSurvey]);

    const undoableActionTypes = useMemo(() => new Set([
        SurveyActionType.REORDER_QUESTION,
        SurveyActionType.REPOSITION_QUESTION,
        SurveyActionType.MOVE_QUESTION_TO_NEW_BLOCK,
        SurveyActionType.MOVE_QUESTION_TO_EXISTING_BLOCK,
        SurveyActionType.DELETE_QUESTION,
        SurveyActionType.DELETE_BLOCK,
        SurveyActionType.BULK_DELETE_QUESTIONS,
        SurveyActionType.BULK_MOVE_TO_NEW_BLOCK,
        SurveyActionType.DELETE_CHOICE,
        SurveyActionType.SET_PAGING_MODE,
        SurveyActionType.REORDER_BLOCK,
        SurveyActionType.MOVE_BLOCK_UP,
        SurveyActionType.MOVE_BLOCK_DOWN,
    ]), []);

    const dispatchAndRecord = useCallback((action: Action) => {
        if (undoableActionTypes.has(action.type)) {
            // Limit history size to prevent memory issues, e.g., 10 levels
            setHistory(prev => [...prev, survey].slice(-10));
        }
        dispatch(action);
    }, [survey, undoableActionTypes]);

    const handleUndo = useCallback(() => {
        const currentHistory = historyRef.current;
        if (currentHistory.length > 0) {
            const lastState = currentHistory[currentHistory.length - 1];
            dispatch({ type: SurveyActionType.RESTORE_STATE, payload: lastState });
            setHistory(currentHistory.slice(0, -1));
            return true; // Undo successful
        }
        return false; // Nothing to undo
    }, []);

    return {
        survey,
        dispatch,
        dispatchAndRecord,
        history,
        handleUndo,
        surveyStatus,
        setSurveyStatus,
        publishedSurvey,
        setPublishedSurvey,
        isDirty
    };
};
