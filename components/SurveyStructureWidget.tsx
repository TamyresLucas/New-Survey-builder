import React, { memo, useMemo, useState } from 'react';
import type { Survey } from '../types';
import { QuestionIcon, PageIcon, ClockSolidIcon, ChevronDownIcon } from './icons';
import { QuestionType as QTEnum } from '../types';
import { calculateQuestionPoints, analyzeSurveyPaths } from '../utils';

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
  onBackToTop: () => void;
  onToggleCollapseAll: () => void;
  allBlocksCollapsed: boolean;
  onPagingModeChange: (mode: Survey['pagingMode']) => void;
}

const SurveyStructureWidget: React.FC<SurveyStructureWidgetProps> = memo(({ survey, onBackToTop, onToggleCollapseAll, allBlocksCollapsed, onPagingModeChange }) => {
  
  const [selectedPathId, setSelectedPathId] = useState<string>('all-paths');
  const paths = useMemo(() => analyzeSurveyPaths(survey), [survey]);
  const pathOptions = useMemo(() => [
      { id: 'all-paths', name: 'All Paths' },
      ...paths,
  ], [paths]);

  const { totalQuestions, requiredQuestions, totalPages, completionTimeString } = useMemo(() => {
    // A specific path is selected from the dropdown
    if (selectedPathId !== 'all-paths') {
      const selectedPath = paths.find(p => p.id === selectedPathId);
      if (selectedPath) {
        return {
          totalQuestions: selectedPath.questionCount,
          requiredQuestions: selectedPath.questionCount, // Approximation: We don't have per-path 'forceResponse' data
          totalPages: String(selectedPath.pageCount),
          completionTimeString: selectedPath.completionTimeString,
        };
      }
    }

    // "All Paths" is selected (default case)
    const allQuestionsList = survey.blocks.flatMap(block => block.questions);
    const countableQuestions = allQuestionsList.filter(q => q.type !== QTEnum.Description && q.type !== QTEnum.PageBreak);
    const totalQuestionsValue = countableQuestions.length;
    const requiredQuestionsValue = countableQuestions.filter(q => q.forceResponse).length;

    // If there's only one or zero paths, display single, more accurate values
    if (paths.length <= 1) {
        const totalPoints = allQuestionsList.reduce((sum, question) => sum + calculateQuestionPoints(question), 0);
        const estimatedTimeInMinutes = Math.round(totalPoints / 8);
        const timeString = estimatedTimeInMinutes < 1 ? (totalQuestionsValue > 0 ? "<1 min" : "0 min") : `${estimatedTimeInMinutes} min`;
        
        let pages;
        if (survey.pagingMode === 'one-per-page') {
            pages = countableQuestions.length;
        } else {
            pages = (survey.blocks.length > 0 ? 1 : 0) + allQuestionsList.filter(q => q.type === QTEnum.PageBreak).length;
        }

        return {
            totalQuestions: totalQuestionsValue,
            requiredQuestions: requiredQuestionsValue,
            totalPages: String(pages),
            completionTimeString: timeString,
        };
    }
    
    // If there are multiple paths, calculate and display ranges for metrics
    const questionCounts = paths.map(p => p.questionCount);
    const minQs = Math.min(...questionCounts);
    const maxQs = Math.max(...questionCounts);

    const completionTimes = paths.map(p => parseFloat(p.completionTimeString.replace('<', '')) || 0);
    const minTime = Math.min(...completionTimes);
    const maxTime = Math.max(...completionTimes);
    
    const pageCounts = paths.map(p => p.pageCount);
    const minPages = Math.min(...pageCounts);
    const maxPages = Math.max(...pageCounts);

    return {
        totalQuestions: minQs === maxQs ? String(maxQs) : `${minQs}-${maxQs}`,
        requiredQuestions: 'N/A', // Cannot be determined accurately for multiple paths
        totalPages: minPages === maxPages ? String(maxPages) : `${minPages}-${maxPages}`,
        completionTimeString: minTime === maxTime ? `${maxTime} min` : `${minTime}-${maxTime} min`,
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
                className="w-full bg-surface border border-outline rounded-md py-2 px-3 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary appearance-none"
            >
                <option value="one-per-page">One Question per Page</option>
                <option value="multi-per-page">Multi-Question per Page</option>
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-on-surface-variant pointer-events-none" />
        </div>

        <div className="relative">
            <select
                id="path-selector"
                aria-label="Survey Path"
                value={selectedPathId}
                onChange={e => setSelectedPathId(e.target.value)}
                className="w-full bg-surface border border-outline rounded-md py-2 px-3 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary appearance-none"
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