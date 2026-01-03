import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Block, Survey, Question, QuestionRandomizationRule, RandomizationPattern, BranchingLogic, BranchingLogicBranch, BranchingLogicCondition, LogicIssue, DisplayLogic, DisplayLogicCondition } from '../types';
import { QuestionType } from '../types';
import { XIcon, ChevronDownIcon, PlusIcon, InfoIcon, ExpandIcon, CollapseIcon } from './icons';
import { Toggle } from './Toggle';
import { generateId, truncate, parseChoice, isBranchingLogicExhaustive } from '../utils';
import { CollapsibleSection } from './logic-editor/shared';
import { BlockDisplayLogicEditor } from './logic-editor/BlockDisplayLogicEditor';

import { Button } from './Button';


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
  const randomizationRef = useRef<HTMLDivElement>(null);

  const tabs = ['Settings', 'Logic'];

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
    if (focusTarget?.type === 'block' && focusTarget.id === block.id) {
      setActiveTab(focusTarget.tab);

      // Use a timeout to ensure the tab has rendered and the element is visible
      setTimeout(() => {
        let elementToHighlight: HTMLElement | null = null;
        let elementToFocus: HTMLElement | null = null;

        if (focusTarget.element === 'continueTo' && continueToRef.current) {
          elementToFocus = continueToRef.current;
          elementToHighlight = continueToRef.current.closest('div.relative');
        } else if (focusTarget.element === 'questionRandomization' && randomizationRef.current) {
          elementToFocus = randomizationRef.current;
          elementToHighlight = randomizationRef.current;
        }

        if (elementToFocus && elementToHighlight) {
          elementToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elementToFocus.focus({ preventScroll: true });

          elementToHighlight.classList.add('logic-highlight');
          setTimeout(() => {
            elementToHighlight?.classList.remove('logic-highlight');
          }, 2500);
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

  const handleIsSectionToggle = (checked: boolean) => {
    onUpdateBlock(block.id, {
      isSurveySection: checked,
      // If turning on and no custom name exists, default it to block title
      sectionName: checked && !block.sectionName ? block.title : block.sectionName
    });
  };

  const questionCount = useMemo(() =>
    block.questions.filter(q => q.type !== QuestionType.Description && q.type !== QuestionType.PageBreak).length,
    [block.questions]
  );

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

  const renderSettingsTab = () => (
    <div className="space-y-6">

      <CollapsibleSection title="Block" defaultExpanded={true}>
        <div className="space-y-6">

          <div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="set-as-section" className="text-sm font-medium text-on-surface block">
                  Set as survey section
                </label>
                <p className="text-xs text-on-surface-variant mt-0.5">Display a section header for this block.</p>
              </div>
              <Toggle
                id="set-as-section"
                checked={block.isSurveySection || false}
                onChange={handleIsSectionToggle}
              />
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
                  className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors"
                  placeholder="Enter section name..."
                />
              </div>
            )}
          </div>
          {survey.pagingMode === 'multi-per-page' && (
            <div className="flex items-start gap-3">
              <div className='flex items-center'>
                <Toggle
                  id="block-auto-page-breaks"
                  checked={!!block.automaticPageBreaks}
                  onChange={(checked) => onUpdateBlock(block.id, { automaticPageBreaks: checked })}
                  size="small"
                />
              </div>
              <div>
                <label htmlFor="block-auto-page-breaks" className="text-sm font-medium text-on-surface block">
                  Automatic page break between questions
                </label>
                <p className="text-xs text-on-surface-variant mt-0.5">Applies page breaks between each question within this block.</p>
              </div>
            </div>
          )}


        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Questions" defaultExpanded={true}>
        <div className="space-y-6">
          {/* Question Randomization Section */}
          <div ref={randomizationRef} tabIndex={-1} className="focus:outline-none rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="enable-randomization" className="text-sm font-medium text-on-surface block">
                  Randomize questions
                </label>
                <p className="text-xs text-on-surface-variant mt-0.5">Randomize the order of questions in this block.</p>
              </div>
              <Toggle
                id="enable-randomization"
                checked={!!block.questionRandomization}
                onChange={handleToggleRandomization}
              />
            </div>
            {block.questionRandomization && (
              <div className="mt-4 space-y-4">
                <button onClick={handleAddRandomizationRule} className="flex items-center gap-1 text-sm font-button-text text-primary hover:underline">
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

          <div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="enable-looping" className="text-sm font-medium text-on-surface block">
                  Loop questions
                </label>
                <p className="text-xs text-on-surface-variant mt-0.5">Repeat the questions in this block.</p>
              </div>
              <Toggle
                id="enable-looping"
                checked={block.loopingEnabled || false}
                onChange={(checked) => onUpdateBlock(block.id, { loopingEnabled: checked })}
              />
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
                  className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary transition-colors"
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Navigation" defaultExpanded={true}>
        <div className="space-y-6">
          <div>
            <label htmlFor="survey-path" className="block text-sm font-medium text-on-surface-variant mb-1">
              Survey Path
            </label>
            <div className="relative">
              <select
                id="survey-path"
                value={block.branchName || ''}
                onChange={e => onUpdateBlock(block.id, { branchName: e.target.value || undefined })}
                className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none transition-colors"
              >
                <option value="">Default</option>
                {surveyPaths.map(path => (
                  <option key={path} value={path}>{path}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Associate this block with a survey path.</p>
          </div>
          <div>
            {!isDefaultPathDisabled && (
              <>
                <label htmlFor="continue-to" className="block text-sm font-medium text-on-surface-variant mb-1">
                  Continue to
                </label>
                <div className="relative">
                  <select
                    id="continue-to"
                    ref={continueToRef}
                    value={block.continueTo || 'next'}
                    onChange={e => onUpdateBlock(block.id, { continueTo: e.target.value })}
                    className="w-full bg-transparent border border-input-border rounded-md p-2 pr-8 text-sm text-on-surface hover:border-input-border-hover focus:outline-2 focus:outline-offset-1 focus:outline-primary appearance-none transition-colors"
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
                  <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg" />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Define the block's default exit path.</p>
              </>
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
              <Toggle
                id="block-auto-advance"
                checked={block.questions.some(q => (q.type === QuestionType.Radio || q.type === QuestionType.ChoiceGrid)) && block.questions.filter(q => (q.type === QuestionType.Radio || q.type === QuestionType.ChoiceGrid)).every(q => q.autoAdvance)}
                onChange={(checked) => {
                  const updatedQuestions = block.questions.map(q => {
                    if (q.type === QuestionType.Radio || q.type === QuestionType.ChoiceGrid) {
                      return { ...q, autoAdvance: checked };
                    }
                    return q;
                  });
                  onUpdateBlock(block.id, { questions: updatedQuestions, autoAdvance: undefined });
                }}
              />
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
              <Toggle
                id="block-hide-back-button"
                checked={!!block.hideBackButton}
                onChange={(checked) => onUpdateBlock(block.id, { hideBackButton: checked })}
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div >
  );

  const renderBehaviorTab = () => (
    <div className="space-y-6">
      <CollapsibleSection title="Display Logic" defaultExpanded={true}>
        <div className="">
          <BlockDisplayLogicEditor
            block={block}
            survey={survey}
            onUpdateBlock={onUpdateBlock}
            onExpandSidebar={onExpandSidebar}
          />
        </div>
      </CollapsibleSection>


    </div>
  );



  const renderContent = () => {
    switch (activeTab) {
      case 'Settings':
        return renderSettingsTab();
      case 'Logic':
        return renderBehaviorTab();
      default:
        return null;
    }
  };

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <header className="p-4 border-b border-outline-variant flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-medium text-on-surface" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Edit Block {block.bid}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="tertiary" iconOnly onClick={onToggleExpand} aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}>
            {isExpanded ? <CollapseIcon className="text-xl" /> : <ExpandIcon className="text-xl" />}
          </Button>
          <Button variant="tertiary" iconOnly onClick={onClose} aria-label="Close panel">
            <XIcon className="text-xl" />
          </Button>
        </div>
      </header>

      <div className="border-b border-outline-variant px-4">
        <nav className="-mb-px flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
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
