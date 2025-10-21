import React, { useState } from 'react';
import type { Question } from '../types';
import { QuestionType } from '../types';
import { parseChoice } from '../utils';
import {
    RadioButtonUncheckedIcon,
    RadioIcon as RadioButtonCheckedIcon,
    CheckboxOutlineIcon,
    CheckboxFilledIcon as CheckboxCheckedIcon,
    ChevronDownIcon,
} from './icons';

interface PreviewQuestionProps {
  question: Question;
  onAnswerChange: (questionId: string, answer: any) => void;
  isInvalid: boolean;
  device: 'mobile' | 'desktop';
  value: any;
}

export const PreviewQuestion: React.FC<PreviewQuestionProps> = ({ question, onAnswerChange, isInvalid, device, value }) => {
  // Local state for UI that doesn't affect survey state (e.g., accordion expansion)
  const [expandedMobileRowId, setExpandedMobileRowId] = useState<string | null>(question.choices?.[0]?.id ?? null);
  
  const handleRadioChange = (choiceId: string) => {
    onAnswerChange(question.id, choiceId);
  };

  const handleCheckboxChange = (choiceId: string) => {
    const currentSet = (value as Set<string>) || new Set();
    const newSet = new Set(currentSet);
    if (newSet.has(choiceId)) {
      newSet.delete(choiceId);
    } else {
      newSet.add(choiceId);
    }
    onAnswerChange(question.id, newSet);
  };
  
  const handleGridChange = (rowId: string, colId: string) => {
      const newMap = (value as Map<string, string>) || new Map();
      newMap.set(rowId, colId);
      onAnswerChange(question.id, newMap);
      
      // "Select and advance" logic for mobile accordion view
      if (device === 'mobile' && question.advancedSettings?.enableMobileLayout) {
        const choices = question.choices || [];
        const currentIndex = choices.findIndex(c => c.id === rowId);
        if (currentIndex !== -1 && currentIndex < choices.length - 1) {
            const nextChoice = choices[currentIndex + 1];
            setExpandedMobileRowId(nextChoice.id);
        } else {
            setExpandedMobileRowId(null);
        }
      }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onAnswerChange(question.id, e.target.value);
  }

  const renderQuestionText = () => (
    <div className="mb-6">
      <p className="text-lg text-on-surface" dangerouslySetInnerHTML={{ __html: question.text }} />
      {question.forceResponse && <span className="text-sm text-error ml-1">*</span>}
    </div>
  );

  const renderChoices = () => {
    if (!question.choices) return null;

    const isRadio = question.type === QuestionType.Radio;
    const isCheckbox = question.type === QuestionType.Checkbox;

    const settings = (device === 'mobile' && question.advancedSettings?.enableMobileLayout)
      ? { ...question.advancedSettings, ...question.advancedSettings?.mobile }
      : question.advancedSettings;
    
    const orientation = settings?.choiceOrientation || 'vertical';
    const numColumns = settings?.numColumns || 2;
    
    const gridLayoutClasses: { [key: number]: string } = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
    };

    const layoutClasses = {
        vertical: 'flex flex-col space-y-3',
        horizontal: 'flex flex-wrap items-center gap-4',
        grid: `grid gap-3 ${gridLayoutClasses[numColumns] || 'grid-cols-2'}`
    }[orientation];

    const radioSelection = value as string | null;
    const checkboxSelection = (value as Set<string>) || new Set();

    return (
      <div className={layoutClasses}>
        {question.choices.map(choice => {
          const isSelected = isRadio ? radioSelection === choice.id : checkboxSelection.has(choice.id);
          return (
            <div
              key={choice.id}
              onClick={() => isRadio ? handleRadioChange(choice.id) : handleCheckboxChange(choice.id)}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-colors ${
                isSelected
                  ? 'bg-primary-container border-primary shadow-sm'
                  : 'hover:bg-surface-container-high border-outline-variant'
              }`}
            >
              {isRadio ? (
                isSelected ? <RadioButtonCheckedIcon className="text-2xl text-primary flex-shrink-0" /> : <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
              ) : (
                isSelected ? <CheckboxCheckedIcon className="text-2xl text-primary flex-shrink-0" /> : <CheckboxOutlineIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
              )}
              <span className={`text-base ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`}>
                {parseChoice(choice.text).label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderChoiceGrid = () => {
    if (!question.choices || !question.scalePoints) return null;
    const gridSelection = (value as Map<string, string>) || new Map();
    
    // Check if we should render the mobile-optimized accordion view
    if (device === 'mobile' && question.advancedSettings?.enableMobileLayout) {
        return (
            <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant overflow-hidden">
                {(question.choices || []).map(choice => {
                    const { label } = parseChoice(choice.text);
                    const isAccordionExpanded = expandedMobileRowId === choice.id;
                    const selectedScalePointId = gridSelection.get(choice.id);
                    const selectedScalePoint = question.scalePoints?.find(sp => sp.id === selectedScalePointId);

                    return (
                        <div key={choice.id}>
                            <button 
                                onClick={() => setExpandedMobileRowId(isAccordionExpanded ? null : choice.id)}
                                className="w-full flex justify-between items-center p-3 text-left bg-surface-container-high"
                                aria-expanded={isAccordionExpanded}
                            >
                                <div className="flex-1 pr-2">
                                    <p className="text-sm text-on-surface">{label}</p>
                                    {selectedScalePoint && !isAccordionExpanded && (
                                        <p className="text-xs text-primary mt-1 font-medium">{selectedScalePoint.text}</p>
                                    )}
                                </div>
                                <ChevronDownIcon className={`text-xl text-on-surface-variant transition-transform flex-shrink-0 ${isAccordionExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isAccordionExpanded && (
                                <div className="p-3 bg-surface">
                                    <div className="space-y-3">
                                        {(question.scalePoints || []).map(sp => {
                                            const isSelected = selectedScalePointId === sp.id;
                                            return (
                                                <div 
                                                    key={sp.id}
                                                    onClick={() => handleGridChange(choice.id, sp.id)}
                                                    className="flex items-center gap-3 cursor-pointer"
                                                >
                                                    {isSelected ? 
                                                        <RadioButtonCheckedIcon className="text-2xl text-primary flex-shrink-0" /> : 
                                                        <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                                    }
                                                    <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-on-surface'}`}>
                                                        {sp.text}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
    
    // Default desktop table view
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b-2 border-outline-variant">
                        <th className="p-3 text-left w-1/3"></th>
                        {question.scalePoints.map(sp => (
                            <th key={sp.id} className="p-3 text-center text-sm font-medium text-on-surface-variant align-bottom">
                                <span>{sp.text}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {question.choices.map((choice) => (
                        <tr key={choice.id} className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high">
                            <td className="p-3 text-base text-on-surface pr-4 align-middle">
                                {parseChoice(choice.text).label}
                            </td>
                            {question.scalePoints.map(sp => {
                                const isSelected = gridSelection.get(choice.id) === sp.id;
                                return (
                                <td key={sp.id} className="p-2 text-center align-middle">
                                    <button 
                                        onClick={() => handleGridChange(choice.id, sp.id)}
                                        className="p-1 rounded-full cursor-pointer"
                                        aria-label={`Select ${sp.text} for ${parseChoice(choice.text).label}`}
                                    >
                                        {isSelected ? <RadioButtonCheckedIcon className="text-2xl text-primary" /> : <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant" />}
                                    </button>
                                </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  };
  
  const renderTextEntry = () => {
      const settings = question.textEntrySettings;
      const textValue = (value as string) || '';
      return (
          <div className="w-full">
              {settings?.answerLength === 'long' ? (
                  <textarea 
                    rows={8}
                    value={textValue}
                    onChange={handleTextChange}
                    placeholder={settings.placeholder || 'Your answer...'}
                    className="w-full bg-surface border border-outline rounded-md p-2 text-base text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  />
              ) : (
                  <input
                    type="text"
                    value={textValue}
                    onChange={handleTextChange}
                    placeholder={settings?.placeholder || 'Your answer...'}
                    className="w-full bg-surface border border-outline rounded-md p-2 text-base text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  />
              )}
          </div>
      );
  };

  const renderContent = () => {
    switch (question.type) {
      case QuestionType.Radio:
      case QuestionType.Checkbox:
        return renderChoices();
      case QuestionType.ChoiceGrid:
        return renderChoiceGrid();
      case QuestionType.TextEntry:
        return renderTextEntry();
      case QuestionType.Description:
        return null; // The text is already rendered
      default:
        return <p className="text-sm text-on-surface-variant italic">This question type can't be displayed in the preview yet.</p>;
    }
  };

  return (
    <div className="py-8 border-b border-outline-variant last:border-b-0">
      {renderQuestionText()}
      {renderContent()}
      {isInvalid && (
        <p className="mt-2 text-sm text-error">Answer required</p>
      )}
    </div>
  );
};
