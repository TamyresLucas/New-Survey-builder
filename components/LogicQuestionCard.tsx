import React, { memo } from 'react';
import type { Question, ToolboxItemData } from '../types';
import { truncate, parseChoice } from '../utils';
import { RadioIcon } from './icons'; // Default icon

interface LogicQuestionCardProps {
  question: Question;
  toolboxItems: ToolboxItemData[];
  isFirst?: boolean;
  isLast?: boolean;
}

const LogicQuestionCard: React.FC<LogicQuestionCardProps> = memo(({ question, toolboxItems, isFirst = false, isLast = false }) => {
  const questionTypeInfo = toolboxItems.find(item => item.name === question.type);
  const Icon = questionTypeInfo?.icon || RadioIcon;

  const unconnectedCircleClasses = "bg-surface-container-high border-2 border-outline-variant";
  const connectedCircleClasses = "bg-primary border-2 border-primary";

  return (
    <div className="relative bg-surface-container rounded-xl shadow-lg p-4 w-64 flex-shrink-0 border border-outline-variant/50">
      {/* Connection points */}
      {!isFirst && (
        <div className={`absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 rounded-full ${connectedCircleClasses}`} aria-hidden="true" />
      )}
      <div className={`absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 rounded-full ${isLast ? unconnectedCircleClasses : connectedCircleClasses}`} aria-hidden="true" />

      {/* Card Header */}
      <div className="flex items-center mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary-container text-on-primary-container text-sm font-semibold">
          <Icon className="text-base" />
          <span>{question.qid}</span>
        </div>
      </div>

      {/* Card Body */}
      <p className="text-on-surface text-base mb-4 h-12 leading-tight">{truncate(question.text, 55)}</p>
      
      {question.choices && question.choices.length > 0 && (
        <ul className="space-y-1.5">
          {question.choices.slice(0, 3).map(choice => {
            const { variable, label } = parseChoice(choice.text);
            return (
              <li key={choice.id} className="text-sm text-on-surface-variant flex items-baseline">
                <span className="font-semibold text-on-surface mr-2">{variable}</span>
                <span className="truncate">{label}</span>
              </li>
            );
          })}
          {question.choices.length > 3 && (
             <li className="text-xs text-on-surface-variant mt-2">...and {question.choices.length - 3} more</li>
          )}
        </ul>
      )}
    </div>
  );
});

export default LogicQuestionCard;