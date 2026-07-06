/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FeelingOption } from '../types';

interface EmojiCardProps {
  option: FeelingOption;
  isSelected: boolean;
  onSelect: () => void;
  key?: string;
}

export default function EmojiCard({ option, isSelected, onSelect }: EmojiCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <button
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      className={`
        w-full p-5 text-left rounded-2xl border-2 transition-all duration-300 outline-none cursor-pointer flex flex-col sm:flex-row items-center sm:items-start gap-4 focus-visible:ring-2 focus-visible:ring-sleek-accent focus-visible:ring-offset-2
        ${
          isSelected
            ? `${option.color} ${option.darkColor} border-sleek-accent dark:border-sleek-accent shadow-lg shadow-sleek-accent/10 scale-[1.02]`
            : 'border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 shadow-xs hover:shadow-md'
        }
      `}
      id={`emoji-card-${option.label.toLowerCase()}`}
    >
      {/* Large animated emoji */}
      <div
        className={`text-4xl select-none transition-transform duration-300 ${
          isSelected ? 'scale-115 rotate-6 animate-bounce-once' : 'group-hover:scale-110'
        }`}
        aria-hidden="true"
      >
        {option.emoji}
      </div>

      {/* Label and description */}
      <div className="flex-1 text-center sm:text-left space-y-1">
        <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
          {option.label}
          {isSelected && (
            <span className="w-2 h-2 rounded-full bg-sleek-accent" />
          )}
        </h4>
        <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed max-w-sm">
          {option.description}
        </p>
      </div>
    </button>
  );
}
