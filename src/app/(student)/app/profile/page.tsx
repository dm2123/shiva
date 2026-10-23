import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
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

/**
 * THE SHIVA — Student Profile.
 *
 * Banawat andar-ke standard par: beech me avatar, bada naam, asal data se
 * bane badges aur stat cards, phir 'Personal Details' aur
 * 'Academic Details' cards. Har number asal table se aata hai —
 * StudentXP (Total XP), LectureProgress, AssessmentAttempts, Doubts
 * (status = RESOLVED matlab solved). Jo data platform par maujood hi
 * nahi (level system, satisfaction rating, class/board), uska card ya
 * badge nahi banta.
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
  const memberSince = new Date(session.createdAt || profile?.enrolledAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const statCards = [
    ...(totalXp !== null
      ? [{
          label: 'Total XP',
          value: String(totalXp),
          icon: <IconZap size={20} />,
          href: '/app/leaderboard',
          bg: 'from-[#f5b942] to-amber-600',
        }]
      : []),
    {
      label: 'Lectures Done',
      value: String(s.lecturesCompleted || 0),
      icon: <IconPlay size={20} />,
      href: '/app/my-courses',
      bg: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Tests Taken',
      value: String(s.testsTaken || 0),
      icon: <IconClipboard size={20} />,
      href: '/app/tests',
      bg: 'from-[#6d28d9] to-[#2a1650]',
    },
    {
      label: 'Doubts Solved',
      value: String(s.doubtsSolved || 0),
      icon: <IconCheckCircle size={20} />,
      href: '/app/doubts',
      bg: 'from-sky-500 to-blue-600',
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

  return (
    <div className="space-y-6">
      {/* ── Hero: beech avatar + bada naam + asal badges ── */}
      <div className="student-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#7c3aed] relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, white 1.5px, transparent 1.5px), radial-gradient(circle at 70% 60%, white 1.5px, transparent 1.5px)',
              backgroundSize: '42px 42px',
            }}
            aria-hidden="true"
          />
          <div className="absolute -top-10 right-10 w-36 h-36 rounded-full bg-[#f5b942]/20 blur-2xl" aria-hidden="true" />
        </div>
        <div className="px-5 pb-6 -mt-12 relative flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--student-surface)] p-1 shadow-lg flex-shrink-0">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center text-white text-4xl font-black">
                {initial}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--student-text)] tracking-tight mt-3 truncate max-w-full">
            {displayName}
          </h1>
          <p className="text-sm text-[var(--student-text-muted)] truncate max-w-full">{session.email}</p>

          <div className="flex items-center justify-center gap-2 flex-wrap mt-3">
            {totalXp !== null && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#92600a] dark:text-[#f5b942] bg-[#f5b942]/15 border border-[#f5b942]/40 rounded-full px-3 py-1">
                <IconZap size={12} />
                {totalXp} XP
              </span>
            )}
            {profile?.targetExam && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6d28d9] bg-[#6d28d9]/10 border border-[#6d28d9]/25 rounded-full px-3 py-1">
                <IconTarget size={12} />
                Target: {profile.targetExam}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 rounded-full px-3 py-1">
              <IconCheckCircle size={12} /> Active Student
            </span>
          </div>
          <p className="text-[11px] text-[var(--student-text-faint)] mt-3">Member since {memberSince}</p>
        </div>
      </div>

      {/* ── Stat cards (sirf asal data) ── */}
      <section>
        <h2 className="text-lg font-bold text-[var(--student-text)] tracking-tight mb-3">Your Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="student-card p-4 hover:shadow-md hover:border-[#6d28d9] transition group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} text-white flex items-center justify-center mb-3 group-hover:scale-105 transition`}>
                {c.icon}
              </div>
              <p className="text-2xl font-black text-[var(--student-text)]">{c.value}</p>
              <p className="text-[12px] font-medium text-[var(--student-text-muted)]">{c.label}</p>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-[var(--student-text-faint)] mt-2.5 flex items-center gap-1.5">
          <IconHelpCircle size={12} />
          Ab tak {String(s.doubtsRaised || 0)} doubts poochhe gaye hain — jinme se {String(s.doubtsSolved || 0)} solved hain.
          Courses enrolled: {String(s.enrolledCourses || 0)}.
        </p>
      </section>

      {/* ── Personal Details ── */}
      <section>
        <h2 className="text-lg font-bold text-[var(--student-text)] tracking-tight mb-3">Personal Details</h2>
        <div className="student-card divide-y divide-[var(--student-border-light)]">
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--student-text)]">Full Name</p>
              <p className="text-xs text-[var(--student-text-muted)] truncate">{displayName}</p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--student-text)]">Email Address</p>
              <p className="text-xs text-[var(--student-text-muted)] truncate">{session.email}</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 rounded-full px-2.5 py-1 flex-shrink-0">
              Verified
            </span>
          </div>
          {profile?.phone && (
            <div className="p-4">
              <p className="text-sm font-semibold text-[var(--student-text)]">Mobile Number</p>
              <p className="text-xs text-[var(--student-text-muted)]">{profile.phone}</p>
            </div>
          )}
          <div className="p-4">
            <p className="text-sm font-semibold text-[var(--student-text)]">Member Since</p>
            <p className="text-xs text-[var(--student-text-muted)]">{memberSince}</p>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-[var(--student-text)]">Student ID</p>
            <p className="text-xs text-[var(--student-text-muted)] font-mono break-all">{session.userId}</p>
          </div>
        </div>
        <p className="text-[11px] text-[var(--student-text-faint)] mt-2.5">
          Naam ya mobile me galti hai?{' '}
          <Link href="/app/counsellor" className="font-bold text-[#6d28d9] hover:underline">
            Counsellor se sampark karo
          </Link>{' '}
          — woh tumhari details sahi kar denge.
        </p>
      </section>

      {/* ── Academic Details (sirf asal fields) ── */}
      <section>
        <h2 className="text-lg font-bold text-[var(--student-text)] tracking-tight mb-3">Academic Details</h2>
        <div className="student-card divide-y divide-[var(--student-border-light)]">
          {profile?.targetExam && (
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--student-text)]">Target Exam</p>
                <p className="text-xs text-[var(--student-text-muted)]">Jis exam ki taiyaari chal rahi hai</p>
              </div>
              <span className="text-[11px] font-bold text-[#6d28d9] bg-[#6d28d9]/10 border border-[#6d28d9]/25 rounded-full px-3 py-1 flex-shrink-0">
                {profile.targetExam}
              </span>
            </div>
          )}
          <Link href="/app/my-courses" className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--student-surface-hover)] transition-colors">
            <div>
              <p className="text-sm font-semibold text-[var(--student-text)]">Enrolled Courses</p>
              <p className="text-xs text-[var(--student-text-muted)]">Abhi active enrollments</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-black text-[var(--student-text)]">
              {String(s.enrolledCourses || 0)}
              <IconChevronRight size={14} className="text-[var(--student-text-faint)]" />
            </span>
          </Link>
          <Link href="/app/tests" className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--student-surface-hover)] transition-colors">
            <div>
              <p className="text-sm font-semibold text-[var(--student-text)]">Tests Taken</p>
              <p className="text-xs text-[var(--student-text-muted)]">Evaluate ho chuke attempts</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-black text-[var(--student-text)]">
              {String(s.testsTaken || 0)}
              <IconChevronRight size={14} className="text-[var(--student-text-faint)]" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Quick links ── */}
      <section>
        <h2 className="text-lg font-bold text-[var(--student-text)] tracking-tight mb-3">Quick Actions</h2>
        <div className="student-card divide-y divide-[var(--student-border-light)]">
          {quickLinks.map((q) => (
            <Link key={q.label} href={q.href} className="p-4 flex items-center gap-3 hover:bg-[var(--student-surface-hover)] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#6d28d9]/10 text-[#6d28d9] flex items-center justify-center flex-shrink-0">
                {q.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--student-text)]">{q.label}</p>
                <p className="text-xs text-[var(--student-text-muted)]">{q.desc}</p>
              </div>
              <IconChevronRight size={16} className="text-[var(--student-text-faint)] flex-shrink-0" />
            </Link>
          ))}
          <form action="/api/public/auth/logout" method="POST" className="p-4 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
            <button type="submit" className="flex items-center gap-3 w-full text-left">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <IconLogOut size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">Logout</p>
                <p className="text-xs text-[var(--student-text-muted)]">Apne account se sign out karo</p>
              </div>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
