/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  id?: string;
}

export default function Slider({
  value,
  min = 1,
  max = 10,
  onChange,
  leftLabel = 'Very Lost',
  rightLabel = 'Very Confident',
  id,
}: SliderProps) {
  // Simple textual labels corresponding to value ranges for better clarity and emotional support
  const getHelperText = (val: number) => {
    if (val <= 2) return 'Feeling quite uncertain or overwhelmed with where to begin.';
    if (val <= 4) return 'Getting some ideas down, but seeking more clear directions.';
    if (val <= 6) return 'Making steady progress, feeling okay about the path ahead.';
    if (val <= 8) return 'Feeling comfortable and on top of most application steps.';
    return 'Excited and confident in your materials, ready to hit submit!';
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="w-full space-y-6" id={id || 'survey-slider-group'}>
      {/* Value Bubble Indicator */}
      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="w-16 h-16 rounded-full bg-sleek-accent text-white flex items-center justify-center font-display font-black text-2xl shadow-lg shadow-sleek-accent/10 scale-105 border-4 border-white dark:border-slate-800 transition-transform duration-300">
          {value}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-sleek-accent dark:text-indigo-400 font-sans">
          Confidence Level
        </p>
      </div>

      {/* Actual Slider Input */}
      <div className="relative pt-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sleek-accent dark:accent-indigo-500 focus:outline-none"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          id="confidence-range-input"
        />

        {/* 1-10 Tick marks */}
        <div className="flex justify-between px-1.5 mt-2.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
          {Array.from({ length: max - min + 1 }).map((_, i) => (
            <span key={i} className={value === min + i ? 'text-sleek-accent dark:text-indigo-400 font-bold' : ''}>
              {min + i}
            </span>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs font-semibold text-sleek-muted dark:text-slate-400 px-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      {/* Dynamic guidance response card */}
      <div className="p-4 rounded-xl border border-dashed border-sleek-border/30 dark:border-slate-800 bg-sleek-accent-light dark:bg-slate-900/30 text-center transition-all duration-300">
        <p className="text-xs sm:text-sm font-medium text-sleek-muted dark:text-slate-400 italic">
          "{getHelperText(value)}"
        </p>
      </div>
    </div>
  );
}
