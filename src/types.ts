/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SurveyResponse {
  // Step 0: Identity (Optional)
  identify: boolean;
  name: string;
  email: string;

  // Step 1: Feeling
  feeling: string; // 'Excited' | 'Motivated' | 'Okay' | 'Overwhelmed' | 'Burnt Out'

  // Step 2: Detail (Optional)
  feelingDetail: string;

  // Step 3: Application Confidence
  confidence: number; // 1 to 10

  // Step 4: Stress Areas
  stressAreas: string[];
  otherStressArea: string;

  // Step 5: Needed Support
  supportNeeds: string[];
  otherSupportNeed: string;

  // Step 6: About Yourself (Optional)
  aboutYourself: string;

  // Step 7: Mind Share / Last thing (Optional, softer than "Anonymous Feedback")
  mindShare: string;

  // Step 8: Weekly Win
  weeklyWin: string;

  // Cohort & Module
  cohort: string;
  module: string;
}

export interface FeelingOption {
  emoji: string;
  label: string;
  color: string;
  darkColor: string;
  description: string;
}

export interface OptionCard {
  id: string;
  label: string;
  category?: string;
}

export const INITIAL_RESPONSE: SurveyResponse = {
  identify: false,
  name: '',
  email: '',
  feeling: '',
  feelingDetail: '',
  confidence: 5,
  stressAreas: [],
  otherStressArea: '',
  supportNeeds: [],
  otherSupportNeed: '',
  aboutYourself: '',
  mindShare: '',
  weeklyWin: '',
  cohort: '',
  module: '',
};

export const FEELING_OPTIONS: FeelingOption[] = [
  { emoji: '😁', label: 'Excited', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50', darkColor: 'dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 dark:hover:bg-emerald-900/30', description: 'Feeling eager and ready to take on opportunities' },
  { emoji: '🙂', label: 'Motivated', color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/50', darkColor: 'dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50 dark:hover:bg-teal-900/30', description: 'Focused, driven, and moving in a positive direction' },
  { emoji: '😐', label: 'Okay', color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/50', darkColor: 'dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50 dark:hover:bg-sky-900/30', description: 'Steady, neutral, or just taking things day by day' },
  { emoji: '😕', label: 'Overwhelmed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/50', darkColor: 'dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-950/30', description: 'Dealing with a lot and feeling a bit stretched thin' },
  { emoji: '😣', label: 'Burnt Out', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50', darkColor: 'dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-900/30', description: 'Running very low on energy and needing gentle rest' },
];

export const STRESS_AREAS: string[] = [
  'Essay brainstorming',
  'Personal Statement',
  'Supplemental Essays',
  'Activities List',
  'Financial Aid',
  'SAT/ACT',
  'Recommendation Letters',
  'Time Management',
  'Motivation',
  'English Writing',
  'Balancing Responsibilities',
  'Other',
];

export const SUPPORT_NEEDS: string[] = [
  'Essay brainstorming session',
  'Essay review',
  'Time management guidance',
  'Financial aid support',
  'Application planning',
  'Motivation',
  'General advice',
  'Study accountability',
  'Other',
];
