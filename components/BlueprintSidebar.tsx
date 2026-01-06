import React, { useState, memo } from 'react';
import { PanelLeftIcon, ArrowUpIcon } from './icons';
import { Button } from './Button';
import { PrintSidebar } from './PrintSidebar';
import { PrintDisplayOptions } from './PrintDisplayOptions';
import { Survey, Block, Question } from '../types';

interface BlueprintSidebarProps {
    onClose: () => void;
    survey: Survey;
    selectedBlock: Block | null;
    selectedQuestion: Question | null;
    onSelectBlock: (block: Block) => void;
    onSelectQuestion: (question: Question | null) => void;
    hoveredQuestionId?: string | null;
    onQuestionHover?: (id: string | null) => void;
    printDisplayOptions: Set<string>;
    onTogglePrintOption: (option: string) => void;
}

const BlueprintSidebar: React.FC<BlueprintSidebarProps> = memo(({
    onClose,
    survey,
    selectedBlock,
    selectedQuestion,
    onSelectBlock,
    onSelectQuestion,
    hoveredQuestionId,
    onQuestionHover,
    printDisplayOptions,
    onTogglePrintOption
}) => {
    const [activeTab, setActiveTab] = useState('Survey outline');

    return (
        <div
            className="w-80 bg-surface-container border-r border-outline flex flex-col flex-shrink-0 font-sans h-full"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 border-b border-outline">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-on-surface" style={{ fontFamily: "'Outfit', sans-serif" }}>Blueprint</h2>
                    <Button variant="tertiary" iconOnly onClick={onClose} aria-label="Collapse blueprint panel">
                        <PanelLeftIcon className="text-xl" />
                    </Button>
                </div>
            </div>
            <div className="px-4 border-b border-outline">
                <nav className="-mb-px flex space-x-6">
                    {['Survey outline', 'Display options'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`h-[40px] flex items-center px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-on-surface-variant hover:text-primary'
                                }`}
                            style={{ fontFamily: "'Open Sans', sans-serif" }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {activeTab === 'Survey outline' && (
                    <PrintSidebar
                        survey={survey}
                        selectedBlock={selectedBlock}
                        selectedQuestion={selectedQuestion}
                        onSelectBlock={onSelectBlock}
                        onSelectQuestion={onSelectQuestion}
                        hoveredQuestionId={hoveredQuestionId}
                        onQuestionHover={onQuestionHover}
                    />
                )}
                {activeTab === 'Display options' && (
                    <div className="p-4">
                        <PrintDisplayOptions
                            options={printDisplayOptions}
                            onToggle={onTogglePrintOption}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

export default BlueprintSidebar;
