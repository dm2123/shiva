'use client';

// ============================================================
// THE SHIVA — Student Dashboard (/app) — v4 (Wave A pixel polish)
// PW ke logged-in 'Study' page ki EXACT sanrachna, unke asal
// screenshot se milakar (2 Nov ki PW study). v4 me pixel pass:
// chips h-11 + 36px gray icon circle + 16px extrabold number,
// cards p-7/radius-16, tiles 52px icon dabba + PW-palette
// pastel hex, promo crossfade carousel, Quick Access 48px
// icon dabba:
//   Header row: 'Study' bada title (baayen) + streak/XP chips
//   (daayen, halki pill me) → (asal ho to) validity alert →
//   My Learning card (3 pastel tiles) → Boost Your Learning
//   card (6 pastel tiles, 3×2) → safed card ke andar promo
//   carousel (sirf asal free courses) → Quick Access CARD
//   (title andar, PDF Bank + Bookmarks outlined sub-cards) →
//   brand line. Iske alawa /app par KOI section nahi hai.
// PW par greeting line nahi hoti — yahan bhi nahi. Chips top
// bar me dashboard par nahi dikhte (wahan duplication hota
// tha); ve isi header row me hain, bilkul PW ki tarah.
// Saara data server page (page.tsx) asal DB se bhejta hai;
// jo data nahi hai, uski jagah imaandaar sub-line aati hai —
// koi invent count/price/rating nahi.
// Style: halka gray bg (layout), safed cards radius 16px,
// patli border, pastel tiles; violet #6d28d9 accent,
// gold #f5b942 sirf badge/chip par.
// ============================================================

import { useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  IconBatches, IconPlay, IconDoubts, IconLibrary, IconUsers,
  IconAssignment, IconTarget, IconBookmark, IconClock, IconX,
  IconFlame, IconStar, IconCalendar, IconBook,
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

/** Asal PUBLISHED free course (promo carousel ke liye) */
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
  /** Asal published free courses (zyada se zyada 3) */
  promoCourses: DashboardPromoCourse[];
  /** DailyStreaks se asal current streak; load na ho to null */
  streak: number | null;
  /** StudentXP se asal total XP; load na ho to null */
  totalXP: number | null;
}

const CARD =
  'rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] sm:p-7';
const SECTION_TITLE = 'text-[19px] font-bold leading-snug text-gray-900';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

/** Pastel tile — PW anatomy: bada safed icon dabba, bold label, gray sub-line */
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
      className={`flex min-h-[136px] min-w-0 flex-col rounded-xl p-3.5 transition hover:shadow-sm sm:min-h-[154px] sm:p-5 ${bg}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm sm:h-[52px] sm:w-[52px] sm:rounded-[14px]">
        <Icon size={24} className={iconColor} />
      </span>
      <span className="mt-3 text-[13.5px] font-bold leading-tight text-gray-900 sm:text-[15px]">{label}</span>
      <span className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-gray-500">{sub}</span>
    </Link>
  );
}

/** Header-row chip — PW pattern: halki safed pill, icon + bold ginti */
function HeaderChip({
  Icon,
  iconColor,
  value,
  label,
  href,
}: {
  Icon: IconComponent;
  iconColor: string;
  value: string;
  label: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 ${iconColor}`}>
        <Icon size={18} />
      </span>
      <span className="pr-1.5 text-[16px] font-extrabold tabular-nums leading-none text-gray-900">{value}</span>
    </>
  );
  const cls =
    'inline-flex h-11 items-center gap-2.5 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]';
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-violet-300`} aria-label={label}>
      {inner}
    </Link>
  ) : (
    <span className={cls} aria-label={label}>
      {inner}
    </span>
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
  enrollments,
  doubtSummary,
  recentLearning,
  promoCourses,
  streak,
  totalXP,
}: PWDashboardProps) {
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

  // ── Promo carousel state ───────────────────────────────────
  const [promoIdx, setPromoIdx] = useState(0);
  const promo = promoCourses[promoIdx] || promoCourses[0] || null;

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
    { label: 'Library', sub: 'Notes, eBooks aur sheets', Icon: IconLibrary, href: '/app/library', bg: 'bg-[#e7f0ff]', iconColor: 'text-blue-600' },
    { label: 'Doubt Poocho', sub: 'Sawal poochho, jawab pao', Icon: IconDoubts, href: '/app/doubts', bg: 'bg-[#ffe8d1]', iconColor: 'text-orange-600' },
    { label: 'Mentors', sub: 'Mentor se sahi guidance', Icon: IconUsers, href: '/app/mentors', bg: 'bg-[#fdf0c2]', iconColor: 'text-amber-600' },
    { label: 'Study Plan', sub: 'Apni taiyaari plan karo', Icon: IconCalendar, href: '/app/study-plan', bg: 'bg-[#ece7ff]', iconColor: 'text-violet-600' },
    { label: 'Question Bank', sub: 'Topic-wise sawal', Icon: IconTarget, href: '/app/question-bank', bg: 'bg-[#ffe3ee]', iconColor: 'text-pink-600' },
    { label: 'DPP', sub: 'Roz ke practice problems', Icon: IconAssignment, href: '/app/dpp', bg: 'bg-[#dcf5e3]', iconColor: 'text-emerald-600' },
  ];

  return (
    <main className="mx-auto w-full max-w-[54rem] space-y-6 px-4 py-6 pb-10">
      {/* ── 1. Header row: 'Study' + asal streak/XP chips ──── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
        <h1 className="text-[28px] font-extrabold leading-none text-gray-900">Study</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-2.5">
          {streak !== null && (
            <HeaderChip
              Icon={IconFlame}
              iconColor="text-orange-500"
              value={String(streak)}
              label={`${streak} din ki streak`}
              href="/app/streak"
            />
          )}
          {totalXP !== null && (
            <HeaderChip
              Icon={IconStar}
              iconColor="text-[#d97706]"
              value={Number(totalXP).toLocaleString('en-IN')}
              label={`${totalXP} XP`}
            />
          )}
        </div>
      </div>

      {/* ── 2. Validity alert — sirf asal condition par ────── */}
      {nearestExpiring && !alertDismissed && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5" role="alert">
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
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-4">
          <PastelTile
            href="/app/batches"
            Icon={IconBatches}
            label="My Batches"
            sub={batchSub}
            bg="bg-[#e7f0ff]"
            iconColor="text-blue-600"
          />
          <PastelTile
            href="/app/my-courses"
            Icon={IconPlay}
            label="Recent Learning"
            sub={recentSub}
            bg="bg-[#ffe8d1]"
            iconColor="text-orange-600"
          />
          <PastelTile
            href="/app/doubts"
            Icon={IconDoubts}
            label="My Doubts"
            sub={doubtSub}
            bg="bg-[#dcf5e3]"
            iconColor="text-emerald-600"
          />
        </div>
      </section>

      {/* ── 4. Boost Your Learning — 6 pastel tiles (3×2) ──── */}
      <section className={CARD} aria-label="Boost Your Learning">
        <h2 className={SECTION_TITLE}>Boost Your Learning</h2>
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-4">
          {BOOST_TILES.map((t) => (
            <PastelTile key={t.label} {...t} />
          ))}
        </div>
      </section>

      {/* ── 5. Promo carousel — safed card ke andar, sirf asal
             published free courses ─────────────────────────── */}
      {promo && (
        <section className={CARD} aria-label="Free courses">
          {/* Saari slides ek hi grid cell me stacked — slide badalne
              par opacity crossfade (smooth transition), height sabse
              bade slide ke barabar */}
          <div className="grid overflow-hidden rounded-xl">
            {promoCourses.map((c, i) => (
              <div
                key={c.id}
                aria-hidden={i !== promoIdx}
                className={`col-start-1 row-start-1 flex min-h-[150px] flex-col justify-center bg-gradient-to-r from-[#2a1650] to-[#6d28d9] p-6 text-white transition-opacity duration-500 sm:min-h-[168px] sm:p-8 ${
                  i === promoIdx ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <span className="inline-flex self-start rounded-full bg-[#f5b942] px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider text-[#2a1650]">
                  Free Course
                </span>
                <span className="mt-3 block text-[19px] font-extrabold leading-snug sm:text-[22px]">
                  {c.title}
                </span>
                <span className="mt-1 block max-w-md text-[13px] leading-relaxed text-white/75">
                  Bilkul free course — enroll karke aaj hi padhai shuru karo.
                </span>
                <Link
                  href={`/app/courses/${c.id}`}
                  tabIndex={i === promoIdx ? 0 : -1}
                  className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-[#2a1650] transition hover:shadow-md"
                >
                  Shuru karo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
          {promoCourses.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {promoCourses.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setPromoIdx(i)}
                  aria-label={`Banner ${i + 1}: ${c.title}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === promoIdx ? 'w-6 bg-[#6d28d9]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 6. Quick Access — safed card, title andar ──────── */}
      <section className={CARD} aria-label="Quick Access">
        <h2 className={SECTION_TITLE}>Quick Access</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Link
            href="/app/library"
            className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-violet-300 hover:shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[#6d28d9]">
              <IconBook size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold leading-snug text-gray-900">PDF Bank</span>
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
            className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-violet-300 hover:shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[#6d28d9]">
              <IconBookmark size={22} />
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
      <p className="pt-1 text-center text-[12px] font-medium text-gray-400">
        THE SHIVA — padhai, sahi direction me.
      </p>
    </main>
  );
}
