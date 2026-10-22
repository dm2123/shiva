'use client';

import { useState, useEffect } from 'react';

interface OverviewData {
  coursesEnrolled: number;
  totalTests: number;
  avgScore: number;
  highestScore: number;
  lowestScore: number;
  totalXP: number;
  totalStreak: number;
  doubtsAsked: number;
  doubtsResolved: number;
  leaderboardRank: number | string;
}

export default function AnalyticsOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/student/analytics/overview');
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch overview error:', err);
      }
      setLoading(false);
    };
    fetchOverview();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!data) return null;

  const stats = [
    { label: 'Courses', value: data.coursesEnrolled, icon: '📚', color: 'bg-blue-500' },
    { label: 'Tests Taken', value: data.totalTests, icon: '📝', color: 'bg-green-500' },
    { label: 'Avg Score', value: `${data.avgScore}%`, icon: '📊', color: 'bg-purple-500' },
    { label: 'Best Score', value: `${data.highestScore}%`, icon: '🏆', color: 'bg-yellow-500' },
    { label: 'Total XP', value: data.totalXP, icon: '⭐', color: 'bg-indigo-500' },
    { label: 'Active Days', value: data.totalStreak, icon: '🔥', color: 'bg-orange-500' },
    { label: 'Doubts', value: `${data.doubtsResolved}/${data.doubtsAsked}`, icon: '❓', color: 'bg-red-500' },
    { label: 'Rank', value: `#${data.leaderboardRank}`, icon: '🏅', color: 'bg-pink-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
