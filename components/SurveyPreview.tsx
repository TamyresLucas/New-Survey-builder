import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Survey, Question } from '../types';
import { QuestionType } from '../types';
import { XIcon, ArrowRightAltIcon, SignalIcon, BatteryIcon } from './icons';
import { PreviewQuestion } from './PreviewQuestion';

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
}

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
  device
}) => {
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
      <div className={`mt-8 flex items-center gap-4 ${currentPage > 0 ? 'justify-between' : 'justify-end'}`}>
        {currentPage > 0 && (
          <button
            onClick={onBack}
            className={`px-6 py-3 text-sm font-semibold text-primary rounded-full hover:bg-primary-container ${device === 'mobile' ? 'flex-1' : ''}`}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-on-primary bg-primary rounded-full hover:opacity-90 ${device === 'mobile' ? 'flex-1' : ''}`}
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

  const pages = useMemo(() => {
    const allQuestions = survey.blocks.flatMap(b => b.questions);
    
    if (allQuestions.length === 0) return [[]];

    return allQuestions.reduce((acc, question) => {
      if (question.type === QuestionType.PageBreak) {
        if (acc[acc.length - 1].length > 0) {
            acc.push([]);
        }
      } else {
        acc[acc.length - 1].push(question);
      }
      return acc;
    }, [[]] as Question[][]);
  }, [survey]);

  useEffect(() => {
    setAnswers(new Map());
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
  const isLastPage = currentPage === pages.length - 1;

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => new Map(prev).set(questionId, answer));
    if (validationErrors.has(questionId)) {
      setValidationErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(questionId);
        return newErrors;
      });
    }
  };

  const validatePage = (): boolean => {
    const errors = new Set<string>();
    for (const q of currentQuestions) {
      if (!q.forceResponse) continue;

      const answer = answers.get(q.id);
      let isAnswered = false;

      if (answer !== undefined && answer !== null) {
        switch (q.type) {
          case QuestionType.TextEntry:
            isAnswered = typeof answer === 'string' && answer.trim() !== '';
            break;
          case QuestionType.Radio:
            isAnswered = typeof answer === 'string' && answer.trim() !== '';
            break;
          case QuestionType.Checkbox:
            isAnswered = answer instanceof Set && answer.size > 0;
            break;
          case QuestionType.ChoiceGrid:
            isAnswered = answer instanceof Map && answer.size === (q.choices || []).length;
            break;
          default:
            isAnswered = true;
        }
      }

      if (!isAnswered) {
        errors.add(q.id);
      }
    }
    setValidationErrors(errors);
    return errors.size === 0;
  };
  
  const handleSubmit = () => {
      alert("Survey Submitted! (Not really)");
      onClose();
  }

  const handleNext = () => {
    if (!validatePage()) {
      return;
    }

    setPageHistory(prev => [...prev, currentPage]);

    let destination: string | null = null;
    const questionsOnPage = pages[currentPage];

    for (let i = questionsOnPage.length - 1; i >= 0; i--) {
      const question = questionsOnPage[i];
      const logic = question.skipLogic;
      const answer = answers.get(question.id);

      if (logic && answer) {
        if (logic.type === 'simple') {
          destination = logic.skipTo;
          break;
        } else if (logic.type === 'per_choice' && (typeof answer === 'string' || answer instanceof Set)) {
            const answerSet = typeof answer === 'string' ? new Set([answer]) : answer;
            for (const ans of Array.from(answerSet).reverse()) {
                const rule = logic.rules.find(r => r.choiceId === ans);
                if (rule && rule.skipTo) {
                    destination = rule.skipTo;
                    break;
                }
            }
            if (destination) break;
        }
      }
    }

    if (destination === 'end') {
      handleSubmit();
      return;
    }

    let nextPageIndex = -1;

    if (destination && destination !== 'next') {
      nextPageIndex = pages.findIndex(page => page.some(q => q.id === destination));
    }

    if (nextPageIndex === -1) {
      if (isLastPage) {
        handleSubmit();
        return;
      }
      nextPageIndex = currentPage + 1;
    }

    setCurrentPage(nextPageIndex);
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const lastPageIndex = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(lastPageIndex);
    }
  };

  const commonContentProps = {
    survey: survey,
    questions: currentQuestions,
    answers: answers,
    validationErrors: validationErrors,
    onAnswerChange: handleAnswerChange,
    isLastPage: isLastPage,
    currentPage: currentPage,
    onBack: handleBack,
    onNext: handleNext,
  };


  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col font-sans">
      <header className="flex-shrink-0 bg-surface-container border-b border-outline-variant p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Survey Preview</h2>
        <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high">
          <XIcon className="text-xl" />
          <span className="sr-only">Close Preview</span>
        </button>
      </header>
      <main className="flex-1 overflow-hidden flex items-stretch divide-x divide-outline-variant">
        {/* Desktop Pane */}
        <div className="flex-1 flex justify-center items-center p-4 sm:p-8">
            <div
              ref={desktopPaneRef}
              onScroll={() => syncScroll('desktop')}
              className="w-full h-full max-w-3xl bg-surface-container rounded-lg border border-outline-variant p-6 sm:p-10 shadow-sm overflow-y-auto"
            >
              <PreviewContent device="desktop" {...commonContentProps} />
            </div>
        </div>
        {/* Mobile Pane */}
        <div className="flex-shrink-0 flex justify-center items-center p-4 sm:p-8 bg-surface-container-high w-[450px]">
            <div
              className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[calc(100vh-240px)] min-h-[500px] max-h-[700px] w-[340px] shadow-2xl"
            >
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
                <div 
                  ref={mobilePaneRef} 
                  onScroll={() => syncScroll('mobile')}
                  className="overflow-y-auto h-[calc(100%-32px)]"
                >
                  <div className="p-4">
                    <PreviewContent device="mobile" {...commonContentProps} />
                  </div>
                </div>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};