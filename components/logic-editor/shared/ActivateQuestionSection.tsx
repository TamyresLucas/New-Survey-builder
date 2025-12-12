import React from 'react';
import { Toggle } from '../../Toggle';
import type { Question } from '../../../types';

export const ActivateQuestionSection: React.FC<{
  question: Question;
  handleUpdate: (updates: Partial<Question>) => void;
}> = ({ question, handleUpdate }) => {
  const isHidden = question.isHidden || false;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="activate-question" className="text-sm font-medium text-on-surface block">
            Activate question
          </label>
          <p className="text-xs text-on-surface-variant mt-0.5">Make this question visible to respondents.</p>
        </div>
        <Toggle
          id="activate-question"
          checked={!isHidden}
          onChange={(checked) => handleUpdate({ isHidden: !checked })}
        />
      </div>
    </div>
  );
};
