import React, { memo, useMemo } from 'react';
import { QuestionEditor } from './QuestionEditor';
import type { Survey, Question, ToolboxItemData, LogicIssue, Block } from '../types';
import { XIcon, ExpandIcon, CollapseIcon } from './icons';
import { QuestionType } from '../types';
import { Button } from './Button';

export const RightSidebar: React.FC<{
    question: Question;
    survey: Survey;
    logicIssues: LogicIssue[];
    focusedLogicSource: string | null;
    onClose: () => void;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
    onAddChoice: (questionId: string) => void;
    onDeleteChoice: (questionId: string, choiceId: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onExpandSidebar: () => void;
    onSelectBlock: (block: Block | null, options?: { tab: string, focusOn: string }) => void;
    toolboxItems: ToolboxItemData[];
    onRequestGeminiHelp: (topic: string) => void;
}> = memo(({
    question,
    survey,
    logicIssues,
    focusedLogicSource,
    onClose,
    activeTab,
    onTabChange,
    onUpdateQuestion,
    onAddChoice,
    onDeleteChoice,
    isExpanded,
    onToggleExpand,
    onExpandSidebar,
    onSelectBlock,
    toolboxItems,
    onRequestGeminiHelp,
}) => {
    const tabs = useMemo(() => {
        const baseTabs = ['Settings', 'Behavior', 'Advanced'];
        if (![QuestionType.PageBreak].includes(question.type)) {
            baseTabs.push('Preview');
        }
        return baseTabs;
    }, [question.type]);

    return (
        <aside className="w-full h-full bg-surface-container border-l border-outline flex flex-col">
            <header className="p-4 border-b border-outline flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-medium text-on-surface" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Edit {question.qid}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="tertiary" iconOnly onClick={onToggleExpand} aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}>
                        {isExpanded ? <CollapseIcon className="text-xl" /> : <ExpandIcon className="text-xl" />}
                    </Button>
                    <Button variant="tertiary" iconOnly onClick={onClose} aria-label="Close panel">
                        <XIcon className="text-xl" />
                    </Button>
                </div>
            </header>

            <div className="border-b border-outline px-4">
                <nav className="-mb-px flex space-x-4">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-on-surface-variant hover:text-primary'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 overflow-y-auto">
                <QuestionEditor
                    question={question}
                    survey={survey}
                    logicIssues={logicIssues} // Passed here
                    focusedLogicSource={focusedLogicSource}
                    activeTab={activeTab}
                    onUpdateQuestion={onUpdateQuestion}
                    onAddChoice={onAddChoice}
                    onDeleteChoice={onDeleteChoice}
                    isExpanded={isExpanded}
                    onExpandSidebar={onExpandSidebar}
                    onSelectBlock={onSelectBlock}
                    toolboxItems={toolboxItems}
                    onRequestGeminiHelp={onRequestGeminiHelp}
                />
            </div>
        </aside>
    );
});