'use client';

import { useState, useEffect } from 'react';

interface TrendsData {
  scoreTrends: Array<{
    percentage: number;
    completedAt: string;
    title: string;
  }>;
  xpTrends: Array<{
    date: string;
    xp: number;
  }>;
  activity: Array<{
    date: string;
    activities: number;
  }>;
}

export default function PerformanceTrends() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch('/api/student/analytics/trends');
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch trends error:', err);
      }
      setLoading(false);
    };
    fetchTrends();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!data) return null;

  const maxXP = Math.max(...data.xpTrends.map(d => d.xp), 1);

  return (
    <div className="space-y-4">
      {/* Score Trend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Score Trend</h3>
        {data.scoreTrends.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No test data yet</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {data.scoreTrends.map((test, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t ${
                    test.percentage >= 70 ? 'bg-green-500' : test.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${test.percentage}%` }}
                  title={`${test.title}: ${test.percentage}%`}
                />
                <span className="text-[8px] text-slate-400 mt-1 truncate w-full text-center">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* XP Trend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">XP Earned (Last 30 Days)</h3>
        {data.xpTrends.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No XP data yet</p>
        ) : (
          <div className="flex items-end gap-1 h-24">
            {data.xpTrends.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-indigo-500 rounded-t"
                  style={{ height: `${(day.xp / maxXP) * 100}%` }}
                  title={`${day.date}: ${day.xp} XP`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Activity Heatmap</h3>
        <div className="grid grid-cols-7 gap-1">
          {data.activity.map((day, i) => {
            const intensity = Math.min(day.activities / 5, 1);
            return (
              <div
                key={i}
                className="aspect-square rounded"
                style={{
                  backgroundColor: `rgba(79, 70, 229, ${0.1 + intensity * 0.9})`,
                }}
                title={`${day.date}: ${day.activities} activities`}
              />
            );
          })}
        </div>
        <div className="flex justify-center gap-2 mt-2 text-xs text-slate-500">
          <span>Less</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v, i) => (
            <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: `rgba(79, 70, 229, ${v})` }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
