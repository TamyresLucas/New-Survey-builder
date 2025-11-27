import type { Survey } from '../types';
import { parseChoice } from './parser';

export const truncate = (str: string, maxLength: number): string => {
    if (!str) return '';
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength) + '...';
};

export const stripHtml = (html: string): string => {
    if (typeof document === 'undefined') {
        return html.replace(/<[^>]*>?/gm, '');
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

export const generateSurveyTextCopy = (survey: Survey): string => {
    let output = `SURVEY: ${survey.title}\n`;
    output += `========================================\n\n`;

    const allQuestions = survey.blocks.flatMap(b => b.questions);

    const formatDestination = (destinationId: string): string => {
        if (destinationId === 'next') return 'Next Question';
        if (destinationId === 'end') return 'End of Survey';

        if (destinationId.startsWith('block:')) {
            const blockId = destinationId.substring(6);
            const block = survey.blocks.find(b => b.id === blockId);
            return block ? `Block ${block.bid}` : 'Unknown Block';
        }

        const question = allQuestions.find(q => q.id === destinationId);
        return question ? question.qid : 'Unknown Question';
    };

    survey.blocks.forEach(block => {
        output += `BLOCK ${block.bid}: ${block.title}\n`;
        output += `----------------------------------------\n`;

        block.questions.forEach(q => {
            if (q.type === 'Page Break') {
                output += `[PAGE BREAK]\n\n`;
                return;
            }
            if (q.type === 'Description') {
                output += `${q.label || 'Description'}: ${stripHtml(q.text)}\n\n`;
                return;
            }

            output += `Question Variable: ${q.qid}\n`;
            output += `Question Text: ${stripHtml(q.text)}\n`;

            if (q.choices) {
                output += `Choices:\n`;
                q.choices.forEach(c => {
                    const { variable, label } = parseChoice(c.text);
                    output += `  ${variable || '(No Var)'}: ${stripHtml(label)}\n`;
                });
            }

            if (q.scalePoints) {
                output += `Scale Points (Columns):\n`;
                q.scalePoints.forEach(sp => {
                    output += `  - ${stripHtml(sp.text)}\n`;
                });
            }

            const displayLogic = q.displayLogic;
            if (displayLogic && displayLogic.conditions.filter(c => c.isConfirmed).length > 0) {
                const logicStr = displayLogic.conditions
                    .filter(c => c.isConfirmed)
                    .map(c => `${c.questionId} ${c.operator} "${c.value}"`)
                    .join(` ${displayLogic.operator} `);
                output += `  Display Logic: SHOW IF ${logicStr}\n`;
            }

            const skipLogic = q.skipLogic;
            if (skipLogic) {
                if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                    output += `  Skip Logic: IF answered, skip to ${formatDestination(skipLogic.skipTo)}\n`;
                } else if (skipLogic.type === 'per_choice') {
                    const rules = skipLogic.rules.filter(r => r.isConfirmed);
                    if (rules.length > 0) {
                        output += `  Skip Logic:\n`;
                        rules.forEach(rule => {
                            const choice = q.choices?.find(c => c.id === rule.choiceId);
                            if (choice) {
                                const { label } = parseChoice(choice.text);
                                output += `    IF "${stripHtml(label)}" is selected, skip to ${formatDestination(rule.skipTo)}\n`;
                            }
                        });
                    }
                }
            }

            const branchingLogic = q.branchingLogic;
            if (branchingLogic) {
                const hasConfirmedBranches = branchingLogic.branches.some(b => b.thenSkipToIsConfirmed);
                if (hasConfirmedBranches || branchingLogic.otherwiseIsConfirmed) {
                    output += `  Branching Logic:\n`;
                    branchingLogic.branches.forEach(branch => {
                        if (branch.thenSkipToIsConfirmed) {
                            const conditionsStr = branch.conditions.filter(c => c.isConfirmed).map(c => `${c.questionId} ${c.operator} "${c.value}"`).join(` ${branch.operator} `);
                            output += `    IF ${conditionsStr} THEN skip to ${formatDestination(branch.thenSkipTo)}\n`;
                        }
                    });
                    if (branchingLogic.otherwiseIsConfirmed) {
                        output += `    OTHERWISE skip to ${formatDestination(branchingLogic.otherwiseSkipTo)}\n`;
                    }
                }
            }

            output += `\n`;
        });
    });

    return output;
};

export const generateSurveyCsv = (survey: Survey): string => {
    const allQuestions = survey.blocks.flatMap(b => b.questions);
    const allQuestionsWithBlock = survey.blocks.flatMap(block =>
        block.questions.map(question => ({ question, block }))
    );

    const header = [
        'Block BID', 'Block Title', 'Question ID / Label', 'Question Text', 'Question Type', 'Choices', 'Scale Points', 'Force Response',
        'Display Logic', 'Skip Logic', 'Branching Logic'
    ];

    const escapeCsvField = (field: string | undefined | null): string => {
        if (field === undefined || field === null) return '""';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
    };

    const formatDestination = (destinationId: string): string => {
        if (destinationId === 'next') return 'Next Question';
        if (destinationId === 'end') return 'End of Survey';
        if (destinationId.startsWith('block:')) {
            const blockId = destinationId.substring(6);
            const block = survey.blocks.find(b => b.id === blockId);
            return block ? `Block ${block.bid}` : 'Unknown Block';
        }
        const question = allQuestions.find(q => q.id === destinationId);
        return question ? question.qid : 'Unknown Question';
    };

    const dataRows = allQuestionsWithBlock.map(({ question, block }) => {
        if (question.type === 'Page Break') {
            return [
                escapeCsvField(block.bid),
                escapeCsvField(block.title),
                escapeCsvField(''),
                escapeCsvField(question.pageName || (question.isAutomatic ? 'Automatic Page Break' : 'Page Break')),
                escapeCsvField(question.type),
                escapeCsvField(''), escapeCsvField(''), escapeCsvField('No'),
                escapeCsvField(''), escapeCsvField(''), escapeCsvField(''),
            ].join(',');
        }

        if (question.type === 'Description') {
            return [
                escapeCsvField(block.bid),
                escapeCsvField(block.title),
                escapeCsvField(question.label),
                escapeCsvField(stripHtml(question.text)),
                escapeCsvField(question.type),
                escapeCsvField(''), escapeCsvField(''), escapeCsvField('No'),
                escapeCsvField(''), escapeCsvField(''), escapeCsvField(''),
            ].join(',');
        }

        const choices = question.choices?.map(c => parseChoice(c.text).label).join('; ') || '';
        const scalePoints = question.scalePoints?.map(sp => sp.text).join('; ') || '';

        // Format display logic
        let displayLogicStr = '';
        const displayLogic = question.displayLogic;
        if (displayLogic && displayLogic.conditions.filter(c => c.isConfirmed).length > 0) {
            displayLogicStr = 'SHOW IF ' + displayLogic.conditions
                .filter(c => c.isConfirmed)
                .map(c => `${c.questionId} ${c.operator} "${c.value}"`)
                .join(` ${displayLogic.operator} `);
        }

        // Format skip logic
        let skipLogicStr = '';
        const skipLogic = question.skipLogic;
        if (skipLogic) {
            if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
                skipLogicStr = `IF answered, skip to ${formatDestination(skipLogic.skipTo)}`;
            } else if (skipLogic.type === 'per_choice') {
                const rules = skipLogic.rules.filter(r => r.isConfirmed);
                if (rules.length > 0) {
                    skipLogicStr = rules.map(rule => {
                        const choice = question.choices?.find(c => c.id === rule.choiceId);
                        if (!choice) return '';
                        const { label: rowLabel } = parseChoice(choice.text);

                        if (question.type === 'Choice Grid' && rule.operator && rule.valueChoiceId) {
                            const scalePoint = question.scalePoints?.find(sp => sp.id === rule.valueChoiceId);
                            if (scalePoint) {
                                const operatorMap: { [key: string]: string } = {
                                    'is_answered_with': 'is answered with',
                                    'is_not_answered_with': 'is not answered with',
                                    'is_answered_after': 'is after',
                                    'is_answered_before': 'is before',
                                    'is_answered': 'is answered',
                                    'is_not_answered': 'is not answered'
                                };
                                const operatorStr = operatorMap[rule.operator] || rule.operator;
                                return `IF "${stripHtml(rowLabel)}" ${operatorStr} "${scalePoint.text}" -> ${formatDestination(rule.skipTo)}`;
                            }
                        }
                        return `IF "${stripHtml(rowLabel)}" -> ${formatDestination(rule.skipTo)}`;
                    }).filter(Boolean).join('; ');
                }
            }
        }

        // Format branching logic
        let branchingLogicStr = '';
        const branchingLogic = question.branchingLogic;
        if (branchingLogic) {
            const formatBranchingCondition = (c: any) => {
                const sourceQuestion = allQuestions.find(q => q.qid === c.questionId);
                if (sourceQuestion?.type === 'Choice Grid' && c.gridValue) {
                    const rowLabel = parseChoice(c.value).label;
                    const col = sourceQuestion.scalePoints?.find(sp => sp.id === c.gridValue);
                    const colText = col ? col.text : '...';
                    return `${c.questionId} "${rowLabel}" ${c.operator} "${colText}"`;
                }
                return `${c.questionId} ${c.operator} "${c.value}"`;
            };

            const branches = branchingLogic.branches.filter(b => b.thenSkipToIsConfirmed);
            const parts = [];
            if (branches.length > 0) {
                branches.forEach(branch => {
                    const conditionsStr = branch.conditions.filter(c => c.isConfirmed).map(formatBranchingCondition).join(` ${branch.operator} `);
                    parts.push(`IF ${conditionsStr} THEN -> ${formatDestination(branch.thenSkipTo)}`);
                });
            }
            if (branchingLogic.otherwiseIsConfirmed) {
                parts.push(`OTHERWISE -> ${formatDestination(branchingLogic.otherwiseSkipTo)}`);
            }
            branchingLogicStr = parts.join('; ');
        }

        return [
            escapeCsvField(block.bid),
            escapeCsvField(block.title),
            escapeCsvField(question.qid),
            escapeCsvField(stripHtml(question.text)),
            escapeCsvField(question.type),
            escapeCsvField(choices),
            escapeCsvField(scalePoints),
            escapeCsvField(question.forceResponse ? 'Yes' : 'No'),
            escapeCsvField(displayLogicStr),
            escapeCsvField(skipLogicStr),
            escapeCsvField(branchingLogicStr),
        ].join(',');
    });

    return [header.join(','), ...dataRows].join('\n');
};
