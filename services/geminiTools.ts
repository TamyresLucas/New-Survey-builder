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
                enum: Object.values(QTEnum),
            },
            choices: {
                type: Type.ARRAY,
                description: 'An array of strings for the choices. Applicable for choice-based questions like Radio, Checkbox, Dropdown.',
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
            },
            // Advanced Properties
            minSelections: { type: Type.INTEGER, description: "Minimum number of choices required." },
            maxSelections: { type: Type.INTEGER, description: "Maximum number of choices allowed." },
            message: { type: Type.STRING, description: "Custom error message or instruction text." }
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
    description: 'Sets or updates the simple skip logic for a question. This determines where the respondent goes after answering. Calling this will overwrite any existing skip logic. Do NOT use this for branching logic or complex conditions.',
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

// --- NEW TOOLS ---

export const setBranchingLogicFunctionDeclaration: FunctionDeclaration = {
    name: 'set_branching_logic',
    description: 'Sets or updates the branching logic for a question or block. This is for complex logic like "IF Q1=Yes AND Q2=No THEN -> Q5". Overwrites existing branching logic.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            targetId: {
                type: Type.STRING,
                description: "The variable name of the question (e.g., 'Q1') OR block (e.g., 'BL1') to apply the logic to.",
            },
            branches: {
                type: Type.ARRAY,
                description: "List of branches to evaluate in order.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        conditions: {
                            type: Type.ARRAY,
                            description: "Conditions for this branch (e.g., Q1=Yes).",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sourceQid: { type: Type.STRING },
                                    operator: { type: Type.STRING, enum: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty', 'greater_than', 'less_than'] },
                                    value: { type: Type.STRING }
                                },
                                required: ['sourceQid', 'operator']
                            }
                        },
                        conditionOperator: {
                            type: Type.STRING,
                            description: "How to combine conditions in this branch (AND/OR).",
                            enum: ['AND', 'OR'],
                            default: 'AND'
                        },
                        destination: {
                            type: Type.STRING,
                            description: "Where to go if conditions match (QID, 'next', 'end')."
                        },
                        pathName: { type: Type.STRING, description: "Optional name for this branch." }
                    },
                    required: ['conditions', 'destination']
                }
            },
            otherwiseDestination: {
                type: Type.STRING,
                description: "Where to go if NO branches match. Defaults to 'next'.",
            }
        },
        required: ['targetId', 'branches']
    }
};

export const addBlockFunctionDeclaration: FunctionDeclaration = {
    name: 'add_block',
    description: 'Adds a new block to the survey.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Title of the new block." },
            insertAfterBid: { type: Type.STRING, description: "Optional. The BID of the block to insert after (e.g., 'BL1')." }
        },
        required: ['title']
    }
};

export const updateBlockFunctionDeclaration: FunctionDeclaration = {
    name: 'update_block',
    description: 'Updates a block title or other properties.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            bid: { type: Type.STRING, description: "The BID of the block (e.g., 'BL1')." },
            title: { type: Type.STRING, description: "New title for the block." }
        },
        required: ['bid', 'title']
    }
};

// --- END NEW TOOLS ---

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
