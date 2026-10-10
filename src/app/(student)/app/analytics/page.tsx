'use client';

import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import SubjectWiseChart from '@/components/analytics/SubjectWiseChart';
import WeaknessAnalysis from '@/components/analytics/WeaknessAnalysis';
import PerformanceTrends from '@/components/analytics/PerformanceTrends';

export default function AnalyticsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h1>
      <AnalyticsOverview />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubjectWiseChart />
        <WeaknessAnalysis />
      </div>
      <PerformanceTrends />
    </div>
  );
}
