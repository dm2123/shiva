'use client';

// ============================================================
// THE SHIVA — Student Dashboard (/app) — v2
// PW ke logged-in 'Study' page ki EXACT sanrachna (1:1):
//   'Study' title + greeting → (asal ho to) validity alert →
//   My Learning card (3 pastel tiles) → Boost Your Learning
//   card (6 pastel tiles) → asal free-course promo banner →
//   Quick Access (2 outlined cards) → brand line.
// Iske alawa /app par KOI section nahi hai. Streak/XP chips
// shell ke top bar me rehte hain (layout) — yahan duplicate
// nahi hote. Saara data server page (page.tsx) asal DB se
// bhejta hai; jo data nahi hai, uski jagah imaandaar
// sub-line aati hai — koi invent count/price/rating nahi.
// Style: halka gray bg (layout), safed cards radius 12px,
// patli border, pastel tiles; violet #6d28d9 accent,
// gold #f5b942 sirf badge/chip par.
// ============================================================

import { useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  IconBatches, IconPlay, IconDoubts, IconLibrary, IconUsers,
  IconTestSeries, IconAssignment, IconTarget, IconBookmark, IconClock, IconX,
} from '@/components/student/ShivaIcons';

export interface DashboardEnrollment {
  courseId: string;
  courseTitle: string;
  batchName: string | null;
  enrolledAt: string | null;
  /** Batches.endDate — asal batch validity ka aakhri din */
  batchEndDate: string | null;
  /** Courses.validityMonths — asal validity avadhi (mahine); na ho to null */
  validityMonths: number | null;
}

export interface DashboardDoubtSummary {
  total: number;
  open: number;
  resolved: number;
}

export interface DashboardRecentLearning {
  lectureId: string;
  lectureTitle: string;
  courseId: string;
  courseTitle: string;
  isCompleted: boolean;
  lastWatchedAt: string | null;
}

/** Asal PUBLISHED free course (promo strip ke liye); na ho to null */
export interface DashboardPromoCourse {
  id: string;
  title: string;
  slug: string | null;
}

export interface PWDashboardProps {
  userName: string;
  enrollments: DashboardEnrollment[];
  /** Doubts table se asal ginti */
  doubtSummary: DashboardDoubtSummary;
  /** LectureProgress se asal haal ki activity (sabse taza pehle) */
  recentLearning: DashboardRecentLearning[];
  promoCourse: DashboardPromoCourse | null;
}

const CARD =
  'rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]';
const SECTION_TITLE = 'text-[17px] font-bold leading-snug text-gray-900';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

/** Pastel tile — PW anatomy: safed icon dabba, bold label, chhoti gray sub-line */
function PastelTile({
  href,
  Icon,
  label,
  sub,
  bg,
  iconColor,
}: {
  href: string;
  Icon: IconComponent;
  label: string;
  sub: string;
  bg: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-col rounded-xl p-3 transition hover:shadow-sm sm:p-4 ${bg}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white shadow-sm">
        <Icon size={20} className={iconColor} />
      </span>
      <span className="mt-2.5 text-[15px] font-bold leading-tight text-gray-900">{label}</span>
      <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-gray-500">{sub}</span>
    </Link>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

/** Ek enrollment ki asal validity ka aakhri din: batch endDate pehle,
 *  warna enrolledAt + course validityMonths. Dono na hon to null (koi alert nahi). */
function expiryOf(e: DashboardEnrollment): Date | null {
  if (e.batchEndDate) {
    const d = new Date(e.batchEndDate);
    return isNaN(d.getTime()) ? null : d;
  }
  if (e.enrolledAt && e.validityMonths && e.validityMonths > 0) {
    const d = new Date(e.enrolledAt);
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + e.validityMonths);
    return d;
  }
  return null;
}

export default function PWDashboard({
  userName,
  enrollments,
  doubtSummary,
  recentLearning,
  promoCourse,
}: PWDashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (userName || '').split(' ')[0] || 'Student';
  const greetingLine = `${greeting}, ${firstName} — ${
    recentLearning.length > 0 || enrollments.length > 0
      ? 'jahan chhoda tha, wahin se shuru karo.'
      : 'aaj kya seekhna hai? Chalo shuru karte hain.'
  }`;

  // ── Validity alert — sirf asal expiry (30 din ke andar / khatam) par ──
  const [alertDismissed, setAlertDismissed] = useState(false);
  const now = Date.now();
  const expiring = enrollments
    .map((e) => {
      const expiry = expiryOf(e);
      if (!expiry) return null;
      const daysLeft = Math.ceil((expiry.getTime() - now) / 86400000);
      return daysLeft <= 30 ? { e, expiry, daysLeft } : null;
    })
    .filter((x): x is { e: DashboardEnrollment; expiry: Date; daysLeft: number } => x !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const nearestExpiring = expiring[0] || null;

  // ── My Learning tiles ki asal sub-lines ────────────────────
  const batchSub =
    enrollments.length > 0
      ? `${enrollments.length} ${enrollments.length === 1 ? 'batch' : 'batches'} joined`
      : 'Apne batches dekho';
  const recentSub = recentLearning[0]
    ? recentLearning[0].courseTitle
    : 'Jahan chhoda tha, wahi se';
  const doubtSub =
    doubtSummary.open > 0
      ? `${doubtSummary.open} doubts ka jawab baaki`
      : doubtSummary.total > 0
        ? `Kul ${doubtSummary.total} doubts poochhe`
        : 'Doubts aur unke jawab';

  const BOOST_TILES = [
    { label: 'Library', sub: 'Notes, eBooks aur sheets', Icon: IconLibrary, href: '/app/library', bg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { label: 'Doubt Poocho', sub: 'Sawal poochho, jawab pao', Icon: IconDoubts, href: '/app/doubts', bg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Mentors', sub: 'Mentor se sahi guidance', Icon: IconUsers, href: '/app/mentors', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Tests', sub: 'Mock tests aur test series', Icon: IconTestSeries, href: '/app/tests', bg: 'bg-rose-50', iconColor: 'text-rose-600' },
    { label: 'DPP', sub: 'Roz ke practice problems', Icon: IconAssignment, href: '/app/dpp', bg: 'bg-lime-50', iconColor: 'text-lime-600' },
    { label: 'Question Bank', sub: 'Topic-wise sawal', Icon: IconTarget, href: '/app/question-bank', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-5 px-4 py-5 pb-8">
      {/* ── 1. Page header: 'Study' + greeting ─────────────── */}
      <div>
        <h1 className="text-[22px] font-extrabold leading-tight text-gray-900">Study</h1>
        <p className="mt-1 text-[13px] text-gray-500">{greetingLine}</p>
      </div>

      {/* ── 2. Validity alert — sirf asal condition par ────── */}
      {nearestExpiring && !alertDismissed && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5" role="alert">
          <span className="mt-0.5 shrink-0 text-red-500">
            <IconClock size={18} />
          </span>
          <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
            <p className="font-bold text-red-800">
              {nearestExpiring.daysLeft < 0
                ? `‘${nearestExpiring.e.courseTitle}’ ki validity khatam ho gayi hai`
                : nearestExpiring.daysLeft === 0
                  ? `‘${nearestExpiring.e.courseTitle}’ ki validity aaj khatam ho rahi hai`
                  : `‘${nearestExpiring.e.courseTitle}’ ki validity ${nearestExpiring.daysLeft} din me khatam hogi`}
            </p>
            <p className="mt-0.5 text-red-600">
              {`Valid till ${formatDate(nearestExpiring.expiry.toISOString())}`}
              {expiring.length > 1 && ` · kul ${expiring.length} courses ki validity nazdeek hai`}
              {' · '}
              <Link href="/app/my-courses" className="font-bold underline underline-offset-2">
                My Courses me dekho
              </Link>
            </p>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            aria-label="Alert band karo"
            className="flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-full text-red-400 transition hover:bg-red-100 hover:text-red-600"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      {/* ── 3. My Learning — ek safed card, 3 pastel tiles ─── */}
      <section className={CARD} aria-label="My Learning">
        <h2 className={SECTION_TITLE}>My Learning</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <PastelTile
            href="/app/batches"
            Icon={IconBatches}
            label="My Batches"
            sub={batchSub}
            bg="bg-sky-50"
            iconColor="text-sky-600"
          />
          <PastelTile
            href="/app/my-courses"
            Icon={IconPlay}
            label="Recent Learning"
            sub={recentSub}
            bg="bg-orange-50"
            iconColor="text-orange-600"
          />
          <PastelTile
            href="/app/doubts"
            Icon={IconDoubts}
            label="My Doubts"
            sub={doubtSub}
            bg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>
      </section>

      {/* ── 4. Boost Your Learning — 6 pastel tiles (3×2) ──── */}
      <section className={CARD} aria-label="Boost Your Learning">
        <h2 className={SECTION_TITLE}>Boost Your Learning</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {BOOST_TILES.map((t) => (
            <PastelTile key={t.label} {...t} />
          ))}
        </div>
      </section>

      {/* ── 5. Promo strip — sirf asal published free course ── */}
      {promoCourse && (
        <Link
          href={`/app/courses/${promoCourse.id}`}
          className="block rounded-xl bg-gradient-to-r from-[#2a1650] to-[#6d28d9] p-5 text-white transition hover:shadow-md sm:p-6"
        >
          <span className="inline-flex rounded-full bg-[#f5b942] px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider text-[#2a1650]">
            Free Course
          </span>
          <span className="mt-3 block text-[18px] font-extrabold leading-snug sm:text-[20px]">
            {promoCourse.title}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-white/75">
            Bilkul free course — enroll karke aaj hi padhai shuru karo.
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-[#2a1650]">
            Shuru karo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </Link>
      )}

      {/* ── 6. Quick Access — 2 outlined cards ─────────────── */}
      <section aria-label="Quick Access">
        <h2 className={SECTION_TITLE}>Quick Access</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link
            href="/app/library"
            className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-violet-300 hover:shadow-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-violet-50 text-[#6d28d9]">
              <IconLibrary size={21} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-snug text-gray-900">Study Material</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-gray-500">
                Notes, sheets aur PDFs ek jagah
              </span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-300" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link
            href="/app/bookmarks"
            className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-violet-300 hover:shadow-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-violet-50 text-[#6d28d9]">
              <IconBookmark size={21} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-snug text-gray-900">Bookmarks</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-gray-500">
                Save kiye hue sawal aur lectures
              </span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-300" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── 7. Band karne wali brand line ──────────────────── */}
      <p className="pt-2 text-center text-[12px] font-medium text-gray-400">
        THE SHIVA — padhai, sahi direction me.
      </p>
    </main>
  );
}
