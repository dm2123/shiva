import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import StudentDoubtForm from '@/components/student/StudentDoubtForm';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconCheckCircle, IconClock } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function DoubtsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [doubtRows]: any = await mysqlPool.query(
    `SELECT d.id, d.courseId, d.chapterId, d.title, d.description, d.status, d.teacherResponse, d.createdAt,
            c.title AS courseTitle, tp.name AS teacherName
       FROM Doubts d
       LEFT JOIN Courses c ON d.courseId = c.id
       LEFT JOIN TeacherProfiles tp ON d.teacherId = tp.userId
      WHERE d.studentId = ?
      ORDER BY d.updatedAt DESC, d.createdAt DESC`,
    [session.userId]
  );

  const [courseRows]: any = await mysqlPool.query(
    `SELECT c.id, c.title
       FROM StudentEnrollments e JOIN Courses c ON e.courseId = c.id
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY c.title`,
    [session.userId]
  );

  const doubts = doubtRows || [];
  const courses = (courseRows || []).map((c: any) => ({ id: c.id, title: c.title }));

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Doubt Resolution"
        description="Ask questions and get written clarifications from your course educators."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <aside>
          <StudentDoubtForm courses={courses} />
        </aside>

        <div className="space-y-3">
          {doubts.length === 0 ? (
            <div className="student-card p-12 text-center border-dashed">
              <IconClock size={26} className="mx-auto text-[var(--student-text-faint)] mb-3" />
              <p className="text-sm font-semibold text-[var(--student-text)]">No doubts asked yet</p>
              <p className="text-xs text-[var(--student-text-muted)] mt-1 max-w-sm mx-auto">
                Raise your first doubt using the form. Your educator will respond, and the answer appears here.
              </p>
            </div>
          ) : (
            doubts.map((d: any) => (
              <div key={d.id} className="student-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--student-text)] text-sm leading-snug">{d.title}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          d.status === 'OPEN'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : d.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <p className="text-2xs text-[var(--student-text-faint)] mt-1 text-[11px]">
                      {d.courseTitle} · {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[var(--student-text-secondary)] leading-relaxed mt-3">{d.description}</p>

                {d.status === 'RESOLVED' && (
                  <div className="mt-4 pt-4 border-t border-[var(--student-border-light)]">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                      <IconCheckCircle size={12} />
                      Resolution · {d.teacherName || 'Educator'}
                    </p>
                    <p className="text-sm text-[var(--student-text-secondary)] leading-relaxed bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3">
                      {d.teacherResponse}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}