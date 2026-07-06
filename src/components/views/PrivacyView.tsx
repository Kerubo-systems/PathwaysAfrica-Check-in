/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Lock, EyeOff, Sparkles, ArrowLeft, Heart, CheckCircle } from 'lucide-react';
import Button from '../Button';

interface PrivacyViewProps {
  onBackToHome: () => void;
  onStartSurvey: () => void;
}

export default function PrivacyView({ onBackToHome, onStartSurvey }: PrivacyViewProps) {
  return (
    <div className="relative overflow-hidden py-10 sm:py-14" id="privacy-view-root">
      {/* Background glow shape */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-sleek-blob/50 dark:bg-slate-900 ambient-glow" />

      <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-12">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sleek-muted dark:text-slate-400 hover:text-sleek-charcoal dark:hover:text-slate-100 transition-colors cursor-pointer"
            id="privacy-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <span className="text-xs font-mono font-bold text-sleek-muted dark:text-slate-500 uppercase tracking-widest">
            Privacy Framework
          </span>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sleek-accent-light border border-sleek-border/30 text-xs font-semibold text-sleek-accent">
            <Lock className="w-3.5 h-3.5" />
            Your Safety is Our Top Priority
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
            Privacy & Comfort 💙
          </h2>
          <p style={{ color: '#979540' }} className="text-base sm:text-lg leading-relaxed font-medium">
            Sharing your authentic feelings requires deep trust. We have constructed this check-in tool with strict guardrails to protect your identity and answers.
          </p>
        </div>

        {/* Key Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-sleek-accent-light text-sleek-accent flex items-center justify-center shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
              Completely Optional Identity
            </h4>
            <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed">
              You are never forced to identify yourself. You can leave the name and email fields entirely blank, making your check-in anonymous to the system and mentors.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-sleek-peach text-sleek-charcoal flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
              No Public Sharing
            </h4>
            <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed">
              Your feedback is only visible to selected, trained Pathways mentors. No information, response, or personal details will ever be shared with anyone outside the program.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-sleek-peach text-sleek-charcoal flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-rose-500/10" />
            </div>
            <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
              Support Improvement Only
            </h4>
            <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed">
              We collect responses solely to plan helpful group sessions, spot stress trends across the student cohort, and check-in individually if you request follow-up.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-sleek-accent-light text-sleek-accent flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
              Leave Blank Freely
            </h4>
            <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed">
              If a question does not feel comfortable for you, simply leave it blank. You can skip any optional part of the check-in without affecting your program standing.
            </p>
          </div>
        </div>

        {/* Security Summary Alert */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-sleek-accent-light dark:bg-slate-900 border border-sleek-border/30 text-center text-xs text-sleek-muted dark:text-slate-400 space-y-2">
          <p className="font-semibold text-sm text-sleek-accent">
            🛡️ Local Encryption & Data Safety
          </p>
          <p className="leading-relaxed text-sm">
            In compliance with student welfare frameworks, all entries stored in this browser session remain sandbox-confined and are deleted once the session expires. We are fully committed to protecting your online presence and peace of mind.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartSurvey}
            className="w-full sm:w-auto"
            id="privacy-cta-start"
          >
            I feel safe, start check-in
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onBackToHome}
            className="w-full sm:w-auto"
            id="privacy-cta-back"
          >
            Read About Platform
          </Button>
        </div>
      </div>
    </div>
  );
}
