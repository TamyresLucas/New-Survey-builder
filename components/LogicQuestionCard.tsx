import React, { memo } from 'react';
import type { Question, ToolboxItemData } from '../types';
import { truncate } from '../utils';
import { RadioIcon } from './icons'; // Default icon

interface LogicQuestionCardProps {
  question: Question;
  toolboxItems: ToolboxItemData[];
}

const LogicQuestionCard: React.FC<LogicQuestionCardProps> = memo(({ question, toolboxItems }) => {
  const questionTypeInfo = toolboxItems.find(item => item.name === question.type);
  const Icon = questionTypeInfo?.icon || RadioIcon;

  return (
    <div className="bg-surface-container rounded-xl shadow-lg p-4 w-60 flex-shrink-0 border border-outline-variant/50">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center mr-3 flex-shrink-0">
          <Icon className="text-primary text-lg" />
        </div>
        <h3 className="font-bold text-on-surface text-xl truncate">{question.qid}</h3>
      </div>
      <p className="text-on-surface-variant text-sm mb-4 h-10">{truncate(question.text, 45)}</p>
      {question.choices && question.choices.length > 0 && (
        <ul className="space-y-1.5">
          {question.choices.slice(0, 3).map(choice => (
            <li key={choice.id} className="text-sm text-on-surface truncate">
              {choice.text}
            </li>
          ))}
          {question.choices.length > 3 && (
             <li className="text-xs text-on-surface-variant mt-2">...and {question.choices.length - 3} more</li>
          )}
        </ul>
      )}
    </div>
  );
});

export default LogicQuestionCard;
