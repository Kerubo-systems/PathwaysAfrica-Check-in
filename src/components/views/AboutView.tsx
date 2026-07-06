/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Heart, Star, Compass, ArrowLeft, GraduationCap, 
  Users, Lock, Eye, Check, BarChart3, ShieldCheck, 
  Smile, Frown, Sparkles, MessageSquare 
} from 'lucide-react';
import Button from '../Button';

interface AboutViewProps {
  onBackToHome: () => void;
  onStartSurvey: () => void;
}

const DEMO_COHORT = [
  {
    id: 1,
    identify: true,
    name: 'Kofi Owusu',
    email: 'kofi.owusu@example.com',
    feeling: 'Excited',
    emoji: '😁',
    confidence: 9,
    stresses: ['Personal Statement', 'Motivation'],
    supports: ['Essay Review'],
    weeklyWin: 'Finished my personal statement introduction and outline.',
    feelingDetail: 'Drafted my personal statement intro! Stoked about the story structure.'
  },
  {
    id: 2,
    identify: true,
    name: 'Amina Diop',
    email: 'amina.diop@example.com',
    feeling: 'Motivated',
    emoji: '🙂',
    confidence: 8,
    stresses: ['Financial Aid', 'Time Management'],
    supports: ['Financial Aid Guidance', 'Application Planning'],
    weeklyWin: 'Gathered all required tax slips for scholarship forms.',
    feelingDetail: 'Ready to tackle my financial aid papers this weekend.'
  },
  {
    id: 3,
    identify: false,
    name: 'Anonymous Mentee',
    email: '',
    feeling: 'Okay',
    emoji: '😐',
    confidence: 6,
    stresses: ['Supplemental Essays', 'Time Management'],
    supports: ['Motivation Check-in', 'Accountability Partnering'],
    weeklyWin: 'Booked an appointment with my English teacher for recommendations.',
    feelingDetail: 'Applications are moving slowly, but keeping my head up.'
  },
  {
    id: 4,
    identify: true,
    name: 'Chinedu Uche',
    email: 'chinedu.uche@example.com',
    feeling: 'Overwhelmed',
    emoji: '😕',
    confidence: 4,
    stresses: ['Supplemental Essays', 'Time Management', 'Balancing Responsibilities'],
    supports: ['Application Planning', 'Brainstorming'],
    weeklyWin: 'Drafted outline for two Stanford supplemental essays.',
    feelingDetail: 'Too many supplementary questions to answer. Struggling to organize deadlines.'
  },
  {
    id: 5,
    identify: false,
    name: 'Anonymous Mentee',
    email: '',
    feeling: 'Burnt Out',
    emoji: '😣',
    confidence: 2,
    stresses: ['Time Management', 'Balancing Responsibilities', 'Motivation'],
    supports: ['Motivation Check-in', 'Accountability Partnering'],
    weeklyWin: 'I still managed to write 250 words for my UC Application.',
    feelingDetail: 'High school midterms coinciding with application prep is too draining.'
  },
  {
    id: 6,
    identify: true,
    name: 'Zola Mandela',
    email: 'zola.mandela@example.com',
    feeling: 'Excited',
    emoji: '😁',
    confidence: 10,
    stresses: ['Supplemental Essays'],
    supports: ['Essay Review'],
    weeklyWin: 'Polished the final draft of my Common App Essay!',
    feelingDetail: 'Had a super helpful essay revision call with a senior advisor.'
  },
  {
    id: 7,
    identify: false,
    name: 'Anonymous Mentee',
    email: '',
    feeling: 'Motivated',
    emoji: '🙂',
    confidence: 7,
    stresses: ['SAT/ACT Preparation', 'Motivation'],
    supports: ['Accountability Partnering'],
    weeklyWin: 'Improved my diagnostic test score by 80 points!',
    feelingDetail: 'Working hard on my math SAT prep material.'
  },
  {
    id: 8,
    identify: true,
    name: 'Tariq Said',
    email: 'tariq.said@example.com',
    feeling: 'Okay',
    emoji: '😐',
    confidence: 5,
    stresses: ['Personal Statement', 'Balancing Responsibilities'],
    supports: ['Essay Review'],
    weeklyWin: 'Organized my portfolio submission folder.',
    feelingDetail: 'Just taking things one day at a time.'
  },
  {
    id: 9,
    identify: false,
    name: 'Anonymous Mentee',
    email: '',
    feeling: 'Overwhelmed',
    emoji: '😕',
    confidence: 3,
    stresses: ['Financial Aid', 'Balancing Responsibilities'],
    supports: ['Financial Aid Guidance'],
    weeklyWin: 'Resolved my fee waiver voucher code issue.',
    feelingDetail: 'Having issues getting school transcripts ready in time.'
  },
  {
    id: 10,
    identify: false,
    name: 'Anonymous Mentee',
    email: '',
    feeling: 'Motivated',
    emoji: '🙂',
    confidence: 8,
    stresses: ['Personal Statement'],
    supports: ['Brainstorming', 'Essay Review'],
    weeklyWin: 'Found a unique angle to talk about my volunteer work in my essay.',
    feelingDetail: 'Super happy with the brainstorm results.'
  }
];

export default function AboutView({ onBackToHome, onStartSurvey }: AboutViewProps) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'trends'>('submissions');
  const [selectedDemo, setSelectedDemo] = useState<typeof DEMO_COHORT[0] | null>(DEMO_COHORT[3]); // Default to Chinedu

  const getFeelingBadgeColor = (f: string) => {
    switch(f) {
      case 'Excited': return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Motivated': return 'bg-teal-50 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400';
      case 'Okay': return 'bg-sky-50 text-sky-800 dark:bg-sky-950/20 dark:text-sky-400';
      case 'Overwhelmed': return 'bg-amber-50 text-amber-850 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Burnt Out': return 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400';
      default: return 'bg-slate-50 text-slate-800';
    }
  };

  return (
    <div className="relative overflow-hidden py-10 sm:py-14" id="about-view-root">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-sleek-peach/40 dark:bg-slate-900 ambient-glow" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-12">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sleek-muted dark:text-slate-400 hover:text-sleek-charcoal dark:hover:text-slate-100 transition-colors cursor-pointer"
            id="about-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <span className="text-xs font-mono font-bold text-sleek-muted dark:text-slate-500 uppercase tracking-widest">
            About the Project
          </span>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <h2 className="font-display text-4xl sm:text-5xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
            Why we check in 🌱
          </h2>
          <p style={{ color: '#213146' }} className="text-base sm:text-lg leading-relaxed">
            The college application journey can be exciting, but it is also one of the most intense and stressful times in a student’s life. Pathways Africa is here to support you at every single turn.
          </p>
          <p style={{ color: '#212f44' }} className="text-base sm:text-lg leading-relaxed">
            This platform exists as a <strong>safe, warm, and comforting virtual space</strong> designed to bridge the gap between students and mentors. It provides a structured but gentle way for you to report your academic status, emotional exhaustion, or specific hurdles.
          </p>
        </div>

        {/* Core Principles */}
        <div className="space-y-6">
          <h3 style={{ color: '#8f873d' }} className="font-display font-bold text-2xl">
            How your check-in makes a difference
          </h3>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex gap-4 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-sleek-peach text-sleek-charcoal flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-rose-500/10" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
                  Honesty over perfection
                </h4>
                <p className="text-sm text-sleek-muted dark:text-slate-400 mt-1 leading-relaxed">
                  We encourage you to be completely real with us. If you are exhausted, burnt out, or feeling stuck, sharing that is the first step toward getting relief. There are no grades or judgments here.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-sleek-accent-light text-sleek-accent flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
                  Dynamic and responsive assistance
                </h4>
                <p className="text-sm text-sleek-muted dark:text-slate-400 mt-1 leading-relaxed">
                  Your feedback helps mentors tailor the program in real-time. If multiple students are stressed about supplemental essays or recommendation letters, mentors will schedule targeted group sessions and workshops.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#FCF3E5] text-sleek-charcoal flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-500/10 text-amber-700" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
                  You are in control of your data
                </h4>
                <p className="text-sm text-sleek-muted dark:text-slate-400 mt-1 leading-relaxed">
                  Every section of the check-in is structured to respect your privacy. All long-form text responses and even identifying information are optional. You can choose to skip questions that feel too personal or submit completely anonymously.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Segment: Interactive Mock Cohort */}
        <div className="space-y-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sleek-accent bg-sleek-accent-light px-2.5 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Mentor Dashboard Preview
            </span>
            <h3 style={{ color: '#81836d' }} className="font-display font-bold text-2xl sm:text-3xl">
              Transparency: See How Mentors Receive Data
            </h3>
            <p className="text-sm sm:text-base text-sleek-muted dark:text-slate-500 leading-relaxed">
              Wondering how your check-ins help? Below is a live interactive preview modeled on <strong>10 sample participants</strong>. Observe how mentors aggregate anonymous trends and connect directly with named students to offer support.
            </p>
          </div>

          {/* Interactive Frame */}
          <div className="rounded-[28px] border border-sleek-border bg-white/60 dark:bg-slate-900/50 p-4 sm:p-6 shadow-xl space-y-6">
            
            {/* Toggles and Quick Metrics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'submissions'
                      ? 'bg-white dark:bg-slate-800 text-sleek-charcoal dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Cohort Responses ({DEMO_COHORT.length})
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'trends'
                      ? 'bg-white dark:bg-slate-800 text-sleek-charcoal dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Aggregate Trend Insights
                </button>
              </div>

              {/* Mini counters */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-sleek-muted dark:text-slate-400">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/30">
                  👥 5 Named Mentees
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/30">
                  🔒 5 Anonymous Mentees
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-100/30">
                  📈 Avg Confidence: 6.7/10
                </span>
              </div>
            </div>

            {/* Tab 1: Cohort submissions list */}
            {activeTab === 'submissions' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* List portion */}
                <div className="lg:col-span-5 space-y-2 max-h-[360px] overflow-y-auto pr-2">
                  <span className="block text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400 mb-1">Select Check-in to Inspect</span>
                  {DEMO_COHORT.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDemo(item)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        selectedDemo?.id === item.id
                          ? 'border-sleek-accent bg-sleek-accent-light text-sleek-accent dark:border-sleek-accent dark:bg-slate-800'
                          : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-sleek-charcoal dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-bold truncate">
                          {item.identify ? item.name : '🔒 Anonymous Submitter'}
                        </span>
                        <span className="block text-[10px] opacity-75 mt-0.5 truncate">
                          Confidence: {item.confidence}/10 • Win: "{item.weeklyWin.slice(0, 30)}..."
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${getFeelingBadgeColor(item.feeling)}`}>
                        {item.emoji} {item.feeling}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Inspecting detail frame */}
                <div className="lg:col-span-7 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 space-y-4">
                  {selectedDemo ? (
                    <>
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-base text-sleek-charcoal dark:text-slate-200">
                              {selectedDemo.identify ? selectedDemo.name : '🔒 Anonymous Submitter'}
                            </span>
                            {selectedDemo.identify ? (
                              <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold uppercase font-mono">Named follow-up</span>
                            ) : (
                              <span className="text-[9px] bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase font-mono">100% Secure Anon</span>
                            )}
                          </div>
                          {selectedDemo.identify && (
                            <span className="block text-xs text-sleek-muted dark:text-slate-400 font-mono mt-0.5">
                              {selectedDemo.email}
                            </span>
                          )}
                        </div>

                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getFeelingBadgeColor(selectedDemo.feeling)}`}>
                          Current Mood: {selectedDemo.emoji} {selectedDemo.feeling}
                        </span>
                      </div>

                      {/* Detail attributes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="block text-slate-400 dark:text-slate-500 font-mono text-[9px] uppercase font-bold tracking-wider">Hurdles / Stressors</span>
                          <span className="block font-medium text-sleek-charcoal dark:text-slate-200 mt-0.5">
                            {selectedDemo.stresses.join(', ')}
                          </span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="block text-slate-400 dark:text-slate-500 font-mono text-[9px] uppercase font-bold tracking-wider">Support Requested</span>
                          <span className="block font-medium text-sleek-charcoal dark:text-slate-200 mt-0.5">
                            {selectedDemo.supports.join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Weekly win */}
                        <div className="p-3 bg-amber-50/20 dark:bg-amber-950/10 rounded-xl border border-amber-100/30">
                          <span className="block text-amber-800 dark:text-amber-400 font-mono text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                            🏆 Weekly Win
                          </span>
                          <p className="text-sleek-charcoal dark:text-slate-300 mt-1 leading-relaxed italic">
                            "{selectedDemo.weeklyWin}"
                          </p>
                        </div>

                        {/* Feeling detail */}
                        {selectedDemo.feelingDetail && (
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="block text-slate-400 dark:text-slate-500 font-mono text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-slate-400" /> Elaborated Feeling
                            </span>
                            <p className="text-sleek-charcoal dark:text-slate-300 mt-1 leading-relaxed">
                              {selectedDemo.feelingDetail}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mentor intervention info banner */}
                      <div className="p-3 rounded-xl bg-sleek-accent-light border border-sleek-border/30 text-[10px] text-sleek-accent leading-relaxed font-medium">
                        💡 <strong>How Mentors Use This:</strong> {selectedDemo.identify ? (
                          <span>"We see that Kofi is excited but needs Essay Review. A mentor will reach out directly to Kofi's email to coordinate feedback on his draft."</span>
                        ) : (
                          <span>"Since this is Anonymous, mentors can't email individual help, but we noticed they checked 'Accountability Partnering'. We will address this topic in the next cohort-wide study call!"</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                      <Users className="w-8 h-8 opacity-40 animate-pulse" />
                      <span className="text-xs mt-2 font-medium">Select a submission from the left to preview mentor tools.</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Tab 2: Trends chart */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-xs text-sleek-muted dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800/60">
                  📊 This simulated analytical rollup highlights the cohort-wide stressors and needs from the 10 submissions. Instead of identifying individuals, mentors review these aggregate patterns to organize weekly cohort-wide workshops.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stressors */}
                  <div className="space-y-4">
                    <span className="block text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400">Top Hurdles (Simulated Breakdown)</span>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Supplemental Essays</span>
                          <span>4 Students (40%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Time Management</span>
                          <span>4 Students (40%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Personal Statement</span>
                          <span>3 Students (30%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-600 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Financial Aid</span>
                          <span>3 Students (30%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support needs */}
                  <div className="space-y-4">
                    <span className="block text-[10px] font-mono uppercase tracking-widest font-bold text-slate-400">Requested Support Categories</span>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Essay Review</span>
                          <span>4 Students (40%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-sleek-accent rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Accountability Partnering</span>
                          <span>3 Students (30%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-sleek-accent/80 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Application Planning</span>
                          <span>2 Students (20%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-sleek-accent/60 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-sleek-charcoal dark:text-slate-200 mb-1">
                          <span>Financial Aid Guidance</span>
                          <span>2 Students (20%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-150 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-sleek-accent/40 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mentor response action card */}
                <div className="p-4 rounded-xl bg-teal-50/25 dark:bg-teal-950/10 text-xs text-teal-950 dark:text-teal-400 leading-relaxed border border-teal-100/20">
                  ✨ <strong>Resulting Mentor Action:</strong> Since "Supplemental Essays" and "Essay Review" represent the largest student bottlenecks this week, mentors will immediately plan a cohort-wide Supplemental Essay brainstorming workshop!
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Note on Support */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-sleek-accent-light dark:bg-slate-900/60 border border-sleek-border/30 dark:border-indigo-900/40 space-y-3">
          <h4 className="font-display font-bold text-lg text-sleek-accent dark:text-indigo-300 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            A message from the Pathways Team
          </h4>
          <p className="text-sm text-sleek-muted dark:text-slate-300 leading-relaxed">
            Remember: Your path is unique. Your speed is yours. Every effort you put in is a vital component of your growth. Please do not hesitate to make use of this check-in to clear your thoughts and ask for a guiding hand.
          </p>
        </div>

        {/* CTA to start */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartSurvey}
            className="w-full sm:w-auto"
            id="about-cta-start"
          >
            Start My Check-in Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onBackToHome}
            className="w-full sm:w-auto"
            id="about-cta-back"
          >
            Explore Home Page
          </Button>
        </div>
      </div>
    </div>
  );
}
