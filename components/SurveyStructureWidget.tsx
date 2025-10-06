import React, { memo, useMemo } from 'react';
import type { Survey, Question } from '../types';
import { QuestionIcon, BlockIcon, ClockSolidIcon } from './icons';
import { QuestionType } from '../types';

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
}

// Helper function to calculate points based on question type
const calculateQuestionPoints = (question: Question): number => {
    switch (question.type) {
        // Simple single-choice questions: 1 point
        case QuestionType.Radio:
        case QuestionType.DropDownList:
        case QuestionType.NetPromoterNPS:
        case QuestionType.StarRating:
            return 1;

        // Multiple-choice questions: 0.5 points per choice
        case QuestionType.Checkbox:
        case QuestionType.ImageSelector:
            return (question.choices?.length || 0) * 0.5;

        // Grid questions: 1 point per row (approximating with choices)
        case QuestionType.ChoiceGrid:
        case QuestionType.HybridGrid:
        case QuestionType.ImageChoiceGrid:
            return question.choices?.length || 1;

        // Open-ended/text questions: 3 points
        case QuestionType.TextEntry:
        case QuestionType.EmailAddressAnswer:
        case QuestionType.NumericAnswer:
        case QuestionType.Signature:
            return 3;
        
        // Complex questions: 4 points
        case QuestionType.CardSort:
        case QuestionType.DragAndDropRanking:
        case QuestionType.TextHighlighter:
            return 4;
        
        // Non-interactive or simple info: 0 points
        case QuestionType.Description:
        case QuestionType.PageBreak:
            return 0;

        // Default for other types: 1 point as a baseline
        default:
            return 1;
    }
};

const SurveyStructureWidget: React.FC<SurveyStructureWidgetProps> = memo(({ survey, onBackToTop, onToggleCollapseAll, allBlocksCollapsed }) => {
  const { totalQuestions, requiredQuestions, totalBlocks, completionTimeString } = useMemo(() => {
    const allQuestions = survey.blocks.flatMap(block => block.questions);
  
    // Per user request, filter out non-interactive "questions" like descriptions from counts.
    const countableQuestions = allQuestions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
  
    const totalQuestions = countableQuestions.length;
    const totalBlocks = survey.blocks.length;
    
    // "Required questions" is functionally the same as total questions based on current logic.
    const requiredQuestions = totalQuestions;
    
    // Calculate total points based on the provided logic for all questions, as descriptions already have 0 points.
    const totalPoints = allQuestions.reduce((sum, question) => sum + calculateQuestionPoints(question), 0);
  
    // Convert points to time (8 points per minute)
    const estimatedTimeInMinutes = Math.round(totalPoints / 8);
  
    let completionTimeString: string;
    if (estimatedTimeInMinutes < 1) {
        completionTimeString = requiredQuestions > 0 ? "<1 min" : "0 min";
    } else {
        completionTimeString = `${estimatedTimeInMinutes} min`;
    }

    return { totalQuestions, requiredQuestions, totalBlocks, completionTimeString };
  }, [survey]);

  return (
    <aside className="w-full bg-surface-container border border-outline-variant rounded-lg flex-shrink-0 flex flex-col p-4 gap-4 h-fit">
      <div className="flex flex-row items-center">
          <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="flex-grow text-lg font-medium text-on-surface">
              Survey structure
          </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
            <DataCard icon={QuestionIcon} label="Total questions" value={totalQuestions} />
            <DataCard icon={QuestionIcon} label="Required questions" value={requiredQuestions} />
            <DataCard icon={BlockIcon} label="Blocks" value={totalBlocks} />
            <DataCard icon={ClockSolidIcon} label="Completion time" value={completionTimeString} />
      </div>
      <div className="flex justify-between items-center mt-2">
        <button onClick={onBackToTop} className="text-sm font-medium text-primary hover:underline" style={{ fontFamily: "'Open Sans', sans-serif" }}>Back To Top</button>
        <button onClick={onToggleCollapseAll} className="text-sm font-medium text-primary hover:underline" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {allBlocksCollapsed ? 'Expand All' : 'Collapse All'}
        </button>
      </div>
    </aside>
  );
});

export default SurveyStructureWidget;