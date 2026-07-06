/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  wordCount?: number;
  maxWords?: number;
  value?: string;
  className?: string;
  id?: string;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export default function TextArea({
  label,
  helperText,
  value = '',
  wordCount,
  maxWords,
  className = '',
  id,
  ...props
}: TextAreaProps) {
  return (
    <div className="w-full space-y-1.5" id={`${id || 'textarea'}-container`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-sleek-charcoal dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          id={id}
          value={value}
          className={`
            w-full min-h-[140px] p-4 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-sans text-sm leading-relaxed transition-all duration-200 outline-none focus:border-sleek-accent dark:focus:border-sleek-accent focus:shadow-md
            ${className}
          `}
          {...props}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-sleek-muted dark:text-slate-500 px-1 font-medium">
        <span>{helperText || ''}</span>
        {maxWords && (
          <span className="font-mono">
            {wordCount || 0} / {maxWords} words
          </span>
        )}
      </div>
    </div>
  );
}
