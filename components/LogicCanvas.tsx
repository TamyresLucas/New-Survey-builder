import React, { memo } from 'react';
import type { Survey, ToolboxItemData } from '../types';
import LogicQuestionCard from './LogicQuestionCard';
import { QuestionType } from '../types';

interface LogicCanvasProps {
  survey: Survey;
  toolboxItems: ToolboxItemData[];
}

const LogicCanvas: React.FC<LogicCanvasProps> = memo(({ survey, toolboxItems }) => {
  // Flatten all questions into a single array, filtering out non-interactive types.
  const allQuestions = survey.blocks
    .flatMap(block => block.questions)
    .filter(q => q.type !== QuestionType.PageBreak && q.type !== QuestionType.Description);

  return (
    <div className="flex-1 overflow-auto bg-surface p-8">
      <div className="flex items-center h-full">
        {allQuestions.map((question, index, arr) => (
          <React.Fragment key={question.id}>
            <LogicQuestionCard
              question={question}
              toolboxItems={toolboxItems}
              isFirst={index === 0}
              isLast={index === arr.length - 1}
            />
            {index < arr.length - 1 && (
              <div className="relative w-12 flex-shrink-0 flex items-center" aria-hidden="true">
                {/* Line */}
                <div className="w-full h-0.5 bg-primary" />
                {/* Arrowhead - moved right-2 to not overlap with the circle */}
                <div className="absolute right-2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-primary" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

export default LogicCanvas;