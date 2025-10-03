import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import type { Question, ToolboxItemData, Choice } from '../types';
import { QuestionType } from '../types';
import { generateId, parseChoice } from '../utils';
import { PasteChoicesModal } from './PasteChoicesModal';
import { 
    XIcon, PlusIcon, ExpandIcon, CollapseIcon, ChevronDownIcon, DragIndicatorIcon,
    MoreVertIcon, ImageIcon, ArrowRightAltIcon,
    ComputerIcon, TabletIcon, SmartphoneIcon, ContentPasteIcon
} from './icons';
import { QuestionTypeSelectionMenuContent } from './ActionMenus';

interface RightSidebarProps {
  question: Question;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onAddChoice: (questionId: string) => void;
  onDeleteChoice: (questionId: string, choiceId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  toolboxItems: ToolboxItemData[];
}

const RightSidebar: React.FC<RightSidebarProps> = memo(({
  question,
  onClose,
  activeTab,
  onTabChange,
  onUpdateQuestion,
  onAddChoice,
  onDeleteChoice,
  isExpanded,
  onToggleExpand,
  toolboxItems
}) => {
  const [questionText, setQuestionText] = useState(question.text);
  const [expandedChoiceId, setExpandedChoiceId] = useState<string | null>(null);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [previewOrientation, setOrientation] = useState('portrait');
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);


  useEffect(() => {
    setQuestionText(question.text);
    setExpandedChoiceId(null);
    setAdvancedExpanded(false);
    setIsTypeMenuOpen(false);
  }, [question]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
            setIsTypeMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = useCallback((updates: Partial<Question>) => {
    onUpdateQuestion(question.id, updates);
  }, [question.id, onUpdateQuestion]);

  const handleTypeSelect = useCallback((newType: QuestionType) => {
    handleUpdate({ type: newType });
    setIsTypeMenuOpen(false);
  }, [handleUpdate]);
  
  const handleChoicePropertyChange = (choiceId: string, property: keyof Choice, value: any) => {
    const newChoices = (question.choices || []).map(c => 
        c.id === choiceId ? { ...c, [property]: value } : c
    );
    handleUpdate({ choices: newChoices });
  };
  
  const handleChoiceTextChange = (choiceId: string, newLabel: string) => {
    const newChoices = (question.choices || []).map(c => {
        if (c.id === choiceId) {
            const { variable } = parseChoice(c.text);
            const newText = variable ? `${variable} ${newLabel}` : newLabel;
            return { ...c, text: newText };
        }
        return c;
    });
    handleUpdate({ choices: newChoices });
  };

  const handleTextBlur = () => {
    if (questionText.trim() !== question.text) {
      handleUpdate({ text: questionText.trim() });
    }
  };

  const handlePasteChoices = (pastedText: string) => {
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    // The renumbering logic will handle adding variables automatically
    const newChoices: Choice[] = lines.map(line => ({
      id: generateId('c'),
      text: line.trim(),
    }));

    handleUpdate({ choices: newChoices });
  };

  const CurrentQuestionType = toolboxItems.find(item => item.name === question.type);
  const initialChoicesText = (question.choices || []).map(c => parseChoice(c.text).label).join('\n');

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          Question Type
        </label>
        <div className="relative" ref={typeMenuRef}>
          <button
            onClick={() => setIsTypeMenuOpen(prev => !prev)}
            className="w-full flex items-center gap-2 text-left bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            aria-haspopup="true"
            aria-expanded={isTypeMenuOpen}
          >
            {CurrentQuestionType ? <CurrentQuestionType.icon className="text-base text-primary flex-shrink-0" /> : <div className="w-4 h-4 mr-3 flex-shrink-0" />}
            <span className="flex-grow">{question.type}</span>
            <ChevronDownIcon className="text-lg text-on-surface-variant flex-shrink-0" />
          </button>
          {isTypeMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-10">
              <QuestionTypeSelectionMenuContent onSelect={handleTypeSelect} toolboxItems={toolboxItems} />
            </div>
          )}
        </div>
        <p className="text-xs text-on-surface-variant mt-1">Changing type may reset some settings</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="allow-multiple" className="text-sm font-medium text-on-surface">
            Allow Multiple Answers
          </label>
          <p className="text-xs text-on-surface-variant mt-0.5">Convert to Checkbox question type</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="allow-multiple"
            checked={question.type === QuestionType.Checkbox}
            onChange={(e) => handleUpdate({ type: e.target.checked ? QuestionType.Checkbox : QuestionType.Radio })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
      
      <div>
        <label htmlFor="answer-format" className="block text-sm font-medium text-on-surface-variant mb-1">Answer Format</label>
        <div className="relative">
            <select id="answer-format" value={question.answerFormat || 'list'} onChange={e => handleUpdate({ answerFormat: e.target.value as any })} className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none">
                <option value="list">List (Vertical)</option>
                <option value="dropdown">Dropdown</option>
                <option value="horizontal">Horizontal List</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
      </div>
      
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
          placeholder="Enter your question here..."
        />
        <p className="text-xs text-on-surface-variant mt-1">Maximum 5000 characters</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-on-surface-variant mb-2">Choices</h3>
        <div className="space-y-2">
          {(question.choices || []).map((choice) => (
            <div key={choice.id} className="group">
              <div className="flex items-center gap-2">
                <button className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-on-surface cursor-grab active:cursor-grabbing transition-opacity" aria-label="Reorder choice">
                  <DragIndicatorIcon className="text-lg" />
                </button>
                <input
                  type="text"
                  value={parseChoice(choice.text).label}
                  onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                  className="flex-grow bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  placeholder="Enter choice text"
                />
                <button onClick={() => setExpandedChoiceId(expandedChoiceId === choice.id ? null : choice.id)} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full" aria-label="More options">
                  <MoreVertIcon className="text-lg" />
                </button>
                <button onClick={() => onDeleteChoice(question.id, choice.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full" aria-label="Delete choice">
                  <XIcon className="text-lg" />
                </button>
              </div>
              {expandedChoiceId === choice.id && (
                <div className="ml-8 mt-2 p-3 bg-surface-container-high rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-on-surface-variant">Visible</label>
                    <input type="checkbox" checked={choice.visible ?? true} onChange={e => handleChoicePropertyChange(choice.id, 'visible', e.target.checked)} className="accent-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-on-surface-variant">Fixed Position</label>
                    <input type="checkbox" checked={choice.fixed ?? false} onChange={e => handleChoicePropertyChange(choice.id, 'fixed', e.target.checked)} className="accent-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant block mb-1">Allow Text Entry</label>
                     <input type="checkbox" checked={choice.allowTextEntry ?? false} onChange={e => handleChoicePropertyChange(choice.id, 'allowTextEntry', e.target.checked)} className="accent-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <button onClick={() => onAddChoice(question.id)} className="flex items-center text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base mr-1" /> Add Choice</button>
          <button onClick={() => setIsPasteModalOpen(true)} className="flex items-center text-sm font-medium text-primary hover:underline"><ContentPasteIcon className="text-base mr-1" /> Copy and paste</button>
        </div>
      </div>

      <div className="border-t border-outline-variant pt-6">
        <button onClick={() => setAdvancedExpanded(!advancedExpanded)} className="w-full flex items-center justify-between text-sm font-medium text-on-surface hover:text-primary">
          <span>Advanced Settings</span>
          <ChevronDownIcon className={`text-lg transition-transform ${advancedExpanded ? 'rotate-180' : ''}`} />
        </button>
        {advancedExpanded && (
          <div className="mt-4 space-y-6">
             <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Display & Layout</h4>
          </div>
        )}
      </div>
    </div>
  );

  const renderBehaviorTab = () => (
     <div className="space-y-6">
        <div>
            <h3 className="text-sm font-medium text-on-surface mb-2">Display Logic</h3>
            <p className="text-xs text-on-surface-variant mb-3">Control when this question is shown to respondents</p>
            <button onClick={() => alert("Not implemented")} className="flex items-center text-sm font-medium text-primary hover:underline"><PlusIcon className="text-base mr-1" />Add Display Logic</button>
        </div>

        <div className="border-t border-outline-variant pt-6">
            <h3 className="text-sm font-medium text-on-surface mb-2">Skip Logic</h3>
            <p className="text-xs text-on-surface-variant mb-3">Skip to different questions based on the selected answer</p>
            <div className="space-y-2">
                {(question.choices || []).map(choice => (
                    <div key={choice.id} className="flex items-center gap-2">
                        <span className="text-sm text-on-surface flex-shrink-0 w-32 truncate">{parseChoice(choice.text).label}</span>
                        <ArrowRightAltIcon className="text-on-surface-variant flex-shrink-0" />
                        <select className="flex-1 bg-surface border border-outline rounded-md p-2 text-sm">
                            <option value="next">Next Question</option>
                            <option value="end">End of Survey</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
     </div>
  );

  const renderVariablesTab = () => (
    <div className="text-center py-8">
        <p className="text-on-surface-variant">Variable management is handled automatically.</p>
        <p className="text-xs text-on-surface-variant mt-2">Variables are auto-generated based on question ID and update automatically.</p>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-2">Preview Device</label>
        <div className="flex gap-2">
          {[
            { id: 'desktop', label: 'Desktop', icon: ComputerIcon },
            { id: 'tablet', label: 'Tablet', icon: TabletIcon },
            { id: 'mobile', label: 'Mobile', icon: SmartphoneIcon }
          ].map(device => (
            <button
              key={device.id}
              onClick={() => setPreviewDevice(device.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-md border transition-colors ${
                previewDevice === device.id
                  ? 'bg-primary-container text-on-primary-container border-primary'
                  : 'bg-surface text-on-surface border-outline hover:bg-surface-container-high'
              }`}
            >
              <device.icon className="text-2xl" />
              <span className="text-xs">{device.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-high">
        <div className="bg-surface rounded-md p-6 shadow-sm">
          <div className="space-y-4">
            <p className="text-base font-medium text-on-surface">{questionText || 'Question text will appear here'}</p>
            <div className={`space-y-2 ${question.answerFormat === 'horizontal' ? 'flex flex-wrap gap-4' : ''}`}>
              {(question.choices || []).filter(c => c.visible !== false).map(choice => (
                <label key={choice.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-surface-container-high cursor-pointer">
                  <span className="material-symbols-rounded text-xl" style={{ color: choice.color || 'hsl(var(--color-primary))' }}>radio_button_unchecked</span>
                  <span className="text-sm text-on-surface">{parseChoice(choice.text).label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const renderTabContent = () => {
    switch(activeTab) {
        case 'Settings': return renderSettingsTab();
        case 'Behavior': return renderBehaviorTab();
        case 'Variables': return renderVariablesTab();
        case 'Preview': return renderPreviewTab();
        default: return <p>Content not available</p>;
    }
  }

  return (
    <>
      <PasteChoicesModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onSave={handlePasteChoices}
        initialChoicesText={initialChoicesText}
      />
      <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            Edit question
          </h2>
          <div className="flex items-center">
              <button 
                  onClick={onToggleExpand} 
                  className="text-on-surface-variant hover:text-on-surface p-1 mr-1"
                  aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                  {isExpanded ? <CollapseIcon className="text-2xl" /> : <ExpandIcon className="text-2xl" />}
              </button>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1">
                  <XIcon className="text-2xl" />
              </button>
          </div>
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
          {renderTabContent()}
        </div>
      </aside>
    </>
  );
});

export default RightSidebar;