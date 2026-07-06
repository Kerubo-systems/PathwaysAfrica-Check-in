/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxCardProps {
  label: string;
  isSelected: boolean;
  onChange: () => void;
  id?: string;
  key?: string;
}

export default function CheckboxCard({ label, isSelected, onChange, id }: CheckboxCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange();
    }
  };

  return (
    <button
      onClick={onChange}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      className={`
        w-full p-4 text-left rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-sleek-accent focus-visible:ring-offset-2 select-none
        ${
          isSelected
            ? 'border-sleek-accent bg-sleek-accent-light text-sleek-accent dark:border-sleek-accent dark:bg-slate-800'
            : 'border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 text-sleek-charcoal dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-800'
        }
      `}
      id={id || `checkbox-card-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <span className="font-sans text-sm font-semibold">{label}</span>

      {/* Tactile checkbox visual indicator */}
      <div
        className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-sleek-accent border-sleek-accent text-white scale-105'
            : 'border-slate-300 dark:border-slate-700 bg-white'
        }`}
      >
        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>
    </button>
  );
}
