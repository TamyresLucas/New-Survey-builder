import React, { useMemo } from 'react';
import type { Survey } from '../../types';
import { analyzeSurveyPaths } from '../../utils';
import { ArrowSplitIcon, QuestionIcon, ClockSolidIcon, PageIcon } from '../icons';

interface PathAnalysisPanelProps {
  survey: Survey;
}

const PathAnalysisPanel: React.FC<PathAnalysisPanelProps> = ({ survey }) => {
  const paths = useMemo(() => analyzeSurveyPaths(survey), [survey]);

  return (
    <div className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <header className="p-4 border-b border-outline-variant flex items-center gap-2">
        <ArrowSplitIcon className="text-xl text-primary" />
        <h2 className="text-lg font-bold text-on-surface">Path Analysis</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {paths.length === 0 && (
          <div className="text-center text-on-surface-variant p-8">
            <p>No paths found in the survey.</p>
          </div>
        )}
        {paths.map(path => (
          <div key={path.id} className="bg-surface border border-outline-variant rounded-lg p-4">
            <h3 className="font-bold text-base text-primary mb-3">{path.name}</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <QuestionIcon className="text-base text-on-surface-variant" />
                    <div className="flex flex-col">
                        <span className="text-xs text-on-surface-variant">Questions</span>
                        <span className="font-semibold text-on-surface">{path.questionCount}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ClockSolidIcon className="text-base text-on-surface-variant" />
                    <div className="flex flex-col">
                        <span className="text-xs text-on-surface-variant">Time</span>
                        <span className="font-semibold text-on-surface">{path.completionTimeString}</span>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <PageIcon className="text-base text-on-surface-variant" />
                    <div className="flex flex-col">
                        <span className="text-xs text-on-surface-variant">Pages</span>
                        <span className="font-semibold text-on-surface">{path.pageCount}</span>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathAnalysisPanel;