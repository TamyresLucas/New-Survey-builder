import { FunctionDeclaration, Type } from "@google/genai";
import { QuestionType as QTEnum } from '../types';

export const addQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'add_question',
    description: 'Adds a question to the survey. Can optionally specify its position relative to another question.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: 'The main text or question being asked.',
            },
            type: {
                type: Type.STRING,
                description: 'The type of question.',
                enum: [QTEnum.Radio, QTEnum.Checkbox, QTEnum.Description, QTEnum.TextEntry],
            },
            choices: {
                type: Type.ARRAY,
                description: 'An array of strings for the choices. Only applicable for Radio Button and Checkbox types.',
                items: {
                    type: Type.STRING,
                },
            },
            after_qid: {
                type: Type.STRING,
                description: "The variable name (e.g., 'Q1', 'Q2') of the question AFTER which this new question should be inserted. Use for requests like 'add a question after Q2'."
            },
            before_qid: {
                type: Type.STRING,
                description: "The variable name (e.g., 'Q1', 'Q2') of the question BEFORE which this new question should be inserted. Use for requests like 'add before Q2' or to make the new question become a specific number, e.g., 'make this the new Q1'."
            }
        },
        required: ['title', 'type'],
    },
};

export const updateQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'update_question',
    description: 'Updates properties of an existing question. Use this to change text, choices, type, or other settings like making it required or randomizing choices.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to update (e.g., 'Q1'). When the user says 'this question', use the qid from the provided context.",
            },
            text: {
                type: Type.STRING,
                description: 'The new main text for the question.',
            },
            type: {
                type: Type.STRING,
                description: 'The new type for the question (e.g., "Checkbox", "Text Entry").',
                enum: Object.values(QTEnum),
            },
            choices: {
                type: Type.ARRAY,
                description: 'A new array of strings for the choices. This will replace all existing choices.',
                items: {
                    type: Type.STRING,
                },
            },
            forceResponse: {
                type: Type.BOOLEAN,
                description: 'Set to true to make the question required, false to make it optional.',
            },
            randomizeChoices: {
                type: Type.BOOLEAN,
                description: "Set to true to randomize the order of choices, false to disable randomization."
            },
            answerFormat: {
                type: Type.STRING,
                description: "For choice-based questions, sets the display format.",
                enum: ['list', 'grid']
            },
            multipleSelection: {
                type: Type.BOOLEAN,
                description: "For Radio Button or Checkbox questions, set to true to allow multiple answers (Checkbox), or false for a single answer (Radio Button). This will change the question's type.",
            }
        },
        required: ['qid'],
    },
};

export const getQuestionDetailsFunctionDeclaration: FunctionDeclaration = {
    name: 'get_question_details',
    description: 'Retrieves the current configuration and details of a specific question in the survey.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to get details for (e.g., 'Q1'). When the user asks about 'this question', use the qid from the provided context.",
            },
        },
        required: ['qid'],
    },
};

export const setDisplayLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'set_display_logic',
    description: 'Sets or updates the display logic for a question. This determines whether the question is shown to the respondent. Calling this will overwrite any existing display logic.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to apply the logic to (e.g., 'Q2'). When the user says 'this question', use the qid from the provided context.",
            },
            logicalOperator: {
                type: Type.STRING,
                description: "How to evaluate multiple conditions. Defaults to 'AND'.",
                enum: ['AND', 'OR'],
            },
            conditions: {
                type: Type.ARRAY,
                description: 'A list of conditions that must be met for the question to be displayed.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sourceQid: {
                            type: Type.STRING,
                            description: "The QID of the question the condition is based on (e.g., 'Q1').",
                        },
                        operator: {
                            type: Type.STRING,
                            description: 'The comparison operator.',
                            enum: ['equals', 'not_equals', 'is_empty', 'is_not_empty', 'contains', 'greater_than', 'less_than'],
                        },
                        value: {
                            type: Type.STRING,
                            description: "The value to check against. For choice-based questions, find the full choice text (e.g., 'Q1_1 Yes') from the user's prompt or survey context. Not required for 'is_empty' or 'is_not_empty'.",
                        },
                    },
                    required: ['sourceQid', 'operator'],
                },
            },
        },
        required: ['qid', 'conditions'],
    },
};

export const removeDisplayLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'remove_display_logic',
    description: 'Removes all display logic from a question, making it always visible.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to remove logic from (e.g., 'Q2'). When the user says 'this question', use the qid from the provided context.",
            },
        },
        required: ['qid'],
    },
};

export const setSkipLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'set_skip_logic',
    description: 'Sets or updates the skip logic for a question. This determines where the respondent goes after answering. Calling this will overwrite any existing skip logic. For questions with choices (like Radio Button), you must provide a rule for each choice. For other questions (like Text Entry), provide one rule without a specific choice.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to apply the logic to (e.g., 'Q1'). When the user says 'this question', use the qid from the provided context.",
            },
            rules: {
                type: Type.ARRAY,
                description: "A list of rules for skipping. The destination can be another question's QID (e.g., 'Q3'), 'next', or 'end'.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        choiceText: {
                            type: Type.STRING,
                            description: "The text of the choice that triggers this rule (e.g., 'Yes', 'Option A'). Omit for simple (non-choice-based) skip logic.",
                        },
                        destinationQid: {
                            type: Type.STRING,
                            description: "The QID of the question to skip to, or the keyword 'next' or 'end'.",
                        },
                    },
                    required: ['destinationQid'],
                },
            },
        },
        required: ['qid', 'rules'],
    },
};

export const removeSkipLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'remove_skip_logic',
    description: 'Removes all skip logic from a question.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to remove logic from (e.g., 'Q1'). When the user says 'this question', use the qid from the provided context.",
            },
        },
        required: ['qid'],
    },
};

export const repositionQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'reposition_question',
    description: 'Moves an existing question to a new position in the survey, either before or after another specified question.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to move (e.g., 'Q1').",
            },
            after_qid: {
                type: Type.STRING,
                description: "The variable name (e.g., 'Q2') of the question AFTER which the selected question should be moved."
            },
            before_qid: {
                type: Type.STRING,
                description: "The variable name (e.g., 'Q3') of the question BEFORE which the selected question should be moved."
            },
            force: {
                type: Type.BOOLEAN,
                description: "Defaults to false. If true, bypasses logic validation and forces the move. This should only be used after the user has been warned about potential logic issues and has confirmed they want to proceed."
            }
        },
        required: ['qid'],
    },
};

export const deleteQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'delete_question',
    description: 'Deletes an existing question from the survey based on its variable name (QID).',
    parameters: {
        type: Type.OBJECT,
        properties: {
            qid: {
                type: Type.STRING,
                description: "The variable name of the question to delete (e.g., 'Q1').",
            },
        },
        required: ['qid'],
    },
};
