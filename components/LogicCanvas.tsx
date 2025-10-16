import React, { memo, useMemo } from 'react';
import type { Survey, ToolboxItemData, Question, SkipLogicRule } from '../types';
import LogicQuestionCard from './LogicQuestionCard';
import { QuestionType } from '../types';
import LogicBranch from './LogicBranch';

interface LogicCanvasProps {
  survey: Survey;
  toolboxItems: ToolboxItemData[];
}

const findQuestionById = (survey: Survey, id: string): Question | undefined => {
    return survey.blocks.flatMap(b => b.questions).find(q => q.id === id);
};

const Connector: React.FC = () => (
    <div className="relative w-24 flex-shrink-0 flex items-center" aria-hidden="true">
        <div className="w-full h-0.5 bg-primary" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-primary" />
    </div>
);

interface BranchInfo {
    skippedQuestion: Question;
    targetQuestion: Question;
    nextRule: SkipLogicRule;
    skipRule: SkipLogicRule;
    isSimpleSkip?: boolean;
}

const LogicCanvas: React.FC<LogicCanvasProps> = memo(({ survey, toolboxItems }) => {
  const allQuestions = useMemo(() => 
    survey.blocks
      .flatMap(block => block.questions)
      .filter(q => q.type !== QuestionType.PageBreak && q.type !== QuestionType.Description),
    [survey]
  );

  const { visibleQuestions, branchInfoMap } = useMemo(() => {
    const branchInfoMap = new Map<string, BranchInfo>();
    const skippedQuestionIds = new Set<string>();

    // This visualization supports a specific pattern: a question skipping over the single, immediately following question.
    // We iterate up to length - 2 because we need a source, a skipped, and a target question.
    for (let i = 0; i < allQuestions.length - 2; i++) {
        const question = allQuestions[i];
        const nextQuestionInArray = allQuestions[i + 1];
        const targetQuestionCandidate = allQuestions[i + 2];
        
        // Use draft logic if it exists, otherwise fall back to confirmed logic.
        // This ensures the canvas reflects what the user is currently editing in the sidebar.
        const skipLogic = question.draftSkipLogic ?? question.skipLogic;
        
        if (!skipLogic) continue;

        // Pattern 1: Simple skip (e.g., from a Text Entry question)
        if (skipLogic.type === 'simple') {
            if (skipLogic.skipTo === targetQuestionCandidate.id) {
                branchInfoMap.set(question.id, {
                    skippedQuestion: nextQuestionInArray,
                    targetQuestion: targetQuestionCandidate,
                    // These rules are for the branch component to render paths.
                    // Confirmation status isn't relevant for visualization.
                    nextRule: { choiceId: '', skipTo: 'next' },
                    skipRule: { choiceId: '', skipTo: skipLogic.skipTo },
                    isSimpleSkip: true,
                });
                skippedQuestionIds.add(nextQuestionInArray.id);
                continue;
            }
        }
        
        // Pattern 2: Per-choice skip (e.g., from a Radio Button question)
        if (skipLogic.type === 'per_choice') {
            const rules = skipLogic.rules;
            // We currently only visualize simple 2-way branches
            if (rules.length === 2) {
                const nextRule = rules.find(r => r.skipTo === 'next');
                const skipRule = rules.find(r => r.skipTo !== 'next' && r.skipTo !== 'end');
                
                if (nextRule && skipRule && skipRule.skipTo === targetQuestionCandidate.id) {
                    branchInfoMap.set(question.id, {
                        skippedQuestion: nextQuestionInArray,
                        targetQuestion: targetQuestionCandidate,
                        nextRule: nextRule,
                        skipRule: skipRule,
                    });
                    skippedQuestionIds.add(nextQuestionInArray.id);
                }
            }
        }
    }

    const visibleQuestions = allQuestions.filter(q => !skippedQuestionIds.has(q.id));
    return { visibleQuestions, branchInfoMap };
  }, [allQuestions]);


  return (
    <div className="flex-1 overflow-auto bg-surface p-8">
      <div className="flex items-center h-full">
        {visibleQuestions.map((question, index) => {
            const branchInfo = branchInfoMap.get(question.id);
            const isLast = index === visibleQuestions.length - 1;

            return (
              <React.Fragment key={question.id}>
                <LogicQuestionCard
                  question={question}
                  toolboxItems={toolboxItems}
                  isFirst={index === 0}
                  isLast={!branchInfo && isLast}
                />
                
                {branchInfo ? (
                    <LogicBranch
                        fromQuestion={question}
                        skippedQuestion={branchInfo.skippedQuestion}
                        nextRule={branchInfo.nextRule}
                        skipRule={branchInfo.skipRule}
                        toolboxItems={toolboxItems}
                        isSimpleSkip={branchInfo.isSimpleSkip}
                    />
                ) : !isLast ? (
                  <Connector />
                ) : null}

              </React.Fragment>
            );
        })}
      </div>
    </div>
  );
});

export default LogicCanvas;