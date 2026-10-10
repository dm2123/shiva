'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Child {
  studentId: string;
  name: string;
  email: string;
  studentClass: string;
  enrolledCourses: number;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch('/api/parent/children');
        const data = await res.json();
        if (data.success) setChildren(data.data.children);
      } catch (err) {
        console.error('Fetch children error:', err);
      }
      setLoading(false);
    };
    fetchChildren();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {children.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No linked students found</p>
        </div>
      ) : (
        children.map(child => (
          <Link
            key={child.studentId}
            href={`/parent/${child.studentId}`}
            className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">
                  {child.name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{child.name}</h3>
                <p className="text-sm text-slate-500">
                  Class {child.studentClass} • {child.enrolledCourses} courses
                </p>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
