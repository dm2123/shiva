import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader, StudentSection } from '@/components/student/StudentShared';
import { IconUser, IconShield, IconTarget, IconAward } from '@/components/student/StudentIcons';

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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <StudentPageHeader title="Profile" description="View and manage your student account information." />

      <StudentSection>
        <div className="student-card p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-500/25">
              {initial}
            </div>
            <span className="absolute -bottom-1 -right-1 capsule capsule-success px-2 py-1 text-[9px]">Active</span>
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold text-[var(--student-text)] mb-1">{displayName}</h2>
              <p className="text-sm text-[var(--student-text-muted)] font-medium">{session.email}</p>
              {profile?.targetExam && (
                <p className="text-xs text-[var(--student-primary)] font-bold mt-1">Targeting: {profile.targetExam}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--student-border-light)]">
              {[
                { label: 'Courses', value: String(s.enrolledCourses || 0), icon: <IconTarget size={13} /> },
                { label: 'Lectures Done', value: String(s.lecturesCompleted || 0), icon: <IconUser size={13} /> },
                { label: 'Tests Taken', value: String(s.testsTaken || 0), icon: <IconAward size={13} /> },
                { label: 'Doubts Raised', value: String(s.doubtsRaised || 0), icon: <IconShield size={13} /> },
              ].map((x) => (
                <div key={x.label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[var(--student-text-faint)] mb-1">
                    {x.icon}
                    <p className="text-[10px] font-semibold uppercase tracking-widest">{x.label}</p>
                  </div>
                  <p className="text-sm font-black text-[var(--student-text)]">{x.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StudentSection>

      <StudentSection title="Account Information">
        <div className="student-card divide-y divide-[var(--student-border-light)]">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--student-text)] mb-0.5">Email Address</p>
              <p className="text-xs text-[var(--student-text-muted)]">{session.email}</p>
            </div>
            <span className="capsule capsule-success">Verified</span>
          </div>
          {profile?.phone && (
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--student-text)] mb-0.5">Phone</p>
                <p className="text-xs text-[var(--student-text-muted)]">{profile.phone}</p>
              </div>
            </div>
          )}
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--student-text)] mb-0.5">User ID</p>
              <p className="text-xs text-[var(--student-text-muted)] font-mono">{session.userId}</p>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--student-text)] mb-0.5">Account Created</p>
              <p className="text-xs text-[var(--student-text-muted)]">
                {new Date(session.createdAt || (profile?.enrolledAt || Date.now())).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </StudentSection>
    </div>
  );
}