'use client';

import { useState, useEffect } from 'react';

interface SubjectData {
  subject: string;
  course: string;
  testsTaken: number;
  avgScore: number;
  highestScore: number;
}

export default function SubjectWiseChart() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/student/analytics/subject-wise');
        const data = await res.json();
        if (data.success) setSubjects(data.data.subjects);
      } catch (err) {
        console.error('Fetch subjects error:', err);
      }
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Subject-wise Performance</h3>
      {subjects.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No test data available</p>
      ) : (
        <div className="space-y-3">
          {subjects.map(sub => (
            <div key={sub.subject} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{sub.subject}</span>
                <span className="text-slate-500">{sub.avgScore}% ({sub.testsTaken} tests)</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getScoreColor(sub.avgScore)}`}
                  style={{ width: `${sub.avgScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
