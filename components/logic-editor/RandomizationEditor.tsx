import React from 'react';
import type { Question, RandomizationMethod } from '../../types';
import { ChevronDownIcon } from '../icons';

export const RandomizeChoicesEditor: React.FC<{
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}> = ({ question, onUpdate }) => {
  const answerBehavior = question.answerBehavior || {};
  const isRandomized = answerBehavior.randomizeChoices || false;

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      answerBehavior: {
        ...answerBehavior,
        randomizeChoices: e.target.checked,
        randomizationMethod: e.target.checked ? answerBehavior.randomizationMethod || 'permutation' : undefined
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
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="randomize-choices" checked={isRandomized} onChange={handleToggle} className="sr-only peer" />
          <div className="w-11 h-6 bg-outline peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
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
              className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
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