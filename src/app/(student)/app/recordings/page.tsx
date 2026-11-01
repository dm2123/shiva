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
      {/* ── Hero band (brand deep-purple, PW-style) ─────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
        style={{ background: 'linear-gradient(120deg, #2a1650 0%, #4c1d95 55%, #6d28d9 100%)' }}
      >
        <div
          className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#f5b942]/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <IconRecording size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Class Recordings</h1>
              <p className="text-[13px] text-violet-200 mt-0.5">Missed a class? Yahan se dobara dekho.</p>
            </div>
          </div>
          <p className="text-[13px] text-violet-100/90 mt-4 max-w-xl leading-relaxed">
            Jo live classes khatm ho chuki hain aur jinki recording asal me upload hui hai,
            wahi yahan dikhengi — apni speed par dobara dekho, kabhi bhi. Recording taiyaar
            hone me thoda samay lag sakta hai.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <Link
              href="/app/live"
              className="inline-flex items-center gap-2 bg-[#f5b942] text-[#2a1650] text-xs font-extrabold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            >
              <IconLive size={15} />
              Live &amp; Upcoming Classes
            </Link>
            <Link
              href="/app/my-courses"
              className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/15 transition-colors"
            >
              <IconPlay size={15} />
              My Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Recordings list (data-driven component) — card frame taaki page surface par sahi baithe */}
      <div className="student-card p-5 md:p-6">
        <SessionRecordings />
      </div>
    </div>
  );
}
