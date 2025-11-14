import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Block, Survey, Question, QuestionRandomizationRule, RandomizationPattern, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, DisplayLogic, DisplayLogicCondition } from '../types';
import { QuestionType } from '../types';
import { XIcon, ChevronDownIcon, PlusIcon, InfoIcon } from './icons';
import { generateId, truncate, parseChoice, isBranchingLogicExhaustive } from '../utils';
// FIX: Changed import path to point to the barrel file inside the 'shared' directory.
import { CollapsibleSection } from './logic-editor/shared/index';
import { BlockDisplayLogicEditor } from './logic-editor/BlockDisplayLogicEditor';
import { BlockSkipLogicEditor } from './logic-editor/BlockSkipLogicEditor';


interface BlockSidebarProps {
  block: Block;
  survey: Survey;
  onClose: () => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onExpandSidebar: () => void;
  focusTarget: { type: string; id: string; tab: string; element: string } | null;
  onFocusHandled: () => void;
}

// ====================================================================================
// MAIN SIDEBAR COMPONENT
// ====================================================================================

export const BlockSidebar: React.FC<BlockSidebarProps> = ({ block, survey, onClose, onUpdateBlock, isExpanded, onToggleExpand, onExpandSidebar, focusTarget, onFocusHandled }) => {
  const [activeTab, setActiveTab] = useState('Settings');
  const [title, setTitle] = useState(block.title);
  const [sectionName, setSectionName] = useState(block.sectionName || block.title);
  const continueToRef = useRef<HTMLSelectElement>(null);

  const tabs = ['Settings', 'Behavior', 'Advanced'];

  const lastInteractiveQuestion = useMemo(() => {
    // Find the last question in the block that is not a Page Break or Description
    return [...block.questions]
      .reverse()
      .find(
        (q) =>
          q.type !== QuestionType.PageBreak &&
          q.type !== QuestionType.Description
      );
  }, [block.questions]);

  const isDefaultPathDisabled = useMemo(
    () => isBranchingLogicExhaustive(lastInteractiveQuestion),
    [lastInteractiveQuestion]
  );

  useEffect(() => {
    if (focusTarget?.type === 'block' && focusTarget.id === block.id && focusTarget.element === 'continueTo') {
        setActiveTab(focusTarget.tab);
        
        // Use a timeout to ensure the tab has rendered and the element is visible
        setTimeout(() => {
            if (continueToRef.current) {
                continueToRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                continueToRef.current.focus();
                
                // Add highlight effect
                const parentContainer = continueToRef.current.closest('div.relative');
                if (parentContainer) {
                    parentContainer.classList.add('logic-highlight');
                    setTimeout(() => parentContainer.classList.remove('logic-highlight'), 2500);
                }
            }
            onFocusHandled();
        }, 100);
    }
  }, [focusTarget, block.id, onFocusHandled]);

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

  const localQuestionGroups = useMemo(() => {
    const groups = new Set<string>();
    block.questions.forEach(q => {
        if (q.groupName) {
            groups.add(q.groupName);
        }
    });
    return Array.from(groups).sort();
  }, [block.questions]);

  const globalQuestionGroups = useMemo(() => {
    const allGroups = new Set<string>();
    survey.blocks.forEach(b => {
        if (b.id !== block.id) { // only other blocks
            b.questions.forEach(q => {
                if (q.groupName) {
                    allGroups.add(q.groupName);
                }
            });
        }
    });
    return Array.from(allGroups).sort();
  }, [survey.blocks, block.id]);
  
  const currentBlockIndex = useMemo(() => survey.blocks.findIndex(b => b.id === block.id), [survey.blocks, block.id]);

  const compatibleBlocks = useMemo(() => {
      if (currentBlockIndex === -1) return [];
      
      return survey.blocks.filter((b, index) => 
          index > currentBlockIndex && // Must come after
          b.branchName === block.branchName // Must be in the same path
      );
  }, [survey.blocks, block.id, block.branchName, currentBlockIndex]);

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

  const questionCount = useMemo(() => 
    block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak).length,
    [block.questions]
  );

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
        {survey.pagingMode === 'multi-per-page' && (
            <div className="flex items-start gap-3 pt-6 border-t border-outline-variant">
                <input
                    type="checkbox"
                    id="block-auto-page-breaks"
                    className="w-4 h-4 rounded border-outline text-primary focus:ring-primary accent-primary mt-0.5"
                    checked={!!block.automaticPageBreaks}
                    onChange={(e) => onUpdateBlock(block.id, { automaticPageBreaks: e.target.checked })}
                />
                <div>
                    <label htmlFor="block-auto-page-breaks" className="text-sm font-medium text-on-surface block">
                        Automatic page break between questions
                    </label>
                    <p className="text-xs text-on-surface-variant mt-0.5">Applies page breaks between each question within this block.</p>
                </div>
            </div>
        )}
    </div>
  );

  const renderBehaviorTab = () => (
    <div className="space-y-8">
        <CollapsibleSection title="Navigation" defaultExpanded={true}>
            <div className="space-y-6">
                <div>
                    <label htmlFor="continue-to" className={`block text-sm font-medium mb-1 ${isDefaultPathDisabled ? 'text-on-surface-variant/70' : 'text-on-surface-variant'}`}>
                    Continue to
                    </label>
                    <div className="relative">
                    <select
                        id="continue-to"
                        ref={continueToRef}
                        value={block.continueTo || 'next'}
                        onChange={e => onUpdateBlock(block.id, { continueTo: e.target.value })}
                        className="w-full bg-surface border border-outline rounded-md p-2 pr-8 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none disabled:bg-surface-container-high disabled:cursor-not-allowed disabled:text-on-surface-variant/70"
                        disabled={isDefaultPathDisabled}
                    >
                        <option value="next">Default (next block)</option>
                        <option value="end">End of Survey</option>
                        {compatibleBlocks.length > 0 && (
                            <optgroup label="Blocks in this path">
                                {compatibleBlocks.map(b => (
                                    <option key={b.id} value={`block:${b.id}`}>
                                        {b.bid}: {truncate(b.title, 50)}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">Define the block's default exit path.</p>
                    {isDefaultPathDisabled && (
                        <div className="mt-2 p-2 bg-primary-container/20 border border-primary-container/30 rounded-md text-xs text-on-primary-container flex items-start gap-2">
                            <InfoIcon className="text-base flex-shrink-0 mt-0.5" />
                            <span>This is disabled because the last question in the block has exhaustive branching logic that defines all possible exits.</span>
                        </div>
                    )}
                </div>
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

                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <label htmlFor="block-auto-advance" className="text-sm font-medium text-on-surface block">
                                Autoadvance
                            </label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Automatically moves to the next page when a question in this block is answered.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="block-auto-advance"
                                checked={!!block.autoAdvance}
                                onChange={(e) => onUpdateBlock(block.id, { autoAdvance: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <label htmlFor="block-hide-back-button" className="text-sm font-medium text-on-surface block">
                                Hide back button
                            </label>
                            <p className="text-xs text-on-surface-variant mt-0.5">Prevent respondent from going back from any question in this block.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="block-hide-back-button"
                                checked={!!block.hideBackButton}
                                onChange={(e) => onUpdateBlock(block.id, { hideBackButton: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-2 peer-focus:outline-primary peer-focus:outline-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
        <CollapsibleSection title="Logic" defaultExpanded={true}>
            <div className="divide-y divide-outline-variant">
                <div className="py-6 first:pt-0">
                    <BlockDisplayLogicEditor
                        block={block}
                        survey={survey}
                        onUpdateBlock={onUpdateBlock}
                        onExpandSidebar={onExpandSidebar}
                    />
                </div>
                <div className="py-6 first:pt-0">
                    <h3 className="text-sm font-medium text-on-surface mb-1">Skip Logic</h3>
                    <BlockSkipLogicEditor
                        block={block}
                        survey={survey}
                        onUpdateBlock={onUpdateBlock}
                        onExpandSidebar={onExpandSidebar}
                    />
                </div>
            </div>
        </CollapsibleSection>
    </div>
  );

  const renderAdvancedTab = () => {
    // Handlers for Question Randomization
    const handleToggleRandomization = (enabled: boolean) => {
      if (enabled) {
        onExpandSidebar();
        // If turning on and there are no rules, add a default rule.
        if (!block.questionRandomization || block.questionRandomization.length === 0) {
            const newRule: QuestionRandomizationRule = {
                id: generateId('rand'),
                startQuestionId: '',
                endQuestionId: '',
                pattern: 'permutation',
                isConfirmed: false,
            };
            onUpdateBlock(block.id, {
                questionRandomization: [newRule],
            });
        }
      } else {
        // Turning off
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
            isConfirmed: false,
        };
        onUpdateBlock(block.id, {
            questionRandomization: [...(block.questionRandomization || []), newRule],
        });
    };
    
    const handleUpdateRandomizationRule = (ruleId: string, updates: Partial<QuestionRandomizationRule>) => {
        const newRules = (block.questionRandomization || []).map(rule => {
            if (rule.id === ruleId) {
                const updatedRule = { ...rule, ...updates, isConfirmed: false };

                // When changing the pattern, reset the group if it's no longer valid.
                if ('pattern' in updates) {
                    const newIsSync = updates.pattern === 'synchronized';
                    const oldIsSync = rule.pattern === 'synchronized';

                    if (newIsSync && !oldIsSync) { // Switched to sync
                        // if current group is a local group, reset it
                        if (localQuestionGroups.includes(rule.questionGroupId || '')) {
                            updatedRule.questionGroupId = undefined;
                        }
                    } else if (!newIsSync && oldIsSync) { // Switched from sync
                        // if current group is a global group, reset it
                        if (globalQuestionGroups.includes(rule.questionGroupId || '')) {
                            updatedRule.questionGroupId = undefined;
                        }
                    }
                }
                return updatedRule;
            }
            return rule;
        });
        onUpdateBlock(block.id, { questionRandomization: newRules });
    };

    const handleConfirmRandomizationRule = (ruleId: string) => {
        const newRules = (block.questionRandomization || []).map(rule =>
            rule.id === ruleId ? { ...rule, isConfirmed: true } : rule
        );
        onUpdateBlock(block.id, { questionRandomization: newRules });
    };

    const handleRemoveRandomizationRule = (ruleId: string) => {
        const newRules = (block.questionRandomization || []).filter(rule => rule.id !== ruleId);
        onUpdateBlock(block.id, { questionRandomization: newRules.length > 0 ? newRules : undefined });
    };

    return (
        <div className="space-y-6">
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
                        <div className="space-y-3">
                            <div className="space-y-2">
                                {block.questionRandomization.map((rule) => {
                                    const availableQuestions = block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak);
                                    const isSync = rule.pattern === 'synchronized';
                                    return (
                                        <div key={rule.id}>
                                            {/* Rule content placeholder */}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'Settings':
        return renderSettingsTab();
      case 'Behavior':
        return renderBehaviorTab();
      case 'Advanced':
        return renderAdvancedTab();
      default:
        return null;
    }
  };

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <header className="p-4 border-b border-outline-variant flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          Edit Block {block.bid}
        </h2>
        <div className="flex items-center gap-2">
          {/* Expand/Collapse buttons would go here */}
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
        {renderContent()}
      </div>
    </aside>
  );
};