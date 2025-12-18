import React from 'react';
import { Toggle } from '../../Toggle';
import type { Question } from '../../../types';

export const ForceResponseSection: React.FC<{
  question: Question;
  handleUpdate: (updates: Partial<Question>) => void;
}> = ({ question, handleUpdate }) => {
  const isForced = question.forceResponse || false;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="force-response" className="text-sm font-medium text-on-surface block">
            Force response
          </label>
          <p className="text-xs text-on-surface-variant mt-0.5">Require respondent to answer this question.</p>
        </div>
        <Toggle
          id="force-response"
          checked={isForced}
          onChange={(checked) => handleUpdate({ forceResponse: checked })}
        />
      </div>
    </div>
  );
};
