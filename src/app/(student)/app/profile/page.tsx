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
} from '@/components/student/StudentIcons';

export const revalidate = 0;

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
       (SELECT COUNT(*) FROM Doubts d WHERE d.studentId = u.id) AS doubtsRaised
      FROM Users u WHERE u.id = ?`,
    [session.userId]
  );

  const s = stats?.[0] || {};
  const displayName = profile?.name || session.email?.split('@')[0] || 'Student';
  const initial = displayName[0]?.toUpperCase() || 'S';

  const statCards = [
    {
      label: 'My Courses',
      value: String(s.enrolledCourses || 0),
      icon: <IconBook size={20} />,
      href: '/app/my-courses',
      bg: 'from-indigo-500 to-violet-600',
    },
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
      bg: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Doubts Raised',
      value: String(s.doubtsRaised || 0),
      icon: <IconHelpCircle size={20} />,
      href: '/app/doubts',
      bg: 'from-sky-500 to-blue-600',
    },
  ];

  const quickLinks = [
    { label: 'My Certificates', desc: 'Earned on course completion', icon: <IconAward size={18} />, href: '/app/certificates' },
    { label: 'Notifications', desc: 'Announcements & reminders', icon: <IconBell size={18} />, href: '/app/notifications' },
    { label: 'Settings', desc: 'Theme, password & preferences', icon: <IconSettings size={18} />, href: '/app/settings' },
    { label: 'Study Plan', desc: 'Your personalised roadmap', icon: <IconTarget size={18} />, href: '/app/study-plan' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-5 pb-24 space-y-6">
      {/* ── Hero card ── */}
      <div className="rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1.5px, transparent 1.5px), radial-gradient(circle at 70% 60%, white 1.5px, transparent 1.5px)', backgroundSize: '42px 42px' }} />
        </div>
        <div className="px-5 pb-5 -mt-12 relative">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg flex-shrink-0">
              <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black">
                {initial}
              </div>
            </div>
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-gray-900 truncate">{displayName}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                  <IconCheckCircle size={12} /> Active
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{session.email}</p>
              {profile?.targetExam && (
                <p className="text-xs font-bold text-indigo-700 mt-1">🎯 Target: {profile.targetExam}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid (tappable) ── */}
      <section>
        <h2 className="text-[17px] font-bold text-gray-900 mb-3">Your Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} text-white flex items-center justify-center mb-3 group-hover:scale-105 transition`}>
                {c.icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{c.value}</p>
              <p className="text-[12px] font-medium text-gray-500">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Account information ── */}
      <section>
        <h2 className="text-[17px] font-bold text-gray-900 mb-3">Account Information</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Email Address</p>
              <p className="text-xs text-gray-500">{session.email}</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">Verified</span>
          </div>
          {profile?.phone && (
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Phone</p>
                <p className="text-xs text-gray-500">{profile.phone}</p>
              </div>
            </div>
          )}
          <div className="p-4">
            <p className="text-sm font-semibold text-gray-900">User ID</p>
            <p className="text-xs text-gray-500 font-mono break-all">{session.userId}</p>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-gray-900">Member Since</p>
            <p className="text-xs text-gray-500">
              {new Date(session.createdAt || profile?.enrolledAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick links ── */}
      <section>
        <h2 className="text-[17px] font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {quickLinks.map((q) => (
            <Link key={q.label} href={q.href} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                {q.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{q.label}</p>
                <p className="text-xs text-gray-500">{q.desc}</p>
              </div>
              <IconChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </Link>
          ))}
          <form action="/api/public/auth/logout" method="POST" className="p-4 flex items-center gap-3 hover:bg-red-50/50 transition cursor-pointer">
            <button type="submit" className="flex items-center gap-3 w-full text-left">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <IconLogOut size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">Logout</p>
                <p className="text-xs text-gray-500">Sign out of your account</p>
              </div>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
