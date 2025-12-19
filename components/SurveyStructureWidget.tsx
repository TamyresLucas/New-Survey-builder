import React, { memo, useMemo } from 'react';
import { Toggle } from './Toggle';
import type { Survey, PathAnalysisResult } from '../types';
import { QuestionIcon, AsteriskIcon, PageIcon, ClockSolidIcon, ChevronDownIcon, BlockIcon, WarningIcon, CheckCircleIcon } from './icons';
import { QuestionType as QTEnum } from '../types';
import { calculateQuestionPoints } from '../utils';
import { DropdownField } from './DropdownField';
import { Button } from './Button';

interface DataCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    state?: 'success' | 'warning' | 'error' | 'default';
}

const DataCard: React.FC<DataCardProps> = ({ icon: Icon, label, value, state = 'default' }) => {
    let containerClasses = "bg-surface-container border-outline";
    let labelClasses = "text-on-surface-variant";
    let valueClasses = "text-on-surface";
    let iconClasses = "text-on-surface";
    let DisplayIcon = Icon;

    if (state === 'success') {
        containerClasses = "bg-success-container border-success";
        iconClasses = "text-on-success-container";
        DisplayIcon = CheckCircleIcon;
    } else if (state === 'warning') {
        containerClasses = "bg-warning-container border-warning";
        iconClasses = "text-on-warning-container";
        DisplayIcon = WarningIcon;
    } else if (state === 'error') {
        containerClasses = "bg-error-container border-error";
        iconClasses = "text-on-error-container";
        DisplayIcon = WarningIcon;
    }

    return (
        <div className={`box-border flex flex-col justify-center items-start p-2 gap-1 h-[55px] border rounded-md ${containerClasses}`}>
            <p style={{ fontFamily: "'Open Sans', sans-serif" }} className={`w-full text-[11px] leading-[15px] ${labelClasses}`}>
                {label}
            </p>
            <div className="flex flex-row items-center gap-2">
                <DisplayIcon className={`text-base ${iconClasses}`} />
                <span style={{ fontFamily: "'Outfit', sans-serif" }} className={`text-base font-medium leading-5 ${valueClasses}`}>
                    {value}
                </span>
            </div>
        </div>
    );
};


interface SurveyStructureWidgetProps {
    survey: Survey;
    paths: PathAnalysisResult[];
    selectedPathId: string;
    onPathChange: (pathId: string) => void;

    onPagingModeChange: (mode: Survey['pagingMode']) => void;
    onGlobalAutoAdvanceChange: (enabled: boolean) => void;
    logicIssues: any[];
}

const SurveyStructureWidget: React.FC<SurveyStructureWidgetProps> = memo(({ survey, paths, selectedPathId, onPathChange, onPagingModeChange, onGlobalAutoAdvanceChange, logicIssues }) => {

    const pathOptions = useMemo(() => [
        { id: 'all-paths', name: 'All Paths' },
        ...paths,
    ], [paths]);

    const { totalQuestions, requiredQuestions, totalPages, completionTimeString, maxMinutes } = useMemo(() => {
        // A specific path is selected from the dropdown
        if (selectedPathId !== 'all-paths') {
            const selectedPath = paths.find(p => p.id === selectedPathId);
            if (selectedPath) {
                // Parse max minutes from string for path (approximate)
                // Format is usually "X min" or "X - Y min" or "<1 min"
                let minutes = 0;
                if (selectedPath.completionTimeString.includes('-')) {
                    const parts = selectedPath.completionTimeString.split('-');
                    minutes = parseInt(parts[1].replace('min', '').trim()) || 0;
                } else if (selectedPath.completionTimeString.includes('<1')) {
                    minutes = 0;
                } else {
                    minutes = parseInt(selectedPath.completionTimeString.replace('min', '').trim()) || 0;
                }

                return {
                    totalQuestions: selectedPath.questionCount,
                    requiredQuestions: 'N/A', // Cannot be accurately determined for a specific path
                    totalPages: String(selectedPath.pageCount),
                    completionTimeString: selectedPath.completionTimeString,
                    maxMinutes: minutes
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
        let maxMin = 0;

        const calculateMinutes = (points: number): number => {
            let minutes = Math.round(points / 8);
            if (survey.globalAutoAdvance) {
                minutes = Math.round(minutes * 0.62); // 38% reduction
            }
            return minutes;
        };

        const formatTime = (minutes: number): string => {
            return minutes < 1 ? "<1" : `${minutes}`;
        };

        if (requiredQuestionsValue > 0) {
            const minPoints = requiredQuestionsList.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);
            const maxPoints = countableQuestions.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);

            const minMinutes = calculateMinutes(minPoints);
            const maxMinutesCalc = calculateMinutes(maxPoints);
            maxMin = maxMinutesCalc;

            const minTimeStr = formatTime(minMinutes);
            const maxTimeStr = formatTime(maxMinutesCalc);

            if (minTimeStr === maxTimeStr) {
                timeString = `${maxTimeStr} min`;
            } else {
                timeString = `${minTimeStr} - ${maxTimeStr} min`;
            }
        } else {
            // No required questions, just calculate max time
            const maxPoints = countableQuestions.reduce((sum, q) => sum + calculateQuestionPoints(q), 0);
            const maxMinutesCalc = calculateMinutes(maxPoints);
            maxMin = maxMinutesCalc;

            const maxTimeStr = formatTime(maxMinutesCalc);

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
            maxMinutes: maxMin
        };
    }, [survey, selectedPathId, paths]);

    // Determine states
    const issuesCount = new Set(logicIssues.map(i => i.questionId)).size;
    const issuesState = issuesCount > 0 ? 'error' : 'success';

    let completionTimeState: 'success' | 'warning' | 'error' = 'success';
    if (maxMinutes >= 15) {
        completionTimeState = 'error';
    } else if (maxMinutes > 10) {
        completionTimeState = 'warning';
    } else {
        completionTimeState = 'success';
    }

    return (
        <aside className="w-full bg-surface-container border border-outline rounded-lg flex-shrink-0 flex flex-col p-4 h-fit">
            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center">
                    <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="flex-grow text-lg font-medium text-on-surface">
                        Survey structure
                    </h2>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="global-autoadvance" className="text-sm font-medium text-on-surface block">
                            Autoadvance
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Globally enable autoadvance for all compatible items.</p>
                    </div>
                    <Toggle
                        id="global-autoadvance"
                        checked={survey.globalAutoAdvance || false}
                        onChange={(checked) => onGlobalAutoAdvanceChange(checked)}
                    />
                </div>

                <div className="relative">
                    <DropdownField
                        value={survey.pagingMode}
                        onChange={(value) => onPagingModeChange(value as Survey['pagingMode'])}
                        options={[
                            { value: 'one-per-page', label: 'One Question per Page' },
                            { value: 'multi-per-page', label: 'Multi-Question per Page' }
                        ]}
                    />
                </div>

                <div className="relative">
                    <DropdownField
                        value={selectedPathId}
                        onChange={onPathChange}
                        options={pathOptions.map(p => ({ value: p.id, label: p.name }))}
                        disabled={paths.length === 0}
                    />
                </div>

                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <DataCard icon={QuestionIcon} label="Total questions" value={totalQuestions} />
                        <DataCard icon={AsteriskIcon} label="Required questions" value={requiredQuestions} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <DataCard icon={BlockIcon} label="Blocks" value={survey.blocks.length} />
                        <DataCard icon={WarningIcon} label={issuesCount === 0 ? "No issues" : "Issues"} value={issuesCount} state={issuesState} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <DataCard icon={PageIcon} label="Pages" value={totalPages} />
                        <DataCard icon={ClockSolidIcon} label="Completion time" value={completionTimeString} state={completionTimeState} />
                    </div>
                </div>
            </div>
        </aside>
    );
});

export default SurveyStructureWidget;
