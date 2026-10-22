'use client';

// ============================================================
// THE SHIVA — Student Study Home (dashboard)
// Structure: greeting + goal chip → Continue Learning →
// aaj ka schedule → hafta progress → quick access →
// popular exams → Recommended For You.
// HAR number asal data se aata hai (server page.tsx DB se
// bhejta hai). Jo data nahi mila, wo section chip/show hi
// nahi hota — koi placeholder/fake stat nahi.
// ============================================================

import Link from 'next/link';
import {
  IconSSC, IconRailway, IconBanking, IconDefence, IconTeaching,
  IconTestSeries, IconDoubts, IconLibrary, IconLive, IconMyCourses, IconTrophy,
  IconBatches, IconAssignment, IconFlame, IconPlay, IconBook, IconClock, IconCheck,
} from '@/components/student/ShivaIcons';

export interface DashboardEnrollment {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  price: number;
  batchName: string | null;
  enrolledAt: string | null;
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
  recommended: RecommendedCourse[];
}

const GOALS = [
  { label: 'SSC', Icon: IconSSC, bg: 'bg-blue-100', iconColor: 'text-blue-600', href: '/app/goals?exam=ssc' },
  { label: 'Railway', Icon: IconRailway, bg: 'bg-green-100', iconColor: 'text-green-600', href: '/app/goals?exam=railway' },
  { label: 'Banking', Icon: IconBanking, bg: 'bg-yellow-100', iconColor: 'text-yellow-600', href: '/app/goals?exam=banking' },
  { label: 'Defence', Icon: IconDefence, bg: 'bg-orange-100', iconColor: 'text-orange-600', href: '/app/goals?exam=defence' },
  { label: 'Teaching', Icon: IconTeaching, bg: 'bg-purple-100', iconColor: 'text-purple-600', href: '/app/goals?exam=teaching' },
];

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

export default function PWDashboard({
  userName, goal, enrollments, todaysClasses, nextClass, streak, totalXP, pendingDoubts, recommended,
}: PWDashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (userName || '').split(' ')[0] || 'Student';

  const continueList = enrollments.slice(0, 4);
  const firstContinue = enrollments[0] || null;
  const totalCompleted = enrollments.reduce((s, e) => s + e.completedLectures, 0);
  const totalLectures = enrollments.reduce((s, e) => s + e.totalLectures, 0);
  const weekActive = streak ? streak.week.filter((d) => d.active).length : 0;

  const QUICK_ACTIONS = [
    { label: 'My Courses', Icon: IconMyCourses, href: '/app/my-courses' },
    { label: 'My Batches', Icon: IconBatches, href: '/app/batches' },
    { label: 'Test Series', Icon: IconTestSeries, href: '/app/tests' },
    { label: 'DPP', Icon: IconAssignment, href: '/app/dpp' },
    { label: 'Library', Icon: IconLibrary, href: '/app/ebooks' },
    { label: 'Doubts', Icon: IconDoubts, href: '/app/doubts', badge: pendingDoubts > 0 ? pendingDoubts : 0 },
    { label: 'Live Classes', Icon: IconLive, href: '/app/live' },
    { label: 'Leaderboard', Icon: IconTrophy, href: '/app/leaderboard' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1200px] mx-auto px-4 py-4 space-y-6 pb-20">

        {/* ── Greeting + goal chip + asal streak/XP ─────────── */}
        <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] text-white p-5 relative">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-10 bottom-0 w-20 h-20 rounded-full bg-[#f5b942]/20" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[13px] text-white/70">{greeting},</p>
              {goal ? (
                <Link href="/app/goals" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1 text-[12px] font-semibold transition">
                  <span aria-hidden>🎯</span> {goal}
                </Link>
              ) : (
                <Link href="/app/goals" className="inline-flex items-center gap-1.5 bg-[#f5b942] text-[#2a1650] rounded-full px-3 py-1 text-[12px] font-bold transition hover:bg-[#ffcf6b]">
                  🎯 Apna goal set karo
                </Link>
              )}
            </div>
            <h1 className="text-xl font-black mt-1">{firstName}!</h1>
            <p className="text-[13px] text-white/70 mt-1">
              {firstContinue
                ? 'Jahan chhoda tha, wahin se shuru karo — tumhari padhai tumhara intezaar kar rahi hai.'
                : 'Aaj kya seekhna hai? Chalo shuru karte hain.'}
            </p>

            {(streak !== null || totalXP !== null) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {streak !== null && (
                  <Link href="/app/streak" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 text-[12px] font-bold transition">
                    <IconFlame size={14} className="text-[#f5b942]" />
                    {streak.currentStreak} din streak
                  </Link>
                )}
                {totalXP !== null && (
                  <Link href="/app/analytics" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 text-[12px] font-bold transition">
                    <IconTrophy size={14} className="text-[#f5b942]" />
                    {Number(totalXP).toLocaleString('en-IN')} XP
                  </Link>
                )}
                {totalLectures > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-[12px] font-bold">
                    <IconCheck size={14} className="text-[#f5b942]" />
                    {totalCompleted}/{totalLectures} lectures done
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {firstContinue ? (
                <Link href={learnHref(firstContinue)} className="inline-flex items-center gap-2 bg-[#f5b942] hover:bg-[#ffcf6b] text-[#2a1650] text-sm font-bold rounded-xl px-5 py-2.5 transition">
                  <IconPlay size={15} /> Continue Learning
                </Link>
              ) : (
                <Link href="/app/courses" className="inline-block bg-[#f5b942] hover:bg-[#ffcf6b] text-[#2a1650] text-sm font-bold rounded-xl px-5 py-2.5 transition">
                  Explore Courses →
                </Link>
              )}
              <Link href="/app/my-courses" className="inline-flex items-center bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition">
                My Courses
              </Link>
            </div>
          </div>
        </section>

        {/* ── Continue Learning / Continue Watching ─────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-gray-900">Continue Learning</h2>
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
              <h2 className="text-[17px] font-bold text-gray-900">Aaj ka Schedule</h2>
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

        {/* ── Quick Access ──────────────────────────────────── */}
        <section>
          <h2 className="text-[17px] font-bold text-gray-900 mb-3">Quick Access</h2>
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
            <h2 className="text-[17px] font-bold text-gray-900">Popular Exams</h2>
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
              <h2 className="text-[17px] font-bold text-gray-900">Recommended For You</h2>
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
    </div>
  );
}
