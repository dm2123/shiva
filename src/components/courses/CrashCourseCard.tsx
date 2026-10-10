'use client';

import { useState } from 'react';

interface CrashCourseCardProps {
  id: string;
  title: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  teacherName?: string;
  onEnroll?: (id: string) => void;
}

export default function CrashCourseCard({ id, title, durationDays, startDate, endDate, teacherName, onEnroll }: CrashCourseCardProps) {
  const [enrolling, setEnrolling] = useState(false);

  async function handleEnroll() {
    if (onEnroll) {
      setEnrolling(true);
      onEnroll(id);
      setEnrolling(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          {teacherName && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">by {teacherName}</p>
          )}
        </div>
        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
          {durationDays} days
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Start</p>
          <p className="font-medium text-slate-900 dark:text-white">{new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">End</p>
          <p className="font-medium text-slate-900 dark:text-white">{new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {enrolling ? 'Enrolling...' : 'Enroll Now'}
      </button>
    </div>
  );
}
