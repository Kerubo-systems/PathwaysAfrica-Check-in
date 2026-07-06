/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Shield, Heart, Compass } from 'lucide-react';
import Button from '../Button';

interface LandingViewProps {
  onStart: () => void;
  setView: (view: 'landing' | 'survey' | 'about' | 'privacy' | 'admin') => void;
}

export default function LandingView({ onStart, setView }: LandingViewProps) {
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && typeof data.totalCount === 'number') {
          setStudentCount(data.totalCount);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch public stats', err);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="relative overflow-hidden" id="landing-view-root">
      <div className="relative py-8 sm:py-12 md:py-16">
        {/* Ambient background glow shapes */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sleek-blob/50 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-sleek-peach/50 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="space-y-6 lg:col-span-6 text-center lg:text-left">
            {/* Soft Wellness Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sleek-accent-light border border-sleek-border/30 text-xs font-semibold text-sleek-accent animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5 fill-sleek-accent/10 animate-spin-slow" />
              Pathways Africa Student Portal
            </div>
 
            {/* Title & Subtitle */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
              Your voice <br/>
              <span className="italic font-normal relative">
                matters
                <span className="absolute -inset-2 bg-emerald-400/20 dark:bg-emerald-400/35 blur-xl rounded-full opacity-0 dark:opacity-50 -z-10 animate-pulse-slow" />
                <span className="text-emerald-700 dark:text-[#34d399] font-medium">.</span>
              </span>
            </h1>

            <p className="font-sans text-base sm:text-lg md:text-xl text-sleek-muted dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              This space helps mentors better understand how you're doing so we can provide the support that matters most to your journey.
            </p>

            {/* Trust Slogan Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-sleek-muted dark:text-slate-400">
              <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5 text-sleek-accent" />
                100% Private & Secure
              </span>
              <span className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-full">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" />
                Optional Identification
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onStart}
                icon={<ArrowRight className="w-5 h-5 animate-pulse-slow" />}
                iconPosition="right"
                className="w-full sm:w-auto px-8 py-4"
                id="landing-cta-start"
              >
                Start Check-in
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setView('about')}
                className="w-full sm:w-auto px-8 py-4"
                id="landing-cta-why"
              >
                Learn More
              </Button>
            </div>

            {/* Dynamic Community Tracker */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-6">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF7F2] dark:border-slate-900 bg-emerald-800 text-emerald-50 flex items-center justify-center font-display text-xs font-bold shadow-sm">🎓</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF7F2] dark:border-slate-900 bg-emerald-100 text-emerald-900 flex items-center justify-center font-display text-xs font-bold shadow-sm">🌍</div>
                <div className="w-10 h-10 rounded-full border-2 border-[#FAF7F2] dark:border-slate-900 bg-emerald-700 text-emerald-50 flex items-center justify-center font-display text-xs font-bold shadow-sm">🌱</div>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {studentCount === null ? (
                  <span>Checking participation metrics...</span>
                ) : studentCount === 0 ? (
                  <span>Be the first student to check in this week!</span>
                ) : (
                  <span>Joined by <strong className="text-sleek-accent dark:text-[#34d399] font-extrabold">{studentCount}</strong> {studentCount === 1 ? 'student' : 'students'} so far</span>
                )}
              </p>
            </div>
          </div>

          {/* Gorgeous Illustration */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative max-w-md sm:max-w-lg lg:max-w-none w-full">
              {/* Decorative background circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-40">
                <svg width="600" height="600" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="400" cy="400" r="399.5" stroke="#5A5A40" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>

              {/* Floating Sparkles for sparkle-appeal */}
              <div className="absolute -top-6 -left-6 text-emerald-500/50 dark:text-emerald-400/70 animate-float pointer-events-none">
                <Sparkles className="w-8 h-8 fill-emerald-500/10" />
              </div>
              <div className="absolute top-1/3 -right-6 text-amber-500/40 dark:text-amber-400/60 animate-float-delayed pointer-events-none">
                <Sparkles className="w-6 h-6 fill-amber-500/10" />
              </div>

              {/* Main Image frame */}
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 aspect-video transition-all hover:scale-[1.01] duration-300">
                <img
                  src="/src/assets/images/students_learning_1783014094443.jpg"
                  alt="Pathways Students learning together in a supportive environment"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  id="landing-hero-image"
                />
              </div>

              {/* Float floating stats card */}
              <div className="absolute -bottom-6 left-6 sm:left-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-xs animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sleek-accent-light dark:bg-slate-900 text-sleek-accent flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-display font-bold text-sleek-charcoal dark:text-slate-100 text-sm">
                      Supportive Community
                    </span>
                    <span className="block font-sans text-xs text-sleek-muted dark:text-slate-400">
                      Helping you navigate your applications
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature grid explaining how check-in works */}
        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800/80">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="font-display font-bold text-3xl text-sleek-charcoal dark:text-slate-100">
              A gentle wellness companion
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
              Unlike traditional forms, this space is built around emotional care, reflection, and proactive support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/80 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-full bg-sleek-accent-light text-sleek-accent flex items-center justify-center font-display font-bold text-lg mb-4">
                1
              </div>
              <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100 mb-2">
                Share How You Feel
              </h4>
              <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed">
                Choose a warm emoji card that best describes your stress level, fatigue, or excitement today.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-full bg-sleek-peach text-sleek-charcoal flex items-center justify-center font-display font-bold text-lg mb-4">
                2
              </div>
              <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100 mb-2">
                Identify Challenges
              </h4>
              <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed">
                Pinpoint exactly which parts of your college applications (essays, financial aid, or motivation) are causing stress.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-full bg-sleek-accent-light text-sleek-accent flex items-center justify-center font-display font-bold text-lg mb-4">
                3
              </div>
              <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100 mb-2">
                Get Targeted Support
              </h4>
              <p className="text-sm text-sleek-muted dark:text-slate-400 leading-relaxed">
                Your responses go straight to the mentors, who use them to design workshops and reach out where they can help most.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
