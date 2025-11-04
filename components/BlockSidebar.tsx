import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Block, Survey, QuestionRandomizationRule, RandomizationPattern } from '../types';
import { QuestionType } from '../types';
import { XIcon, ChevronDownIcon, PlusIcon, ExpandIcon, CollapseIcon } from './icons';
import { generateId, truncate } from '../utils';

interface BlockSidebarProps {
  block: Block;
  survey: Survey;
  onClose: () => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const BlockSidebar: React.FC<BlockSidebarProps> = ({ block, survey, onClose, onUpdateBlock, isExpanded, onToggleExpand }) => {
  const [activeTab, setActiveTab] = useState('Settings');
  const [title, setTitle] = useState(block.title);
  const [sectionName, setSectionName] = useState(block.sectionName || block.title);

  const tabs = ['Settings', 'Behavior'];

  useEffect(() => {
    setTitle(block.title);
    setSectionName(block.sectionName || block.title);
  }, [block]);

  const surveyPaths = useMemo(() => {
    const paths = new Set<string>();
    survey.blocks.forEach(b => {
      b.questions.forEach(q => {
        if (q.branchingLogic) {
          q.branchingLogic.branches.forEach(branch => {
            if (branch.pathName) paths.add(branch.pathName);
          });
          if (q.branchingLogic.otherwisePathName) {
            paths.add(q.branchingLogic.otherwisePathName);
          }
        }
      });
    });
    return Array.from(paths);
  }, [survey]);

  const questionGroups = useMemo(() => {
    const groups = new Set<string>();
    survey.blocks.forEach(b => {
        b.questions.forEach(q => {
            if (q.groupName) {
                groups.add(q.groupName);
            }
        });
    });
    return Array.from(groups).sort();
  }, [survey]);

  const handleTitleBlur = () => {
    if (title.trim() && title.trim() !== block.title) {
      onUpdateBlock(block.id, { title: title.trim() });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLTextAreaElement).blur();
    } else if (e.key === 'Escape') {
      setTitle(block.title);
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  const handleSectionNameBlur = () => {
    if (sectionName.trim() !== block.sectionName) {
      onUpdateBlock(block.id, { sectionName: sectionName.trim() || undefined });
    }
  };

  const handleSectionNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
        setSectionName(block.sectionName || block.title);
        (e.target as HTMLInputElement).blur();
    }
  };

  const handleIsSectionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onUpdateBlock(block.id, { 
      isSurveySection: isChecked,
      // If turning on and no custom name exists, default it to block title
      sectionName: isChecked && !block.sectionName ? block.title : block.sectionName
    });
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="block-title" className="block text-sm font-medium text-on-surface-variant mb-1">
          Block Title
        </label>
        <textarea
          id="block-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          rows={2}
          className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
          placeholder="Enter block title..."
        />
      </div>
      <div>
        <label htmlFor="survey-path" className="block text-sm font-medium text-on-surface-variant mb-1">
          Survey Path
        </label>
        <div className="relative">
          <select
            id="survey-path"
            value={block.branchName || ''}
            onChange={e => onUpdateBlock(block.id, { branchName: e.target.value || undefined })}
            className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
          >
            <option value="">None</option>
            {surveyPaths.map(path => (
              <option key={path} value={path}>{path}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
        <p className="text-xs text-on-surface-variant mt-1">Associate this block with a survey path.</p>
      </div>
      <div>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <label htmlFor="set-as-section" className="text-sm font-medium text-on-surface block">
                    Set as survey section
                </label>
                <p className="text-xs text-on-surface-variant mt-0.5">Display a section header for this block.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="set-as-section" checked={block.isSurveySection || false} onChange={handleIsSectionToggle} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
        </div>
        {block.isSurveySection && (
          <div className="mt-4 pl-4 border-l-2 border-outline-variant">
            <label htmlFor="section-name" className="block text-sm font-medium text-on-surface-variant mb-1">
              Section Name
            </label>
            <input
              type="text"
              id="section-name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              onBlur={handleSectionNameBlur}
              onKeyDown={handleSectionNameKeyDown}
              className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              placeholder="Enter section name..."
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderBehaviorTab = () => {
    // Handlers for Question Randomization
    const handleToggleRandomization = (enabled: boolean) => {
      if (enabled && (!block.questionRandomization || block.questionRandomization.length === 0)) {
        const newRule: QuestionRandomizationRule = {
          id: generateId('rand'),
          startQuestionId: '',
          endQuestionId: '',
          pattern: 'permutation',
        };
        onUpdateBlock(block.id, {
          questionRandomization: [newRule],
        });
      } else if (!enabled) {
        onUpdateBlock(block.id, {
          questionRandomization: undefined,
        });
      }
    };

    const handleAddRandomizationRule = () => {
        const newRule: QuestionRandomizationRule = {
            id: generateId('rand'),
            startQuestionId: '',
            endQuestionId: '',
            pattern: 'permutation',
        };
        onUpdateBlock(block.id, {
            questionRandomization: [...(block.questionRandomization || []), newRule],
        });
    };
    
    const handleUpdateRandomizationRule = (ruleId: string, updates: Partial<QuestionRandomizationRule>) => {
        const newRules = (block.questionRandomization || []).map(rule =>
            rule.id === ruleId ? { ...rule, ...updates } : rule
        );
        onUpdateBlock(block.id, { questionRandomization: newRules });
    };

    const handleRemoveRandomizationRule = (ruleId: string) => {
        const newRules = (block.questionRandomization || []).filter(rule => rule.id !== ruleId);
        onUpdateBlock(block.id, { questionRandomization: newRules.length > 0 ? newRules : undefined });
    };

    return (
        <div className="space-y-6">
            {/* Question Looping Section */}
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="enable-looping" className="text-sm font-medium text-on-surface block">
                            Enable question looping
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Repeat the questions in this block.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                        type="checkbox"
                        id="enable-looping"
                        checked={block.loopingEnabled || false}
                        onChange={e => onUpdateBlock(block.id, { loopingEnabled: e.target.checked })}
                        className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {block.loopingEnabled && (
                <div className="mt-4 pl-4 border-l-2 border-outline-variant">
                    <label htmlFor="max-loop-size" className="block text-sm font-medium text-on-surface-variant mb-1">
                    Max. Loop Size
                    </label>
                    <input
                    type="number"
                    id="max-loop-size"
                    value={block.maxLoopSize || ''}
                    onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        onUpdateBlock(block.id, { maxLoopSize: value });
                    }}
                    className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    placeholder="e.g., 5"
                    min="1"
                    />
                </div>
                )}
            </div>

            <div className="border-t border-outline-variant"></div>

            {/* Question Randomization Section */}
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <label htmlFor="enable-randomization" className="text-sm font-medium text-on-surface block">
                            Enable question randomization
                        </label>
                        <p className="text-xs text-on-surface-variant mt-0.5">Randomize the order of questions in this block.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                        type="checkbox"
                        id="enable-randomization"
                        checked={!!block.questionRandomization}
                        onChange={e => handleToggleRandomization(e.target.checked)}
                        className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {block.questionRandomization && (
                    <div className="mt-4 space-y-4">
                        <button onClick={handleAddRandomizationRule} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                            <PlusIcon className="text-base" /> Add randomization
                        </button>
                        <div className="space-y-2">
                            {block.questionRandomization.map((rule) => {
                                const questionsInBlock = block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
                                const startQuestionIndex = questionsInBlock.findIndex(q => q.id === rule.startQuestionId);
                                const endQuestionOptions = startQuestionIndex !== -1
                                    ? questionsInBlock.slice(startQuestionIndex + 1)
                                    : [];
                                
                                const showGroupSelect = rule.pattern === 'permutation';
                                const gridCols = showGroupSelect ? 'grid-cols-[1fr,1fr,1fr,1fr,auto]' : 'grid-cols-[1fr,1fr,1fr,auto]';

                                return (
                                    <div key={rule.id} className={`grid ${gridCols} items-center gap-2`}>
                                        {/* Start Question */}
                                        <div className="relative">
                                            <select
                                                value={rule.startQuestionId}
                                                onChange={e => handleUpdateRandomizationRule(rule.id, { startQuestionId: e.target.value, endQuestionId: '' })}
                                                className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                            >
                                                <option value="">Start Q</option>
                                                {questionsInBlock.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 20)}</option>)}
                                            </select>
                                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                        </div>
                                        {/* End Question */}
                                        <div className="relative">
                                            <select
                                                value={rule.endQuestionId}
                                                onChange={e => handleUpdateRandomizationRule(rule.id, { endQuestionId: e.target.value })}
                                                disabled={!rule.startQuestionId}
                                                className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none disabled:bg-surface-container-highest"
                                            >
                                                <option value="">End Q</option>
                                                {endQuestionOptions.map(q => <option key={q.id} value={q.id}>{q.qid}: {truncate(q.text, 20)}</option>)}
                                            </select>
                                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                        </div>
                                        {/* Pattern */}
                                        <div className="relative">
                                            <select
                                                value={rule.pattern}
                                                onChange={e => {
                                                    const newPattern = e.target.value as RandomizationPattern;
                                                    const updates: Partial<QuestionRandomizationRule> = { pattern: newPattern };
                                                    if (newPattern !== 'permutation') {
                                                        updates.questionGroupId = undefined;
                                                    }
                                                    handleUpdateRandomizationRule(rule.id, updates);
                                                }}
                                                className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                            >
                                                <option value="permutation">Permutation</option>
                                                <option value="rotation">Rotation</option>
                                                <option value="synchronized">Synchronized</option>
                                                <option value="reverse_order">Reverse order</option>
                                            </select>
                                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                        </div>
                                        {/* Question Group (Conditional) */}
                                        {showGroupSelect && (
                                            <div className="relative">
                                                <select
                                                    value={rule.questionGroupId || ''}
                                                    onChange={e => handleUpdateRandomizationRule(rule.id, { questionGroupId: e.target.value || undefined })}
                                                    className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none"
                                                >
                                                    <option value="">Select Question Group</option>
                                                    {questionGroups.map(group => <option key={group} value={group}>{group}</option>)}
                                                </select>
                                                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                            </div>
                                        )}
                                        {/* Remove Button */}
                                        <button onClick={() => handleRemoveRandomizationRule(rule.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full">
                                            <XIcon className="text-lg" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <header className="p-4 border-b border-outline-variant flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          Edit Block {block.bid}
        </h2>
        <div className="flex items-center gap-2">
            <button onClick={onToggleExpand} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high" aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}>
                {isExpanded ? <CollapseIcon className="text-xl" /> : <ExpandIcon className="text-xl" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high" aria-label="Close panel">
            <XIcon className="text-xl" />
            </button>
        </div>
      </header>

      <div className="border-b border-outline-variant px-4">
          <nav className="-mb-px flex space-x-4">
              {tabs.map(tab => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-on-surface-variant hover:text-on-surface'
                      }`}
                  >
                      {tab}
                  </button>
              ))}
          </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'Settings' && renderSettingsTab()}
        {activeTab === 'Behavior' && renderBehaviorTab()}
      </div>
    </aside>
  );
};