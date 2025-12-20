import React from 'react';
import { Question, QuestionType, Choice } from '../types';
import { CheckboxFilledIcon, CheckboxOutlineIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { EditableText } from './EditableText';
import { Badge } from './Badge';

interface PrintQuestionCardProps {
    question: Question;
    isChecked: boolean;
    onToggleCheck: (id: string) => void;
    printDisplayOptions: Set<string>;
    hoveredQuestionId?: string | null;
    onQuestionHover?: (id: string | null) => void;
}

const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-2 text-left text-sm font-medium text-on-surface tracking-wider border-b border-outline bg-surface-container-low">
        {children}
    </th>
);

const TableCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <td className={`px-4 py-2 text-sm text-on-surface border-b border-outline ${className}`}>
        {children}
    </td>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-base font-medium text-on-surface mb-2 mt-6">{children}</h3>
);

export const PrintQuestionCard: React.FC<PrintQuestionCardProps> = ({ question, isChecked, onToggleCheck, printDisplayOptions, hoveredQuestionId, onQuestionHover }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Helper to determine variable type
    const getVariableType = (q: Question) => {
        switch (q.type) {
            case QuestionType.TextEntry: return 'Text';
            case QuestionType.Radio: return 'Single Choice';
            case QuestionType.Checkbox: return 'Multi-Choice';
            case QuestionType.ChoiceGrid: return 'Grid';
            default: return 'Data';
        }
    };

    const renderChoicesTable = () => {
        if (!printDisplayOptions.has('Choices') || !question.choices || question.choices.length === 0) return null;

        return (
            <div className="mb-6">
                <SectionTitle>Choices</SectionTitle>
                <div className="border border-outline rounded overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>#</TableHeader>
                                <TableHeader>Code</TableHeader>
                                <TableHeader>Text</TableHeader>
                                <TableHeader>Open-end</TableHeader>
                                <TableHeader>Attributes</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {question.choices.map((choice, index) => (
                                <tr key={choice.id} className="bg-surface-container">
                                    <TableCell className="w-12 text-on-surface-variant">{index + 1}</TableCell>
                                    <TableCell className="w-24 font-mono text-xs">{index + 1}</TableCell>
                                    <TableCell>{choice.text}</TableCell>
                                    <TableCell>None</TableCell>
                                    <TableCell>Visible</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderRowsTable = () => {
        if (!printDisplayOptions.has('Columns and Rows') || !question.choices || question.choices.length === 0) return null;
        return (
            <div className="mb-6">
                <SectionTitle>Rows</SectionTitle>
                <div className="border border-outline rounded overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>#</TableHeader>
                                <TableHeader>Variables</TableHeader>
                                <TableHeader>Text</TableHeader>
                                <TableHeader>Open-end</TableHeader>
                                <TableHeader>Answer required</TableHeader>
                                <TableHeader>Hide if</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {question.choices.map((row, index) => (
                                <tr key={row.id} className="bg-surface-container">
                                    <TableCell className="w-12 text-on-surface-variant">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs">{`${question.qid}_${index + 1}`}</TableCell>
                                    <TableCell>{row.text}</TableCell>
                                    <TableCell>None</TableCell>
                                    <TableCell>True</TableCell>
                                    <TableCell className="">{null}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderColumnsTable = () => {
        if (!printDisplayOptions.has('Columns and Rows') || !question.scalePoints || question.scalePoints.length === 0) return null;
        return (
            <div className="mb-6">
                <SectionTitle>Columns</SectionTitle>
                <div className="border border-outline rounded overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>#</TableHeader>
                                <TableHeader>Code</TableHeader>
                                <TableHeader>Text</TableHeader>
                                <TableHeader>Open-end</TableHeader>
                                <TableHeader>Attributes</TableHeader>
                                <TableHeader>Hide if</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {question.scalePoints.map((col, index) => (
                                <tr key={col.id} className="bg-surface-container">
                                    <TableCell className="w-12 text-on-surface-variant">{index + 1}</TableCell>
                                    <TableCell className="w-24 font-mono text-xs">{index + 1}</TableCell>
                                    <TableCell>{col.text}</TableCell>
                                    <TableCell>None</TableCell>
                                    <TableCell>Visible</TableCell>
                                    <TableCell className="">{null}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const renderVariablesTable = () => {
        if (!printDisplayOptions.has('Variables')) return null;
        // Mocking variable data based on question ID
        // For Grid, variables are in Rows table usually, but main variable entry might exist?
        // In screenshot, Grid has 'Variables and References' section but the Table "Variables" lists items.
        // Actually, screenshot 1 (Checkbox) shows Variables table.
        // Screenshot 2 (Grid) shows Variables table below Rows.

        // We will generate one variable entry per question for simplicity, or per row for Grid.

        let variables = [];
        if (question.type === QuestionType.ChoiceGrid && question.choices) {
            variables = question.choices.map((row, i) => ({
                id: row.id,
                name: `${question.qid}_${i + 1}`,
                type: 'Discrete',
                hideIf: 'N/A',
                min: '',
                max: ''
            }));
        } else {
            variables = [{
                id: question.id,
                name: question.qid, // Using QID as variable name
                type: getVariableType(question),
                hideIf: 'N/A',
                min: '',
                max: ''
            }];
        }

        return (
            <div className="mb-6">
                <div className="border-b border-outline pb-2 mb-4 mt-8">
                    <h3 className="text-base font-medium text-on-surface">Variables and References</h3>
                </div>

                <SectionTitle>Variables</SectionTitle>
                <div className="border border-outline rounded overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <TableHeader>#</TableHeader>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Type</TableHeader>
                                <TableHeader>Hide if</TableHeader>
                                <TableHeader>Min. value</TableHeader>
                                <TableHeader>Max. value</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {variables.map((v, index) => (
                                <tr key={v.id} className="bg-surface-container">
                                    <TableCell className="w-12 text-on-surface-variant">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs">{v.name}</TableCell>
                                    <TableCell>{v.type}</TableCell>
                                    <TableCell>{v.hideIf}</TableCell>
                                    <TableCell>{v.min}</TableCell>
                                    <TableCell>{v.max}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const isHovered = hoveredQuestionId === question.id;

    return (
        <div
            className={`p-4 rounded-lg border transition-all bg-surface-container ${isChecked
                ? isHovered
                    ? 'border-primary shadow-md'
                    : 'border-primary'
                : isHovered
                    ? 'border-outline shadow-md'
                    : 'border-outline'
                }`}
            onMouseEnter={() => onQuestionHover?.(question.id)}
            onMouseLeave={() => onQuestionHover?.(null)}
        >
            {/* Header: Checkbox and ID */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="cursor-pointer text-primary print:hidden flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCheck(question.id);
                        }}
                    >
                        {isChecked ? (
                            <CheckboxFilledIcon className="text-xl" />
                        ) : (
                            <CheckboxOutlineIcon className="text-xl text-on-surface-variant" />
                        )}
                    </div>

                    {/* ID / Label Logic matching QuestionCard.tsx */}
                    {question.type === QuestionType.Description ? (
                        <span className="font-semibold text-on-surface-variant">{question.label || 'Description'}</span>
                    ) : (
                        <span className="font-bold text-base text-on-surface">{question.qid}</span>
                    )}
                </div>

                {/* Collapse Button - Icon only tertiary */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-lowest transition-colors print:hidden"
                >
                    {isCollapsed ? <ChevronDownIcon className="text-xl" /> : <ChevronUpIcon className="text-xl" />}
                </button>
            </div>

            <div className="pl-0">
                {/* Question Text */}
                <div className="mb-6">
                    <EditableText
                        html={question.text || "Untitled Question"}
                        onChange={() => { }}
                        className="text-on-surface min-h-[24px]"
                        readOnly={true}
                    />
                </div>

                {/* Question Type Specific Tables - Helper to render content */}
                {!isCollapsed && (
                    <>
                        {/* Question Type Specific Tables */}
                        {question.type === QuestionType.ChoiceGrid ? (
                            <>
                                {renderColumnsTable()}
                                {renderRowsTable()}
                            </>
                        ) : (
                            renderChoicesTable()
                        )}

                        {/* Variables Table */}
                        {renderVariablesTable()}

                        {/* Options */}
                        {printDisplayOptions.has('Options') && (
                            <div className="mb-6">
                                <SectionTitle>Options</SectionTitle>
                                <div className="text-sm border border-outline rounded p-4 bg-surface-container-low grid grid-cols-2 gap-4">
                                    <div className="grid grid-cols-[140px_1fr]">
                                        <span className="font-medium text-on-surface">Active</span>
                                        <span className="text-on-surface">{question.isHidden ? 'No' : 'Yes'}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr]">
                                        <span className="font-medium text-on-surface">Answer required</span>
                                        <span className="text-on-surface">{question.forceResponse ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr]">
                                        <span className="font-medium text-on-surface">Hide back button</span>
                                        <span className="text-on-surface">{question.hideBackButton ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr]">
                                        <span className="font-medium text-on-surface">Auto advance</span>
                                        <span className="text-on-surface">{question.autoAdvance ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr]">
                                        <span className="font-medium text-on-surface">Randomize</span>
                                        {/* Simplified access since nested props might be complex/missing in Types check */}
                                        <span className="text-on-surface">No</span>
                                    </div>
                                    {question.type === QuestionType.TextEntry && (
                                        <div className="grid grid-cols-[140px_1fr]">
                                            <span className="font-medium text-on-surface">Soft prompt</span>
                                            <span className="text-on-surface">{question.softPrompt ? 'Yes' : 'No'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
