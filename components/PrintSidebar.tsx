import React, { memo } from 'react';
import { Survey, Block, Question, QuestionType as QTEnum } from '../types';
import { RadioIcon, CheckboxFilledIcon, TextAnswerIcon, ChoiceGridIcon, PageIcon, DescriptionIcon } from './icons';
import { getPagesForBlock } from '../utils/pagination';

interface PrintSidebarProps {
    survey: Survey;
    onSelectBlock: (block: Block) => void;
    onSelectQuestion: (question: Question | null) => void;
    selectedBlock: Block | null;
    selectedQuestion: Question | null;
    hoveredQuestionId?: string | null;
    onQuestionHover?: (id: string | null) => void;
}

const getQuestionIcon = (type: QTEnum) => {
    switch (type) {
        case QTEnum.Radio: return RadioIcon;
        case QTEnum.Checkbox: return CheckboxFilledIcon;
        case QTEnum.TextEntry: return TextAnswerIcon;
        case QTEnum.ChoiceGrid: return ChoiceGridIcon;
        case QTEnum.Description: return DescriptionIcon;
        default: return RadioIcon;
    }
};

const SidebarQuestionItem = memo(({ question, isSelected, isCheckedForPrint, isHovered, onClick, onHover }: { question: Question, isSelected: boolean, isCheckedForPrint: boolean, isHovered: boolean, onClick: () => void, onHover: (id: string | null) => void }) => {
    const Icon = getQuestionIcon(question.type);

    let containerClasses = `flex items-center px-4 py-1.5 gap-2 text-sm transition-all cursor-pointer border-l-4`;
    if (isSelected) {
        containerClasses += ' border-primary bg-primary/10 text-primary font-medium';
    } else if (isHovered) {
        containerClasses += ' border-transparent text-on-surface bg-surface-container-lowest';
    } else {
        containerClasses += ' border-transparent text-on-surface hover:bg-surface-container-lowest';
    }

    return (
        <div
            className={containerClasses}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onMouseEnter={() => onHover(question.id)}
            onMouseLeave={() => onHover(null)}
        >
            <Icon className={`text-lg flex-shrink-0 ${isCheckedForPrint ? 'text-primary' : (isSelected ? 'text-primary' : 'text-on-surface-variant')}`} />
            <span className="truncate">
                {question.type !== QTEnum.PageBreak && question.qid && (
                    <span className="font-bold mr-1">{question.qid}</span>
                )}
                {question.text || (question.type === QTEnum.PageBreak ? 'Page Break' : 'Untitled Question')}
            </span>
        </div>
    );
});

export const PrintSidebar: React.FC<PrintSidebarProps> = ({
    survey,
    selectedBlock,
    selectedQuestion,
    onSelectBlock,
    onSelectQuestion,
    hoveredQuestionId,
    onQuestionHover
}) => {
    // Helper to determine active state
    const isBlockActive = (blockId: string) => selectedBlock?.id === blockId;
    const isPageActive = (blockId: string, pageIndex: number) =>
        selectedBlock?.id === blockId && selectedQuestion === null; // Simplified logic, usually page selection is distinct
    const isQuestionActive = (questionId: string) => selectedQuestion?.id === questionId;

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' }); // 'start' aligns nicely
        }
    };

    let globalPageCount = 0;

    return (
        <div className="w-80 bg-surface-container border-r border-outline flex flex-col flex-shrink-0 h-full">
            <div className="p-4 border-b border-outline">
                <h2 className="text-lg font-medium text-on-surface" style={{ fontFamily: "'Outfit', sans-serif" }}>Survey Outline</h2>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
                {survey.blocks.map(block => {
                    const pages = getPagesForBlock(block);
                    const isBlockSelected = selectedBlock?.id === block.id && !selectedQuestion;
                    const isBlockPrinted = true; // This was previously derived from printSelectedBlocks, now always true

                    return (
                        <div key={block.id} className={`mb-2 transition-opacity duration-200 ${!isBlockPrinted ? 'opacity-50' : ''}`}>
                            {/* Block Header */}
                            <div
                                className={`px-4 py-2 flex items-center justify-between cursor-pointer ${isBlockSelected ? 'bg-surface-container-highest text-primary' : 'hover:bg-surface-container-lowest text-on-surface'}`}
                                onClick={() => scrollTo(`print-block-${block.id}`)}
                            >
                                <div className="flex items-center overflow-hidden">
                                    <span className={`font-bold mr-2 text-xs px-1.5 py-0.5 rounded border ${isBlockPrinted ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-highest text-on-surface-variant border-outline/50'}`}>{block.bid}</span>
                                    <span className="truncate text-sm font-bold">{block.title}</span>
                                </div>
                            </div>

                            {/* Nested Pages */}
                            <div className="ml-4 border-l border-outline/30 my-1">
                                {pages.map((questions, pageIndex) => {
                                    globalPageCount++;
                                    return (
                                        <div key={pageIndex} className="mb-2">
                                            {/* Page Header */}
                                            <div
                                                className="px-4 py-1 flex items-center gap-2 text-xs font-bold text-on-surface-variant cursor-pointer hover:text-primary transition-colors uppercase tracking-wider mt-2 mb-1 opacity-70 hover:opacity-100"
                                                onClick={() => scrollTo(`print-block-${block.id}-page-${pageIndex}`)}
                                            >
                                                <PageIcon className="text-sm" />
                                                <span>Page {globalPageCount}</span>
                                            </div>

                                            {/* Questions on Page */}
                                            <div className="ml-2 border-l border-outline/30">
                                                {questions.map(question => (
                                                    <SidebarQuestionItem
                                                        key={question.id}
                                                        question={question}
                                                        isSelected={selectedQuestion?.id === question.id}
                                                        isCheckedForPrint={true}
                                                        isHovered={hoveredQuestionId === question.id}
                                                        onClick={() => scrollTo(`print-question-${question.id}`)}
                                                        onHover={(id) => onQuestionHover?.(id)}
                                                    />
                                                ))}
                                                {questions.length === 0 && (
                                                    <div className="px-4 py-1 text-xs text-on-surface-variant italic">Empty Page</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
