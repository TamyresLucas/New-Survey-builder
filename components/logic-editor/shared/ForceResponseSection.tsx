import React from 'react';
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
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="force-response"
            checked={isForced}
            onChange={(e) => handleUpdate({ forceResponse: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );
};
