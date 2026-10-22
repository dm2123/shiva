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
      {/* Shaant header (andar ke pages ka standard) */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center text-white flex-shrink-0">
            <IconRecording size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--student-text)] tracking-tight">Class Recordings</h1>
            <p className="text-sm text-[var(--student-text-muted)] mt-0.5">Missed a class? Yahan se dobara dekho.</p>
          </div>
        </div>
        <p className="text-sm text-[var(--student-text-muted)] mt-3 max-w-xl leading-relaxed">
          Jo live classes khatm ho chuki hain aur jinki recording asal me upload hui hai,
          wahi yahan dikhengi — apni speed par dobara dekho, kabhi bhi. Recording taiyaar
          hone me thoda samay lag sakta hai.
        </p>
        <div className="flex flex-wrap gap-2.5 mt-4">
          <Link
            href="/app/live"
            className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-[#2a1650] transition-colors"
          >
            <IconLive size={15} />
            Live &amp; Upcoming Classes
          </Link>
          <Link
            href="/app/my-courses"
            className="inline-flex items-center gap-2 text-[var(--student-text)] text-xs font-bold px-4 py-2.5 rounded-full border border-[var(--student-border)] hover:bg-[var(--student-surface-hover)] transition-colors"
          >
            <IconPlay size={15} />
            My Courses
          </Link>
        </div>
      </div>

      {/* Recordings list (data-driven component) */}
      <SessionRecordings />
    </div>
  );
}
