import { CheckinRecord } from './db';

export interface DashboardSummary {
  moodDistribution: Record<string, number>;
  averageConfidence: number;
  topStressAreas: { area: string; count: number }[];
  topSupportNeeds: { need: string; count: number }[];
  totalCount: number;
  anonymousCount: number;
  identifiedCount: number;
  anonymousPercentage: number;
  recentSubmissions: Partial<CheckinRecord>[];
  confidenceOverTime: { date: string; confidence: number }[];
  weeklyActivity: { week: string; count: number }[];
}

export function calculateAnalytics(records: CheckinRecord[]): DashboardSummary {
  // Only process non-deleted entries
  const activeRecords = records.filter(r => !r.isDeleted);
  const totalCount = activeRecords.length;

  // Mood distribution
  const moodDistribution: Record<string, number> = {
    'Excited': 0,
    'Motivated': 0,
    'Okay': 0,
    'Overwhelmed': 0,
    'Burnt Out': 0
  };
  
  let totalConfidence = 0;
  let anonymousCount = 0;
  let identifiedCount = 0;

  const stressCounts: Record<string, number> = {};
  const supportCounts: Record<string, number> = {};

  activeRecords.forEach(r => {
    // Mood
    if (r.feeling in moodDistribution) {
      moodDistribution[r.feeling]++;
    } else {
      moodDistribution[r.feeling] = 1;
    }

    // Confidence sum
    totalConfidence += r.confidence;

    // Identity
    if (r.identify) {
      identifiedCount++;
    } else {
      anonymousCount++;
    }

    // Stress Areas
    r.stressAreas.forEach(area => {
      const displayArea = area === 'SAT' ? 'SAT/ACT' : area;
      stressCounts[displayArea] = (stressCounts[displayArea] || 0) + 1;
    });

    // Support Needs
    r.supportNeeds.forEach(need => {
      supportCounts[need] = (supportCounts[need] || 0) + 1;
    });
  });

  const averageConfidence = totalCount > 0 ? parseFloat((totalConfidence / totalCount).toFixed(1)) : 0;
  const anonymousPercentage = totalCount > 0 ? parseFloat(((anonymousCount / totalCount) * 100).toFixed(1)) : 0;

  // Top Stress Areas Sorted
  const topStressAreas = Object.entries(stressCounts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top Support Needs Sorted
  const topSupportNeeds = Object.entries(supportCounts)
    .map(([need, count]) => ({ need, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent Submissions (limit to 6 for the dashboard)
  const recentSubmissions = [...activeRecords]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Confidence over time (aggregate daily/weekly average of confidence levels)
  // Let's sort records chronologically first
  const chronoRecords = [...activeRecords].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Group confidence daily or by staggered intervals for a smoother trend line (e.g. up to 10 points)
  const confidenceOverTime = aggregateConfidenceTrend(chronoRecords);

  // Weekly Activity (number of check-ins per week)
  const weeklyActivity = aggregateWeeklySubmissions(chronoRecords);

  return {
    moodDistribution,
    averageConfidence,
    topStressAreas,
    topSupportNeeds,
    totalCount,
    anonymousCount,
    identifiedCount,
    anonymousPercentage,
    recentSubmissions,
    confidenceOverTime,
    weeklyActivity
  };
}

// Helper to calculate confidence trend chronologically
function aggregateConfidenceTrend(records: CheckinRecord[]): { date: string; confidence: number }[] {
  if (records.length === 0) return [];
  
  const dailyGroups: Record<string, { sum: number; count: number }> = {};
  
  records.forEach(r => {
    const dateObj = new Date(r.createdAt);
    // Format date as "MMM DD" (e.g., "Jun 12")
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dailyGroups[dateStr]) {
      dailyGroups[dateStr] = { sum: 0, count: 0 };
    }
    dailyGroups[dateStr].sum += r.confidence;
    dailyGroups[dateStr].count++;
  });

  return Object.entries(dailyGroups).map(([date, data]) => ({
    date,
    confidence: parseFloat((data.sum / data.count).toFixed(1))
  }));
}

// Helper to count submissions by week
function aggregateWeeklySubmissions(records: CheckinRecord[]): { week: string; count: number }[] {
  const weeklyGroups: Record<string, number> = {};

  records.forEach(r => {
    const dateObj = new Date(r.createdAt);
    // Get ISO Week Number or just standard date-based week grouping
    // e.g. "Week of Jun 14"
    const startOfWeek = new Date(dateObj);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);
    
    const weekStr = 'Week of ' + startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weeklyGroups[weekStr] = (weeklyGroups[weekStr] || 0) + 1;
  });

  return Object.entries(weeklyGroups).map(([week, count]) => ({
    week,
    count
  }));
}
