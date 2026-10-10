'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Scholarship {
  id: string;
  title: string;
  courseTitle: string;
  totalMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  scholarshipPercentage: number;
  totalAttempts: number;
  highScore: number;
}

export default function ScholarshipList() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const res = await fetch('/api/student/scholarships');
        const data = await res.json();
        if (data.success) setScholarships(data.data.scholarships);
      } catch (err) {
        console.error('Fetch scholarships error:', err);
      }
      setLoading(false);
    };
    fetchScholarships();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading scholarships...</div>;
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('en-IN');

  return (
    <div className="space-y-4">
      {scholarships.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No scholarship tests available</p>
        </div>
      ) : (
        scholarships.map(s => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{s.courseTitle}</p>
                <div className="flex gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                  <span>📝 {s.totalMarks} marks</span>
                  <span>⏱️ {s.durationMinutes} min</span>
                  <span>👥 {s.totalAttempts} attempts</span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-slate-500">Start: </span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatDate(s.startTime)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                  Up to {s.scholarshipPercentage}% off
                </div>
                <Link
                  href={`/app/scholarships/${s.id}`}
                  className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                >
                  Take Test
                </Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
