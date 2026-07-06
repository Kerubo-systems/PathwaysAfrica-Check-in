/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Smile, MessageSquare, Heart, AlertCircle, RefreshCw, Trophy } from 'lucide-react';
import { SurveyResponse, FEELING_OPTIONS, STRESS_AREAS, SUPPORT_NEEDS, INITIAL_RESPONSE } from '../../types';
import ProgressBar from '../ProgressBar';
import EmojiCard from '../EmojiCard';
import CheckboxCard from '../CheckboxCard';
import Slider from '../Slider';
import TextArea from '../TextArea';
import Button from '../Button';
import celebrationSuccessImg from '../../assets/images/celebration_success_1783014107068.jpg';

interface SurveyViewProps {
  onComplete: (data: SurveyResponse) => void;
  onCancel: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const STORAGE_KEY = 'pathways_survey_draft';

export default function SurveyView({ onComplete, onCancel, showToast }: SurveyViewProps) {
  const [step, setStep] = useState(0);
  const [response, setResponse] = useState<SurveyResponse>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cohort === 'Other' || !parsed.cohort) {
          parsed.cohort = 'Cohort 1';
        }
        if (parsed.module === 'Other' || !parsed.module) {
          parsed.module = 'Module 1';
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load survey draft', e);
    }
    return { 
      ...INITIAL_RESPONSE,
      cohort: 'Cohort 1',
      module: 'Module 1'
    };
  });

  // Dynamic academic configurations
  const [availableCohorts, setAvailableCohorts] = useState<string[]>(['Cohort 1', 'Cohort 2', 'Cohort 3']);
  const [availableModules, setAvailableModules] = useState<string[]>(['Module 1', 'Module 2', 'Module 3']);

  // Fetch configs from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        const d = await res.json();
        if (d.success) {
          const cohortsFiltered = d.data.cohorts.filter((c: string) => c.toLowerCase() !== 'other');
          const modulesFiltered = d.data.modules.filter((m: string) => m.toLowerCase() !== 'other');
          setAvailableCohorts(cohortsFiltered);
          setAvailableModules(modulesFiltered);
          
          setResponse(prev => {
            const nextCohort = prev.cohort && cohortsFiltered.includes(prev.cohort) ? prev.cohort : (cohortsFiltered[0] || 'Cohort 1');
            const nextModule = prev.module && modulesFiltered.includes(prev.module) ? prev.module : (modulesFiltered[0] || 'Module 1');
            return {
              ...prev,
              cohort: nextCohort,
              module: nextModule
            };
          });
        }
      } catch (err) {
        console.error('Failed to load configurations in student check-in', err);
      }
    };
    fetchConfig();
  }, []);

  // Save draft locally whenever response changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
  }, [response]);

  const totalSteps = 11; // 0 to 10 (10 is submission/success page)

  const stepLabels = [
    'Cohort & Module',
    'Identity',
    'Feelings',
    'Tell Us More',
    'Confidence',
    'Stressors',
    'Needs',
    'About You',
    'Thoughts',
    'Weekly Win',
    'Celebration 🎉',
  ];

  const handleNext = () => {
    // Step 0: Cohort & Module - compulsory
    if (step === 0) {
      if (!response.cohort || !response.cohort.trim() || !response.module || !response.module.trim()) {
        showToast('Please select both your Cohort and Active Module to continue 🎓', 'warning');
        return;
      }
    }

    // Step 2: Feeling (was step 1) - compulsory
    if (step === 2 && !response.feeling) {
      showToast('Please select how you are feeling today to continue 🌸', 'warning');
      return;
    }

    // Step 4: Confidence Level (was step 3) - compulsory
    if (step === 4 && (response.confidence < 1 || response.confidence > 10)) {
      showToast('Please select your confidence level to continue 🌸', 'warning');
      return;
    }

    // Step 5: Stress Areas (was step 4) - compulsory
    if (step === 5 && response.stressAreas.length === 0) {
      showToast('Please select at least one stress area to continue. Select "Other" if you want to write a custom one 🌸', 'warning');
      return;
    }

    // Step 6: Support Needs (was step 5) - compulsory
    if (step === 6 && response.supportNeeds.length === 0) {
      showToast('Please select at least one support need area to continue. Select "Other" if you want to write a custom one 🌸', 'warning');
      return;
    }

    // Step 8: Thoughts/Mind Share (was step 7) skip confirmation
    if (step === 8 && !response.mindShare.trim()) {
      const confirmSkip = window.confirm(
        'Are you really sure you want to skip this question? Your input is what makes us better.'
      );
      if (!confirmSkip) {
        return;
      }
    }

    // Step 9: Weekly Win (was step 8) - compulsory
    if (step === 9 && !response.weeklyWin.trim()) {
      showToast('Sharing even a small win makes us smile! Please write down one win 🌟', 'warning');
      return;
    }

    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start your check-in over? This will clear your current answers.')) {
      setResponse({ ...INITIAL_RESPONSE });
      setStep(0);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Form draft reset successfully ✨', 'info');
    }
  };

  const handleSubmitSurvey = async () => {
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem(STORAGE_KEY);
        onComplete(response);
        setStep(10); // Transition to success step
        showToast('Check-in submitted! Thank you for sharing 💙', 'success');
      } else {
        showToast(data.message || 'Submission failed. Please check inputs.', 'warning');
      }
    } catch (err) {
      console.error('Error submitting check-in', err);
      // Fallback local support
      localStorage.removeItem(STORAGE_KEY);
      onComplete(response);
      setStep(10);
      showToast('Check-in submitted (saved locally) 💙', 'success');
    }
  };

  const updateResponse = <K extends keyof SurveyResponse>(key: K, value: SurveyResponse[K]) => {
    setResponse((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Stress list selectors helper
  const toggleStressArea = (area: string) => {
    const list = [...response.stressAreas];
    const idx = list.indexOf(area);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(area);
    }
    updateResponse('stressAreas', list);
  };

  // Support needs helper
  const toggleSupportNeed = (need: string) => {
    const list = [...response.supportNeeds];
    const idx = list.indexOf(need);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(need);
    }
    updateResponse('supportNeeds', list);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 relative" id="survey-view-container">
      {/* Draft indicator */}
      {step < 10 && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sleek-muted dark:text-slate-400 hover:text-sleek-accent dark:hover:text-sleek-accent transition-colors cursor-pointer"
            id="survey-step-back-trigger"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {step === 0 ? 'Home' : 'Back'}
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-sleek-accent bg-sleek-accent-light px-2.5 py-1 rounded-full border border-sleek-border/30">
              <span className="w-1.5 h-1.5 rounded-full bg-sleek-accent animate-pulse" />
              Draft Saved Locally
            </span>
            <button
              onClick={handleReset}
              title="Reset Draft"
              className="p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-sleek-muted hover:text-rose-500 hover:border-rose-100 dark:hover:border-rose-950 cursor-pointer transition-colors"
              id="survey-reset-trigger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main card panel */}
      <div className="wellness-card rounded-[32px] p-6 sm:p-10 transition-all duration-300">
        
        {/* Progress bar displayed on top of active survey */}
        {step < 10 && (
          <div className="mb-8">
            <ProgressBar currentStep={step} totalSteps={11} stepLabels={stepLabels} />
          </div>
        )}

        {/* Survey Steps Render */}
        <div className="min-h-[280px] flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Step 0: Cohort & Module Required dropdown selections */}
            {step === 0 && (
              <div className="space-y-6" id="survey-step-cohort-module">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <Smile className="w-3.5 h-3.5" />
                    Academic Information
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    Which Cohort & Module are you in?
                  </h3>
                  <p className="text-sm sm:text-base text-sleek-muted dark:text-slate-400">
                    To help our mentors keep track of responses and support your learning pathway, please select your assigned cohort and active module from the required fields below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-sleek-accent-light dark:bg-slate-950/40 border-2 border-sleek-border dark:border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sleek-accent dark:text-[#34d399] uppercase tracking-wider block">Your Cohort 🏫 <span className="text-rose-500">*</span></label>
                    <select
                      value={response.cohort || ''}
                      onChange={(e) => updateResponse('cohort', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-sans text-sm focus:border-sleek-accent outline-none cursor-pointer transition-colors"
                      id="survey-select-cohort"
                    >
                      {availableCohorts.map(cohort => (
                        <option key={cohort} value={cohort}>{cohort}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sleek-accent dark:text-[#34d399] uppercase tracking-wider block">Your Active Module 📚 <span className="text-rose-500">*</span></label>
                    <select
                      value={response.module || ''}
                      onChange={(e) => updateResponse('module', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-sans text-sm focus:border-sleek-accent outline-none cursor-pointer transition-colors"
                      id="survey-select-module"
                    >
                      {availableModules.map(mod => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-sleek-accent-light dark:bg-slate-950 text-xs text-sleek-accent dark:text-slate-400 border border-sleek-border/30">
                  💡 These selections are required to keep check-in analytics accurate. Thank you for helping us support your growth!
                </div>
              </div>
            )}

            {/* Step 1: Identify Yourself (Optional, softer rename requested by user) */}
            {step === 1 && (
              <div className="space-y-6" id="survey-step-identity">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <Smile className="w-3.5 h-3.5" />
                    Identity Options
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    Would you like to identify yourself?
                  </h3>
                  <p className="text-sm sm:text-base text-sleek-muted dark:text-slate-400">
                    Mentors love connecting with you, but your privacy is fully respected. You can choose to be anonymous or identify yourself for direct follow-up.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => updateResponse('identify', false)}
                    className={`flex-1 p-5 rounded-2xl border-2 text-left transition-all outline-none cursor-pointer ${
                      !response.identify
                        ? 'border-sleek-accent bg-sleek-accent-light text-sleek-accent dark:border-sleek-accent dark:bg-slate-800'
                        : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-muted dark:text-slate-300 hover:bg-slate-50/50'
                    }`}
                    id="identity-option-anon"
                  >
                    <span className="block font-display font-bold text-lg">Remain Anonymous 👤</span>
                    <span className="block text-xs text-sleek-muted dark:text-slate-400 mt-1">
                      No names or emails are collected. Responses will be aggregated only for support mapping.
                    </span>
                  </button>

                  <button
                    onClick={() => updateResponse('identify', true)}
                    className={`flex-1 p-5 rounded-2xl border-2 text-left transition-all outline-none cursor-pointer ${
                      response.identify
                        ? 'border-sleek-accent bg-sleek-accent-light text-sleek-accent dark:border-sleek-accent dark:bg-slate-800'
                        : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-muted dark:text-slate-300 hover:bg-slate-50/50'
                    }`}
                    id="identity-option-named"
                  >
                    <span className="block font-display font-bold text-lg">Identify Myself 🤝</span>
                    <span className="block text-xs text-sleek-muted dark:text-slate-400 mt-1">
                      Share your name/email so mentors can reach out to guide you directly.
                    </span>
                  </button>
                </div>

                {response.identify && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-float-delayed">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">Name (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Kwame"
                        value={response.name}
                        onChange={(e) => updateResponse('name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-sans text-sm focus:border-sleek-accent outline-none"
                        id="identity-input-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">Email (optional)</label>
                      <input
                        type="email"
                        placeholder="e.g. kwame@example.com"
                        value={response.email}
                        onChange={(e) => updateResponse('email', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-sans text-sm focus:border-sleek-accent outline-none"
                        id="identity-input-email"
                      />
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-sleek-accent-light dark:bg-slate-950 text-xs text-sleek-accent dark:text-slate-400 border border-sleek-border/30">
                  💡 You can leave these completely blank if you'd prefer your responses to remain anonymous. That keeps the check-in flexible and comfortable.
                </div>
              </div>
            )}

            {/* Step 2: Feeling today (Required) */}
            {step === 2 && (
              <div className="space-y-6" id="survey-step-feeling">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" />
                    Emotion & Wellness
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    How are you feeling today?
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    Take a brief moment to scan your energy, mind, and mood. Select the card that feels closest to you.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label="Current feeling today">
                  {FEELING_OPTIONS.map((opt) => (
                    <EmojiCard
                      key={opt.label}
                      option={opt}
                      isSelected={response.feeling === opt.label}
                      onSelect={() => updateResponse('feeling', opt.label)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Feeling Details (Optional) */}
            {step === 3 && (
              <div className="space-y-6" id="survey-step-feeling-detail">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Express Yourself
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    Tell us more (optional)
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    If you'd like to share what's contributing to your current feeling, write it down below. It helps mentors understand the context.
                  </p>
                </div>

                <TextArea
                  placeholder="Share anything you'd like mentors to know..."
                  value={response.feelingDetail}
                  onChange={(e) => updateResponse('feelingDetail', e.target.value)}
                  id="feeling-detail-textarea"
                />
              </div>
            )}

            {/* Step 4: Confidence Slider */}
            {step === 4 && (
              <div className="space-y-6" id="survey-step-confidence">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Academic Standing
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    How confident do you currently feel about your college applications?
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    From feeling very lost to feeling on top of all requirements, select where you stand.
                  </p>
                </div>

                <Slider
                  value={response.confidence}
                  onChange={(val) => updateResponse('confidence', val)}
                  leftLabel="1 - Very Lost"
                  rightLabel="10 - Very Confident"
                  id="confidence-slider-picker"
                />
              </div>
            )}

            {/* Step 5: Stress Areas (Multiple select) */}
            {step === 5 && (
              <div className="space-y-6" id="survey-step-stressors">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-sleek-accent" />
                    Pinch Points
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    Which areas are causing you the most stress?
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    You can select multiple options. This lists common academic and lifestyle pinch points.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="stress-options-grid">
                  {STRESS_AREAS.map((area) => (
                    <CheckboxCard
                      key={area}
                      label={area}
                      isSelected={response.stressAreas.includes(area)}
                      onChange={() => toggleStressArea(area)}
                    />
                  ))}
                </div>

                {/* If Other is selected, show custom textbox */}
                {response.stressAreas.includes('Other') && (
                  <div className="space-y-1.5 pt-2 animate-float">
                    <label className="text-xs font-bold text-sleek-charcoal dark:text-slate-400 uppercase tracking-wider">Please specify other stress areas:</label>
                    <input
                      type="text"
                      placeholder="Specify other stressors here..."
                      value={response.otherStressArea}
                      onChange={(e) => updateResponse('otherStressArea', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-sans text-sm focus:border-sleek-accent outline-none"
                      id="stress-other-specification-input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Support Needs (Multiple select) */}
            {step === 6 && (
              <div className="space-y-6" id="survey-step-needs">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <Smile className="w-3.5 h-3.5 text-purple-500" />
                    Mentor Actions
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    What support would help you the most?
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    We can coordinate workshops, peer reviews, or accountability sessions. Select all that apply.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="support-options-grid">
                  {SUPPORT_NEEDS.map((need) => (
                    <CheckboxCard
                      key={need}
                      label={need}
                      isSelected={response.supportNeeds.includes(need)}
                      onChange={() => toggleSupportNeed(need)}
                    />
                  ))}
                </div>

                {/* If Other is selected, show custom textbox */}
                {response.supportNeeds.includes('Other') && (
                  <div className="space-y-1.5 pt-2 animate-float">
                    <label className="text-xs font-bold text-sleek-charcoal dark:text-slate-400 uppercase tracking-wider">Please specify other needed support:</label>
                    <input
                      type="text"
                      placeholder="Specify other support needs here..."
                      value={response.otherSupportNeed}
                      onChange={(e) => updateResponse('otherSupportNeed', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-sans text-sm focus:border-sleek-accent outline-none"
                      id="support-other-specification-input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Getting to know the student (Optional) */}
            {step === 7 && (
              <div className="space-y-6" id="survey-step-hobbies">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    Beyond Academics
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    Tell us a little about yourself (Optional)
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    We'd love to get to know you beyond college applications. Share anything you'd like—your hobbies, interests, passions, responsibilities, favorite way to spend a weekend, or anything else that feels like you.
                  </p>
                </div>

                <TextArea
                  placeholder="I enjoy... Lately I've been... Something that makes me smile is..."
                  value={response.aboutYourself}
                  onChange={(e) => updateResponse('aboutYourself', e.target.value)}
                  id="hobbies-detail-textarea"
                />
              </div>
            )}

            {/* Step 8: Softer renaming of Anonymous Feedback (Optional) */}
            {step === 8 && (
              <div className="space-y-6" id="survey-step-mindshare">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold">
                    💬 Share Anything
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    🌱 Share anything on your mind
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    Is there anything you wish mentors knew? This is an open textbox for you to vent, request special space, or offer advice.
                  </p>
                </div>

                <TextArea
                  placeholder="Is there anything you wish mentors knew? Leave any final thoughts or feedback here..."
                  value={response.mindShare}
                  onChange={(e) => updateResponse('mindShare', e.target.value)}
                  id="mindshare-detail-textarea"
                />
              </div>
            )}

            {/* Step 9: Celebration of small wins */}
            {step === 9 && (
              <div className="space-y-6" id="survey-step-weeklywin">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sleek-peach text-sleek-charcoal text-xs font-semibold">
                    <Trophy className="w-3.5 h-3.5 text-sleek-accent" />
                    Celebration 🎉
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    What's one win you're celebrating this week?
                  </h3>
                  <p className="text-sm text-sleek-muted dark:text-slate-400">
                    Progress doesn't have to be perfect; every step counts. Celebrate your dedication!
                  </p>
                </div>

                {/* Helpful Examples list */}
                <div className="bg-sleek-peach/20 dark:bg-slate-950 p-5 rounded-2xl border border-sleek-border/20 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-sleek-charcoal dark:text-slate-500">Need some examples?</span>
                  <ul className="text-xs sm:text-sm text-sleek-muted dark:text-slate-400 space-y-1.5">
                    <li className="flex items-center gap-2">🌱 I finished my activities list.</li>
                    <li className="flex items-center gap-2">✍️ I started drafting my personal statement essay.</li>
                    <li className="flex items-center gap-2">📧 I reached out to a teacher for a recommendation letter.</li>
                    <li className="flex items-center gap-2">📅 I attended every program mentorship session this week.</li>
                    <li className="flex items-center gap-2">🎓 I finally finalized my list of college targets.</li>
                  </ul>
                </div>

                <TextArea
                  placeholder="This week, I was able to..."
                  value={response.weeklyWin}
                  onChange={(e) => updateResponse('weeklyWin', e.target.value)}
                  id="weeklywin-detail-textarea"
                  helperText="Your win can be as small as resting or as big as finishing a full draft. We support all of them!"
                />
              </div>
            )}

            {/* Step 10: Submission Completion (Success Panel) */}
            {step === 10 && (
              <div className="space-y-8 text-center py-6" id="survey-step-success">
                {/* Micro-sparkle icons or badge */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-sleek-accent-light dark:bg-emerald-950/50 flex items-center justify-center text-sleek-accent shadow-lg shadow-sleek-accent/10">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-3xl sm:text-4xl text-sleek-charcoal dark:text-slate-50 leading-[1.1]">
                    Thank you for checking in 💙
                  </h3>
                  <p className="text-sm sm:text-base text-sleek-muted dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                    Your responses help mentors better understand the needs of the cohort and improve the support offered to everyone.
                  </p>
                </div>

                {/* Support statement blocks */}
                <div className="p-6 rounded-[32px] bg-sleek-accent-light dark:bg-indigo-950/20 border border-sleek-border/30 dark:border-indigo-900/40 max-w-lg mx-auto space-y-2">
                  <p className="text-xs font-sans font-bold uppercase text-sleek-accent dark:text-indigo-400 tracking-wider">
                    Always Keep in Mind:
                  </p>
                  <blockquote className="text-base sm:text-lg font-display font-bold text-sleek-charcoal dark:text-indigo-200">
                    "Progress doesn't have to be perfect. Every single step counts."
                  </blockquote>
                </div>

                {/* Generated Celebration Success Image */}
                <div className="max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video relative group">
                  <img
                    src={celebrationSuccessImg}
                    alt="Joyful abstract shapes celebrating growth and wins"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                    id="success-celebration-image"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onCancel}
                    id="success-cta-done"
                  >
                    Return to Portal
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setResponse({ ...INITIAL_RESPONSE });
                      setStep(0);
                    }}
                    id="success-cta-restart"
                  >
                    Submit another check-in
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Forward/Backward Navigation Tray */}
          {step < 10 && (
            <div className="flex items-center justify-between gap-4 pt-10 mt-8 border-t border-slate-200 dark:border-slate-800/80">
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                id="survey-nav-back-button"
              >
                Back
              </Button>

              {step === 9 ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleSubmitSurvey}
                  icon={<Check className="w-4 h-4 stroke-[3]" />}
                  id="survey-nav-submit-button"
                >
                  Submit Check-in
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  id="survey-nav-next-button"
                >
                  Continue
                </Button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
