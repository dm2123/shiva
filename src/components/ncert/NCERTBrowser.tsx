'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NCERTChapter {
  id: string;
  classLevel: string;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  content: string;
}

interface NCERTBrowserProps {
  classLevel?: string;
  subject?: string;
}

export default function NCERTBrowser({ classLevel, subject }: NCERTBrowserProps) {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<NCERTChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!classLevel) {
          const res = await fetch('/api/student/ncert');
          const data = await res.json();
          if (data.success) setClasses(data.data.classes);
        } else if (!subject) {
          const res = await fetch(`/api/student/ncert/${classLevel}`);
          const data = await res.json();
          if (data.success) setSubjects(data.data.subjects);
        } else {
          const res = await fetch(`/api/student/ncert/${classLevel}/${subject}`);
          const data = await res.json();
          if (data.success) setChapters(data.data.chapters);
        }
      } catch (err) {
        console.error('Fetch NCERT data error:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [classLevel, subject]);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  // Show classes
  if (!classLevel) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Select Class</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {classes.map(cls => (
            <Link
              key={cls}
              href={`/app/ncert/${cls}`}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center hover:shadow-lg transition-shadow"
            >
              <p className="text-2xl font-bold text-indigo-600">Class {cls}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Show subjects
  if (!subject) {
    return (
      <div className="space-y-4">
        <Link href="/app/ncert" className="text-indigo-600 hover:underline text-sm">
          ← All Classes
        </Link>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Class {classLevel} — Subjects</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {subjects.map(sub => (
            <Link
              key={sub}
              href={`/app/ncert/${classLevel}/${sub}`}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
            >
              <p className="font-bold text-slate-900 dark:text-white">{sub}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Show chapters
  return (
    <div className="space-y-4">
      <Link href={`/app/ncert/${classLevel}`} className="text-indigo-600 hover:underline text-sm">
        ← Back to Subjects
      </Link>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        Class {classLevel} — {subject}
      </h2>
      <div className="space-y-3">
        {chapters.map(ch => (
          <Link
            key={ch.id}
            href={`/app/ncert/${classLevel}/${subject}/${ch.chapterNumber}`}
            className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600">
                {ch.chapterNumber}
              </span>
              <span className="font-medium text-slate-900 dark:text-white">{ch.chapterTitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
