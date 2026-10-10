'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SolutionViewer from '@/components/ncert/SolutionViewer';
import Link from 'next/link';

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

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">Chapter not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href={`/app/ncert/${classLevel}/${subject}`} className="text-indigo-600 hover:underline text-sm">
        ← Back to Chapters
      </Link>
      <SolutionViewer chapter={data} />
    </div>
  );
}
