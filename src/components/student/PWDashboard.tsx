'use client';

// ============================================================
// THE SHIVA — Student Study Home (dashboard)
// PW grammar (light): safed cards, ~12px radius, patli border,
// ek violet accent (#6d28d9) + gold (#f5b942) sirf gamification
// par, primary CTA kaale. Structure:
// 'Study' header card (greeting + asal chips) → asal validity
// alert (ho to) → My Learning (3 pastel tiles) → Continue
// Learning (banner cards) → aaj ka schedule → hafta strip →
// announcements + Boost Your Learning (pastel tiles) →
// Quick Access → Popular Exams → Recommended.
// HAR number asal data se aata hai (server page.tsx DB se
// bhejta hai). Jo data nahi mila, wo card/section honest
// empty state dikhata hai ya dikhta hi nahi — koi fake
// count, promo ya placeholder nahi.
// NOTE: saari stat lines single template-string se banti hain
// taaki JSX whitespace bug ('0din streak', 'Is hafte0/7 din')
// dobara na aaye.
// ============================================================

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  IconSSC, IconRailway, IconBanking, IconDefence, IconTeaching,
  IconTestSeries, IconDoubts, IconLibrary, IconLive, IconTrophy,
  IconBatches, IconAssignment, IconFlame, IconPlay, IconBook, IconClock, IconCheck,
  IconBookmark, IconSearch, IconX, IconUsers, IconTarget, IconDownload,
} from '@/components/student/ShivaIcons';

export interface DashboardEnrollment {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  price: number;
  batchName: string | null;
  enrolledAt: string | null;
  /** LectureProgress ki sabse taza activity (asal last-watched) */
  lastActivityAt: string | null;
  /** Batches.endDate — asal batch validity ka aakhri din */
  batchEndDate: string | null;
  /** Courses.validityMonths — asal validity avadhi (mahine); na ho to null */
  validityMonths: number | null;
  totalLectures: number;
  completedLectures: number;
  /** Lecture jahan student ruka tha (asal Video/Lecture progress se) */
  resumeLecture: { id: string; title: string } | null;
  /** Agli incomplete lecture (course order me pehli baaki) */
  nextLecture: { id: string; title: string } | null;
  /** Courses.thumbnailUrl — asal value; file exist kare, koi guarantee nahi */
  thumbnailUrl: string | null;
}

export interface DashboardLiveClass {
  id: string;
  title: string;
  status: string; // 'LIVE' | 'SCHEDULED'
  startTime: string; // ISO
  meetingUrl: string | null;
}

export interface DashboardWeekDay {
  label: string; // 'S' | 'M' | 'T' | 'W' | 'F' …
  active: boolean;
  isToday: boolean;
}

export interface DashboardStreak {
  currentStreak: number;
  totalDays: number;
  week: DashboardWeekDay[]; // pichhle 7 din, aaj last
}

export interface DashboardDoubt {
  id: string;
  title: string;
  status: string; // 'OPEN' | 'RESOLVED' | …
  courseTitle: string | null;
  createdAt: string | null;
}

export interface DashboardDoubtSummary {
  total: number;
  open: number;
  resolved: number;
  recent: DashboardDoubt[];
}

export interface DashboardRecentLearning {
  lectureId: string;
  lectureTitle: string;
  courseId: string;
  courseTitle: string;
  isCompleted: boolean;
  lastWatchedAt: string | null;
}

export interface DashboardAnnouncement {
  id: string;
  title: string;
  message: string;
  createdAt: string | null;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  /** Courses.thumbnailUrl — asal value; file exist kare, koi guarantee nahi */
  thumbnailUrl: string | null;
  /** Courses.language — ho tabhi pill dikhta hai */
  language: string | null;
}

export interface PWDashboardProps {
  userName: string;
  userEmail: string;
  /** StudentProfiles.targetExam — asal goal; na ho to null */
  goal: string | null;
  enrollments: DashboardEnrollment[];
  /** Aaj (IST) ki live + scheduled classes */
  todaysClasses: DashboardLiveClass[];
  /** Aaj ke baad ki sabse pehli upcoming class (aaj wali ho to null rakho) */
  nextClass: DashboardLiveClass | null;
  /** DailyStreaks se asal streak; load na ho paya ho to null */
  streak: DashboardStreak | null;
  /** StudentXP ka asal total; load na ho paya ho to null */
  totalXP: number | null;
  pendingDoubts: number;
  /** Doubts table se asal summary + haal ke doubts */
  doubtSummary: DashboardDoubtSummary;
  /** LectureProgress se asal haal ki dekhi hui lectures */
  recentLearning: DashboardRecentLearning[];
  /** TeacherAnnouncements se asal announcements (Boost carousel ke liye) */
  announcements: DashboardAnnouncement[];
  /** ContentBookmarks ki asal ginti */
  bookmarksCount: number;
  recommended: RecommendedCourse[];
}

const GOALS = [
  { label: 'SSC', Icon: IconSSC, bg: 'bg-sky-50', border: 'border-sky-100', iconColor: 'text-sky-600', href: '/app/goals?exam=ssc' },
  { label: 'Railway', Icon: IconRailway, bg: 'bg-emerald-50', border: 'border-emerald-100', iconColor: 'text-emerald-600', href: '/app/goals?exam=railway' },
  { label: 'Banking', Icon: IconBanking, bg: 'bg-amber-50', border: 'border-amber-100', iconColor: 'text-amber-600', href: '/app/goals?exam=banking' },
  { label: 'Defence', Icon: IconDefence, bg: 'bg-orange-50', border: 'border-orange-100', iconColor: 'text-orange-600', href: '/app/goals?exam=defence' },
  { label: 'Teaching', Icon: IconTeaching, bg: 'bg-violet-50', border: 'border-violet-100', iconColor: 'text-violet-600', href: '/app/goals?exam=teaching' },
];

/* Boost tiles — student app ke asal routes hi (PW pattern: pastel tile grid) */
const BOOST_TILES = [
  { label: 'Library', Icon: IconLibrary, href: '/app/library', bg: 'bg-violet-50', iconColor: 'text-[#6d28d9]' },
  { label: 'Doubts', Icon: IconDoubts, href: '/app/doubts', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { label: 'Mentors', Icon: IconUsers, href: '/app/mentors', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Tests', Icon: IconTestSeries, href: '/app/tests', bg: 'bg-sky-50', iconColor: 'text-sky-600' },
  { label: 'DPP', Icon: IconAssignment, href: '/app/dpp', bg: 'bg-rose-50', iconColor: 'text-rose-600' },
  { label: 'PYQ', Icon: IconClock, href: '/app/pyq', bg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { label: 'Question Bank', Icon: IconTarget, href: '/app/question-bank', bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { label: 'NCERT', Icon: IconBook, href: '/app/ncert', bg: 'bg-teal-50', iconColor: 'text-teal-600' },
];

/* Banner fallback ke liye brand gradients (slug hash se stable) */
const BANNER_GRADIENTS = [
  'linear-gradient(120deg,#2a1650,#6d28d9)',
  'linear-gradient(120deg,#4c1d95,#7c3aed)',
  'linear-gradient(120deg,#312e81,#6d28d9)',
  'linear-gradient(120deg,#2a1650,#8b5cf6)',
];

function gradientFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length];
}

const STAR_KEY = 'shiva-starred-batches';

const CARD = 'bg-white border border-gray-200 rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.05)]';
const VIEW_ALL = 'shrink-0 rounded-full bg-violet-50 px-3 py-1.5 text-[12.5px] font-bold text-[#6d28d9] transition hover:bg-violet-100';

function learnHref(e: DashboardEnrollment): string {
  const lecture = e.resumeLecture ?? e.nextLecture;
  return lecture ? `/app/learn/${e.courseId}?lecture=${lecture.id}` : `/app/learn/${e.courseId}`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch { return ''; }
}

function formatDayTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch { return ''; }
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

/** Asal last-watched ko dostana relative samay me ("aaj", "kal", "3 din pehle") */
function formatRelative(iso: string | null): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return 'Aaj';
  if (days === 1) return 'Kal';
  if (days < 30) return `${days} din pehle`;
  return formatDate(iso);
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

/**
 * Course banner — asal thumbnail load ho to wahi; URL khaali ho ya
 * image fail ho (seed/legacy paths par file hoti hi nahi) to
 * designed brand-gradient tile: course title ki typography ke
 * saath. Kabhi kaala dabba ya tooti hui image nahi dikhti.
 */
function CourseBanner({
  title,
  seedKey,
  thumbnailUrl,
  pill,
}: {
  title: string;
  seedKey: string;
  thumbnailUrl: string | null;
  pill?: ReactNode;
}) {
  const usable = typeof thumbnailUrl === 'string' && thumbnailUrl.trim().length > 0;
  const [imgOk, setImgOk] = useState(usable);
  useEffect(() => { setImgOk(usable); }, [usable, thumbnailUrl]);
  return (
    <span className="relative block aspect-[16/9] overflow-hidden bg-gray-100">
      {usable && imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl as string}
          alt={title}
          loading="lazy"
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center"
          style={{ background: gradientFor(seedKey) }}
          aria-hidden="true"
        >
          <IconBook size={30} className="text-white/85" />
          <span className="line-clamp-2 text-[15px] font-extrabold leading-snug text-white">{title}</span>
        </span>
      )}
      {pill}
    </span>
  );
}

export default function PWDashboard({
  userName, goal, enrollments, todaysClasses, nextClass, streak, totalXP,
  doubtSummary, recentLearning, announcements, bookmarksCount, recommended,
}: PWDashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (userName || '').split(' ')[0] || 'Student';

  const continueList = enrollments.slice(0, 4);
  const firstContinue = enrollments[0] || null;
  const totalCompleted = enrollments.reduce((s, e) => s + e.completedLectures, 0);
  const totalLectures = enrollments.reduce((s, e) => s + e.totalLectures, 0);
  const weekActive = streak ? streak.week.filter((d) => d.active).length : 0;

  const greetingLine = `${greeting}, ${firstName} — ${firstContinue
    ? 'jahan chhoda tha, wahin se shuru karo.'
    : 'aaj kya seekhna hai? Chalo shuru karte hain.'}`;

  // Hafta caption — hisse asal data par hi judte hain, ek hi string me
  const weekCaption = streak
    ? [
        `Is hafte ${weekActive}/7 din active rahe`,
        streak.totalDays > 0 ? `kul ${streak.totalDays} din padhai ki` : null,
        streak.currentStreak > 0 ? `streak ${streak.currentStreak} din` : null,
      ].filter(Boolean).join(' · ')
    : '';

  // ── Validity alert — sirf asal expiry (30 din ke andar / khatam) par ──
  const [alertDismissed, setAlertDismissed] = useState(false);
  const expiring = useMemo(() => {
    const now = Date.now();
    return enrollments
      .map((e) => {
        const expiry = expiryOf(e);
        if (!expiry) return null;
        const daysLeft = Math.ceil((expiry.getTime() - now) / 86400000);
        return daysLeft <= 30 ? { e, expiry, daysLeft } : null;
      })
      .filter((x): x is { e: DashboardEnrollment; expiry: Date; daysLeft: number } => x !== null)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [enrollments]);
  const nearestExpiring = expiring[0] || null;

  // ── My Batches drawer — search + starred (star sirf is device ki pasand,
  //    localStorage me; koi server data nahi badalta) ──
  const [batchesOpen, setBatchesOpen] = useState(false);
  const [batchQuery, setBatchQuery] = useState('');
  const [starred, setStarred] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STAR_KEY);
      if (raw) setStarred(new Set(JSON.parse(raw) as string[]));
    } catch { /* pasand na mile to bina star ke list chalegi */ }
  }, []);
  const toggleStar = (courseId: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId); else next.add(courseId);
      try { window.localStorage.setItem(STAR_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };
  useEffect(() => {
    if (!batchesOpen) return;
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setBatchesOpen(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [batchesOpen]);
  const filteredBatches = useMemo(() => {
    const q = batchQuery.trim().toLowerCase();
    const list = q
      ? enrollments.filter((e) =>
          e.courseTitle.toLowerCase().includes(q) || (e.batchName || '').toLowerCase().includes(q))
      : enrollments;
    return [...list].sort((a, b) => Number(starred.has(b.courseId)) - Number(starred.has(a.courseId)));
  }, [enrollments, batchQuery, starred]);

  const QUICK_ACCESS = [
    { label: 'PDF Bank', Icon: IconDownload, href: '/app/ebooks' },
    { label: 'Bookmarks', Icon: IconBookmark, href: '/app/bookmarks', badge: bookmarksCount > 0 ? bookmarksCount : 0 },
    { label: 'Live Classes', Icon: IconLive, href: '/app/live' },
  ];

  return (
    <div>
      <main className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-4 pb-10">

        {/* ── Header card: Study + greeting + asal chips ────── */}
        <section className={`${CARD} p-4 sm:p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-gray-900">Study</h1>
              <p className="mt-0.5 text-[13px] text-gray-500">{greetingLine}</p>
            </div>
            {goal ? (
              <Link href="/app/goals" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-[#6d28d9] transition hover:bg-violet-100">
                <span aria-hidden>🎯</span>
                <span>{goal}</span>
              </Link>
            ) : (
              <Link href="/app/goals" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f5b942] px-3 py-1.5 text-[12px] font-bold text-[#2a1650] transition hover:bg-[#ffcf6b]">
                <span aria-hidden>🎯</span>
                <span>Apna goal set karo</span>
              </Link>
            )}
          </div>

          {(streak !== null || totalXP !== null || totalLectures > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {streak !== null && (
                <Link href="/app/streak" className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-[12px] font-bold text-orange-700 transition hover:bg-orange-100">
                  <IconFlame size={14} className="text-orange-500" />
                  <span>{`${streak.currentStreak} din streak`}</span>
                </Link>
              )}
              {totalXP !== null && (
                <Link href="/app/analytics" className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-700 transition hover:bg-amber-100">
                  <IconTrophy size={14} className="text-[#d99a17]" />
                  <span>{`${Number(totalXP).toLocaleString('en-IN')} XP`}</span>
                </Link>
              )}
              {totalLectures > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700">
                  <IconCheck size={14} className="text-emerald-500" />
                  <span>{`${totalCompleted}/${totalLectures} lectures done`}</span>
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {firstContinue ? (
              <Link href={learnHref(firstContinue)} className="inline-flex items-center gap-2 rounded-[10px] bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black">
                <IconPlay size={15} />
                <span>Continue Learning</span>
              </Link>
            ) : (
              <Link href="/app/courses" className="inline-flex items-center rounded-[10px] bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black">
                Explore Courses →
              </Link>
            )}
            <Link href="/app/my-courses" className="inline-flex items-center rounded-[10px] border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 transition hover:border-gray-400">
              My Courses
            </Link>
          </div>
        </section>

        {/* ── Validity alert — sirf asal expiry par, band ho sakta hai ── */}
        {nearestExpiring && !alertDismissed && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5" role="alert">
            <span className="mt-0.5 shrink-0 text-red-500"><IconClock size={18} /></span>
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
                <Link href="/app/my-courses" className="font-bold underline underline-offset-2">My Courses me dekho</Link>
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

        {/* ── My Learning — ek safed card, 3 pastel tiles ───── */}
        <section>
          <h2 className="mb-3 text-base font-bold text-gray-900">My Learning</h2>
          <div className={`${CARD} grid gap-3 p-3 sm:grid-cols-3 sm:p-4`}>

            {/* My Batches — asal enrollments; drawer me search + starred */}
            <div className="flex flex-col rounded-xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#6d28d9] shadow-sm">
                  <IconBatches size={20} />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">My Batches</h3>
                {enrollments.length > 0 && (
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#6d28d9]">{`${enrollments.length}`}</span>
                )}
              </div>
              {enrollments.length === 0 ? (
                <p className="mt-3 flex-1 text-[12.5px] leading-relaxed text-gray-500">
                  Abhi koi batch join nahi kiya hai. Course me enroll karte hi tumhara batch yahan dikhega.
                </p>
              ) : (
                <ul className="mt-3 flex-1 space-y-2">
                  {enrollments.slice(0, 2).map((e) => (
                    <li key={e.courseId} className="text-[12.5px] leading-snug">
                      <Link href={learnHref(e)} className="line-clamp-1 font-semibold text-gray-800 transition-colors hover:text-[#6d28d9]">
                        {e.batchName || e.courseTitle}
                      </Link>
                      {e.batchName && <span className="line-clamp-1 text-gray-400">{e.courseTitle}</span>}
                    </li>
                  ))}
                  {enrollments.length > 2 && (
                    <li className="text-[12px] text-gray-400">{`+ ${enrollments.length - 2} aur batches/courses`}</li>
                  )}
                </ul>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setBatchesOpen(true)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-gray-900 px-3 py-2 text-[12.5px] font-bold text-white transition hover:bg-black"
                >
                  <IconSearch size={13} />
                  <span>Batches khojo</span>
                </button>
                <Link href="/app/batches" className="inline-flex items-center justify-center rounded-[10px] border border-violet-200 bg-white px-3 py-2 text-[12.5px] font-bold text-[#6d28d9] transition hover:bg-violet-100">
                  Saare →
                </Link>
              </div>
            </div>

            {/* Recent Learning — asal last-watched lectures */}
            <div className="flex flex-col rounded-xl border border-sky-100 bg-sky-50 p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-sky-600 shadow-sm">
                  <IconPlay size={20} />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">Recent Learning</h3>
              </div>
              {recentLearning.length === 0 ? (
                <p className="mt-3 flex-1 text-[12.5px] leading-relaxed text-gray-500">
                  Abhi koi lecture nahi dekha hai. Pehli lecture shuru karte hi tumhari haal ki padhai yahan dikhegi.
                </p>
              ) : (
                <ul className="mt-3 flex-1 space-y-2.5">
                  {recentLearning.map((r) => (
                    <li key={r.lectureId} className="text-[12.5px] leading-snug">
                      <Link href={`/app/learn/${r.courseId}?lecture=${r.lectureId}`} className="line-clamp-1 font-semibold text-gray-800 transition-colors hover:text-[#6d28d9]">
                        {r.lectureTitle}
                      </Link>
                      <span className="line-clamp-1 text-gray-400">
                        {`${r.courseTitle} · ${formatRelative(r.lastWatchedAt)}${r.isCompleted ? ' · Poora dekha' : ''}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/app/my-courses" className="mt-4 inline-flex items-center justify-center rounded-[10px] border border-sky-200 bg-white px-3 py-2 text-[12.5px] font-bold text-sky-700 transition hover:bg-sky-100">
                Continue Learning →
              </Link>
            </div>

            {/* My Doubts — asal counts + haal ka doubt */}
            <div className="flex flex-col rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-amber-600 shadow-sm">
                  <IconDoubts size={20} />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">My Doubts</h3>
                {doubtSummary.open > 0 && (
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-amber-600">{`${doubtSummary.open} open`}</span>
                )}
              </div>
              {doubtSummary.total === 0 ? (
                <p className="mt-3 flex-1 text-[12.5px] leading-relaxed text-gray-500">
                  Abhi koi doubt nahi poochha hai. Kahin atko to sawal poochho — teacher ka jawab yahin milega.
                </p>
              ) : (
                <div className="mt-3 flex-1">
                  <p className="text-[12.5px] text-gray-500">
                    {`Kul ${doubtSummary.total} doubts · ${doubtSummary.resolved} hal hue · ${doubtSummary.open} jawab baaki`}
                  </p>
                  {doubtSummary.recent[0] && (
                    <div className="mt-2 text-[12.5px] leading-snug">
                      <span className="text-gray-400">Haal ka sawal:</span>{' '}
                      <Link href="/app/doubts" className="line-clamp-1 font-semibold text-gray-800 transition-colors hover:text-[#6d28d9]">
                        {doubtSummary.recent[0].title}
                      </Link>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${doubtSummary.recent[0].status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-amber-600'}`}>
                        {doubtSummary.recent[0].status}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <Link href="/app/doubts" className="mt-4 inline-flex items-center justify-center rounded-[10px] border border-amber-200 bg-white px-3 py-2 text-[12.5px] font-bold text-amber-700 transition hover:bg-amber-100">
                Doubt poochho →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Continue Learning — banner cards, asal progress ── */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-900">Continue Learning</h2>
            {enrollments.length > 0 && (
              <Link href="/app/my-courses" className={VIEW_ALL}>View all →</Link>
            )}
          </div>

          {enrollments.length === 0 ? (
            <div className={`${CARD} p-8 text-center`}>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[10px] bg-violet-50 text-[#6d28d9]">
                <IconBook size={26} />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900">Abhi koi course nahi liya hai</h3>
              <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-gray-500">
                Tumne abhi tak kisi course me enroll nahi kiya. Courses dekho aur apni
                taiyaari aaj se shuru karo.
              </p>
              <Link href="/app/courses" className="mt-4 inline-block rounded-[10px] bg-gray-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-black">
                Courses dekhein →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {continueList.map((e) => {
                const pct = e.totalLectures === 0 ? 0 : Math.round((e.completedLectures / e.totalLectures) * 100);
                const done = e.totalLectures > 0 && e.completedLectures >= e.totalLectures;
                const upNext = e.resumeLecture
                  ? { label: 'Wahin se jaari rakho', title: e.resumeLecture.title }
                  : e.nextLecture
                    ? { label: 'Up next', title: e.nextLecture.title }
                    : null;
                return (
                  <article key={e.courseId} className={`${CARD} flex flex-col overflow-hidden`}>
                    <Link href={learnHref(e)} aria-label={e.courseTitle}>
                      <CourseBanner
                        title={e.courseTitle}
                        seedKey={e.courseSlug || e.courseId}
                        thumbnailUrl={e.thumbnailUrl}
                        pill={
                          <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${e.price === 0 ? 'bg-emerald-600 text-white' : 'bg-white/95 text-gray-900'}`}>
                            {e.price === 0 ? 'Free' : `₹${Number(e.price).toLocaleString('en-IN')}`}
                          </span>
                        }
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900">{e.courseTitle}</h3>
                      {e.batchName && <p className="mt-1 text-xs text-gray-500">{`Batch: ${e.batchName}`}</p>}
                      {e.lastActivityAt && (
                        <p className="mt-0.5 text-xs text-gray-400">{`Aakhri baar dekha: ${formatRelative(e.lastActivityAt)}`}</p>
                      )}

                      {e.totalLectures > 0 ? (
                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-gray-500">{`${e.completedLectures} / ${e.totalLectures} lectures`}</span>
                            <span className="font-bold text-[#6d28d9]">{`${pct}%`}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-[#6d28d9] transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-gray-400">Is course ki lectures jald aa rahi hain.</p>
                      )}

                      {done ? (
                        <p className="mt-3 text-xs font-semibold text-emerald-600">🎉 Course poora ho gaya — badhai ho!</p>
                      ) : upNext ? (
                        <p className="mt-3 truncate text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">{`${upNext.label}:`}</span>{` ${upNext.title}`}
                        </p>
                      ) : null}

                      <div className="flex-1" />
                      <Link href={learnHref(e)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-gray-900 px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-black">
                        <IconPlay size={14} />
                        <span>{done ? 'Dobara dekho' : 'Continue'}</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Aaj ka schedule (sirf asal classes par) ───────── */}
        {(todaysClasses.length > 0 || nextClass) && (
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">Aaj ka Schedule</h2>
              <Link href="/app/live" className={VIEW_ALL}>All classes →</Link>
            </div>
            {todaysClasses.length === 0 && nextClass ? (
              <div className={`${CARD} flex items-center gap-4 p-4 sm:p-5`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-violet-50">
                  <IconClock size={20} className="text-[#6d28d9]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">Aaj koi live class schedule nahi hai</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {`Agli class: ${nextClass.title} — ${formatDayTime(nextClass.startTime)}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todaysClasses.map((c) => {
                  const isLive = c.status === 'LIVE';
                  return (
                    <div key={c.id} className={`${CARD} flex flex-col gap-3 p-4 sm:p-5`}>
                      <div className="flex items-center justify-between">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-600">
                            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                            <span>Live Now</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#6d28d9]">
                            <IconClock size={12} />
                            <span>{formatTime(c.startTime)}</span>
                          </span>
                        )}
                        <IconLive size={18} className={isLive ? 'text-red-500' : 'text-gray-300'} />
                      </div>
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">{c.title}</h3>
                      <Link href={`/app/live/${c.id}`} className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-bold text-white transition ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-black'}`}>
                        <IconPlay size={14} />
                        <span>{isLive ? 'Join Now' : 'View Details'}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Hafta progress (asal DailyStreaks se) — 7 din, ek row ── */}
        {streak !== null && (
          <section className={`${CARD} p-4 sm:p-5`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">Tumhara Hafta</h2>
              <Link href="/app/streak" className={VIEW_ALL}>Streak dekho →</Link>
            </div>
            <div className="mx-auto grid max-w-md grid-cols-7 gap-1.5">
              {streak.week.map((d, i) => {
                const dayDate = new Date();
                dayDate.setDate(dayDate.getDate() - (6 - i));
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${d.active ? 'bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white' : d.isToday ? 'border-2 border-dashed border-[#6d28d9] text-[#6d28d9]' : 'bg-gray-100 text-gray-400'}`}>
                      {d.active ? <IconFlame size={15} /> : <span className="text-[12px] font-bold">{`${dayDate.getDate()}`}</span>}
                    </span>
                    <span className={`text-[10px] font-semibold ${d.isToday ? 'text-[#6d28d9]' : 'text-gray-400'}`}>{d.isToday ? 'Aaj' : d.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">{weekCaption}</p>
          </section>
        )}

        {/* ── Announcements (asal hon tabhi) — promo carousel ── */}
        {announcements.length > 0 && (
          <section>
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
              {announcements.map((a) => (
                <Link
                  key={a.id}
                  href="/app/announcements"
                  className="w-[300px] max-w-[85vw] shrink-0 snap-start rounded-xl bg-gradient-to-br from-[#2a1650] to-[#6d28d9] p-5 text-white transition hover:shadow-md"
                >
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">Announcement</span>
                  <h3 className="mt-3 line-clamp-2 text-[14px] font-bold leading-snug">{a.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/70">{a.message}</p>
                  {a.createdAt && <p className="mt-3 text-[11px] text-white/50">{formatDate(a.createdAt)}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Boost Your Learning — pastel tile grid ────────── */}
        <section>
          <h2 className="mb-3 text-base font-bold text-gray-900">Boost Your Learning</h2>
          <div className={`${CARD} p-3 sm:p-4`}>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {BOOST_TILES.map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className={`flex flex-col items-center gap-2 rounded-xl px-1 py-3.5 text-center transition hover:shadow-sm sm:py-4 ${t.bg}`}
                >
                  <t.Icon size={24} className={t.iconColor} />
                  <span className="flex min-h-[26px] items-start justify-center text-[11px] font-semibold leading-tight text-gray-700 sm:text-[12px]">
                    {t.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quick Access — chhote outlined cards ──────────── */}
        <section>
          <h2 className="mb-3 text-base font-bold text-gray-900">Quick Access</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACCESS.map((q) => (
              <Link key={q.label} href={q.href} className={`${CARD} relative flex items-center gap-2.5 px-3 py-3.5 transition hover:border-violet-300 sm:px-4`}>
                <q.Icon size={20} className="shrink-0 text-[#6d28d9]" />
                <span className="truncate text-[12.5px] font-semibold text-gray-700">{q.label}</span>
                {q.badge ? (
                  <span className="absolute -top-1.5 right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f5b942] px-1 text-[10px] font-black text-[#2a1650]">{`${q.badge}`}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Popular Exams ─────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-gray-900">Popular Exams</h2>
            <Link href="/app/goals" className={VIEW_ALL}>View all →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {GOALS.map((g) => (
              <Link key={g.label} href={g.href} className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-4 transition hover:shadow-sm ${g.bg} ${g.border}`}>
                <g.Icon size={30} className={g.iconColor} />
                <span className="text-[13px] font-semibold text-gray-800">{g.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recommended For You (asal published courses) ──── */}
        {recommended.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">Recommended For You</h2>
              <Link href="/app/courses" className={VIEW_ALL}>View all →</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((c) => {
                const isFree = Number(c.price) <= 0;
                return (
                  <Link key={c.id} href={`/app/courses/${c.id}`} className={`${CARD} group flex flex-col overflow-hidden transition hover:shadow-md`}>
                    <CourseBanner
                      title={c.title}
                      seedKey={c.slug || c.id}
                      thumbnailUrl={c.thumbnailUrl}
                      pill={
                        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${isFree ? 'bg-emerald-600 text-white' : 'bg-white/95 text-gray-900'}`}>
                          {isFree ? 'Free' : `₹${Number(c.price).toLocaleString('en-IN')}`}
                        </span>
                      }
                    />
                    <span className="flex flex-1 flex-col p-4">
                      {c.language && (
                        <span className="mb-2 self-start rounded-full bg-gray-100 px-2.5 py-1 text-[10.5px] font-semibold text-gray-600">{c.language}</span>
                      )}
                      <span className="line-clamp-2 text-[14.5px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#6d28d9]">{c.title}</span>
                      {c.description && <span className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-gray-500">{c.description}</span>}
                      <span className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className={`text-[15px] font-extrabold ${isFree ? 'text-emerald-600' : 'text-gray-900'}`}>
                          {isFree ? 'FREE' : `₹${Number(c.price).toLocaleString('en-IN')}`}
                        </span>
                        <span className="inline-flex items-center rounded-[10px] bg-gray-900 px-4 py-2 text-[12px] font-bold text-white transition group-hover:bg-black">
                          View Course
                        </span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ── My Batches drawer — search + starred (asal enrollments) ── */}
      {batchesOpen && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/50" onClick={() => setBatchesOpen(false)} aria-hidden="true" />
          <aside
            className="fixed bottom-0 right-0 top-0 z-[71] flex w-[380px] max-w-[92vw] flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="My Batches"
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-5 py-4">
              <span className="text-[#6d28d9]"><IconBatches size={20} /></span>
              <h2 className="flex-1 text-[15px] font-bold text-gray-900">My Batches</h2>
              <button
                onClick={() => setBatchesOpen(false)}
                aria-label="Batches band karo"
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="shrink-0 px-4 pt-4">
              <label className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-3 py-2.5">
                <IconSearch size={16} className="shrink-0 text-gray-400" />
                <input
                  value={batchQuery}
                  onChange={(ev) => setBatchQuery(ev.target.value)}
                  placeholder="Batch ya course khojo…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  aria-label="Batch ya course khojo"
                />
              </label>
              {starred.size > 0 && (
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  ⭐ Starred pehle dikhte hain
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {enrollments.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-[#6d28d9]">
                    <IconBatches size={24} />
                  </span>
                  <p className="mt-4 text-sm font-bold text-gray-900">Koi batch nahi hai</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    Tum abhi kisi course me enrolled nahi ho. Enroll karte hi batch yahan dikhega.
                  </p>
                  <Link href="/app/courses" onClick={() => setBatchesOpen(false)} className="mt-4 inline-block rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black">
                    Courses dekho
                  </Link>
                </div>
              ) : filteredBatches.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  {`‘${batchQuery}’ se koi batch nahi mila.`}
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredBatches.map((e) => {
                    const pct = e.totalLectures === 0 ? 0 : Math.round((e.completedLectures / e.totalLectures) * 100);
                    const isStarred = starred.has(e.courseId);
                    return (
                      <li key={e.courseId} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[13.5px] font-bold leading-snug text-gray-900">{e.batchName || e.courseTitle}</p>
                            {e.batchName && <p className="mt-0.5 line-clamp-1 text-[12px] text-gray-400">{e.courseTitle}</p>}
                          </div>
                          <button
                            onClick={() => toggleStar(e.courseId)}
                            aria-label={isStarred ? 'Star hatao' : 'Star karo'}
                            aria-pressed={isStarred}
                            className={`flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-full transition ${isStarred ? 'bg-amber-50 text-[#d99a17]' : 'text-gray-300 hover:bg-amber-50 hover:text-[#d99a17]'}`}
                          >
                            <span aria-hidden>⭐</span>
                          </button>
                        </div>
                        {e.totalLectures > 0 && (
                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-[11px]">
                              <span className="text-gray-400">{`${e.completedLectures}/${e.totalLectures} lectures`}</span>
                              <span className="font-bold text-[#6d28d9]">{`${pct}%`}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-[#6d28d9]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                        <Link
                          href={learnHref(e)}
                          onClick={() => setBatchesOpen(false)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-gray-900 px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-black"
                        >
                          <IconPlay size={13} />
                          <span>Continue</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-gray-100 px-4 py-3">
              <Link href="/app/batches" onClick={() => setBatchesOpen(false)} className="block py-1.5 text-center text-sm font-semibold text-[#6d28d9] transition hover:text-[#2a1650]">
                Saare batches dekho →
              </Link>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
