import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, TrendingUp, AlertTriangle, Users, BookOpen, Calendar, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';

interface CohortSummary {
  moodDistribution: Record<string, number>;
  averageConfidence: number;
  topStressAreas: { area: string; count: number }[];
  topSupportNeeds: { need: string; count: number }[];
  totalCount: number;
  anonymousCount: number;
  identifiedCount: number;
  anonymousPercentage: number;
  confidenceOverTime: { date: string; confidence: number }[];
  weeklyActivity: { week: string; count: number }[];
  cohortSummaries?: {
    cohort: string;
    totalCount: number;
    averageConfidence: number;
    topStressArea: string;
    topSupportNeed: string;
    moodDistribution: Record<string, number>;
  }[];
}

export default function CohortInsightsView({ cohort = 'all' }: { cohort?: 'all' | 'Cohort 1' | 'Cohort 2' | 'Cohort 3' | 'Other' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CohortSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'moods' | 'trends'>('overview');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; confidence: number; index: number } | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = cohort !== 'all' ? `?cohort=${encodeURIComponent(cohort)}` : '';
      const token = localStorage.getItem('pathways_admin_token');
      const res = await fetch(`/api/dashboard/summary${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        setError(`Could not fetch cohort analytics. Server responded with status ${res.status}.`);
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Connection to analytics backend unavailable (invalid format).');
        return;
      }

      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError('Could not fetch cohort analytics.');
      }
    } catch (err) {
      console.error('Error fetching cohort analytics', err);
      setError('Connection to analytics backend unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [cohort]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-block animate-spin text-sleek-accent">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-sleek-muted font-display italic text-lg">Aggregating cohort responses & generating analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 animate-fadeIn">
        <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-500 mb-2">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-rose-600 font-display font-medium text-lg">{error}</p>
        <button 
          onClick={fetchInsights} 
          className="px-5 py-2.5 bg-sleek-accent text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
        >
          Retry Fetching Real Data
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 animate-fadeIn">
        <div className="inline-flex p-3 rounded-full bg-slate-50 text-slate-400 mb-2">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-sleek-muted font-display italic text-lg">No real check-in data has been submitted by students in this cohort yet.</p>
      </div>
    );
  }

  const stats = data;

  const moodColors: Record<string, string> = {
    'Excited': 'bg-emerald-500',
    'Motivated': 'bg-teal-500',
    'Okay': 'bg-sky-400',
    'Overwhelmed': 'bg-indigo-500',
    'Burnt Out': 'bg-rose-500'
  };

  const moodEmojis: Record<string, string> = {
    'Excited': '😁',
    'Motivated': '🙂',
    'Okay': '😐',
    'Overwhelmed': '😕',
    'Burnt Out': '😣'
  };

  // SVG Chart Dimensions & Computations
  const width = 600;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const pointsCount = stats.confidenceOverTime.length;
  const xCoords = stats.confidenceOverTime.map((_, i) => paddingLeft + (i / (pointsCount - 1)) * chartWidth);
  const yCoords = stats.confidenceOverTime.map(pt => {
    // scale 1 to 10 onto chartHeight (y increases downwards)
    const val = pt.confidence;
    const scaledY = paddingTop + chartHeight - ((val - 1) / 9) * chartHeight;
    return scaledY;
  });

  // Construct SVG Path for Confidence Trend Line
  let dPath = '';
  if (pointsCount > 0) {
    dPath = `M ${xCoords[0]} ${yCoords[0]}`;
    for (let i = 1; i < pointsCount; i++) {
      dPath += ` L ${xCoords[i]} ${yCoords[i]}`;
    }
  }

  // Construct SVG Path for Area Fill below line
  let areaPath = '';
  if (pointsCount > 0) {
    areaPath = `${dPath} L ${xCoords[pointsCount - 1]} ${paddingTop + chartHeight} L ${xCoords[0]} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10" id="cohort-insights-view-root">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sleek-accent-light text-sleek-accent text-xs font-semibold uppercase tracking-wider border border-sleek-border/30">
          <BarChart2 className="w-3.5 h-3.5" />
          Cohort Insights & Analytics
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-sleek-charcoal dark:text-slate-50 leading-[1.05] tracking-tight">
          How the Cohort is Doing 🌱
        </h1>
        <p className="text-sm sm:text-base text-sleek-muted dark:text-slate-400">
          This dashboard presents real-time aggregate wellness, application confidence, and academic pinch points based on active mentor check-ins.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 text-amber-700 dark:text-amber-400 text-xs sm:text-sm text-center font-medium max-w-2xl mx-auto">
          ⚠️ {error} Using pre-loaded demo check-in dataset.
        </div>
      )}

      {/* Grid of Key Aggregate Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="cohort-quick-stats-grid">
        {/* Card 1: Total Cohort Entries */}
        <div className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sleek-accent-light text-sleek-accent flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-sans text-xs text-sleek-muted dark:text-slate-400 uppercase tracking-wider font-semibold">Total Check-ins</span>
            <span className="block font-sans font-black text-2xl text-sleek-charcoal dark:text-slate-50">{stats.totalCount}</span>
          </div>
        </div>

        {/* Card 2: Average Application Confidence */}
        <div className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sleek-accent-light text-sleek-accent flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-sans text-xs text-sleek-muted dark:text-slate-400 uppercase tracking-wider font-semibold">Avg. Confidence</span>
            <span className="block font-sans font-black text-2xl text-sleek-charcoal dark:text-slate-50">{stats.averageConfidence} <span className="text-xs text-sleek-muted">/ 10</span></span>
          </div>
        </div>

        {/* Card 3: Anonymity Choice */}
        <div className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sleek-accent-light text-sleek-accent flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-sans text-xs text-sleek-muted dark:text-slate-400 uppercase tracking-wider font-semibold">Anonymous Ratio</span>
            <span className="block font-sans font-black text-2xl text-sleek-charcoal dark:text-slate-50">{stats.anonymousPercentage}%</span>
          </div>
        </div>

        {/* Card 4: Top Stress Domain */}
        <div className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sleek-peach text-sleek-accent flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-sans text-xs text-sleek-muted dark:text-slate-400 uppercase tracking-wider font-semibold">Primary Stressor</span>
            <span className="block font-sans font-black text-lg text-sleek-charcoal dark:text-slate-50 truncate max-w-[150px]">{(!stats.topStressAreas || stats.topStressAreas.length === 0) ? '---' : (stats.topStressAreas[0]?.area || '---')}</span>
          </div>
        </div>
      </div>

      {/* Cross-Cohort Comparison Board (Coordinators Only) */}
      {cohort === 'all' && stats.cohortSummaries && (
        <div className="space-y-6 p-6 sm:p-8 rounded-[32px] bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/60" id="cohort-comparison-board">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="font-display text-2xl font-bold text-sleek-charcoal dark:text-slate-50 tracking-tight flex items-center gap-2">
              <span>👥</span> Cross-Cohort Comparison Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-sleek-muted dark:text-slate-400">
              Comparative health metrics, academic blockers, and emotional sentiment summaries for every active cohort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.cohortSummaries.map((c: any) => {
              const confColor = c.averageConfidence >= 7 
                ? 'text-emerald-700 dark:text-[#34d399] bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-200/30 dark:border-emerald-900/30' 
                : c.averageConfidence >= 5 
                ? 'text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 border-amber-200/30 dark:border-amber-900/30' 
                : 'text-rose-700 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/40 border-rose-200/30 dark:border-rose-900/30';

              const barColor = c.averageConfidence >= 7 
                ? 'bg-emerald-500 dark:bg-[#34d399]' 
                : c.averageConfidence >= 5 
                ? 'bg-amber-500' 
                : 'bg-rose-500';

              return (
                <div 
                  key={c.cohort} 
                  className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <span className="font-display font-black text-base text-slate-800 dark:text-slate-100">{c.cohort}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200/30">
                      {c.totalCount} entries
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Confidence */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Avg Confidence</span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${confColor}`}>
                          {c.averageConfidence} / 10
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${c.averageConfidence * 10}%` }} />
                      </div>
                    </div>

                    {/* Stress Area */}
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">Top Stress Area</span>
                      <span className="inline-flex px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 text-xs font-semibold border border-orange-100 dark:border-orange-900/30 truncate max-w-full">
                        ⚡ {c.topStressArea}
                      </span>
                    </div>

                    {/* Support Need */}
                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">Top Support Need</span>
                      <span className="inline-flex px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-900/30 truncate max-w-full">
                        🤝 {c.topSupportNeed}
                      </span>
                    </div>
                  </div>

                  {/* Mood Distribution small visual row */}
                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1.5 leading-none">Mood Spectrum</span>
                    <div className="flex gap-1.5 items-center flex-wrap">
                      {Object.entries(c.moodDistribution).map(([mood, count]) => {
                        if ((count as number) === 0) return null;
                        return (
                          <span 
                            key={mood} 
                            title={`${mood}: ${count}`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                          >
                            <span>{moodEmojis[mood]}</span>
                            <span className="font-extrabold text-[10px]">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="cohort-main-insights-split">
        
        {/* Left Column: Moods & Confidence Trend (8/12 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Subview Selector tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-sleek-accent text-sleek-accent dark:border-white dark:text-white'
                  : 'border-transparent text-sleek-muted dark:text-slate-400 hover:text-sleek-charcoal'
              }`}
            >
              Overview Analysis
            </button>
            <button
              onClick={() => setActiveTab('moods')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'moods'
                  ? 'border-sleek-accent text-sleek-accent dark:border-white dark:text-white'
                  : 'border-transparent text-sleek-muted dark:text-slate-400 hover:text-sleek-charcoal'
              }`}
            >
              Mood Spectrum
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'border-sleek-accent text-sleek-accent dark:border-white dark:text-white'
                  : 'border-transparent text-sleek-muted dark:text-slate-400 hover:text-sleek-charcoal'
              }`}
            >
              Confidence Timeline
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="wellness-card rounded-[32px] p-6 sm:p-8 space-y-6" id="overview-card-panel">
              <div className="space-y-1.5">
                <h3 className="font-display text-xl sm:text-2xl text-sleek-charcoal dark:text-slate-50 leading-none">
                  Summary Analysis & Observations
                </h3>
                <p className="text-xs sm:text-sm text-sleek-muted dark:text-slate-400">
                  Current indicators show that academic application deadlines are starting to cause mild friction.
                </p>
              </div>

              {/* Stress Categories custom breakdown */}
              <div className="space-y-4">
                <span className="block text-xs font-sans font-bold uppercase tracking-wider text-sleek-muted dark:text-slate-500">Stressor Prevalence Rates</span>
                <div className="space-y-3.5">
                  {stats.topStressAreas.map((area, index) => {
                    const pct = stats.totalCount > 0 ? Math.round((area.count / stats.totalCount) * 100) : 0;
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                          <span className="text-sleek-charcoal dark:text-slate-200">{area.area}</span>
                          <span className="text-sleek-muted font-bold">{area.count} Students ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-sleek-accent dark:bg-sleek-accent rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Helpful tips card */}
              <div className="p-5 rounded-2xl bg-sleek-peach/30 dark:bg-slate-900/40 border border-sleek-border/20 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-sleek-accent dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Recommended Mentor Intervention:
                </div>
                <p className="text-xs sm:text-sm text-sleek-muted dark:text-slate-300 leading-relaxed">
                  Based on current metrics, <strong>{stats.topStressAreas[0]?.area || 'Deadlines'}</strong> is the highest friction point. Hosting a peer workshop or an essay co-writing lounge this Saturday can help buffer the cohort’s stress levels significantly.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'moods' && (
            <div className="wellness-card rounded-[32px] p-6 sm:p-8 space-y-6" id="moods-card-panel">
              <div className="space-y-1.5">
                <h3 className="font-display text-xl sm:text-2xl text-sleek-charcoal dark:text-slate-50 leading-none">
                  Emotional Fingerprint
                </h3>
                <p className="text-xs sm:text-sm text-sleek-muted dark:text-slate-400">
                  Daily mood tracking aggregate distribution. Shows the collective emotional tone of the program.
                </p>
              </div>

              {/* Mood breakdown chart */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4">
                {Object.entries(stats.moodDistribution).map(([mood, count]) => {
                  const percent = stats.totalCount > 0 ? Math.round(((count as number) / stats.totalCount) * 100) : 0;
                  return (
                    <div key={mood} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-center flex flex-col items-center justify-between min-h-[140px] shadow-sm">
                      <span className="text-3xl filter drop-shadow">{moodEmojis[mood]}</span>
                      <div>
                        <span className="block text-sm font-bold text-sleek-charcoal dark:text-slate-200">{mood}</span>
                        <span className="block text-[10px] uppercase font-mono font-bold text-sleek-muted dark:text-slate-500 mt-0.5">{count} entries</span>
                      </div>
                      <div className="w-full mt-2">
                        <span className="text-xs font-sans font-black text-sleek-accent">{percent}%</span>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full ${moodColors[mood]} rounded-full`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Emotion notes */}
              <div className="p-4 rounded-xl bg-sleek-accent-light dark:bg-slate-950 text-xs text-sleek-accent border border-sleek-border/30 dark:border-slate-800 flex items-start gap-2.5">
                <span>💡</span>
                <span>The positive emotions (Excited, Motivated, Okay) currently represent <strong>{Math.round((( (stats.moodDistribution['Excited'] || 0) + (stats.moodDistribution['Motivated'] || 0) + (stats.moodDistribution['Okay'] || 0) ) / stats.totalCount) * 100)}%</strong> of the cohort’s mindset, with some students requesting extra support during stress peaks.</span>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="wellness-card rounded-[32px] p-6 sm:p-8 space-y-6" id="trends-card-panel">
              <div className="space-y-1.5">
                <h3 className="font-display text-xl sm:text-2xl text-sleek-charcoal dark:text-slate-50 leading-none">
                  Confidence Evolution Index
                </h3>
                <p className="text-xs sm:text-sm text-sleek-muted dark:text-slate-400">
                  Weekly application confidence levels averaged on a scale of 1 to 10. Hover over data nodes to inspect details.
                </p>
              </div>

              {/* Responsive SVG Line Chart */}
              <div className="relative w-full overflow-x-auto pt-4 pb-2">
                <div className="min-w-[500px]">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" id="confidence-svg-chart">
                    {/* Definitions for Gradients */}
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B6A3E" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#0B6A3E" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {[1, 4, 7, 10].map((val, idx) => {
                      const scaledY = paddingTop + chartHeight - ((val - 1) / 9) * chartHeight;
                      return (
                        <g key={idx}>
                          <line
                            x1={paddingLeft}
                            y1={scaledY}
                            x2={width - paddingRight}
                            y2={scaledY}
                            className="stroke-slate-200 dark:stroke-slate-800"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={paddingLeft - 8}
                            y={scaledY + 4}
                            className="fill-slate-400 text-[10px] font-mono font-bold text-right"
                            textAnchor="end"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Fill Area path under the line */}
                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                    {/* Main trend line */}
                    {dPath && (
                      <path
                        d={dPath}
                        fill="none"
                        className="stroke-sleek-accent dark:stroke-slate-200"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Horizontal Axis bottom line */}
                    <line
                      x1={paddingLeft}
                      y1={paddingTop + chartHeight}
                      x2={width - paddingRight}
                      y2={paddingTop + chartHeight}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth="1"
                    />

                    {/* Data Node Interactive Circles */}
                    {stats.confidenceOverTime.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={xCoords[i]}
                          cy={yCoords[i]}
                          r={hoveredPoint?.index === i ? "7" : "4.5"}
                          className="fill-white stroke-sleek-accent dark:stroke-slate-200 cursor-pointer transition-all duration-150"
                          strokeWidth="3"
                          onMouseEnter={() => setHoveredPoint({ date: pt.date, confidence: pt.confidence, index: i })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {/* Horizontal Axis Label */}
                        <text
                          x={xCoords[i]}
                          y={paddingTop + chartHeight + 18}
                          className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono font-bold"
                          textAnchor="middle"
                        >
                          {pt.date}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Chart Node hover status readout */}
              <div className="h-10 flex items-center justify-center">
                {hoveredPoint ? (
                  <div className="px-4 py-1.5 rounded-full bg-sleek-accent-light text-sleek-accent border border-sleek-border/30 text-xs font-semibold animate-float-delayed">
                    📅 {hoveredPoint.date} — Cohort Application Confidence averaged <strong>{hoveredPoint.confidence} / 10</strong>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">Hover over the dots on the timeline chart to inspect values</span>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Support Requests List (4/12 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Support requests card panel */}
          <div className="wellness-card rounded-[32px] p-6 sm:p-8 space-y-6" id="support-needs-card-panel">
            <div className="space-y-1">
              <h3 className="font-display text-xl sm:text-2xl text-sleek-charcoal dark:text-slate-50 leading-none">
                Requested Supports
              </h3>
              <p className="text-xs text-sleek-muted dark:text-slate-400">
                Aggregated student requests for cohort-level support structures.
              </p>
            </div>

            {/* List of needs */}
            <div className="space-y-4">
              {stats.topSupportNeeds.map((need, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sleek-accent-light text-sleek-accent flex items-center justify-center text-xs font-black font-mono">
                      {idx + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-sleek-charcoal dark:text-slate-200">{need.need}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-extrabold text-sleek-muted dark:text-slate-400 border border-slate-200/40">
                    {need.count} requests
                  </span>
                </div>
              ))}
            </div>

            {/* Support guarantee statement */}
            <div className="p-4 rounded-2xl bg-sleek-peach/30 dark:bg-slate-900/20 text-xs text-sleek-muted dark:text-slate-300 leading-relaxed space-y-2">
              <span className="block font-sans font-extrabold uppercase text-[10px] tracking-wider text-sleek-accent">Cohort Support Policy</span>
              <p>Whenever a support request category reaches 5+ entries, our mentoring system automatically flags a dedicated cohort review or peer-led workshop.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
