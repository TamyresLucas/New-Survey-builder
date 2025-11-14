
import React, { useState, useCallback, useEffect } from 'react';
import type { Question, Survey, LogicIssue } from '../../types';
import { QuestionType } from '../../types';
import { parseChoice } from '../../utils';
import {
    SignalIcon, BatteryIcon, RadioButtonUncheckedIcon, CheckboxOutlineIcon,
    RadioIcon as RadioButtonCheckedIcon, CheckboxFilledIcon as CheckboxCheckedIcon,
    ChevronDownIcon, InfoIcon, EyeIcon
} from '../icons';

import { CollapsibleSection, QuestionGroupEditor } from '../logic-editor/shared';
import { BranchingLogicEditor } from '../logic-editor/BranchingLogicEditor';
import { WorkflowSectionEditor } from '../logic-editor/WorkflowEditor';
import { ChoiceLayoutEditor, TextEntryAdvancedSettings } from './advanced';

interface AdvancedTabProps {
    question: Question;
    survey: Survey;
    previousQuestions: Question[];
    followingQuestions: Question[];
    issues: LogicIssue[];
    onUpdate: (updates: Partial<Question>) => void;
    onAddLogic: () => void;
    onRequestGeminiHelp: (topic: string) => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ 
    question,
    survey,
    previousQuestions,
    followingQuestions,
    issues,
    onUpdate,
    onAddLogic,
    onRequestGeminiHelp
}) => {
    const isChoiceBased = [QuestionType.Radio, QuestionType.Checkbox, QuestionType.ChoiceGrid].includes(question.type);

    return (
        <div className="p-6 space-y-8">
            <QuestionGroupEditor question={question} survey={survey} onUpdateQuestion={onUpdate} />

            <CollapsibleSection title="Branching Logic" defaultExpanded={true}>
                <div className="py-6 first:pt-0">
                    <BranchingLogicEditor
                        question={question}
                        survey={survey}
                        previousQuestions={previousQuestions}
                        followingQuestions={followingQuestions}
                        issues={issues.filter(i => i.type === 'branching')}
                        onUpdate={onUpdate}
                        onAddLogic={onAddLogic}
                        onRequestGeminiHelp={onRequestGeminiHelp}
                    />
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Workflows" defaultExpanded={true}>
                <div className="-mt-2 mb-4">
                    <p className="text-xs text-on-surface-variant">Automate tasks, and integrate with other services.</p>
                </div>
                <div className="divide-y divide-outline-variant">
                    <WorkflowSectionEditor
                        title="Before Showing This Question"
                        description="Set rules or actions triggered before the question is displayed."
                        questionQid={question.qid}
                        workflows={question.draftBeforeWorkflows ?? question.beforeWorkflows ?? []}
                        onUpdateWorkflows={(newWorkflows) => onUpdate({ beforeWorkflows: newWorkflows })}
                        onAddWorkflow={onAddLogic}
                    />
                    <WorkflowSectionEditor
                        title="After Answering This Question"
                        description="Set rules or actions triggered after the question is answered."
                        questionQid={question.qid}
                        workflows={question.draftAfterWorkflows ?? question.afterWorkflows ?? []}
                        onUpdateWorkflows={(newWorkflows) => onUpdate({ afterWorkflows: newWorkflows })}
                        onAddWorkflow={onAddLogic}
                    />
                </div>
            </CollapsibleSection>
            
            {isChoiceBased && (
                <CollapsibleSection title="Display & Layout" defaultExpanded={true}>
                    <div className="py-6 first:pt-0">
                        <ChoiceLayoutEditor question={question} onUpdate={onUpdate} />
                    </div>
                </CollapsibleSection>
            )}
            {question.type === QuestionType.TextEntry && (
                 <CollapsibleSection title="Text Box Options" defaultExpanded={true}>
                    <div className="py-6 first:pt-0">
                        <TextEntryAdvancedSettings question={question} onUpdate={onUpdate} />
                    </div>
                 </CollapsibleSection>
            )}
        </div>
    );
};

// ====================================================================================
// PREVIEW TAB COMPONENT
// ====================================================================================

interface PreviewTabProps {
    question: Question;
    survey: Survey;
    isExpanded: boolean;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({ question, survey, isExpanded }) => {
    const [selectedPreviewChoices, setSelectedPreviewChoices] = useState<Set<string>>(new Set());
    const [selectedGridChoices, setSelectedGridChoices] = useState<Map<string, string>>(new Map());
    const [expandedMobileRowId, setExpandedMobileRowId] = useState<string | null>(null);

    useEffect(() => {
        setSelectedPreviewChoices(new Set());
        setSelectedGridChoices(new Map());
        if (question.type === QuestionType.ChoiceGrid && question.choices && question.choices.length > 0) {
            setExpandedMobileRowId(question.choices[0].id);
        } else {
            setExpandedMobileRowId(null);
        }
    }, [question]);

    const handlePreviewChoiceClick = useCallback((choiceId: string) => {
        if (question.type === QuestionType.Radio) {
            setSelectedPreviewChoices(new Set([choiceId]));
        } else if (question.type === QuestionType.Checkbox) {
            setSelectedPreviewChoices((prev: Set<string>) => {
                const newSet = new Set(prev);
                if (newSet.has(choiceId)) {
                    newSet.delete(choiceId);
                } else {
                    newSet.add(choiceId);
                }
                return newSet;
            });
        }
    }, [question.type]);

    const handlePreviewGridClick = useCallback((rowId: string, columnId: string) => {
        setSelectedGridChoices(prev => {
            const newMap = new Map(prev);
            newMap.set(rowId, columnId);
            return newMap;
        });

        const choices = question.choices || [];
        const currentIndex = choices.findIndex(c => c.id === rowId);
        
        if (currentIndex !== -1 && currentIndex < choices.length - 1) {
            const nextChoice = choices[currentIndex + 1];
            setExpandedMobileRowId(nextChoice.id);
        } else {
            setExpandedMobileRowId(null);
        }
    }, [question.choices]);

    const renderChoiceBasedContent = () => {
        return (
            <div>
              {!isExpanded ? (
                <div className="flex justify-center pt-4">
                    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                        <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                        <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-surface">
                            <div className="px-4 py-2 flex justify-between items-center text-xs text-on-surface-variant font-sans font-bold">
                                <span>12:29</span>
                                <div className="flex items-center gap-1">
                                    <SignalIcon className="text-base" />
                                    <BatteryIcon className="text-base" />
                                </div>
                            </div>
                            <div className="p-4 overflow-y-auto h-[calc(100%-32px)]">
                                <header className="mb-4">
                                    <h1 className="text-sm font-semibold text-on-surface text-left">{survey.title}</h1>
                                </header>
                                <div className="border-t border-outline-variant my-4"></div>
                                <p className="text-lg text-on-surface mb-6" dangerouslySetInnerHTML={{ __html: question.text || 'Question text will appear here' }}/>
                                {question.type === QuestionType.ChoiceGrid ? (
                                    question.advancedSettings?.enableMobileLayout ? (
                                        <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant overflow-hidden">
                                            {(question.choices || []).filter(c => c.visible !== false).map(choice => {
                                                const { label } = parseChoice(choice.text);
                                                const isAccordionExpanded = expandedMobileRowId === choice.id;
                                                const selectedScalePointId = selectedGridChoices.get(choice.id);
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
                                                                                onClick={() => handlePreviewGridClick(choice.id, sp.id)}
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
                                    ) : (
                                        <div className="overflow-x-auto border border-outline-variant rounded-lg">
                                            <table className="w-full border-collapse text-sm">
                                                <thead>
                                                    <tr className="border-b border-outline-variant bg-surface-container-high">
                                                        <th className="p-2 text-left"></th>
                                                        {(question.scalePoints || []).map(sp => (
                                                            <th key={sp.id} className="p-2 text-center text-xs font-medium text-on-surface-variant align-bottom">
                                                                <span>{sp.text}</span>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(question.choices || []).filter(c => c.visible !== false).map((choice) => {
                                                        const { label } = parseChoice(choice.text);
                                                        return (
                                                            <tr key={choice.id} className="border-b border-outline-variant last:border-b-0">
                                                                <td className="p-2 text-on-surface pr-2 align-middle font-medium">
                                                                    {label}
                                                                </td>
                                                                {(question.scalePoints || []).map(sp => {
                                                                    const isSelected = selectedGridChoices.get(choice.id) === sp.id;
                                                                    return (
                                                                    <td key={sp.id} className="p-1 text-center align-middle">
                                                                        <button onClick={() => handlePreviewGridClick(choice.id, sp.id)} className="p-1 rounded-full cursor-pointer">
                                                                            {isSelected ? <RadioButtonCheckedIcon className="text-xl text-primary" /> : <RadioButtonUncheckedIcon className="text-xl text-on-surface-variant" />}
                                                                        </button>
                                                                    </td>
                                                                    )
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                ) : (
                                    <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant overflow-hidden">
                                        {(question.choices || []).filter(c => c.visible !== false).map(choice => {
                                            const isSelected = selectedPreviewChoices.has(choice.id);
                                            return (
                                                <div 
                                                    key={choice.id} 
                                                    className={`flex items-center gap-4 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary-container' : 'bg-surface-container-high'}`}
                                                    onClick={() => handlePreviewChoiceClick(choice.id)}
                                                >
                                                    {question.type === QuestionType.Radio ? (
                                                        isSelected ? 
                                                            <RadioButtonCheckedIcon className="text-2xl text-primary flex-shrink-0" /> : 
                                                            <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                                    ) : (
                                                        isSelected ?
                                                            <CheckboxCheckedIcon className="text-2xl text-primary flex-shrink-0" /> :
                                                            <CheckboxOutlineIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                                    )}
                                                    <span className={`text-sm ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: parseChoice(choice.text).label }} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
              ) : (
                <div>
                  <header className="mb-8">
                      <h1 className="text-xl font-bold text-on-surface text-left">{survey.title}</h1>
                  </header>
                  <div className="space-y-4">
                    <p className="text-xl font-medium text-on-surface" dangerouslySetInnerHTML={{ __html: question.text || 'Question text will appear here' }} />
                    {question.type === QuestionType.ChoiceGrid ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-outline-variant">
                                        <th className="p-3 text-left w-1/3"></th>
                                        {(question.scalePoints || []).map(sp => (
                                            <th key={sp.id} className="p-3 text-center text-sm font-medium text-on-surface-variant align-bottom">
                                                <span>{sp.text}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(question.choices || []).filter(c => c.visible !== false).map((choice) => {
                                        const { label } = parseChoice(choice.text);
                                        return (
                                            <tr key={choice.id} className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high">
                                                <td className="p-3 text-base text-on-surface pr-4 align-middle">
                                                    {label}
                                                </td>
                                                {(question.scalePoints || []).map(sp => {
                                                    const isSelected = selectedGridChoices.get(choice.id) === sp.id;
                                                    return (
                                                    <td key={sp.id} className="p-2 text-center align-middle">
                                                        <button onClick={() => handlePreviewGridClick(choice.id, sp.id)} className="p-1 rounded-full cursor-pointer">
                                                            {isSelected ? <RadioButtonCheckedIcon className="text-2xl text-primary" /> : <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant" />}
                                                        </button>
                                                    </td>
                                                    )
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-3">
                            {(question.choices || []).filter(c => c.visible !== false).map(choice => {
                                const isSelected = selectedPreviewChoices.has(choice.id);
                                return (
                                    <div
                                        key={choice.id}
                                        onClick={() => handlePreviewChoiceClick(choice.id)}
                                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-colors ${isSelected ? 'bg-primary-container border-primary shadow-sm' : 'hover:bg-surface-container-high border-outline-variant'}`}
                                    >
                                    {question.type === QuestionType.Radio ? (
                                        isSelected ?
                                            <RadioButtonCheckedIcon className="text-2xl text-primary flex-shrink-0" /> :
                                            <RadioButtonUncheckedIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                    ) : (
                                        isSelected ?
                                            <CheckboxCheckedIcon className="text-2xl text-primary flex-shrink-0" /> :
                                            <CheckboxOutlineIcon className="text-2xl text-on-surface-variant flex-shrink-0" />
                                    )}
                                    <span className={`text-base ${isSelected ? 'text-on-primary-container font-medium' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: parseChoice(choice.text).label }} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
        );
    }
    
    const renderTextEntryContent = () => {
        const { textEntrySettings = {} } = question;
        const { answerLength = 'short', placeholder = '', validation = {}, advanced = {} } = textEntrySettings;
        const { contentType = 'none', maxLength = null } = validation;
        const { showCharCounter = false, counterType = 'remaining', textBoxWidth = 'full' } = advanced;
    
        const widthClass = { full: 'w-full', large: 'w-3/4', medium: 'w-1/2', small: 'w-1/4'}[textBoxWidth];
    
        return (
          <div className="p-4">
            <header className="mb-4">
                <h1 className="text-sm font-semibold text-on-surface text-left">{survey.title}</h1>
            </header>
            <div className="border-t border-outline-variant my-4"></div>
            <div className="space-y-4">
                <div>
                    <p className="text-base font-medium text-on-surface" dangerouslySetInnerHTML={{ __html: question.text || 'Question text will appear here' }} />
                    {question.forceResponse && <span className="text-xs text-error ml-1">*</span>}
                </div>
                <div className={`${widthClass}`}>
                    {answerLength === 'short' ? (
                    <input type="text" placeholder={placeholder || 'Enter your answer...'} className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface" disabled />
                    ) : (
                    <textarea placeholder={placeholder || 'Enter your answer...'} rows={8} className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface resize-none" disabled />
                    )}
                    {showCharCounter && maxLength && (
                    <p className="text-xs text-on-surface-variant mt-1">
                        {counterType === 'remaining' && `${maxLength} characters remaining`}
                        {counterType === 'used' && `0 / ${maxLength} characters`}
                        {counterType === 'both' && `0 / ${maxLength} characters`}
                    </p>
                    )}
                </div>
                {contentType !== 'none' && (
                    <div className="flex items-start gap-2 p-3 bg-surface-container-high rounded-md">
                        <InfoIcon className="text-base text-primary" />
                        <p className="text-xs text-on-surface-variant">
                            {contentType === 'email' && 'Validates email format (e.g., name@domain.com)'}
                            {contentType === 'phone' && 'Validates phone number format'}
                            {contentType === 'number' && 'Only numeric input allowed'}
                            {contentType === 'url' && 'Validates URL format (e.g., https://...)'}
                            {contentType === 'date' && 'Validates date format (YYYY-MM-DD)'}
                            {contentType === 'postal_code' && 'Validates postal/zip code format'}
                            {contentType === 'custom_regex' && 'Custom format validation applied'}
                        </p>
                    </div>
                )}
            </div>
          </div>
        );
    };

    const isChoiceBased = [QuestionType.Radio, QuestionType.Checkbox, QuestionType.ChoiceGrid].includes(question.type);

    let content;
    if (isChoiceBased) {
        content = renderChoiceBasedContent();
    } else if (question.type === QuestionType.TextEntry) {
        const previewContent = renderTextEntryContent();
        content = (
            <div>
              {!isExpanded ? (
                <div className="flex justify-center pt-4">
                    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                        <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                        <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-surface">
                            <div className="px-4 py-2 flex justify-between items-center text-xs text-on-surface-variant font-sans font-bold">
                                <span>12:29</span>
                                <div className="flex items-center gap-1">
                                    <SignalIcon className="text-base" />
                                    <BatteryIcon className="text-base" />
                                </div>
                            </div>
                            <div className="overflow-y-auto h-[calc(100%-32px)]">
                                {previewContent}
                            </div>
                        </div>
                    </div>
                </div>
              ) : (
                <div>
                  {previewContent}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant mt-4">
                  <EyeIcon className="text-base" />
                  <p>Preview updates in real-time as you change settings</p>
              </div>
            </div>
        );
    } else {
        content = <p className="text-center text-on-surface-variant">Preview not available for this question type.</p>
    }
    
    return <div className="p-6">{content}</div>;
};
