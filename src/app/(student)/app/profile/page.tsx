import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import ProfileEditForm from './ProfileEditForm';
import {
  IconTarget,
  IconPlay,
  IconClipboard,
  IconHelpCircle,
  IconBook,
  IconAward,
  IconBell,
  IconSettings,
  IconLogOut,
  IconChevronRight,
  IconCheckCircle,
  IconZap,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

/* Wave-B tokens — dashboard/my-batches wale hi (PW pattern):
   safed card radius 16, page title 28px extrabold, spacing ekroop. */
const CARD =
  'rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] sm:p-7';
const SECTION_TITLE = 'text-[19px] font-bold leading-snug text-gray-900';

/**
 * THE SHIVA — Student Profile.
 *
 * PW pattern: bada 'Profile' title, upar safed identity card (avatar
 * initial circle, naam, friendly SHV-ID, asal goal/XP chips), neeche
 * Personal/Academic details safed cards me saaf rows ke saath, phir
 * Quick Actions card. Har number asal table se aata hai — StudentXP
 * (Total XP), LectureProgress, AssessmentAttempts, Doubts (status =
 * RESOLVED matlab solved). Jo data platform par maujood hi nahi
 * (level system, satisfaction rating, class/board), uska card ya
 * badge nahi banta.
 *
 * EDIT NOTE: profile-update API (PUT /api/student/profile) maujood
 * hai — student apna naam, target exam aur avatar URL khud badal
 * sakta hai (ProfileEditForm). Email/phone view-only hain kyunki
 * unke liye koi safe self-service flow nahi hai.
 */
export default async function ProfilePage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [profileRows]: any = await mysqlPool.query(
    `SELECT sp.name, sp.phone, sp.targetExam, sp.avatarUrl, sp.enrolledAt
       FROM StudentProfiles sp WHERE sp.userId = ? LIMIT 1`,
    [session.userId]
  );
  const profile = profileRows?.[0] || null;

  const [stats]: any = await mysqlPool.query(
    `SELECT
       (SELECT COUNT(*) FROM StudentEnrollments e WHERE e.studentId = u.id AND e.status = 'ACTIVE') AS enrolledCourses,
       (SELECT COUNT(*) FROM LectureProgress lp WHERE lp.studentId = u.id AND lp.isCompleted = 1) AS lecturesCompleted,
       (SELECT COUNT(*) FROM AssessmentAttempts a WHERE a.studentId = u.id AND a.status = 'EVALUATED') AS testsTaken,
       (SELECT COUNT(*) FROM Doubts d WHERE d.studentId = u.id) AS doubtsRaised,
       (SELECT COUNT(*) FROM Doubts d WHERE d.studentId = u.id AND d.status = 'RESOLVED') AS doubtsSolved
      FROM Users u WHERE u.id = ?`,
    [session.userId]
  );

  // Total XP — StudentXP table se (best-effort: table/record na ho to
  // XP card aur badge dono gayab, nakli number kabhi nahi).
  let totalXp: number | null = null;
  try {
    const [xpRows]: any = await mysqlPool.query(
      'SELECT COALESCE(SUM(points), 0) AS total FROM StudentXP WHERE studentId = ?',
      [session.userId]
    );
    totalXp = Number(xpRows?.[0]?.total) || 0;
  } catch { /* XP unavailable — card hidden */ }

  const s = stats?.[0] || {};
  const displayName = profile?.name || session.email?.split('@')[0] || 'Student';
  const initial = displayName[0]?.toUpperCase() || 'S';
  // Friendly short ID — poora raw UUID kabhi screen par nahi dikhta.
  // UUID ke pehle 8 hex characters se bana stable short code.
  const shortStudentId = `SHV-${String(session.userId).replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const memberSince = new Date(session.createdAt || profile?.enrolledAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Hamesha 4 stat cards: pehla slot XP (agar asal XP hai), warna
  // Enrolled Courses — grid kabhi aadha-khali nahi dikhta.
  const statCards = [
    ...(totalXp !== null
      ? [{
          label: 'Total XP',
          value: String(totalXp),
          icon: <IconZap size={20} />,
          href: '/app/leaderboard',
          chip: 'bg-amber-50 text-amber-600',
        }]
      : [{
          label: 'Enrolled Courses',
          value: String(s.enrolledCourses || 0),
          icon: <IconBook size={20} />,
          href: '/app/my-courses',
          chip: 'bg-violet-50 text-[#6d28d9]',
        }]),
    {
      label: 'Lectures Done',
      value: String(s.lecturesCompleted || 0),
      icon: <IconPlay size={20} />,
      href: '/app/my-courses',
      chip: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Tests Taken',
      value: String(s.testsTaken || 0),
      icon: <IconClipboard size={20} />,
      href: '/app/tests',
      chip: 'bg-violet-50 text-[#6d28d9]',
    },
    {
      label: 'Doubts Solved',
      value: String(s.doubtsSolved || 0),
      icon: <IconCheckCircle size={20} />,
      href: '/app/doubts',
      chip: 'bg-sky-50 text-sky-600',
    },
  ];

  const quickLinks = [
    { label: 'My Courses', desc: 'Tumhare enrolled courses aur batches', icon: <IconBook size={18} />, href: '/app/my-courses' },
    { label: 'My Certificates', desc: 'Course completion par mile certificates', icon: <IconAward size={18} />, href: '/app/certificates' },
    { label: 'My Purchases', desc: 'Saari payments aur receipts', icon: <IconClipboard size={18} />, href: '/app/payments' },
    { label: 'Notifications', desc: 'Announcements aur reminders', icon: <IconBell size={18} />, href: '/app/notifications' },
    { label: 'Settings', desc: 'Theme, password aur preferences', icon: <IconSettings size={18} />, href: '/app/settings' },
    { label: 'Study Plan', desc: 'Tumhara personalised roadmap', icon: <IconTarget size={18} />, href: '/app/study-plan' },
  ];

  const personalRows: { label: string; value: string; mono?: boolean; chip?: 'verified' }[] = [
    { label: 'Full Name', value: displayName },
    { label: 'Email Address', value: session.email, chip: 'verified' },
    ...(profile?.phone ? [{ label: 'Mobile Number', value: String(profile.phone) }] : []),
    { label: 'Member Since', value: memberSince },
    { label: 'Student ID', value: shortStudentId, mono: true },
  ];

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-6 px-4 py-5 pb-10">
      {/* ── Page title — wave-A pattern (28px extrabold) ── */}
      <h1 className="text-[28px] font-extrabold leading-tight text-gray-900">Profile</h1>

      {/* ── Identity card: avatar + naam + SHV-ID + asal chips ── */}
      <section className={CARD} aria-label="Identity">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="shrink-0">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[#f5b942]/70"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-3xl font-black text-white ring-2 ring-[#f5b942]/70">
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="max-w-full truncate text-[22px] font-extrabold leading-tight text-gray-900">
              {displayName}
            </h2>
            <p className="mt-0.5 max-w-full truncate text-sm text-gray-500">{session.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-gray-600">
                {shortStudentId}
              </span>
              {profile?.targetExam && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6d28d9]/25 bg-[#6d28d9]/10 px-3 py-1 text-[11px] font-bold text-[#6d28d9]">
                  <IconTarget size={12} />
                  Target: {profile.targetExam}
                </span>
              )}
              {totalXp !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5b942]/40 bg-[#f5b942]/15 px-3 py-1 text-[11px] font-bold text-[#92600a]">
                  <IconZap size={12} />
                  {totalXp} XP
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                <IconCheckCircle size={12} /> Active Student
              </span>
            </div>
            <p className="mt-3 text-[12px] text-gray-400">Member since {memberSince}</p>
          </div>
        </div>
      </section>

      {/* ── Stat cards (sirf asal data) ── */}
      <section aria-label="Your Progress">
        <h2 className={SECTION_TITLE}>Your Progress</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {statCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:border-violet-300 hover:shadow-sm"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.chip} mb-3 transition group-hover:scale-105`}>
                {c.icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{c.value}</p>
              <p className="mt-0.5 text-[12.5px] font-medium text-gray-500">{c.label}</p>
            </Link>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-gray-400">
          <IconHelpCircle size={12} />
          Ab tak {String(s.doubtsRaised || 0)} doubts poochhe gaye hain — jinme se {String(s.doubtsSolved || 0)} solved hain.
          Courses enrolled: {String(s.enrolledCourses || 0)}.
        </p>
      </section>

      {/* ── Personal + Academic Details — bade screen par
          side-by-side safed cards, mobile par stack ── */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* ── Personal Details ── */}
        <section className={CARD} aria-label="Personal Details">
          <h2 className={SECTION_TITLE}>Personal Details</h2>
          <div className="mt-2 divide-y divide-gray-100">
            {personalRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{row.label}</p>
                  <p className={`mt-0.5 text-sm font-semibold text-gray-900 ${row.mono ? 'font-mono tracking-wide' : 'truncate'}`}>
                    {row.value}
                  </p>
                </div>
                {row.chip === 'verified' && (
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    Verified
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Edit form — sirf wahi fields jo PUT /api/student/profile
              asal me save karta hai (naam, target exam, avatar URL) */}
          <ProfileEditForm
            initialName={profile?.name || ''}
            initialTargetExam={profile?.targetExam || ''}
            initialAvatarUrl={profile?.avatarUrl || ''}
          />
          <p className="mt-3 text-[12px] leading-relaxed text-gray-400">
            Email ya mobile number badalna hai to{' '}
            <Link href="/app/counsellor" className="font-bold text-[#6d28d9] hover:underline">
              Counsellor se sampark karo
            </Link>{' '}
            — woh tumhari madad kar denge.
          </p>
        </section>

        {/* ── Academic Details (sirf asal fields) ── */}
        <section className={CARD} aria-label="Academic Details">
          <h2 className={SECTION_TITLE}>Academic Details</h2>
          <div className="mt-2 divide-y divide-gray-100">
            {profile?.targetExam && (
              <div className="flex items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Target Exam</p>
                  <p className="mt-0.5 text-xs text-gray-500">Jis exam ki taiyaari chal rahi hai</p>
                </div>
                <span className="shrink-0 rounded-full border border-[#6d28d9]/25 bg-[#6d28d9]/10 px-3 py-1 text-[11px] font-bold text-[#6d28d9]">
                  {profile.targetExam}
                </span>
              </div>
            )}
            <Link href="/app/my-courses" className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">Enrolled Courses</p>
                <p className="mt-0.5 text-xs text-gray-500">Abhi active enrollments</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-black text-gray-900">
                {String(s.enrolledCourses || 0)}
                <IconChevronRight size={14} className="text-gray-300" />
              </span>
            </Link>
            <Link href="/app/tests" className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-900">Tests Taken</p>
                <p className="mt-0.5 text-xs text-gray-500">Evaluate ho chuke attempts</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-black text-gray-900">
                {String(s.testsTaken || 0)}
                <IconChevronRight size={14} className="text-gray-300" />
              </span>
            </Link>
          </div>
        </section>
      </div>

      {/* ── Quick Actions ── */}
      <section className={CARD} aria-label="Quick Actions">
        <h2 className={SECTION_TITLE}>Quick Actions</h2>
        <div className="mt-2 divide-y divide-gray-100">
          {quickLinks.map((q) => (
            <Link key={q.label} href={q.href} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-gray-50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6d28d9]/10 text-[#6d28d9]">
                {q.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{q.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{q.desc}</p>
              </div>
              <IconChevronRight size={16} className="shrink-0 text-gray-300" />
            </Link>
          ))}
          <form action="/api/public/auth/logout" method="POST" className="-mx-2 rounded-lg px-2 py-3.5 transition-colors hover:bg-red-50/60">
            <button type="submit" className="flex w-full items-center gap-3 text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <IconLogOut size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">Logout</p>
                <p className="mt-0.5 text-xs text-gray-500">Apne account se sign out karo</p>
              </div>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
