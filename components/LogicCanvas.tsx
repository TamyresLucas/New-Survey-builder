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

    for (let i = 0; i < allQuestions.length - 1; i++) {
        const question = allQuestions[i];
        const nextQuestionInArray = allQuestions[i + 1];
        
        const skipLogic = question.skipLogic;
        
        if (nextQuestionInArray && skipLogic?.type === 'per_choice') {
            const confirmedRules = skipLogic.rules.filter(r => r.isConfirmed);
            if (confirmedRules.length !== 2) continue;

            const nextRule = confirmedRules.find(r => r.skipTo === 'next');
            const skipRule = confirmedRules.find(r => r.skipTo !== 'next' && r.skipTo !== 'end');
            
            if (nextRule && skipRule) {
                const targetQuestion = findQuestionById(survey, skipRule.skipTo);
                
                // This is the specific visual pattern: a question's logic skips over the immediately following question.
                if (targetQuestion && allQuestions[i + 2]?.id === targetQuestion.id) {
                    branchInfoMap.set(question.id, {
                        skippedQuestion: nextQuestionInArray,
                        targetQuestion: targetQuestion,
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
  }, [allQuestions, survey]);


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