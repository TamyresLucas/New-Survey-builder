import React, { memo, useState, useEffect } from 'react';
import type { Question } from '../types';
import { XIcon, PlusIcon } from './icons';
import { CHOICE_BASED_QUESTION_TYPES } from '../utils';

interface RightSidebarProps {
  question: Question;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onAddChoice: (questionId: string) => void;
  onDeleteChoice: (questionId: string, choiceId: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = memo(({
  question,
  onClose,
  activeTab,
  onTabChange,
  onUpdateQuestion,
  onAddChoice,
  onDeleteChoice,
}) => {
  const [questionText, setQuestionText] = useState(question.text);

  useEffect(() => {
    setQuestionText(question.text);
  }, [question.text, question.id]);

  const handleTextBlur = () => {
    if (questionText.trim() !== question.text) {
      onUpdateQuestion(question.id, { text: questionText.trim() });
    }
  };
  
  const handleChoiceTextChange = (choiceId: string, newText: string) => {
    const newChoices = question.choices?.map(c => c.id === choiceId ? { ...c, text: newText } : c);
    onUpdateQuestion(question.id, { choices: newChoices });
  };

  const renderSettingsTab = () => {
    const isChoiceBased = question.type && CHOICE_BASED_QUESTION_TYPES.has(question.type);

    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">
            Question Text
          </label>
          <textarea
            id="question-text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onBlur={handleTextBlur}
            rows={4}
            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
          />
        </div>

        {isChoiceBased && question.choices && (
          <div>
            <h3 className="text-sm font-medium text-on-surface-variant mb-2">Choices</h3>
            <div className="space-y-2">
              {question.choices.map((choice) => (
                <div key={choice.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                    className="flex-grow bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    aria-label={`Edit choice ${choice.id}`}
                  />
                  <button
                    onClick={() => onDeleteChoice(question.id, choice.id)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full"
                    aria-label={`Delete choice ${choice.id}`}
                  >
                    <XIcon className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => onAddChoice(question.id)}
              className="mt-3 flex items-center text-sm font-medium text-primary hover:underline"
            >
              <PlusIcon className="text-base mr-1" />
              Add Choice
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex-shrink-0 flex flex-col">
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          Edit question
        </h2>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
          <XIcon className="text-2xl" />
        </button>
      </div>
      <div className="border-b border-outline-variant">
        <nav className="-mb-px flex space-x-2 px-4">
          {['Settings', 'Behavior', 'Variables', 'Preview'].map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-3 px-3 border-b-2 font-medium text-sm transition-colors rounded-t-lg ${
                activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
              }`}
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6 overflow-y-auto" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        {activeTab === 'Settings' ? renderSettingsTab() : (
          <>
            <p className="text-on-surface-variant">
              Editing settings for question <span className="font-bold text-on-surface">{question.qid}</span>.
            </p>
            <div className="mt-4 text-center text-on-surface-variant/70">
              Content for "{activeTab}" tab goes here.
            </div>
          </>
        )}
      </div>
    </aside>
  );
});

export default RightSidebar;