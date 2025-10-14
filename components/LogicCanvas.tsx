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
      <div className="flex items-start gap-6 pb-4 -m-2 p-2">
        {allQuestions.map((question, index, arr) => (
          <React.Fragment key={question.id}>
            <LogicQuestionCard question={question} toolboxItems={toolboxItems} />
            {index < arr.length - 1 && (
              <div className="self-center h-px w-12 bg-outline-variant flex-shrink-0"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

export default LogicCanvas;