
// FIX: Added 'useCallback' to the import from 'react' to resolve the 'Cannot find name' error.
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Survey, Question, DisplayLogicCondition, BranchingLogicCondition, Block } from '../types';
import { QuestionType } from '../types';
import { XIcon, ArrowRightAltIcon, SignalIcon, BatteryIcon } from './icons';
import { PreviewQuestion } from './PreviewQuestion';
import { CHOICE_BASED_QUESTION_TYPES } from '../utils';

interface SurveyPreviewProps {
  survey: Survey;
  onClose: () => void;
}

interface PreviewContentProps {
  device: 'mobile' | 'desktop';
  survey: Survey;
  questions: Question[];
  answers: Map<string, any>;
  validationErrors: Set<string>;
  onAnswerChange: (questionId: string, answer: any) => void;
  isLastPage: boolean;
  currentPage: number;
  onBack: () => void;
  onNext: () => void;
  questionIdToBlockMap: Map<string, Block>;
}

// Helper functions for display logic evaluation
const evaluateCondition = (
  condition: DisplayLogicCondition | BranchingLogicCondition,
  answers: Map<string, any>,
  survey: Survey,
  questionMapByQid: Map<string, Question>
): boolean => {
  const sourceQuestion = questionMapByQid.get(condition.questionId);
  if (!sourceQuestion) return false;

  const answer = answers.get(sourceQuestion.id);

  if (condition.operator === 'is_empty') {
    if (answer === undefined || answer === null) return true;
    if (typeof answer === 'string' && answer.trim() === '') return true;
    if (answer instanceof Set && answer.size === 0) return true;
    return false;
  }
  if (condition.operator === 'is_not_empty') {
    if (answer === undefined || answer === null) return false;
    if (typeof answer === 'string' && answer.trim() === '') return false;
    if (answer instanceof Set && answer.size === 0) return false;
    return true;
  }

  if (CHOICE_BASED_QUESTION_TYPES.has(sourceQuestion.type) && sourceQuestion.choices) {
    const conditionValue = condition.value;

    if (typeof answer === 'string') { // Radio button
      const selectedChoice = sourceQuestion.choices.find(c => c.id === answer);
      const actualValue = selectedChoice ? selectedChoice.text : null;
      if (condition.operator === 'equals') return actualValue === conditionValue;
      if (condition.operator === 'not_equals') return actualValue !== conditionValue;
    }

    if (answer instanceof Set) { // Checkbox
      const selectedChoiceTexts = new Set(
        Array.from(answer)
          .map(choiceId => sourceQuestion.choices!.find(c => c.id === choiceId)?.text)
          .filter(Boolean) as string[]
      );
      if (condition.operator === 'equals') return selectedChoiceTexts.has(conditionValue);
      if (condition.operator === 'not_equals') return !selectedChoiceTexts.has(conditionValue);
    }
  } else { // For TextEntry, etc.
    const actualValue = answer as string | null;
    if (condition.operator === 'equals') return actualValue === condition.value;
    if (condition.operator === 'not_equals') return actualValue !== condition.value;
    if (condition.operator === 'contains') return actualValue?.includes(condition.value) ?? false;
  }

  return false;
};

const evaluateDisplayLogic = (
  question: Question,
  answers: Map<string, any>,
  survey: Survey,
  questionMapByQid: Map<string, Question>
): boolean => {
  if (question.isHidden) {
    return false;
  }

  if (!question.displayLogic || question.displayLogic.conditions.length === 0) {
    return true; // Always visible if no logic
  }

  const { operator, conditions } = question.displayLogic;
  const confirmedConditions = conditions.filter(c => c.isConfirmed);

  if (confirmedConditions.length === 0) return true;

  const conditionResults = confirmedConditions.map(cond => evaluateCondition(cond, answers, survey, questionMapByQid));

  if (operator === 'AND') {
    return conditionResults.every(result => result);
  } else { // OR
    return conditionResults.some(result => result);
  }
};


// This component now ONLY renders the content (questions, buttons), not the device chrome.
const PreviewContent: React.FC<PreviewContentProps> = ({
  survey,
  questions,
  answers,
  validationErrors,
  onAnswerChange,
  isLastPage,
  currentPage,
  onBack,
  onNext,
  device,
  questionIdToBlockMap,
}) => {
  const shouldShowBackButton = currentPage > 0 && !questions.some(q => {
    const parentBlock = questionIdToBlockMap.get(q.id);
    return q.hideBackButton || parentBlock?.hideBackButton;
  });

  return (
    <>
      <header className="mb-4">
        <h1 className={`${device === 'mobile' ? 'text-xl' : 'text-3xl'} font-bold text-on-surface mb-2`}>{survey.title}</h1>
        {device === 'desktop' && <div className="w-16 h-1 bg-primary mb-8"></div>}
      </header>
      {questions.map(question => (
        <PreviewQuestion
          key={`${device}-${question.id}`}
          question={question}
          device={device}
          value={answers.get(question.id)}
          onAnswerChange={onAnswerChange}
          isInvalid={validationErrors.has(question.id)}
        />
      ))}
      <div className={`mt-8 flex items-center gap-4 ${shouldShowBackButton ? 'justify-between' : 'justify-end'}`}>
        {shouldShowBackButton && (
          <button
            onClick={onBack}
            className={`px-6 py-3 text-sm font-button-primary text-primary rounded-full hover:bg-primary-container ${device === 'mobile' ? 'flex-1' : ''}`}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-button-primary text-on-primary bg-primary rounded-full hover:opacity-90 ${device === 'mobile' ? 'flex-1' : ''}`}
        >
          <span>{isLastPage ? 'Submit' : 'Next'}</span>
          {!isLastPage && <ArrowRightAltIcon />}
        </button>
      </div>
    </>
  );
};


export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ survey, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageHistory, setPageHistory] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Map<string, any>>(new Map());
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  const desktopPaneRef = useRef<HTMLDivElement>(null);
  const mobilePaneRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef(false);
  const lastAnsweredQIdRef = useRef<string | null>(null);

  const questionMapByQid = useMemo(() => {
    const allQuestions = survey.blocks.flatMap(b => b.questions);
    return new Map(allQuestions.filter(q => q.qid).map(q => [q.qid, q]));
  }, [survey]);

  const questionIdToBlockMap = useMemo(() => {
    const map = new Map<string, Block>();
    survey.blocks.forEach(block => {
      block.questions.forEach(question => {
        map.set(question.id, block);
      });
    });
    return map;
  }, [survey.blocks]);

  const pages = useMemo(() => {
    const finalPages: Question[][] = [];
    let currentPage: Question[] = [];

    for (const block of survey.blocks) {
      // Treat start of a new block as an implicit page break if the current page isn't empty.
      if (currentPage.length > 0) {
        finalPages.push(currentPage);
        currentPage = [];
      }

      for (const question of block.questions) {
        // Only consider questions that should be visible based on display logic
        const isVisible = evaluateDisplayLogic(question, answers, survey, questionMapByQid);
        if (!isVisible) continue;

        if (question.type === QuestionType.PageBreak) {
          // If there's content on the current page, finalize it before the break.
          if (currentPage.length > 0) {
            finalPages.push(currentPage);
          }
          // Start a new page after the break.
          currentPage = [];
        } else {
          currentPage.push(question);
        }
      }
    }

    // Add the last page if it has any questions
    if (currentPage.length > 0) {
      finalPages.push(currentPage);
    }

    // If after all logic, there are no pages, return a single empty page to avoid crashes.
    return finalPages.length > 0 ? finalPages : [[]];
  }, [survey, answers, questionMapByQid]);

  const nextStepInfo = useMemo(() => {
    const questionsOnPage = pages[currentPage];
    if (!questionsOnPage) {
      return { action: 'next' as const, pageIndex: currentPage + 1 };
    }

    let destination: string | null = null;

    // Iterate through questions on the current page in reverse order to find the last applicable logic
    for (let i = questionsOnPage.length - 1; i >= 0; i--) {
      const question = questionsOnPage[i];
      const answer = answers.get(question.id);

      // An answer must exist for some logic to be triggered
      if (answer === undefined) {
        continue;
      }

      // 1. Check for Branching Logic first
      const branchingLogic = question.branchingLogic;
      if (branchingLogic && branchingLogic.branches) {
        let branchMatched = false;
        for (const branch of branchingLogic.branches) {
          if (!branch.thenSkipToIsConfirmed) continue;

          const confirmedConditions = branch.conditions.filter(c => c.isConfirmed);
          if (confirmedConditions.length === 0) continue;

          const conditionResults = confirmedConditions.map(cond =>
            evaluateCondition(cond, answers, survey, questionMapByQid)
          );

          const branchResult = branch.operator === 'AND'
            ? conditionResults.every(res => res)
            : conditionResults.some(res => res);

          if (branchResult) {
            destination = branch.thenSkipTo;
            branchMatched = true;
            break;
          }
        }

        if (branchMatched) {
          break;
        }

        if (branchingLogic.otherwiseIsConfirmed) {
          destination = branchingLogic.otherwiseSkipTo;
          break;
        }
      }

      if (destination !== null) {
        break;
      }

      // 2. Fallback to Skip Logic
      const skipLogic = question.skipLogic;
      if (skipLogic) {
        if (skipLogic.type === 'simple' && skipLogic.isConfirmed) {
          destination = skipLogic.skipTo;
        } else if (skipLogic.type === 'per_choice' && (typeof answer === 'string' || answer instanceof Set)) {
          const answerSet = typeof answer === 'string' ? new Set([answer]) : answer;
          for (const ans of Array.from(answerSet).reverse()) {
            const rule = skipLogic.rules.find(r => r.choiceId === ans && r.isConfirmed);
            if (rule?.skipTo) {
              destination = rule.skipTo;
              break;
            }
          }
        }
      }

      if (destination !== null) {
        break;
      }
    }

    // 3. If no question logic, check block-level logic
    if (destination === null) {
      const lastQuestionOnPage = questionsOnPage[questionsOnPage.length - 1];
      if (lastQuestionOnPage) {
        const blockOfLastQuestion = survey.blocks.find(b => b.questions.some(q => q.id === lastQuestionOnPage.id));
        const interactiveQuestionsInBlock = blockOfLastQuestion?.questions.filter(q => q.type !== QuestionType.PageBreak && q.type !== QuestionType.Description);
        const lastInteractiveInBlock = interactiveQuestionsInBlock?.[interactiveQuestionsInBlock.length - 1];

        if (blockOfLastQuestion && lastInteractiveInBlock?.id === lastQuestionOnPage.id && blockOfLastQuestion.continueTo && blockOfLastQuestion.continueTo !== 'next') {
          destination = blockOfLastQuestion.continueTo;
        }
      }
    }

    if (destination === 'end') {
      return { action: 'submit' as const };
    }

    if (destination && destination !== 'next') {
      let targetId = destination;
      if (destination.startsWith('block:')) {
        const blockId = destination.substring(6);
        const targetBlock = survey.blocks.find(b => b.id === blockId);
        const firstQuestionInBlock = targetBlock?.questions.find(q => q.type !== QuestionType.PageBreak);
        targetId = firstQuestionInBlock?.id || '';
      }

      const pageIndex = pages.findIndex(p => p.some(q => q.id === targetId));
      if (pageIndex > -1) {
        return { action: 'next' as const, pageIndex };
      }
    }

    if (currentPage >= pages.length - 1) {
      return { action: 'submit' as const };
    }

    return { action: 'next' as const, pageIndex: currentPage + 1 };
  }, [currentPage, pages, answers, survey, questionMapByQid]);

  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [pages, currentPage]);

  useEffect(() => {
    setValidationErrors(new Set());
  }, [currentPage]);

  const syncScroll = (scrollingPane: 'desktop' | 'mobile') => {
    if (scrollLockRef.current) return;

    const sourceEl = scrollingPane === 'desktop' ? desktopPaneRef.current : mobilePaneRef.current;
    const targetEl = scrollingPane === 'desktop' ? mobilePaneRef.current : desktopPaneRef.current;

    if (!sourceEl || !targetEl) return;

    const sourceScrollable = sourceEl.scrollHeight - sourceEl.clientHeight;
    if (sourceScrollable <= 0) return;

    const scrollPercentage = sourceEl.scrollTop / sourceScrollable;

    const targetScrollable = targetEl.scrollHeight - targetEl.clientHeight;

    if (targetScrollable > 0) {
      scrollLockRef.current = true;
      targetEl.scrollTop = scrollPercentage * targetScrollable;
      setTimeout(() => { scrollLockRef.current = false; }, 50);
    }
  };

  const currentQuestions = pages[currentPage] || [];
  const isEffectivelyLastPage = nextStepInfo.action === 'submit';

  const validatePage = (): boolean => {
    const errors = new Set<string>();
    for (const q of currentQuestions) {
      if (q.forceResponse) {
        const answer = answers.get(q.id);
        let isAnswered = false;
        if (answer !== undefined && answer !== null) {
          if (typeof answer === 'string') {
            isAnswered = answer.trim() !== '';
          } else if (answer instanceof Set || answer instanceof Map) {
            isAnswered = answer.size > 0;
          } else {
            isAnswered = true; // For other types, presence is enough
          }
        }
        if (!isAnswered) {
          errors.add(q.id);
        }
      }
    }
    setValidationErrors(errors);
    // FIX: Add missing return statement. This function must return a boolean.
    return errors.size === 0;
  };

  const handleNext = () => {
    if (!validatePage()) {
      return; // Validation failed
    }

    if (nextStepInfo.action === 'submit') {
      onClose();
      // In a real app, you'd probably show a thank you message or redirect.
      alert('Survey Submitted! (Preview Mode)');
    } else {
      setPageHistory([...pageHistory, currentPage]);
      setCurrentPage(nextStepInfo.pageIndex);
    }
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const lastPage = pageHistory[pageHistory.length - 1];
      setPageHistory(pageHistory.slice(0, -1));
      setCurrentPage(lastPage);
    }
  };

  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    lastAnsweredQIdRef.current = questionId;
    setAnswers(prev => new Map(prev).set(questionId, answer));
  }, []);

  // Autoadvance logic
  useEffect(() => {
    const lastAnsweredQId = lastAnsweredQIdRef.current;
    if (!lastAnsweredQId) return;

    const question = currentQuestions.find(q => q.id === lastAnsweredQId);
    if (!question) return;

    const parentBlock = questionIdToBlockMap.get(question.id);

    const isAutoadvanceable = (question.autoAdvance === true) || (question.autoAdvance === undefined && parentBlock?.autoAdvance === true) || (question.autoAdvance === undefined && parentBlock?.autoAdvance === undefined && survey.globalAutoAdvance === true);

    if (isAutoadvanceable && [QuestionType.Radio, QuestionType.ChoiceGrid].includes(question.type)) {
      // Delay slightly to allow the UI to update and for the user to see their selection
      const timer = setTimeout(() => {
        handleNext();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentQuestions]);

  // FIX: Added return statement to the component to render the JSX.
  return (
    <div
      className="fixed inset-0 z-50"
    >
      <div
        className="bg-surface w-full h-full flex flex-col"
      >
        <header className="p-4 border-b border-outline-variant flex items-center justify-between flex-shrink-0 bg-surface-container">
          <h2 className="text-lg font-bold text-on-surface">Preview Survey</h2>
          <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-lowest">
            <XIcon className="text-xl" />
          </button>
        </header>

        <main className="flex-1 overflow-hidden grid grid-cols-2">
          {/* Desktop Preview */}
          <div className="flex flex-col">
            <div ref={desktopPaneRef} onScroll={() => syncScroll('desktop')} className="flex-1 overflow-y-auto p-8 bg-surface-container">
              <PreviewContent
                device="desktop"
                survey={survey}
                questions={currentQuestions}
                answers={answers}
                validationErrors={validationErrors}
                onAnswerChange={handleAnswerChange}
                isLastPage={isEffectivelyLastPage}
                currentPage={currentPage}
                onBack={handleBack}
                onNext={handleNext}
                questionIdToBlockMap={questionIdToBlockMap}
              />
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="flex flex-col border-l border-outline-variant">
            <div className="flex-1 overflow-y-auto flex justify-center py-8 bg-surface-container-high">
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-full w-[340px] shadow-xl">
                <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-surface-container">
                  <div className="px-4 py-2 flex justify-between items-center text-xs text-on-surface-variant font-sans font-bold">
                    <span>12:29</span>
                    <div className="flex items-center gap-1">
                      <SignalIcon className="text-base" />
                      <BatteryIcon className="text-base" />
                    </div>
                  </div>
                  <div ref={mobilePaneRef} onScroll={() => syncScroll('mobile')} className="p-4 overflow-y-auto h-[calc(100%-32px)]">
                    <PreviewContent
                      device="mobile"
                      survey={survey}
                      questions={currentQuestions}
                      answers={answers}
                      validationErrors={validationErrors}
                      onAnswerChange={handleAnswerChange}
                      isLastPage={isEffectivelyLastPage}
                      currentPage={currentPage}
                      onBack={handleBack}
                      onNext={handleNext}
                      questionIdToBlockMap={questionIdToBlockMap}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
