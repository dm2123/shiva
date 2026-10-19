'use client';

import Link from 'next/link';
import SessionRecordings from '@/components/recordings/SessionRecordings';
import { IconLive, IconPlay } from '@/components/student/ShivaIcons';

/* Original recording icon */
function IconRecording({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="5.5" width="13" height="13" rx="3" />
      <path d="M16 10.5l5-2.8v8.6l-5-2.8" />
      <circle cx="9.5" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function RecordingsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-6 md:p-10 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-cyan-300/20 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-200 mb-2">Missed a class?</p>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Class Recordings</h1>
            <p className="text-sm md:text-base text-blue-50/90 mt-2 max-w-lg leading-relaxed">
              Saari live classes ki recordings yahan milengi — apni speed par dobara dekho, kabhi bhi.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-5">
              <Link
                href="/app/live"
                className="inline-flex items-center gap-2 bg-white text-blue-700 text-xs font-black px-4 py-2.5 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
              >
                <IconLive size={15} />
                Upcoming Live Classes
              </Link>
              <Link
                href="/app/my-courses"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white text-xs font-bold px-4 py-2.5 rounded-full border border-white/25 hover:bg-white/25 transition-colors"
              >
                <IconPlay size={15} />
                My Courses
              </Link>
            </div>
          </div>
          <div className="hidden md:flex w-28 h-28 rounded-3xl bg-white/15 backdrop-blur items-center justify-center text-white shrink-0">
            <IconRecording size={56} />
          </div>
        </div>
      </div>

      {/* Recordings list (data-driven component) */}
      <SessionRecordings />
    </div>
  );
}
