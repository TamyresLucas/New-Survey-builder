import React from 'react';
import type { Question, RandomizationMethod } from '../../types';
import { ChevronDownIcon } from '../icons';
import { Toggle } from '../Toggle';

export const RandomizeChoicesEditor: React.FC<{
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}> = ({ question, onUpdate }) => {
  const answerBehavior = question.answerBehavior || {};
  const isRandomized = answerBehavior.randomizeChoices || false;

  const handleToggle = (checked: boolean) => {
    onUpdate({
      answerBehavior: {
        ...answerBehavior,
        randomizeChoices: checked,
        randomizationMethod: checked ? answerBehavior.randomizationMethod || 'permutation' : undefined
      }
    });
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      answerBehavior: {
        ...answerBehavior,
        randomizationMethod: e.target.value as RandomizationMethod,
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="randomize-choices" className="text-sm font-medium text-on-surface block">
            Randomize choices
          </label>
          <p className="text-xs text-on-surface-variant mt-0.5">Display choices in a random order.</p>
        </div>
        <Toggle
          id="randomize-choices"
          checked={isRandomized}
          onChange={handleToggle}
        />
      </div>
      {isRandomized && (
        <div className="mt-4 pl-4 border-l-2 border-outline-variant">
          <label htmlFor="randomization-method" className="block text-sm font-medium text-on-surface-variant mb-1">
            Randomization Method
          </label>
          <div className="relative">
            <select
              id="randomization-method"
              value={answerBehavior.randomizationMethod || 'permutation'}
              onChange={handleMethodChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md p-2 pr-8 text-sm text-[var(--input-field-input-txt)] font-normal focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
            >
              <option value="permutation">Permutation</option>
              <option value="random_reverse">Random Reverse</option>
              <option value="reverse_order">Reverse Order</option>
              <option value="sort_by_code">Sort by Code</option>
              <option value="sort_by_text">Sort by Text</option>
              <option value="synchronized">Synchronized</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
          </div>
        </div>
      )}
    </div>
  );
};