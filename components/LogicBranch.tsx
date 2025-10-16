import React from 'react';
import type { Question, SkipLogicRule, ToolboxItemData } from '../types';
import { parseChoice } from '../utils';
import LogicQuestionCard from './LogicQuestionCard';

interface LogicBranchProps {
  fromQuestion: Question;
  skippedQuestion: Question;
  nextRule: SkipLogicRule;
  skipRule: SkipLogicRule;
  toolboxItems: ToolboxItemData[];
  isSimpleSkip?: boolean;
}

const LogicBranch: React.FC<LogicBranchProps> = ({ fromQuestion, skippedQuestion, nextRule, skipRule, toolboxItems, isSimpleSkip = false }) => {
  const nextChoice = !isSimpleSkip ? fromQuestion.choices?.find(c => c.id === nextRule.choiceId) : null;
  const skipChoice = !isSimpleSkip ? fromQuestion.choices?.find(c => c.id === skipRule.choiceId) : null;
  
  const nextLabel = isSimpleSkip ? 'If not answered' : (nextChoice ? parseChoice(nextChoice.text).label : 'Next');
  const skipLabel = isSimpleSkip ? 'If answered' : (skipChoice ? parseChoice(skipChoice.text).label : 'Skip');

  // Coordinates for SVG paths based on component layout and connector positions
  const startX = -24;
  const endX = 408;
  const skippedLeftX = 56;
  const skippedRightX = 328;
  const mainY = 80;
  const skippedY = 308;
  
  // Calculate control points for smooth C-curves that ensure vertical starts and horizontal ends
  const controlPointFactor = 0.6;
  // 'Down' path from Q1 to Q2 (starts vertical, ends horizontal)
  const downCurveControl1Y = mainY + (skippedY - mainY) * controlPointFactor;
  const downCurveControl2X = startX + (skippedLeftX - startX) * (1 - controlPointFactor);
  // 'Up' path from Q2 to Q3 (starts horizontal, ends vertical)
  const upCurveControl1X = skippedRightX + (endX - skippedRightX) * (1 - controlPointFactor);
  const upCurveControl2Y = mainY + (skippedY - mainY) * controlPointFactor;

  return (
    <div className="relative w-96 h-40 flex-shrink-0 mx-8">
      {/* Skipped Question Card */}
      <div className="absolute top-[13.5rem] left-1/2 -translate-x-1/2 z-10">
        <LogicQuestionCard question={skippedQuestion} toolboxItems={toolboxItems} />
      </div>

      {/* SVG for Connectors */}
      <svg width="100%" height="100%" className="absolute inset-0 overflow-visible" aria-hidden="true">
        <defs>
          <marker
            id="logic-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--color-primary))" />
          </marker>
        </defs>

        {/* Path for the main skip flow (straight across) */}
        <g>
          <path
            d={`M ${startX} ${mainY} H ${endX}`}
            stroke="hsl(var(--color-primary))"
            strokeWidth="1.5"
            markerEnd="url(#logic-arrow)"
            fill="none"
          />
          <text x="50%" y="70" dominantBaseline="auto" textAnchor="middle" fill="hsl(var(--color-on-surface-variant))" fontSize="12" className="font-sans">
            {skipLabel}
          </text>
        </g>
        
        {/* Path down to the skipped question (C-curve) */}
        <g>
          <path
            d={`M ${startX} ${mainY} C ${startX} ${downCurveControl1Y}, ${downCurveControl2X} ${skippedY}, ${skippedLeftX} ${skippedY}`}
            stroke="hsl(var(--color-primary))"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#logic-arrow)"
          />
          <text x="-10" y="194" dominantBaseline="middle" textAnchor="start" fill="hsl(var(--color-on-surface-variant))" fontSize="12" className="font-sans">
            {nextLabel}
          </text>
        </g>
        
        {/* Path from the skipped question rejoining the main flow (C-curve) */}
        <path
          d={`M ${skippedRightX} ${skippedY} C ${upCurveControl1X} ${skippedY}, ${endX} ${upCurveControl2Y}, ${endX} ${mainY}`}
          stroke="hsl(var(--color-primary))"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default LogicBranch;