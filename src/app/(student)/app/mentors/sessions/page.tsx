'use client';

import MentorSessions from '@/components/mentorship/MentorSessions';
import Link from 'next/link';
import { IconArrowLeft, IconCalendar } from '@/components/student/StudentIcons';

export default function MentorSessionsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/app/mentors"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--student-text-muted)] hover:text-[var(--student-primary)] transition-colors min-h-[44px]"
      >
        <IconArrowLeft size={16} />
        Back to mentors
      </Link>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] p-6 sm:p-7 text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-[#f5b942]/20 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <IconCalendar size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">My Sessions</h1>
            <p className="text-[13px] text-violet-100 mt-0.5">
              Tumhari booked mentorship sessions — upcoming aur past, sab yahan.
            </p>
          </div>
        </div>
      </div>

      <MentorSessions />
    </div>
  );
}
