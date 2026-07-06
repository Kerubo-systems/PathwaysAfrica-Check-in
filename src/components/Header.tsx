/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sun, Moon, Heart, Menu, X, Info, Shield, HelpCircle, FileText, BarChart2, Lock } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'survey' | 'about' | 'privacy' | 'admin';
  setView: (view: 'landing' | 'survey' | 'about' | 'privacy' | 'admin') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Header({ currentView, setView, theme, toggleTheme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Heart },
    { id: 'survey', label: 'Check-in', icon: FileText },
    { id: 'about', label: 'Why Check-in', icon: Info },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'admin', label: 'Admin Portal', icon: Lock },
  ] as const;

  const handleNavClick = (view: 'landing' | 'survey' | 'about' | 'privacy' | 'admin') => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-300 border-b bg-white/70 border-slate-100 dark:bg-slate-900/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left group transition-transform duration-200 hover:scale-[1.01]"
          id="brand-logo"
        >
          <div className="w-9 h-9 bg-sleek-accent rounded-full flex items-center justify-center text-white shadow-md shadow-sleek-accent/10">
            <Heart className="w-5 h-5 fill-white/10 animate-pulse-slow" />
          </div>
          <div>
            <span className="block font-display font-bold text-lg tracking-tight text-sleek-charcoal dark:text-slate-100">
              Pathways <span className="font-normal opacity-60 italic text-sm">Check-in</span>
            </span>
            <span className="block font-sans text-[10px] uppercase tracking-widest font-bold text-sleek-muted dark:text-slate-400 -mt-0.5">
              Africa Cohort Support
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" id="desktop-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-sleek-accent-light text-sleek-accent dark:bg-slate-800/80 dark:text-slate-200 font-semibold'
                    : 'text-sleek-muted dark:text-slate-300 hover:bg-sleek-bg/80 dark:hover:bg-slate-800/60 hover:text-sleek-charcoal dark:hover:text-slate-100'
                }`}
                id={`nav-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-full border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sleek-muted dark:text-slate-400 cursor-pointer transition-colors duration-200"
            id="theme-toggler"
          >
            {theme === 'light' ? (
              <Moon className="w-4.5 h-4.5 text-sleek-accent animate-float" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse-slow" />
            )}
          </button>

          {/* Start Check-in Shortcut (Desktop Only) */}
          {currentView !== 'survey' && (
            <button
              onClick={() => handleNavClick('survey')}
              className="hidden sm:inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-sleek-accent dark:bg-sleek-accent rounded-full hover:scale-105 shadow-md shadow-sleek-accent/15 hover:shadow-sleek-accent/25 active:scale-95 transition-all cursor-pointer"
              id="header-cta-start"
            >
              Start Check-in
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2.5 rounded-full border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sleek-muted dark:text-slate-400 cursor-pointer transition-colors"
            id="mobile-menu-toggler"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-left text-base font-medium transition-all ${
                    isActive
                      ? 'bg-sleek-accent-light text-sleek-accent dark:bg-slate-800 dark:text-slate-200 font-semibold'
                      : 'text-sleek-muted dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  id={`mobile-nav-${item.id}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            {/* Mobile CTAs */}
            {currentView !== 'survey' && (
              <div className="pt-2">
                <button
                  onClick={() => handleNavClick('survey')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-sleek-accent rounded-full hover:scale-105 active:scale-95 shadow-md shadow-sleek-accent/10 transition-transform"
                  id="mobile-header-cta"
                >
                  <FileText className="w-5 h-5" />
                  Start Check-in
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
