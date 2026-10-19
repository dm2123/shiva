import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import StudentDoubtForm from '@/components/student/StudentDoubtForm';
import {
  IconHelpCircle,
  IconCheckCircle,
  IconClock,
  IconBook,
  IconArrowRight,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

function formatDate(value: any): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

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

  const openCount = doubts.filter((d: any) => d.status === 'OPEN').length;
  const resolvedCount = doubts.filter((d: any) => d.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero header (PW-style) ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 md:p-8 text-white">
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-violet-400/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <IconHelpCircle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Doubts</h1>
              <p className="text-[13px] text-indigo-100 mt-0.5">
                Ask anything — your educator will answer here
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Total asked', value: doubts.length, icon: <IconHelpCircle size={15} /> },
              { label: 'Answered', value: resolvedCount, icon: <IconCheckCircle size={15} /> },
              { label: 'Pending', value: openCount, icon: <IconClock size={15} /> },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-3 md:p-4"
              >
                <div className="flex items-center gap-1.5 text-indigo-100">
                  {s.icon}
                  <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-black mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Ask form */}
        <aside className="xl:sticky xl:top-4">
          <StudentDoubtForm courses={courses} />
          {courses.length === 0 && (
            <p className="text-[11px] text-[var(--student-text-faint)] mt-3 leading-relaxed px-1">
              You are not enrolled in any course yet. Enroll in a course to ask
              course-specific doubts.
            </p>
          )}
        </aside>

        {/* Doubt list */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--student-text)]">
              Your questions
            </h2>
            {doubts.length > 0 && (
              <span className="text-[11px] font-semibold text-[var(--student-text-faint)]">
                {doubts.length} {doubts.length === 1 ? 'doubt' : 'doubts'}
              </span>
            )}
          </div>

          {doubts.length === 0 ? (
            <div className="student-card p-10 md:p-14 text-center border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-[var(--student-primary-light)] flex items-center justify-center mx-auto mb-5">
                <IconHelpCircle size={28} className="text-[var(--student-primary)]" />
              </div>
              <p className="text-base font-bold text-[var(--student-text)]">
                No doubts yet — ask the first one!
              </p>
              <p className="text-[13px] text-[var(--student-text-muted)] mt-2 max-w-sm mx-auto leading-relaxed">
                Stuck on a concept? Use the form to ask your educator. The
                answer will appear right here.
              </p>
            </div>
          ) : (
            doubts.map((d: any) => {
              const isResolved = d.status === 'RESOLVED';
              const isOpen = d.status === 'OPEN';
              return (
                <article key={d.id} className="student-card p-5 overflow-hidden">
                  {/* Status strip */}
                  <div
                    className={`h-1 -mx-5 -mt-5 mb-4 ${
                      isResolved
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : isOpen
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                          : 'bg-gradient-to-r from-slate-300 to-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[var(--student-text)] text-[15px] leading-snug">
                          {d.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isOpen
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isResolved ? (
                            <IconCheckCircle size={11} />
                          ) : (
                            <IconClock size={11} />
                          )}
                          {d.status}
                        </span>
                        {d.courseTitle && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--student-text-muted)] bg-[var(--student-surface-hover)] border border-[var(--student-border-light)] px-2.5 py-1 rounded-full">
                            <IconBook size={11} />
                            {d.courseTitle}
                          </span>
                        )}
                        {d.createdAt && (
                          <span className="text-[11px] text-[var(--student-text-faint)]">
                            {formatDate(d.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--student-text-secondary)] leading-relaxed mt-3">
                    {d.description}
                  </p>

                  {isResolved && d.teacherResponse ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
                        <IconCheckCircle size={13} />
                        Educator&apos;s answer
                        {d.teacherName ? ` · ${d.teacherName}` : ''}
                      </p>
                      <p className="text-sm text-[var(--student-text-secondary)] leading-relaxed">
                        {d.teacherResponse}
                      </p>
                    </div>
                  ) : (
                    isOpen && (
                      <div className="mt-4 rounded-2xl bg-amber-50/70 border border-amber-100 px-4 py-3 flex items-center gap-2.5">
                        <IconClock size={15} className="text-amber-600 flex-shrink-0" />
                        <p className="text-[12px] text-amber-800 leading-relaxed">
                          Your educator has been notified and will answer soon.
                        </p>
                      </div>
                    )
                  )}
                </article>
              );
            })
          )}

          {/* Help strip */}
          <div className="student-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[var(--student-primary-light)] flex items-center justify-center flex-shrink-0">
              <IconBook size={20} className="text-[var(--student-primary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--student-text)]">
                Want faster answers?
              </p>
              <p className="text-[12px] text-[var(--student-text-muted)] mt-0.5">
                Mention the chapter and lecture name in your question.
              </p>
            </div>
            <IconArrowRight size={16} className="text-[var(--student-text-faint)] flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
