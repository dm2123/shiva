import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconTrendingUp, IconCheckCircle, IconTarget, IconClock } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function PerformancePage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [enrolledRows]: any = await mysqlPool.query(
    `SELECT c.id AS courseId, c.title AS courseTitle,
            (SELECT COUNT(*) FROM Lectures l JOIN Chapters ch ON l.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = c.id) AS totalLectures,
            (SELECT COUNT(*) FROM LectureProgress lp
               JOIN Lectures l ON lp.lectureId = l.id
               JOIN Chapters ch ON l.chapterId = ch.id
               JOIN Subjects s ON ch.subjectId = s.id
             WHERE s.courseId = c.id AND lp.studentId = ?) AS completedLectures
       FROM StudentEnrollments e JOIN Courses c ON e.courseId = c.id
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY c.title`,
    [session.userId, session.userId]
  );

  const [attemptRows]: any = await mysqlPool.query(
    `SELECT a.id, a.score, a.status, a.startedAt,
            t.title AS testTitle, t.totalMarks
       FROM AssessmentAttempts a JOIN Tests t ON a.assessmentId = t.id
      WHERE a.studentId = ? AND a.status <> 'STARTED'
      ORDER BY a.startedAt DESC`,
    [session.userId]
  );

  const [accuracyRows]: any = await mysqlPool.query(
    `SELECT s.name AS subjectName,
            SUM(CASE WHEN r.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
            COUNT(*) AS total
       FROM AssessmentResponses r
       JOIN Questions q ON r.questionId = q.id
       JOIN Chapters ch ON q.chapterId = ch.id
       JOIN Subjects s ON ch.subjectId = s.id
       WHERE r.attemptId IN (
         SELECT id FROM AssessmentAttempts WHERE studentId = ?
       )
       GROUP BY s.id, s.name
       ORDER BY total DESC`,
    [session.userId]
  );

  const enrollments = enrolledRows || [];
  const attempts = attemptRows || [];
  const accuracy = accuracyRows || [];

  const completedLectures = enrollments.reduce((s: number, e: any) => s + Number(e.completedLectures || 0), 0);
  const totalLectures = enrollments.reduce((s: number, e: any) => s + Number(e.totalLectures || 0), 0);
  const finishedAttempts = attempts.filter((a: any) => a.status === 'EVALUATED');
  const avgScore = finishedAttempts.length
    ? Math.round(finishedAttempts.reduce((s: number, a: any) => s + Number(a.score || 0), 0) / finishedAttempts.length)
    : 0;

  if (enrollments.length === 0 && attempts.length === 0) {
    return (
      <div className="space-y-8">
        <StudentPageHeader title="Performance Analytics" description="Track your learning progress, test scores, and improvement trends." />
        <StudentEmptyState
          icon={<IconTrendingUp size={24} />}
          title="Insufficient Data"
          description="Performance analytics, charts, and comparative metrics will appear here after you complete learning modules and take mock tests."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StudentPageHeader title="Performance Analytics" description="Track your learning progress, test scores, and improvement trends." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled Courses', value: String(enrollments.length), icon: <IconTarget size={16} className="text-[var(--student-primary)]" /> },
          { label: 'Lectures Completed', value: `${completedLectures}/${totalLectures}`, icon: <IconCheckCircle size={16} className="text-emerald-600" /> },
          { label: 'Tests Taken', value: String(attempts.length), icon: <IconClock size={16} className="text-violet-500" /> },
          { label: 'Avg Test Score', value: `${avgScore}%`, icon: <IconTrendingUp size={16} className="text-amber-600" /> },
        ].map((s) => (
          <div key={s.label} className="student-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--student-surface-hover)] flex items-center justify-center">{s.icon}</div>
            <div>
              <p className="text-xl font-black text-[var(--student-text)]">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--student-text-faint)] font-bold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--student-text)]">Course Progress</h2>
          {enrollments.length === 0 ? (
            <div className="student-card p-6 text-sm text-[var(--student-text-muted)]">No active enrollments.</div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((e: any) => {
                const pct = Number(e.totalLectures) > 0 ? Math.round((Number(e.completedLectures) / Number(e.totalLectures)) * 100) : 0;
                return (
                  <div key={e.courseId} className="student-card p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-[var(--student-text)] truncate">{e.courseTitle}</p>
                      <p className="text-xs font-bold text-[var(--student-primary)]">{pct}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--student-surface-hover)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--student-primary)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-[var(--student-text-faint)] mt-2">
                      {e.completedLectures} of {e.totalLectures} lectures completed
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="text-lg font-bold text-[var(--student-text)] pt-2">Subject-Wise Accuracy</h2>
          {accuracy.length === 0 ? (
            <div className="student-card p-6 text-sm text-[var(--student-text-muted)]">
              Answer questions in tests to build subject-wise accuracy metrics.
            </div>
          ) : (
            <div className="space-y-4">
              {accuracy.map((a: any) => {
                const pct = a.total ? Math.round((a.correct / a.total) * 100) : 0;
                const color = pct >= 70 ? 'bg-emerald-500' : pct >= 45 ? 'bg-amber-500' : 'bg-red-400';
                return (
                  <div key={a.subjectName} className="student-card p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-[var(--student-text)] truncate">{a.subjectName}</p>
                      <p className="text-xs font-bold" style={{ color }}>{pct}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--student-surface-hover)] overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-[var(--student-text-faint)] mt-2">{a.correct} correct · {a.total} answered</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--student-text)]">Test History</h2>
          {attempts.length === 0 ? (
            <div className="student-card p-6 text-sm text-[var(--student-text-muted)]">No tests taken yet. Start a mock test to see your history here.</div>
          ) : (
            <div className="space-y-3">
              {attempts.map((a: any) => {
                const max = Number(a.totalMarks || 0);
                const pct = max > 0 ? Math.round((Number(a.score || 0) / max) * 100) : 0;
                return (
                  <div key={a.id} className="student-card p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--student-text)] truncate">{a.testTitle}</p>
                      <p className="text-[11px] text-[var(--student-text-faint)] mt-0.5">
                        {new Date(a.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-base font-black ${pct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</p>
                      <p className="text-[10px] text-[var(--student-text-faint)] uppercase tracking-wider">
                        {a.score}/{max}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}