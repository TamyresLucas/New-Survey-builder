import React, { memo, useMemo } from 'react';
import type { Survey, PathAnalysisResult } from '../types';
import { QuestionIcon, PageIcon, ClockSolidIcon, ChevronDownIcon } from './icons';
import { QuestionType as QTEnum } from '../types';
import { calculateQuestionPoints } from '../utils';

interface DataCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
}

const DataCard: React.FC<DataCardProps> = ({ icon: Icon, label, value }) => (
    <div className="box-border flex flex-col justify-center items-start p-2 gap-1 h-[55px] bg-surface-container border border-outline-variant rounded-md">
        <p style={{ fontFamily: "'Open Sans', sans-serif" }} className="w-full text-[11px] leading-[15px] text-on-surface-variant">
            {label}
        </p>
        <div className="flex flex-row items-center gap-2">
            <Icon className="text-base text-on-surface" />
            <span style={{ fontFamily: "'Outfit', sans-serif" }} className="text-base font-medium leading-5 text-on-surface">
                {value}
            </span>
        </div>
    </div>
);


interface SurveyStructureWidgetProps {
    survey: Survey;
    paths: PathAnalysisResult[];
    selectedPathId: string;
    onPathChange: (pathId: string) => void;
    onBackToTop: () => void;
    onToggleCollapseAll: () => void;
    allBlocksCollapsed: boolean;
    onPagingModeChange: (mode: Survey['pagingMode']) => void;
    onGlobalAutoAdvanceChange: (enabled: boolean) => void;
}

const SurveyStructureWidget: React.FC<SurveyStructureWidgetProps> = memo(({ survey, paths, selectedPathId, onPathChange, onBackToTop, onToggleCollapseAll, allBlocksCollapsed, onPagingModeChange, onGlobalAutoAdvanceChange }) => {

    const pathOptions = useMemo(() => [
        { id: 'all-paths', name: 'All Paths' },
        ...paths,
    ], [paths]);

    const { totalQuestions, requiredQuestions, totalPages, completionTimeString } = useMemo(() => {
        // A specific path is selected from the dropdown
        if (selectedPathId !== 'all-paths') {
            const selectedPath = paths.find(p => p.id === selectedPathId);
            if (selectedPath) {
                // Path analysis time is already a string, so we can't easily modify it.
                // We'll just show the pre-calculated time for paths. The global calculation below handles the main case.
                return {
                    totalQuestions: selectedPath.questionCount,
                    requiredQuestions: 'N/A', // Cannot be accurately determined for a specific path
                    totalPages: String(selectedPath.pageCount),
                    completionTimeString: selectedPath.completionTimeString,
                };
            }
        }

        // "All Paths" is selected: show totals for the entire survey.
        const allQuestionsList = survey.blocks.flatMap(block => block.questions);
        const countableQuestions = allQuestionsList.filter(q => q.type !== QTEnum.Description && q.type !== QTEnum.PageBreak);
        const totalQuestionsValue = countableQuestions.length;

        const requiredQuestionsList = countableQuestions.filter(q => q.forceResponse);
        const requiredQuestionsValue = requiredQuestionsList.length;

        let timeString: string;

        const calculateAndFormatTimeValue = (points: number, questionCount: number): string => {
            if (questionCount === 0) return "0";
            let minutes = Math.round(points / 8);
            if (survey.globalAutoAdvance) {
                minutes = Math.round(minutes * 0.62); // 38% reduction
            }
            return minutes < 1 ? "<1" : `${minutes}`;
        };

        if (requiredQuestionsValue > 0) {
            const minPoints = requiredQuestionsList.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);
            const maxPoints = countableQuestions.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);

            const minTimeStr = calculateAndFormatTimeValue(minPoints, requiredQuestionsValue);
            const maxTimeStr = calculateAndFormatTimeValue(maxPoints, totalQuestionsValue);

            if (minTimeStr === maxTimeStr) {
                timeString = `${maxTimeStr} min`;
            } else {
                timeString = `${minTimeStr} - ${maxTimeStr} min`;
            }
        } else {
            // No required questions, just calculate max time
            const maxPoints = countableQuestions.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);
            const maxTimeStr = calculateAndFormatTimeValue(maxPoints, totalQuestionsValue);

            if (maxTimeStr === "<1") {
                timeString = totalQuestionsValue > 0 ? "<1 min" : "0 min";
            } else {
                timeString = `${maxTimeStr} min`;
            }
        }

        let pages;
        if (survey.pagingMode === 'one-per-page') {
            pages = countableQuestions.length;
        } else {
            let pageCount = 0;
            survey.blocks.forEach(block => {
                if (block.automaticPageBreaks) {
                    pageCount += block.questions.filter(q => q.type !== QTEnum.Description && q.type !== QTEnum.PageBreak).length;
                } else {
                    pageCount += (block.questions.length > 0 ? 1 : 0) + block.questions.filter(q => q.type === QTEnum.PageBreak && !q.isAutomatic).length;
                }
            });
            pages = pageCount || (survey.blocks.length > 0 ? 1 : 0);
        }

        return {
            totalQuestions: totalQuestionsValue,
            requiredQuestions: requiredQuestionsValue,
            totalPages: String(pages),
            completionTimeString: timeString,
        };
    }, [survey, selectedPathId, paths]);

    return (
        <aside className="w-full bg-surface-container border border-outline-variant rounded-lg flex-shrink-0 flex flex-col p-4 gap-4 h-fit">
            <div className="flex flex-row items-center">
                <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="flex-grow text-lg font-medium text-on-surface">
                    Survey structure
                </h2>
            </div>

            <div className="relative">
                <select
                    id="paging-mode"
                    aria-label="Paging mode"
                    value={survey.pagingMode}
                    onChange={e => onPagingModeChange(e.target.value as Survey['pagingMode'])}
                    className="w-full bg-transparent border border-input-border rounded-md py-2 px-3 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary appearance-none"
                >
                    <option value="one-per-page">One Question per Page</option>
                    <option value="multi-per-page">Multi-Question per Page</option>
                </select>
                <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-on-surface-variant pointer-events-none" />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <label htmlFor="global-autoadvance" className="text-sm font-medium text-on-surface block">
                        Autoadvance
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Globally enable autoadvance for all compatible items.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="global-autoadvance"
                        checked={survey.globalAutoAdvance || false}
                        onChange={(e) => onGlobalAutoAdvanceChange(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high border border-outline-variant peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            <div className="relative">
                <select
                    id="path-selector"
                    aria-label="Survey Path"
                    value={selectedPathId}
                    onChange={e => onPathChange(e.target.value)}
                    className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none disabled:bg-surface-container-high disabled:cursor-not-allowed disabled:text-on-surface-variant/70"
                    disabled={paths.length === 0}
                >
                    {pathOptions.map(path => (
                        <option key={path.id} value={path.id}>{path.name}</option>
                    ))}
                </select>
                <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-on-surface-variant pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <DataCard icon={QuestionIcon} label="Total questions" value={totalQuestions} />
                <DataCard icon={QuestionIcon} label="Required questions" value={requiredQuestions} />
                <DataCard icon={PageIcon} label="Pages" value={totalPages} />
                <DataCard icon={ClockSolidIcon} label="Completion time" value={completionTimeString} />
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-outline-variant pt-4">
                <button onClick={onBackToTop} className="text-sm font-medium text-primary hover:underline" style={{ fontFamily: "'Open Sans', sans-serif" }}>Back To Top</button>
                <button onClick={onToggleCollapseAll} className="text-sm font-medium text-primary hover:underline" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    {allBlocksCollapsed ? 'Expand All' : 'Collapse All'}
                </button>
            </div>
        </aside>
    );
});

export default SurveyStructureWidget;
