'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SolutionViewer from '@/components/ncert/SolutionViewer';
import Link from 'next/link';
import { IconArrowLeft, IconBookOpen } from '@/components/student/StudentIcons';

export default function NCERTChapterPage() {
  const params = useParams();
  const classLevel = params.class as string;
  const subject = params.subject as string;
  const chapter = params.chapter as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await fetch(`/api/student/ncert/${classLevel}/${subject}/${chapter}`);
        const result = await res.json();
        if (result.success) setData(result.data.chapter);
      } catch (err) {
        console.error('Fetch chapter error:', err);
      }
      setLoading(false);
    };
    fetchChapter();
  }, [classLevel, subject, chapter]);

  const backPill = (
    <Link
      href={`/app/ncert/${classLevel}/${subject}`}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--student-border)] bg-[var(--student-surface)] text-xs font-bold text-[var(--student-text-secondary)] hover:border-[#6d28d9] hover:text-[#6d28d9] transition-colors"
    >
      <IconArrowLeft size={13} />
      Back to Chapters
    </Link>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" aria-label="Loading chapter">
        {backPill}
        <div className="skeleton h-32 rounded-3xl" />
        <div className="student-card p-6 md:p-8 space-y-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/5" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {backPill}
        <div className="student-card p-8 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white flex items-center justify-center shadow-md shadow-[#6d28d9]/25">
            <IconBookOpen size={26} />
          </div>
          <p className="text-sm font-bold text-[var(--student-text)]">Chapter nahi mila</p>
          <p className="text-xs text-[var(--student-text-muted)] leading-relaxed max-w-sm mx-auto">
            Ye chapter abhi available nahi hai. Chapters ki list se koi aur chapter choose karo — solutions jald jud rahe hain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {backPill}
      <SolutionViewer chapter={data} />
    </div>
  );
}
