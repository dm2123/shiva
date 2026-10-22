import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TeacherPageHeader, TeacherGlassPanel } from '@/components/teacher/TeacherShared';
import { IconUser, IconCheck } from '@/components/teacher/TeacherIcons';
import { getTeacherAssignmentsDb, mysqlPool } from '@/lib/db';

export const metadata = {
  title: 'Profile | The Shiva',
};

export default async function TeacherProfile() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  const [profileRows]: any = await mysqlPool.query(
    `SELECT tp.name, tp.phone, tp.bio, tp.qualification, tp.experienceYears, tp.slug, tp.createdAt
       FROM TeacherProfiles tp WHERE tp.userId = ? LIMIT 1`,
    [session.userId]
  );
  const profile = profileRows?.[0] || null;

  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courseIds = assignments.map((a: any) => a.courseId);

  let stats = { courses: courseIds.length, students: 0, lectures: 0, doubts: 0 };
  if (courseIds.length > 0) {
    const placeholders = courseIds.map(() => '?').join(', ');
    const [rows]: any = await mysqlPool.query(
      `SELECT
         (SELECT COUNT(DISTINCT studentId) FROM StudentEnrollments WHERE courseId IN (${placeholders}) AND status = 'ACTIVE') AS students,
         (SELECT COUNT(*) FROM Lectures l JOIN Chapters ch ON l.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId IN (${placeholders})) AS lectures,
         (SELECT COUNT(*) FROM Doubts WHERE courseId IN (${placeholders}) AND status = 'OPEN') AS doubts`,
      [...courseIds, ...courseIds, ...courseIds]
    );
    stats = { ...stats, ...(rows?.[0] || {}) };
  }

  const displayName = profile?.name || session.email.split('@')[0];
  const initial = displayName[0]?.toUpperCase() || 'T';
  const joined = profile?.createdAt || session.createdAt;

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Educator Profile"
        description="Manage your professional identity and credentials."
      />
      <div className="mt-8 max-w-3xl space-y-6">
        <TeacherGlassPanel className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-black shadow-xl">
            {initial}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-[var(--teacher-text)]">{displayName}</h2>
            <p className="text-[var(--teacher-text-muted)] mt-1">{session.email}</p>
            {(profile?.qualification || profile?.experienceYears > 0) && (
              <p className="text-sm text-[var(--teacher-text-muted)] mt-1">
                {profile?.qualification}{profile?.qualification && profile?.experienceYears > 0 ? ' · ' : ''}
                {profile?.experienceYears > 0 ? `${profile.experienceYears} yrs experience` : ''}
              </p>
            )}
            {profile?.bio && <p className="text-sm text-[var(--teacher-text-muted)] mt-2">{profile.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-full border border-teal-500/20">
                Verified Educator
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[var(--teacher-text-muted)] text-xs font-bold rounded-full">
                Joined {joined ? new Date(joined).getFullYear() : '—'}
              </span>
            </div>
          </div>
        </TeacherGlassPanel>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Courses', value: stats.courses },
            { label: 'Students', value: stats.students },
            { label: 'Lectures', value: stats.lectures },
            { label: 'Open Doubts', value: stats.doubts },
          ].map((x) => (
            <TeacherGlassPanel key={x.label} className="p-5 text-center">
              <p className="text-2xl font-black text-[var(--teacher-text)]">{x.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--teacher-text-muted)] mt-1">{x.label}</p>
            </TeacherGlassPanel>
          ))}
        </div>

        <TeacherGlassPanel>
          <div className="flex items-center justify-between mb-6 border-b border-[var(--teacher-border)] pb-4">
            <h3 className="text-lg font-bold text-[var(--teacher-text)]">Account Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <div className="font-bold text-[var(--teacher-text)] text-sm">Change Password</div>
                <div className="text-xs text-[var(--teacher-text-muted)] mt-1">Manage your workspace credentials</div>
              </div>
              <a
                href="/teacher/settings"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <IconCheck size={14} /> Update
              </a>
            </div>
          </div>
        </TeacherGlassPanel>
      </div>
    </div>
  );
}