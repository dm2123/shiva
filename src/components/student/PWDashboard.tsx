'use client';

// ============================================================
// THE SHIVA — Student Study Home (dashboard)
// Structure (andar ke pages wala shaant pattern):
// 'Study' heading + greeting → asal validity alert (ho to) →
// My Learning trio (My Batches / Recent Learning / My Doubts) →
// Continue Learning → aaj ka schedule → hafta progress →
// Boost Your Learning → Quick Access → exams → Recommended.
// HAR number asal data se aata hai (server page.tsx DB se
// bhejta hai). Jo data nahi mila, wo card/section honest
// empty state dikhata hai ya dikhta hi nahi — koi fake
// count, promo ya placeholder nahi.
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  IconSSC, IconRailway, IconBanking, IconDefence, IconTeaching,
  IconTestSeries, IconDoubts, IconLibrary, IconLive, IconMyCourses, IconTrophy,
  IconBatches, IconAssignment, IconFlame, IconPlay, IconBook, IconClock, IconCheck,
  IconBookmark, IconStar, IconSearch, IconX, IconVideo,
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
  { label: 'SSC', Icon: IconSSC, bg: 'bg-blue-100', iconColor: 'text-blue-600', href: '/app/goals?exam=ssc' },
  { label: 'Railway', Icon: IconRailway, bg: 'bg-green-100', iconColor: 'text-green-600', href: '/app/goals?exam=railway' },
  { label: 'Banking', Icon: IconBanking, bg: 'bg-yellow-100', iconColor: 'text-yellow-600', href: '/app/goals?exam=banking' },
  { label: 'Defence', Icon: IconDefence, bg: 'bg-orange-100', iconColor: 'text-orange-600', href: '/app/goals?exam=defence' },
  { label: 'Teaching', Icon: IconTeaching, bg: 'bg-purple-100', iconColor: 'text-purple-600', href: '/app/goals?exam=teaching' },
];

const STAR_KEY = 'shiva-starred-batches';

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

  const QUICK_ACTIONS = [
    { label: 'My Courses', Icon: IconMyCourses, href: '/app/my-courses' },
    { label: 'My Batches', Icon: IconBatches, href: '/app/batches' },
    { label: 'Test Series', Icon: IconTestSeries, href: '/app/tests' },
    { label: 'PDF Bank', Icon: IconAssignment, href: '/app/ebooks' },
    { label: 'Library', Icon: IconLibrary, href: '/app/library' },
    { label: 'Bookmarks', Icon: IconBookmark, href: '/app/bookmarks', badge: bookmarksCount > 0 ? bookmarksCount : 0 },
    { label: 'Doubts', Icon: IconDoubts, href: '/app/doubts', badge: doubtSummary.open > 0 ? doubtSummary.open : 0 },
    { label: 'Live Classes', Icon: IconLive, href: '/app/live' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1200px] mx-auto px-4 py-4 space-y-6 pb-20">

        {/* ── Shaant heading: Study + greeting + asal chips ─── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold text-gray-900">Study</h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {greeting}, {firstName} — {firstContinue
                  ? 'jahan chhoda tha, wahin se shuru karo.'
                  : 'aaj kya seekhna hai? Chalo shuru karte hain.'}
              </p>
            </div>
            {goal ? (
              <Link href="/app/goals" className="inline-flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-[#6d28d9] rounded-full px-3 py-1.5 text-[12px] font-semibold transition shrink-0">
                <span aria-hidden>🎯</span> {goal}
              </Link>
            ) : (
              <Link href="/app/goals" className="inline-flex items-center gap-1.5 bg-[#f5b942] text-[#2a1650] rounded-full px-3 py-1.5 text-[12px] font-bold transition hover:bg-[#ffcf6b] shrink-0">
                🎯 Apna goal set karo
              </Link>
            )}
          </div>

          {(streak !== null || totalXP !== null || totalLectures > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {streak !== null && (
                <Link href="/app/streak" className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-700 transition">
                  <IconFlame size={14} className="text-orange-500" />
                  {streak.currentStreak} din streak
                </Link>
              )}
              {totalXP !== null && (
                <Link href="/app/analytics" className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-700 transition">
                  <IconTrophy size={14} className="text-[#d99a17]" />
                  {Number(totalXP).toLocaleString('en-IN')} XP
                </Link>
              )}
              {totalLectures > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-700">
                  <IconCheck size={14} className="text-emerald-600" />
                  {totalCompleted}/{totalLectures} lectures done
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {firstContinue ? (
              <Link href={learnHref(firstContinue)} className="inline-flex items-center gap-2 bg-[#2a1650] hover:bg-[#3b1d73] text-white text-sm font-bold rounded-xl px-5 py-2.5 transition">
                <IconPlay size={15} /> Continue Learning
              </Link>
            ) : (
              <Link href="/app/courses" className="inline-block bg-[#2a1650] hover:bg-[#3b1d73] text-white text-sm font-bold rounded-xl px-5 py-2.5 transition">
                Explore Courses →
              </Link>
            )}
            <Link href="/app/my-courses" className="inline-flex items-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-sm font-bold rounded-xl px-5 py-2.5 transition">
              My Courses
            </Link>
          </div>
        </section>

        {/* ── Validity alert — sirf asal expiry par, band ho sakta hai ── */}
        {nearestExpiring && !alertDismissed && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5" role="alert">
            <span className="text-red-500 mt-0.5 shrink-0"><IconClock size={18} /></span>
            <div className="flex-1 min-w-0 text-[13px] leading-relaxed">
              <p className="font-bold text-red-800">
                {nearestExpiring.daysLeft < 0
                  ? `‘${nearestExpiring.e.courseTitle}’ ki validity khatam ho gayi hai`
                  : nearestExpiring.daysLeft === 0
                    ? `‘${nearestExpiring.e.courseTitle}’ ki validity aaj khatam ho rahi hai`
                    : `‘${nearestExpiring.e.courseTitle}’ ki validity ${nearestExpiring.daysLeft} din me khatam hogi`}
              </p>
              <p className="text-red-700 mt-0.5">
                Valid till {formatDate(nearestExpiring.expiry.toISOString())}
                {expiring.length > 1 && <> · kul {expiring.length} courses ki validity nazdeek hai</>}
                {' '}· <Link href="/app/my-courses" className="font-bold underline underline-offset-2">My Courses me dekho</Link>
              </p>
            </div>
            <button
              onClick={() => setAlertDismissed(true)}
              aria-label="Alert band karo"
              className="shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full text-red-400 hover:bg-red-100 hover:text-red-600 transition"
            >
              <IconX size={16} />
            </button>
          </div>
        )}

        {/* ── My Learning — 3 asal cards ────────────────────── */}
        <section>
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">My Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* My Batches — asal enrollments; drawer me search + starred */}
            <div className="bg-violet-50/70 rounded-2xl border border-violet-100 p-5 flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#6d28d9] shrink-0">
                  <IconBatches size={20} />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">My Batches</h3>
                {enrollments.length > 0 && (
                  <span className="ml-auto text-[11px] font-bold text-[#6d28d9] bg-white rounded-full px-2 py-0.5">{enrollments.length}</span>
                )}
              </div>
              {enrollments.length === 0 ? (
                <p className="text-[12.5px] text-gray-500 leading-relaxed mt-3 flex-1">
                  Abhi koi batch join nahi kiya hai. Course me enroll karte hi tumhara batch yahan dikhega.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 flex-1">
                  {enrollments.slice(0, 2).map((e) => (
                    <li key={e.courseId} className="text-[12.5px] leading-snug">
                      <Link href={learnHref(e)} className="font-semibold text-gray-800 hover:text-[#6d28d9] line-clamp-1 transition-colors">
                        {e.batchName || e.courseTitle}
                      </Link>
                      {e.batchName && <span className="text-gray-400 line-clamp-1">{e.courseTitle}</span>}
                    </li>
                  ))}
                  {enrollments.length > 2 && (
                    <li className="text-[12px] text-gray-400">+ {enrollments.length - 2} aur batches/courses</li>
                  )}
                </ul>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setBatchesOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-[12.5px] font-bold rounded-xl px-3 py-2 transition"
                >
                  <IconSearch size={13} /> Batches khojo
                </button>
                <Link href="/app/batches" className="inline-flex items-center justify-center bg-white hover:bg-violet-100 border border-violet-100 text-[#6d28d9] text-[12.5px] font-bold rounded-xl px-3 py-2 transition">
                  Saare →
                </Link>
              </div>
            </div>

            {/* Recent Learning — asal last-watched lectures */}
            <div className="bg-sky-50/70 rounded-2xl border border-sky-100 p-5 flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sky-600 shrink-0">
                  <IconPlay size={20} />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">Recent Learning</h3>
              </div>
              {recentLearning.length === 0 ? (
                <p className="text-[12.5px] text-gray-500 leading-relaxed mt-3 flex-1">
                  Abhi koi lecture nahi dekha hai. Pehli lecture shuru karte hi tumhari haal ki padhai yahan dikhegi.
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5 flex-1">
                  {recentLearning.map((r) => (
                    <li key={r.lectureId} className="text-[12.5px] leading-snug">
                      <Link href={`/app/learn/${r.courseId}?lecture=${r.lectureId}`} className="font-semibold text-gray-800 hover:text-[#6d28d9] line-clamp-1 transition-colors">
                        {r.lectureTitle}
                      </Link>
                      <span className="text-gray-400 line-clamp-1">
                        {r.courseTitle} · {formatRelative(r.lastWatchedAt)}{r.isCompleted ? ' · Poora dekha' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/app/my-courses" className="mt-4 inline-flex items-center justify-center bg-white hover:bg-sky-100 border border-sky-100 text-sky-700 text-[12.5px] font-bold rounded-xl px-3 py-2 transition">
                Continue Learning →
              </Link>
            </div>

            {/* My Doubts — asal counts + haal ka doubt */}
            <div className="bg-amber-50/70 rounded-2xl border border-amber-100 p-5 flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shrink-0">
                  <IconDoubts size={20} />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">My Doubts</h3>
                {doubtSummary.open > 0 && (
                  <span className="ml-auto text-[11px] font-bold text-amber-700 bg-white rounded-full px-2 py-0.5">{doubtSummary.open} open</span>
                )}
              </div>
              {doubtSummary.total === 0 ? (
                <p className="text-[12.5px] text-gray-500 leading-relaxed mt-3 flex-1">
                  Abhi koi doubt nahi poochha hai. Kahin atko to sawal poochho — teacher ka jawab yahin milega.
                </p>
              ) : (
                <div className="mt-3 flex-1">
                  <p className="text-[12.5px] text-gray-500">
                    Kul <b className="text-gray-800">{doubtSummary.total}</b> doubts ·{' '}
                    <b className="text-gray-800">{doubtSummary.resolved}</b> hal hue ·{' '}
                    <b className="text-gray-800">{doubtSummary.open}</b> jawab baaki
                  </p>
                  {doubtSummary.recent[0] && (
                    <p className="text-[12.5px] leading-snug mt-2">
                      <span className="text-gray-400">Haal ka sawal:</span>{' '}
                      <Link href="/app/doubts" className="font-semibold text-gray-800 hover:text-[#6d28d9] line-clamp-1 transition-colors">
                        {doubtSummary.recent[0].title}
                      </Link>
                      <span className={`inline-flex mt-1 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${doubtSummary.recent[0].status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-amber-700'}`}>
                        {doubtSummary.recent[0].status}
                      </span>
                    </p>
                  )}
                </div>
              )}
              <Link href="/app/doubts" className="mt-4 inline-flex items-center justify-center bg-white hover:bg-amber-100 border border-amber-100 text-amber-700 text-[12.5px] font-bold rounded-xl px-3 py-2 transition">
                Doubt poochho →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Continue Learning / Continue Watching ─────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-gray-900">Continue Learning</h2>
            {enrollments.length > 0 && (
              <Link href="/app/my-courses" className="text-[13px] font-semibold text-[#6d28d9]">View all →</Link>
            )}
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-50 flex items-center justify-center text-[#6d28d9] mb-3">
                <IconBook size={26} />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900">Abhi koi course nahi liya hai</h3>
              <p className="text-[13px] text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                Tumne abhi tak kisi course me enroll nahi kiya. Courses dekho aur apni
                taiyaari aaj se shuru karo.
              </p>
              <Link href="/app/courses" className="inline-block mt-4 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-sm font-bold rounded-xl px-6 py-3 transition">
                Courses dekhein →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {continueList.map((e) => {
                const pct = e.totalLectures === 0 ? 0 : Math.round((e.completedLectures / e.totalLectures) * 100);
                const done = e.totalLectures > 0 && e.completedLectures >= e.totalLectures;
                const upNext = e.resumeLecture
                  ? { label: 'Wahin se jaari rakho', title: e.resumeLecture.title }
                  : e.nextLecture
                    ? { label: 'Up next', title: e.nextLecture.title }
                    : null;
                return (
                  <article key={e.courseId} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-2">{e.courseTitle}</h3>
                      <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${e.price === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {e.price === 0 ? 'Free' : `₹${Number(e.price).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    {e.batchName && <p className="text-xs text-gray-500 mt-1">Batch: {e.batchName}</p>}
                    {e.lastActivityAt && (
                      <p className="text-xs text-gray-400 mt-0.5">Aakhri baar dekha: {formatRelative(e.lastActivityAt)}</p>
                    )}

                    {e.totalLectures > 0 ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-500">{e.completedLectures} / {e.totalLectures} lectures</span>
                          <span className="font-bold text-[#6d28d9]">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#f5b942] transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-4">Is course ki lectures jald aa rahi hain.</p>
                    )}

                    {done ? (
                      <p className="text-xs font-semibold text-emerald-600 mt-3">🎉 Course poora ho gaya — badhai ho!</p>
                    ) : upNext ? (
                      <p className="text-xs text-gray-500 mt-3 truncate">
                        <span className="font-semibold text-gray-700">{upNext.label}:</span> {upNext.title}
                      </p>
                    ) : null}

                    <Link href={learnHref(e)} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6d28d9] text-white text-[13px] font-bold hover:bg-[#5b21b6] transition">
                      <IconPlay size={14} /> {done ? 'Dobara dekho' : 'Continue'}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Aaj ka schedule (sirf asal classes par) ───────── */}
        {(todaysClasses.length > 0 || nextClass) && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-900">Aaj ka Schedule</h2>
              <Link href="/app/live" className="text-[13px] font-semibold text-[#6d28d9]">All classes →</Link>
            </div>
            {todaysClasses.length === 0 && nextClass ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <span className="w-11 h-11 rounded-2xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <IconClock size={20} className="text-[#6d28d9]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">Aaj koi live class schedule nahi hai</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    Agli class: {nextClass.title} — {formatDayTime(nextClass.startTime)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaysClasses.map((c) => {
                  const isLive = c.status === 'LIVE';
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> Live Now
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#6d28d9]">
                            <IconClock size={12} /> {formatTime(c.startTime)}
                          </span>
                        )}
                        <IconLive size={18} className={isLive ? 'text-red-500' : 'text-gray-300'} />
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">{c.title}</h3>
                      <Link href={`/app/live/${c.id}`} className={`mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2a1650] hover:bg-[#3b1d73]'}`}>
                        <IconPlay size={14} /> {isLive ? 'Join Now' : 'View Details'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Hafta progress (asal DailyStreaks se) ─────────── */}
        {streak !== null && (
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-gray-900">Tumhara Hafta</h2>
              <Link href="/app/streak" className="text-[13px] font-semibold text-[#6d28d9]">Streak dekho →</Link>
            </div>
            <div className="flex items-end justify-between gap-2 max-w-md">
              {streak.week.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center ${d.active ? 'bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white' : d.isToday ? 'border-2 border-dashed border-[#6d28d9] text-[#6d28d9]' : 'bg-gray-100 text-gray-300'}`}>
                    {d.active ? <IconFlame size={15} /> : <span className="text-[11px] font-bold">{d.label}</span>}
                  </span>
                  <span className={`text-[10px] font-semibold ${d.isToday ? 'text-[#6d28d9]' : 'text-gray-400'}`}>{d.isToday ? 'Aaj' : d.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Is hafte <b className="text-gray-800">{weekActive}/7 din</b> active rahe
              {streak.totalDays > 0 && <> · kul <b className="text-gray-800">{streak.totalDays} din</b> padhai ki</>}
              {streak.currentStreak > 0 && <> · streak <b className="text-gray-800">{streak.currentStreak} din</b></>}
            </p>
          </section>
        )}

        {/* ── Boost Your Learning ───────────────────────────── */}
        <section>
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">Boost Your Learning</h2>

          {/* Promo carousel — sirf asal announcements hon tabhi */}
          {announcements.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x mb-4">
              {announcements.map((a) => (
                <Link
                  key={a.id}
                  href="/app/announcements"
                  className="snap-start flex-shrink-0 w-[300px] max-w-[85vw] bg-gradient-to-br from-[#2a1650] to-[#6d28d9] text-white rounded-2xl p-5 hover:shadow-md transition"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 rounded-full px-2.5 py-1">Announcement</span>
                  <h3 className="text-[14px] font-bold leading-snug line-clamp-2 mt-3">{a.title}</h3>
                  <p className="text-[12px] text-white/70 leading-relaxed line-clamp-2 mt-1">{a.message}</p>
                  {a.createdAt && <p className="text-[11px] text-white/50 mt-3">{formatDate(a.createdAt)}</p>}
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/app/library" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition group">
              <span className="w-11 h-11 rounded-2xl bg-violet-50 flex items-center justify-center text-[#6d28d9]">
                <IconLibrary size={22} />
              </span>
              <h3 className="text-[14px] font-bold text-gray-900 mt-3 group-hover:text-[#6d28d9] transition-colors">Library</h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed mt-1">
                Saara free study material ek jagah — short notes, PYQs, practice papers aur free lectures.
              </p>
              <span className="inline-block text-[12px] font-bold text-[#6d28d9] mt-3">Library kholo →</span>
            </Link>

            <Link href="/app/doubts" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition group">
              <span className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <IconDoubts size={22} />
              </span>
              <h3 className="text-[14px] font-bold text-gray-900 mt-3 group-hover:text-[#6d28d9] transition-colors">Ask Doubt</h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed mt-1">
                Kahin atke ho? Apna sawal likho — teacher ka jawab tumhare doubts page par milega.
              </p>
              <span className="inline-block text-[12px] font-bold text-[#6d28d9] mt-3">Sawal poochho →</span>
            </Link>

            <Link href="/app/video-solutions" className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition group">
              <span className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                <IconVideo size={22} />
              </span>
              <h3 className="text-[14px] font-bold text-gray-900 mt-3 group-hover:text-[#6d28d9] transition-colors">Video Solutions</h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed mt-1">
                Mushkil sawalon ke step-by-step video hal dekho aur concept turant saaf karo.
              </p>
              <span className="inline-block text-[12px] font-bold text-[#6d28d9] mt-3">Solutions dekho →</span>
            </Link>
          </div>
        </section>

        {/* ── Quick Access ──────────────────────────────────── */}
        <section>
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">Quick Access</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((q) => (
              <Link key={q.label} href={q.href} className="relative bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition">
                <span className="w-11 h-11 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <q.Icon size={24} className="text-[#6d28d9]" />
                </span>
                <span className="text-[12px] font-medium text-gray-700 text-center leading-tight">{q.label}</span>
                {q.badge ? (
                  <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f5b942] text-[#2a1650] text-[10px] font-black flex items-center justify-center">{q.badge}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Popular Exams ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-gray-900">Popular Exams</h2>
            <Link href="/app/goals" className="text-[13px] font-semibold text-[#6d28d9]">View all →</Link>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {GOALS.map((g) => (
              <Link key={g.label} href={g.href} className={`${g.bg} rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition`}>
                <g.Icon size={32} className={g.iconColor} />
                <span className="text-[13px] font-semibold text-gray-800">{g.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recommended For You (asal published courses) ──── */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-900">Recommended For You</h2>
              <Link href="/app/courses" className="text-[13px] font-semibold text-[#6d28d9]">View all →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
              {recommended.map((c) => (
                <Link key={c.id} href={`/app/courses/${c.id}`} className="snap-start flex-shrink-0 w-[260px] bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
                  <div className="h-24 bg-gradient-to-br from-[#2a1650] to-[#6d28d9] relative flex items-center justify-center">
                    <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-[#f5b942]/25" />
                    <span className="relative w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                      <IconBook size={22} />
                    </span>
                    <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-white text-[#6d28d9] px-2.5 py-1 rounded-full">
                      {Number(c.price) > 0 ? `₹${Number(c.price).toLocaleString('en-IN')}` : 'Free'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#6d28d9] transition-colors">{c.title}</h3>
                    {c.description && <p className="text-[12px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{c.description}</p>}
                    <span className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold text-[#6d28d9]">View course →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── My Batches drawer — search + starred (asal enrollments) ── */}
      {batchesOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[70]" onClick={() => setBatchesOpen(false)} aria-hidden="true" />
          <aside
            className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[92vw] bg-white z-[71] shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="My Batches"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
              <span className="text-[#6d28d9]"><IconBatches size={20} /></span>
              <h2 className="text-[15px] font-bold text-gray-900 flex-1">My Batches</h2>
              <button
                onClick={() => setBatchesOpen(false)}
                aria-label="Batches band karo"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="px-4 pt-4 shrink-0">
              <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <IconSearch size={16} className="text-gray-400 shrink-0" />
                <input
                  value={batchQuery}
                  onChange={(ev) => setBatchQuery(ev.target.value)}
                  placeholder="Batch ya course khojo…"
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none min-w-0"
                  aria-label="Batch ya course khojo"
                />
              </label>
              {starred.size > 0 && (
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-3">
                  ⭐ Starred pehle dikhte hain
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {enrollments.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <span className="mx-auto w-14 h-14 rounded-full bg-violet-50 text-[#6d28d9] flex items-center justify-center">
                    <IconBatches size={24} />
                  </span>
                  <p className="text-sm font-bold text-gray-800 mt-4">Koi batch nahi hai</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Tum abhi kisi course me enrolled nahi ho. Enroll karte hi batch yahan dikhega.
                  </p>
                  <Link href="/app/courses" onClick={() => setBatchesOpen(false)} className="inline-block mt-4 text-sm font-semibold text-white bg-[#6d28d9] hover:bg-[#2a1650] rounded-full px-5 py-2 transition">
                    Courses dekho
                  </Link>
                </div>
              ) : filteredBatches.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  ‘{batchQuery}’ se koi batch nahi mila.
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredBatches.map((e) => {
                    const pct = e.totalLectures === 0 ? 0 : Math.round((e.completedLectures / e.totalLectures) * 100);
                    const isStarred = starred.has(e.courseId);
                    return (
                      <li key={e.courseId} className="bg-white border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-bold text-gray-900 leading-snug line-clamp-2">{e.batchName || e.courseTitle}</p>
                            {e.batchName && <p className="text-[12px] text-gray-400 line-clamp-1 mt-0.5">{e.courseTitle}</p>}
                          </div>
                          <button
                            onClick={() => toggleStar(e.courseId)}
                            aria-label={isStarred ? 'Star hatao' : 'Star karo'}
                            aria-pressed={isStarred}
                            className={`shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full transition ${isStarred ? 'text-[#d99a17] bg-amber-50' : 'text-gray-300 hover:text-[#d99a17] hover:bg-amber-50'}`}
                          >
                            <IconStar size={16} />
                          </button>
                        </div>
                        {e.totalLectures > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-gray-400">{e.completedLectures}/{e.totalLectures} lectures</span>
                              <span className="font-bold text-[#6d28d9]">{pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#f5b942]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                        <Link
                          href={learnHref(e)}
                          onClick={() => setBatchesOpen(false)}
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#6d28d9] text-white text-[12.5px] font-bold hover:bg-[#5b21b6] transition"
                        >
                          <IconPlay size={13} /> Continue
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
              <Link href="/app/batches" onClick={() => setBatchesOpen(false)} className="block text-center text-sm font-semibold text-[#6d28d9] hover:text-[#2a1650] py-1.5 transition">
                Saare batches dekho →
              </Link>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
