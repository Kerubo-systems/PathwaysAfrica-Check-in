/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ProgressBarProps {
  currentStep: number; // 0-based index
  totalSteps: number;
  stepLabels?: string[];
}

export default function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const percentage = Math.round(((currentStep) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full space-y-3" id="progress-container">
      {/* Percentage & Step label */}
      <div className="flex items-center justify-between text-[11px] font-sans font-bold tracking-wider uppercase">
        <span className="text-sleek-accent dark:text-slate-300 bg-sleek-accent-light dark:bg-slate-800 px-3 py-1.5 rounded-full border border-sleek-border/30">
          Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
        </span>
        <span className="text-sleek-muted dark:text-slate-400 font-medium">
          {percentage}% Complete
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200/30">
        <div
          className="h-full bg-sleek-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          id="progress-bar-fill"
        />
      </div>

      {/* Step dots (Hidden on extra small screens) */}
      <div className="hidden sm:flex items-center justify-between gap-1 pt-1" id="step-dots-row">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-sleek-accent'
                  : isActive
                  ? 'bg-sleek-accent/50'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
              title={stepLabels ? stepLabels[idx] : `Step ${idx + 1}`}
              id={`step-dot-${idx}`}
            />
          );
        })}
      </div>
    </div>
  );
}
