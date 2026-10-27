import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import { ensureCoreTablesSchema } from '@/lib/ensure-core-tables-schema';
import { ensureStudentProfileSchema } from '@/lib/ensure-student-profile-schema';
import { ensureDoubtsSchema } from '@/lib/ensure-doubts-schema';
import { ensureAnalyticsSchema } from '@/lib/ensure-analytics-schema';

export const revalidate = 0;

export default async function AdminCommunityPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  // Users JOIN + StudentEnrollments subquery: purane DB par ye tables
  // missing hon to page 1146 par 500 deta tha. Apne legs: FROM
  // StudentProfiles + Doubts subquery + AssessmentAttempts subquery
  // (analytics ensure se).
  await ensureCoreTablesSchema();
  await ensureStudentProfileSchema();
  await ensureDoubtsSchema();
  await ensureAnalyticsSchema();

  const [rows]: any = await mysqlPool.query(
    `SELECT sp.userId, sp.name, st.email, st.status AS accountStatus, sp.targetExam, st.createdAt,
            (SELECT COUNT(*) FROM StudentEnrollments e2 WHERE e2.studentId = sp.userId AND e2.status = 'ACTIVE') AS courseCount,
            (SELECT COUNT(*) FROM Doubts d WHERE d.studentId = sp.userId) AS doubtCount,
            (SELECT COUNT(*) FROM AssessmentAttempts a WHERE a.studentId = sp.userId) AS attemptCount
       FROM StudentProfiles sp
       JOIN Users st ON sp.userId = st.id
      ORDER BY st.createdAt DESC`
  );
  const members = rows || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Community Roster</h1>
        <p className="text-sm text-slate-500 mt-1">{members.length} platform members</p>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-sm text-slate-500">
          No student members registered yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {members.map((m: any) => (
              <div key={m.userId} className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-black flex-shrink-0">
                  {(m.name || 'S')[0]?.toUpperCase() || 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-slate-900 text-sm">{m.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{m.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 text-xs text-slate-500 text-right flex-shrink-0">
                  <span>Courses: <b className="text-slate-700">{m.courseCount}</b></span>
                  <span>Doubts: <b className="text-slate-700">{m.doubtCount}</b></span>
                  <span>Assessments: <b className="text-slate-700">{m.attemptCount}</b></span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{m.accountStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}