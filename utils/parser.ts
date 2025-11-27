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

export const parseDisplayLogicString = (
    rawLogic: string
): Omit<DisplayLogic, 'conditions'> & { conditions: Omit<DisplayLogicCondition, 'id'>[] } | undefined => {
    const match = rawLogic.match(/^SHOW IF (.*)$/i);
    if (!match) return undefined;

    const conditionsStr = match[1];
    const operator = conditionsStr.toUpperCase().includes(' OR ') ? 'OR' : 'AND';
    const conditionParts = conditionsStr.split(new RegExp(` ${operator} `, 'i'));

    const conditions: Omit<DisplayLogicCondition, 'id'>[] = [];
    const conditionRegex = /(Q\d+)\s+([a-z_]+)\s*(?:"([^"]*)")?/i;

    for (const part of conditionParts) {
        const condMatch = part.trim().match(conditionRegex);
        if (condMatch) {
            const [, questionId, op, value] = condMatch;
            conditions.push({
                questionId: questionId.toUpperCase(),
                operator: op.toLowerCase() as DisplayLogicCondition['operator'],
                value: value || '',
                isConfirmed: true,
            });
        }
    }
    if (conditions.length === 0) return undefined;
    return { operator, conditions };
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
