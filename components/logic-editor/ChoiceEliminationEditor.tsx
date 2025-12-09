import React, { useMemo } from 'react';
import type { Question } from '../../types';
import { PlusIcon, ChevronDownIcon } from '../icons';
import { truncate } from '../../utils';

export const ChoiceEliminationEditor: React.FC<{
  question: Question;
  previousQuestions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
  onAddLogic: () => void;
}> = ({ question, previousQuestions, onUpdate, onAddLogic }) => {
  const choiceEliminationLogic = question.choiceEliminationLogic;

  const handleEnable = () => {
    onUpdate({ choiceEliminationLogic: { sourceQuestionId: '' } });
    onAddLogic();
  };

  const handleRemove = () => {
    onUpdate({ choiceEliminationLogic: undefined });
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ choiceEliminationLogic: { sourceQuestionId: e.target.value } });
  };

  const compatibleSourceQuestions = useMemo(() =>
    previousQuestions.filter(q =>
      q.choices && q.choices.length > 0 &&
      (q.type === 'Radio Button' || q.type === 'Checkbox' || q.type === 'Drop-Down List')
    ),
    [previousQuestions]);

  if (!choiceEliminationLogic) {
    return (
      <div>
        <h3 className="text-sm font-medium text-on-surface mb-1">Carry Forward Choices</h3>
        <p className="text-xs text-on-surface-variant mb-3">Only show choices that were NOT selected in a previous question.</p>
        <button onClick={handleEnable} className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary hover:text-on-primary rounded-md px-3 py-1.5 transition-colors">
          <PlusIcon className="text-base" />
          Add carry forward rule
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-medium text-on-surface">Carry Forward Choices</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Only show choices that were NOT selected in a previous question.</p>
        </div>
        <button onClick={handleRemove} className="text-sm font-semibold text-error hover:underline px-2 py-1 rounded-md hover:bg-error-container/50">
          Remove
        </button>
      </div>

      <div className="relative">
        <label htmlFor="carry-forward-source" className="block text-sm font-medium text-on-surface-variant mb-1">
          Source Question
        </label>
        <div className="relative">
          <select
            id="carry-forward-source"
            value={choiceEliminationLogic.sourceQuestionId}
            onChange={handleSourceChange}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md p-2 pr-8 text-sm text-[var(--input-field-input-txt)] font-normal focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
          >
            <option value="">Select a source question...</option>
            {compatibleSourceQuestions.map(q => (
              <option key={q.id} value={q.qid}>{q.qid}: {truncate(q.text, 50)}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
        </div>
      </div>
    </div>
  );
};
