/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  id?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center font-display font-semibold rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sleek-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-sleek-accent text-white hover:scale-105 hover:bg-sleek-accent/95 shadow-lg shadow-sleek-accent/10 hover:shadow-sleek-accent/25',
    secondary:
      'bg-sleek-peach text-sleek-charcoal hover:scale-105 hover:bg-sleek-peach/90 shadow-sm',
    outline:
      'border border-slate-200 dark:border-slate-800 text-sleek-accent dark:text-slate-300 bg-white/80 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sleek-charcoal dark:hover:text-slate-100 hover:border-sleek-accent/50',
    ghost:
      'text-sleek-muted dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sleek-charcoal dark:hover:text-slate-100',
    soft: 'bg-sleek-accent-light dark:bg-slate-800 text-sleek-accent dark:text-slate-200 border border-sleek-border/30 dark:border-slate-700/50 hover:bg-sleek-border/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${baseStyle}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
