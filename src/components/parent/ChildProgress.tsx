'use client';

import { useState, useEffect } from 'react';

interface ChildProgressProps {
  studentId: string;
}

export default function ChildProgress({ studentId }: ChildProgressProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/parent/children/${studentId}/progress`);
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch progress error:', err);
      }
      setLoading(false);
    };
    fetchProgress();
  }, [studentId]);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading progress...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-slate-500">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{data.courses.length}</p>
          <p className="text-sm text-slate-500">Courses</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{data.totalXP}</p>
          <p className="text-sm text-slate-500">XP Earned</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{data.totalStreak}</p>
          <p className="text-sm text-slate-500">Active Days</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{data.recentTests.length}</p>
          <p className="text-sm text-slate-500">Tests Taken</p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Enrolled Courses</h3>
        {data.courses.length === 0 ? (
          <p className="text-sm text-slate-500">No courses enrolled</p>
        ) : (
          <div className="space-y-2">
            {data.courses.map((course: any) => (
              <div key={course.courseId} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{course.title}</span>
                <span className="text-xs text-slate-500">{course.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Tests */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Recent Test Scores</h3>
        {data.recentTests.length === 0 ? (
          <p className="text-sm text-slate-500">No tests taken yet</p>
        ) : (
          <div className="space-y-2">
            {data.recentTests.map((test: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{test.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(test.completedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`text-sm font-bold ${test.percentage >= 75 ? 'text-green-600' : test.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {test.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
