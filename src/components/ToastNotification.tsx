/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastNotificationProps {
  toast: Toast | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-300',
    info: 'border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-300',
    warning: 'border-amber-100 dark:border-amber-950/50 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300',
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-float"
      id="toast-notification-banner"
    >
      <div
        className={`
          flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300
          ${borderColors[toast.type || 'success']}
        `}
      >
        {icons[toast.type || 'success']}

        <div className="flex-1 text-sm font-semibold leading-relaxed">
          {toast.message}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
