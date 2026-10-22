'use client';

import { useParams } from 'next/navigation';
import ChildProgress from '@/components/parent/ChildProgress';
import Link from 'next/link';

export default function ChildDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/parent" className="text-indigo-600 hover:underline text-sm">
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Progress</h1>
      <ChildProgress studentId={studentId} />
    </div>
  );
}
