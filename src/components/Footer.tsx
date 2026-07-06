/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Globe, MessageSquare, ShieldAlert } from 'lucide-react';

interface FooterProps {
  setView: (view: 'landing' | 'survey' | 'about' | 'privacy' | 'admin') => void;
}

export default function Footer({ setView }: FooterProps) {
  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Slogan and Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-sleek-charcoal dark:text-slate-100">
                Pathways Africa
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-sleek-accent animate-pulse" />
            </div>
            <p className="text-sm text-sleek-muted dark:text-slate-400 max-w-sm leading-relaxed">
              Empowering talented minds across Africa to achieve their highest educational aspirations. Always listening, always supporting.
            </p>
            <div className="text-xs text-sleek-muted dark:text-slate-500 flex items-center gap-1.5 font-medium">
              Made with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" /> for the Cohort
            </div>
          </div>

          {/* Quick Support Slogan */}
          <div className="bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-4 md:col-span-1">
            <p className="text-xs font-semibold text-sleek-accent dark:text-sleek-accent uppercase tracking-widest mb-1 font-mono">
              Daily Reminder
            </p>
            <blockquote className="text-sm font-medium text-sleek-muted dark:text-slate-300 italic">
              "Progress doesn't have to be perfect. Every single step counts toward your journey."
            </blockquote>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end text-sm">
            <div className="space-y-2.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Resources
              </span>
              <ul className="space-y-2 font-medium">
                <li>
                  <button
                    onClick={() => setView('landing')}
                    className="text-sleek-muted dark:text-slate-300 hover:text-sleek-accent dark:hover:text-sleek-accent transition-colors cursor-pointer"
                    id="footer-link-home"
                  >
                    Home Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setView('survey')}
                    className="text-sleek-muted dark:text-slate-300 hover:text-sleek-accent dark:hover:text-sleek-accent transition-colors cursor-pointer"
                    id="footer-link-checkin"
                  >
                    Check-in Survey
                  </button>
                </li>

              </ul>
            </div>

            <div className="space-y-2.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Guidance
              </span>
              <ul className="space-y-2 font-medium">
                <li>
                  <button
                    onClick={() => setView('about')}
                    className="text-sleek-muted dark:text-slate-300 hover:text-sleek-accent dark:hover:text-sleek-accent transition-colors cursor-pointer"
                    id="footer-link-about"
                  >
                    About Platform
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setView('privacy')}
                    className="text-sleek-muted dark:text-slate-300 hover:text-sleek-accent dark:hover:text-sleek-accent transition-colors cursor-pointer"
                    id="footer-link-privacy"
                  >
                    Privacy & Security
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setView('admin')}
                    className="text-sleek-muted dark:text-slate-300 hover:text-sleek-accent dark:hover:text-sleek-accent transition-colors cursor-pointer text-left"
                    id="footer-link-admin"
                  >
                    Admin Portal
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Pathways Africa Check-in. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Global Access
            </span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Secure SSL Connection
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
