'use client';

import MentorSessions from '@/components/mentorship/MentorSessions';
import Link from 'next/link';

export default function MentorSessionsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/app/mentors" className="text-indigo-600 hover:underline text-sm">
          ← Back to mentors
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">My Sessions</h1>
      </div>
      <MentorSessions />
    </div>
  );
}
