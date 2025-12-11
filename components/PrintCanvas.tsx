import React from 'react';
import { Survey } from '../types';
import { getPagesForBlock } from '../utils/pagination';
import QuestionCard from './QuestionCard';
import { CheckboxFilledIcon, CheckboxOutlineIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { PrintQuestionCard } from './PrintQuestionCard';
import { Block, Question } from '../types'; // Added for Block and Question types

interface PrintCanvasProps {
    survey: Survey;
    selectedBlock: Block | null;
    selectedQuestion: Question | null;
    onSelectBlock: (block: Block) => void;
    onSelectQuestion: (question: Question | null) => void;
    printSelectedQuestions: Set<string>;
    printSelectedBlocks: Set<string>;
    onToggleCheck?: (id: string) => void;
    onToggleBlockCheck?: (blockId: string, questionIds: string[]) => void;
    printDisplayOptions: Set<string>;
    hoveredQuestionId?: string | null;
    onQuestionHover?: (id: string | null) => void;
}

export const PrintCanvas: React.FC<PrintCanvasProps> = ({
    survey,
    selectedBlock,
    selectedQuestion,
    onSelectBlock,
    onSelectQuestion,
    printSelectedQuestions,
    printSelectedBlocks,
    onToggleCheck,
    onToggleBlockCheck,
    printDisplayOptions,
    hoveredQuestionId,
    onQuestionHover
}) => {
    let globalPageCount = 0;
    const [collapsedBlocks, setCollapsedBlocks] = React.useState<Set<string>>(new Set());

    const toggleBlock = (blockId: string) => {
        const next = new Set(collapsedBlocks);
        if (next.has(blockId)) {
            next.delete(blockId);
        } else {
            next.add(blockId);
        }
        setCollapsedBlocks(next);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-surface-container-lowest p-8 relative h-[calc(100vh-64px)] scroll-smooth print:h-auto print:overflow-visible print:p-0 print:bg-white" id="print-canvas-scroll-container">
            {survey.blocks.map((block, index) => {
                const pages = getPagesForBlock(block);
                const isBlockSelected = printSelectedBlocks.has(block.id);
                const isCollapsed = collapsedBlocks.has(block.id);

                return (
                    <React.Fragment key={block.id}>
                        <div
                            id={`print-block-${block.id}`}
                            className={`mb-16 print:mb-0 print:border-none print:p-0 print:break-after-auto print:block transition-opacity duration-200 border border-input-border rounded-lg p-6 bg-surface-container-lowest/50 w-full ${!isBlockSelected ? 'opacity-50 print:hidden' : ''}`}
                        >
                            {/* Block Header - Outside the page, transparent background */}
                            <div className="mb-4 px-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        {/* Block Selection Checkbox */}
                                        <div
                                            className="mr-3 cursor-pointer text-primary print:hidden flex-shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleBlockCheck && onToggleBlockCheck(block.id, block.questions.map(q => q.id));
                                            }}
                                        >
                                            {isBlockSelected ? (
                                                <CheckboxFilledIcon className="text-xl" />
                                            ) : (
                                                <CheckboxOutlineIcon className="text-xl text-on-surface-variant" />
                                            )}
                                        </div>

                                        <h3 className="flex items-center">
                                            <span className="font-bold text-base text-on-surface mr-2">{block.bid}</span>
                                            <span className="font-semibold text-base text-on-surface">{block.title}</span>
                                        </h3>
                                    </div>

                                    {/* Collapse Button - Icon only tertiary */}
                                    <button
                                        onClick={() => toggleBlock(block.id)}
                                        className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-lowest transition-colors print:hidden"
                                    >
                                        {isCollapsed ? <ChevronDownIcon className="text-xl" /> : <ChevronUpIcon className="text-xl" />}
                                    </button>
                                </div>

                                {/* Block Options Summary - Below the header */}
                                {printDisplayOptions.has('Block Settings') && !isCollapsed && (
                                    <div className="mb-8 p-4 border border-outline rounded-lg bg-surface-container text-sm w-full">
                                        <h4 className="text-base font-medium text-on-surface mb-2">Block settings</h4>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                            <div className="grid grid-cols-[180px_1fr]">
                                                <span className="text-sm font-medium text-on-surface tracking-wider pt-0.5">Randomize questions</span>
                                                <span className="text-on-surface">{(block.questionRandomization && block.questionRandomization.length > 0) ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="grid grid-cols-[180px_1fr]">
                                                <span className="text-sm font-medium text-on-surface tracking-wider pt-0.5">Looping enabled</span>
                                                <span className="text-on-surface">{block.loopingEnabled ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="grid grid-cols-[180px_1fr]">
                                                <span className="text-sm font-medium text-on-surface tracking-wider pt-0.5">Auto advance</span>
                                                <span className="text-on-surface">{block.autoAdvance ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="grid grid-cols-[180px_1fr]">
                                                <span className="text-sm font-medium text-on-surface tracking-wider pt-0.5">Hide back button</span>
                                                <span className="text-on-surface">{block.hideBackButton ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="grid grid-cols-[180px_1fr]">
                                                <span className="text-sm font-medium text-on-surface tracking-wider pt-0.5">Automatic page breaks</span>
                                                <span className="text-on-surface">{block.automaticPageBreaks ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isCollapsed && (
                                printDisplayOptions.has('Pagination') ? (
                                    // Paginated layout - render pages with wrappers
                                    pages.map((questions, pageIndex) => {
                                        globalPageCount++;
                                        return (
                                            <div
                                                key={`${block.id}-page-${pageIndex}`}
                                                id={`print-block-${block.id}-page-${pageIndex}`}
                                                className="bg-surface-container dark:bg-surface shadow-md mb-8 p-12 w-full relative print:shadow-none print:m-0 print:w-full print:h-auto print:break-after-page box-border border-outline/20 border lg:border-none"
                                            >
                                                <div className="absolute top-4 left-8 text-on-surface-variant text-xs print:hidden uppercase tracking-wider font-medium opacity-50">
                                                    Page {globalPageCount}
                                                </div>

                                                <div className="space-y-8">
                                                    {questions.map(question => {
                                                        const isChecked = printSelectedQuestions.has(question.id);
                                                        return (
                                                            <div
                                                                key={question.id}
                                                                id={`print-question-${question.id}`}
                                                                className={`transition-opacity duration-200 ${!isChecked ? 'opacity-50 grayscale print:hidden' : ''}`}
                                                            >
                                                                <PrintQuestionCard
                                                                    question={question}
                                                                    isChecked={isChecked}
                                                                    onToggleCheck={() => onToggleCheck && onToggleCheck(question.id)}
                                                                    printDisplayOptions={printDisplayOptions}
                                                                    hoveredQuestionId={hoveredQuestionId}
                                                                    onQuestionHover={onQuestionHover}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                    {questions.length === 0 && (
                                                        <div className="text-center text-on-surface-variant italic py-12">
                                                            Empty Page
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    // Continuous layout - render all questions without page wrappers
                                    <div className="space-y-8 mb-8">
                                        {pages.flat().map(question => {
                                            const isChecked = printSelectedQuestions.has(question.id);
                                            return (
                                                <div
                                                    key={question.id}
                                                    id={`print-question-${question.id}`}
                                                    className={`transition-opacity duration-200 ${!isChecked ? 'opacity-50 grayscale print:hidden' : ''}`}
                                                >
                                                    <PrintQuestionCard
                                                        question={question}
                                                        isChecked={isChecked}
                                                        onToggleCheck={() => onToggleCheck && onToggleCheck(question.id)}
                                                        printDisplayOptions={printDisplayOptions}
                                                        hoveredQuestionId={hoveredQuestionId}
                                                        onQuestionHover={onQuestionHover}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

