import type { Survey, Block, Question, DisplayLogic, DisplayLogicCondition, SkipLogic, SkipLogicRule, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition } from '../types';
import { QuestionType } from '../types';
import { generateId } from './id';

/**
 * Parses a choice string like "Q1_1 Yes" into its variable and label parts.
 * @param text The full choice text.
 * @returns An object with 'variable' and 'label' properties.
 */
export const parseChoice = (text: string): { variable: string; label: string } => {
    // Matches a variable like Q1_1 at the start of the string, followed by optional space.
    const match = text.match(/(^Q\d+_\d+)\s*/);
    if (match) {
        return {
            variable: match[1],
            label: text.substring(match[0].length)
        };
    }
    // If no variable is found, the entire string is considered the label.
    return { variable: '', label: text };
};

export const parseDestinationString = (
    destStr: string,
    qidToQuestionMap: Map<string, Question>,
    bidToBlockMap: Map<string, Block>
): string => {
    const trimmed = destStr.trim();
    if (trimmed.toLowerCase() === 'next question') return 'next';
    if (trimmed.toLowerCase() === 'end of survey') return 'end';

    const blockMatch = trimmed.match(/^Block (BL\d+)/i);
    if (blockMatch) {
        const block = bidToBlockMap.get(blockMatch[1].toUpperCase());
        return block ? `block:${block.id}` : '';
    }

    const questionMatch = trimmed.match(/^(Q\d+)/i);
    if (questionMatch) {
        const question = qidToQuestionMap.get(questionMatch[0].toUpperCase());
        return question ? question.id : '';
    }

    return '';
};

export const parseVoxcoLogic = (
    rawLogic: string,
    qidToQuestionMap: Map<string, Question>
): Omit<DisplayLogic, 'conditions'> & { conditions: Omit<DisplayLogicCondition, 'id'>[] } | undefined => {
    let logic = rawLogic.trim();

    // Handle implicit SHOW IF / HIDE IF
    let isHide = false;
    if (logic.toUpperCase().startsWith('HIDE IF ')) {
        isHide = true;
        logic = logic.substring(8).trim();
    } else if (logic.toUpperCase().startsWith('SHOW IF ')) {
        logic = logic.substring(8).trim();
    }

    // Basic splitting by AND/OR (Does not support complex nested parentheses mixing AND/OR yet)
    // We assume the top level is consistent (all AND or all OR)
    const upperLogic = logic.toUpperCase();
    const operator = upperLogic.includes(' OR ') ? 'OR' : 'AND';
    const splitRegex = new RegExp(`\\s+${operator}\\s+`, 'i');
    const parts = logic.split(splitRegex);

    const conditions: Omit<DisplayLogicCondition, 'id'>[] = [];

    // Regex for Voxco syntax: Q1.A1 = 1, Q1 = "Yes", Q1 > 5, Q1 = Q2, etc.
    // Groups: 1=QID, 2=AnswerIndex(opt), 3=ColIndex(opt), 4=Operator, 5=Value (quoted), 6=Value (numeric), 7=Value (Question Ref)
    const voxcoRegex = /^(Q\d+)(?:\.A(\d+))?(?:\.C(\d+))?\s*(=|<>|>|>=|<|<=|LIKE|RLIKE)\s*(?:"([^"]*)"|(\d+)|(Q\d+(?:_\d+)?))$/i;

    for (const part of parts) {
        // Remove outer parens if simple wrapper
        let cleanPart = part.trim();
        if (cleanPart.startsWith('(') && cleanPart.endsWith(')')) {
            cleanPart = cleanPart.slice(1, -1).trim();
        }

        const match = cleanPart.match(voxcoRegex);
        if (match) {
            const [, qid, ansIdx, colIdx, opStr, strVal, numVal, qRefVal] = match;
            const questionId = qid.toUpperCase();
            const question = qidToQuestionMap.get(questionId);

            if (!question) {
                // If question not found, we can't resolve A1/C1, but we can return raw
                conditions.push({
                    questionId,
                    operator: 'equals', // Default fallback
                    value: strVal || numVal || qRefVal || '',
                    isConfirmed: true
                });
                continue;
            }

            let operator: DisplayLogicCondition['operator'] = 'equals';
            let value = strVal !== undefined ? strVal : (numVal !== undefined ? numVal : qRefVal);

            // Map Operators
            switch (opStr.toUpperCase()) {
                case '=': operator = 'equals'; break;
                case '<>': operator = 'not_equals'; break;
                case '>': operator = 'greater_than'; break;
                case '<': operator = 'less_than'; break;
                case 'LIKE': operator = 'contains'; break;
                // RLIKE not directly supported in simple model, mapping to contains or equals
                case 'RLIKE': operator = 'contains'; break;
            }

            // Handle Qx.Ay notation (Choice Index)
            if (ansIdx) {
                const index = parseInt(ansIdx) - 1; // 1-based to 0-based
                if (question.choices && question.choices[index]) {
                    // Q1.A1 = 1 -> Selected (Equals Choice Value)
                    // Q1.A1 = 0 -> Not Selected (Not Equals Choice Value)
                    const choiceValue = question.choices[index].text; // Assuming value matches text for now

                    if (value === '1') {
                        value = choiceValue;
                        // Operator remains as mapped (usually '=')
                    } else if (value === '0') {
                        value = choiceValue;
                        operator = 'not_equals';
                    } else {
                        // Fallback for weird cases like Q1.A1 = "Something"
                    }
                }
            }
            // Handle Qx = 1 / Qx = 0 (Empty/Not Empty)
            else if (!ansIdx && (value === '1' || value === '0') && (question.type === QuestionType.Radio || question.type === QuestionType.Checkbox)) {
                if (value === '1') {
                    operator = 'is_not_empty';
                    value = '';
                } else {
                    operator = 'is_empty';
                    value = '';
                }
            }
            // Handle Qx = Qy (Question Comparison)
            else if (qRefVal) {
                // If the value is a question reference (e.g. Q1_1), we treat it as a string value for now
                // or ideally, we'd have a specific operator for 'equals_question' but our type system might be limited.
                // For now, we pass it as a value.
                value = qRefVal;
            }

            conditions.push({
                questionId,
                operator,
                value: value || '',
                isConfirmed: true
            });

        } else {
            // Fallback to old parser regex for "Q1 equals Yes" style
            const oldRegex = /(Q\d+)\s+([a-z_]+)\s*(?:"([^"]*)")?/i;
            const oldMatch = cleanPart.match(oldRegex);
            if (oldMatch) {
                const [, questionId, op, val] = oldMatch;
                conditions.push({
                    questionId: questionId.toUpperCase(),
                    operator: op.toLowerCase() as DisplayLogicCondition['operator'],
                    value: val || '',
                    isConfirmed: true,
                });
            }
        }
    }

    if (conditions.length === 0) return undefined;
    return { operator, conditions };
};

export const parseDisplayLogicString = (
    rawLogic: string
): Omit<DisplayLogic, 'conditions'> & { conditions: Omit<DisplayLogicCondition, 'id'>[] } | undefined => {
    // Deprecated wrapper, but kept for compatibility if needed without context
    // Ideally, we should migrate all calls to parseVoxcoLogic
    return undefined;
};

export const parseSkipLogicString = (
    rawLogic: string,
    currentQuestion: Question,
    qidToQuestionMap: Map<string, Question>,
    bidToBlockMap: Map<string, Block>
): SkipLogic | undefined => {
    if (rawLogic.toLowerCase().startsWith('if answered, skip to')) {
        const destStr = rawLogic.substring('if answered, skip to'.length).trim();
        const skipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
        if (skipTo) {
            return { type: 'simple', skipTo, isConfirmed: true };
        }
    } else {
        const rules: Omit<SkipLogicRule, 'id'>[] = [];
        const parts = rawLogic.split('; ');

        for (const part of parts) {
            const match = part.match(/^IF "([^"]+)"(?:\s(is answered with|is not answered with|is after|is before|is answered|is not answered)\s"([^"]+)")?\s*->\s*(.*)$/i);
            if (!match) continue;

            const [, choiceLabel, operatorStr, scalePointLabel, destStr] = match;

            const choice = currentQuestion.choices?.find(c => parseChoice(c.text).label.trim().toLowerCase() === choiceLabel.trim().toLowerCase());
            if (!choice) continue;

            const skipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
            if (!skipTo) continue;

            const newRule: Omit<SkipLogicRule, 'id'> = { choiceId: choice.id, skipTo, isConfirmed: true };

            if (operatorStr && scalePointLabel) {
                const operatorMap: { [key: string]: SkipLogicRule['operator'] } = {
                    'is answered with': 'is_answered_with', 'is not answered with': 'is_not_answered_with',
                    'is after': 'is_answered_after', 'is before': 'is_answered_before',
                    'is answered': 'is_answered', 'is not answered': 'is_not_answered'
                };
                newRule.operator = operatorMap[operatorStr.toLowerCase()];
                const scalePoint = currentQuestion.scalePoints?.find(sp => sp.text.trim().toLowerCase() === scalePointLabel.trim().toLowerCase());
                if (scalePoint) {
                    newRule.valueChoiceId = scalePoint.id;
                }
            }

            rules.push(newRule);
        }

        if (rules.length > 0) {
            return { type: 'per_choice', rules: rules.map(r => ({ ...r, id: generateId('slr') })) };
        }
    }
    return undefined;
};

export const parseBranchingLogicString = (
    rawLogic: string,
    qidToQuestionMap: Map<string, Question>,
    bidToBlockMap: Map<string, Block>
): BranchingLogic | undefined => {
    const branches: Omit<BranchingLogicBranch, 'id'>[] = [];
    let otherwiseSkipTo: string | undefined;

    const parts = rawLogic.split('; ');

    for (const part of parts) {
        if (part.toUpperCase().startsWith('OTHERWISE ->')) {
            const destStr = part.substring('OTHERWISE ->'.length).trim();
            otherwiseSkipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
        } else if (part.toUpperCase().startsWith('IF')) {
            const branchMatch = part.match(/^IF (.*) THEN -> (.*)$/i);
            if (!branchMatch) continue;

            const [, conditionsStr, destStr] = branchMatch;
            const thenSkipTo = parseDestinationString(destStr, qidToQuestionMap, bidToBlockMap);
            if (!thenSkipTo) continue;

            const operator = conditionsStr.toUpperCase().includes(' OR ') ? 'OR' : 'AND';
            const conditionParts = conditionsStr.split(new RegExp(` ${operator} `, 'i'));
            const conditions: Omit<BranchingLogicCondition, 'id'>[] = [];

            for (const condPart of conditionParts) {
                const gridMatch = condPart.trim().match(/^(Q\d+)\s+"([^"]+)"\s+([a-z_]+)\s+"([^"]+)"$/i);
                if (gridMatch) {
                    const [, questionId, rowLabel, op, colText] = gridMatch;
                    const sourceQ = qidToQuestionMap.get(questionId.toUpperCase());
                    const value = sourceQ?.choices?.find(c => parseChoice(c.text).label.trim().toLowerCase() === rowLabel.trim().toLowerCase())?.text || '';
                    const gridValue = sourceQ?.scalePoints?.find(sp => sp.text.trim().toLowerCase() === colText.trim().toLowerCase())?.id || '';
                    conditions.push({ questionId: questionId.toUpperCase(), value, operator: op.toLowerCase() as BranchingLogicCondition['operator'], gridValue, isConfirmed: true });
                } else {
                    const regularMatch = condPart.trim().match(/^(Q\d+)\s+([a-z_]+)\s*(?:"([^"]*)")?$/i);
                    if (regularMatch) {
                        const [, questionId, op, value] = regularMatch;
                        conditions.push({ questionId: questionId.toUpperCase(), operator: op.toLowerCase() as BranchingLogicCondition['operator'], value: value || '', isConfirmed: true });
                    }
                }
            }

            if (conditions.length > 0) {
                branches.push({
                    operator,
                    conditions: conditions.map(c => ({ ...c, id: generateId('cond') })),
                    thenSkipTo, thenSkipToIsConfirmed: true
                });
            }
        }
    }

    if (branches.length > 0 || otherwiseSkipTo) {
        return {
            branches: branches.map(b => ({ ...b, id: generateId('branch') })),
            otherwiseSkipTo: otherwiseSkipTo || 'next',
            otherwiseIsConfirmed: true,
        };
    }
    return undefined;
};

export const parseSurveyCsv = (csvContent: string, surveyTitle: string): Survey | null => {
    try {
        const lines = csvContent.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return null;

        const parseCsvRow = (row: string): string[] => {
            const fields: string[] = [];
            let currentField = '';
            let inQuotes = false;
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                    if (inQuotes && row[i + 1] === '"') { // Escaped quote
                        currentField += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    fields.push(currentField);
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            fields.push(currentField);
            return fields.map(f => f.startsWith('"') && f.endsWith('"') ? f.slice(1, -1).replace(/""/g, '"') : f);
        };

        const header = parseCsvRow(lines[0]).map(h => h.trim());
        const headerMap: { [key: string]: string } = {};
        header.forEach(h => {
            headerMap[h] = h === 'Question ID / Label' ? 'Question ID' : h;
        });

        const dataRows = lines.slice(1);
        const blocksMap = new Map<string, Block>();

        for (const rowStr of dataRows) {
            if (!rowStr.trim()) continue;
            const row = parseCsvRow(rowStr);
            const rowData: { [key: string]: string } = {};
            header.forEach((h, i) => {
                const key = headerMap[h] || h;
                rowData[key] = row[i];
            });

            const blockBid = rowData['Block BID'];
            if (!blockBid) continue;

            if (!blocksMap.has(blockBid)) {
                blocksMap.set(blockBid, {
                    id: generateId('block'),
                    bid: blockBid,
                    title: rowData['Block Title'],
                    questions: [],
                });
            }

            const block = blocksMap.get(blockBid)!;
            const questionType = rowData['Question Type'] as QuestionType;
            const questionText = rowData['Question Text'];

            let newQuestion: any;

            if (questionType === QuestionType.Description) {
                newQuestion = {
                    id: generateId('q'), qid: '', label: rowData['Question ID'],
                    text: questionText, type: questionType,
                };
            } else if (questionType === QuestionType.PageBreak) {
                newQuestion = {
                    id: generateId('q'), qid: '', text: 'Page Break',
                    pageName: questionText, type: questionType,
                };
            } else {
                newQuestion = {
                    id: generateId('q'), qid: rowData['Question ID'], text: questionText,
                    type: questionType, forceResponse: rowData['Force Response']?.toLowerCase() === 'yes',
                };

                if (rowData['Choices']) {
                    newQuestion.choices = rowData['Choices'].split('; ').map((text) => ({
                        id: generateId('c'), text: text.trim(),
                    }));
                }
                if (rowData['Scale Points']) {
                    newQuestion.scalePoints = rowData['Scale Points'].split('; ').map(text => ({
                        id: generateId('s'), text: text.trim(),
                    }));
                }

                if (rowData['Display Logic']) newQuestion._rawDisplayLogic = rowData['Display Logic'];
                if (rowData['Skip Logic']) newQuestion._rawSkipLogic = rowData['Skip Logic'];
                if (rowData['Branching Logic']) newQuestion._rawBranchingLogic = rowData['Branching Logic'];
            }
            block.questions.push(newQuestion);
        }

        const allBlocks = Array.from(blocksMap.values());
        const allQuestions = allBlocks.flatMap(b => b.questions);
        const qidToQuestionMap = new Map<string, Question>(allQuestions.filter(q => q.qid).map(q => [q.qid, q]));
        const bidToBlockMap = new Map<string, Block>(allBlocks.filter(b => b.bid).map(b => [b.bid!, b]));

        for (const question of allQuestions) {
            const q = question as any;
            if (q._rawDisplayLogic) {
                const parsedLogic = parseDisplayLogicString(q._rawDisplayLogic);
                if (parsedLogic) {
                    q.displayLogic = {
                        operator: parsedLogic.operator,
                        conditions: parsedLogic.conditions.map(c => ({ ...c, id: generateId('cond') }))
                    };
                }
                delete q._rawDisplayLogic;
            }
            if (q._rawSkipLogic) {
                q.skipLogic = parseSkipLogicString(q._rawSkipLogic, q, qidToQuestionMap, bidToBlockMap);
                delete q._rawSkipLogic;
            }
            if (q._rawBranchingLogic) {
                q.branchingLogic = parseBranchingLogicString(q._rawBranchingLogic, qidToQuestionMap, bidToBlockMap);
                delete q._rawBranchingLogic;
            }
        }

        const newSurvey: Survey = {
            title: surveyTitle.replace(/\.csv$/i, ''),
            blocks: allBlocks,
            pagingMode: 'one-per-page', // Default paging mode on import
        };

        return newSurvey;
    } catch (e) {
        console.error("Error parsing CSV", e);
        return null;
    }
};
