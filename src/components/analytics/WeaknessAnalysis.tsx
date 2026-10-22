'use client';

import { useState, useEffect } from 'react';

interface WeaknessData {
  weakSubjects: Array<{
    subject: string;
    course: string;
    avgScore: number;
    attempts: number;
  }>;
  recentPoor: Array<{
    title: string;
    percentage: number;
    completedAt: string;
    courseTitle: string;
  }>;
  suggestions: Array<{
    subject: string;
    course: string;
    totalLectures: number;
    notesCompleted: number;
  }>;
}

export default function WeaknessAnalysis() {
  const [data, setData] = useState<WeaknessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeakness = async () => {
      try {
        const res = await fetch('/api/student/analytics/weakness');
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch weakness error:', err);
      }
      setLoading(false);
    };
    fetchWeakness();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Weak Subjects */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Weak Areas</h3>
        {data.weakSubjects.length === 0 ? (
          <p className="text-sm text-slate-500">No weak areas identified yet</p>
        ) : (
          <div className="space-y-2">
            {data.weakSubjects.map(sub => (
              <div key={sub.subject} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{sub.subject}</p>
                  <p className="text-xs text-slate-500">{sub.course}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{sub.avgScore}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Poor Performances */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Needs Improvement</h3>
        {data.recentPoor.length === 0 ? (
          <p className="text-sm text-slate-500">All tests above threshold</p>
        ) : (
          <div className="space-y-2">
            {data.recentPoor.map((test, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{test.title}</p>
                  <p className="text-xs text-slate-500">{test.courseTitle}</p>
                </div>
                <span className="text-sm font-bold text-yellow-600">{test.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Suggestions</h3>
        {data.suggestions.length === 0 ? (
          <p className="text-sm text-slate-500">Keep up the good work!</p>
        ) : (
          <div className="space-y-2">
            {data.suggestions.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{sub.subject}</p>
                  <p className="text-xs text-slate-500">{sub.notesCompleted}/{sub.totalLectures} notes completed</p>
                </div>
                <span className="text-xs text-blue-600">Complete notes</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
