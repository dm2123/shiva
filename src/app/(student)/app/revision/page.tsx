import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconRefresh, IconPlay, IconArrowRight } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function StudentRevisionPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [incompleteRows]: any = await mysqlPool.query(
    `SELECT l.id, l.title, l.durationSeconds, c.id AS courseId, c.title AS courseTitle,
            s.name AS subjectName, ch.title AS chapterName
       FROM Lectures l
       JOIN Chapters ch ON l.chapterId = ch.id
       JOIN Subjects s ON ch.subjectId = s.id
       JOIN Courses c ON s.courseId = c.id
       JOIN StudentEnrollments e ON e.courseId = c.id AND e.studentId = ? AND e.status = 'ACTIVE'
      WHERE NOT EXISTS (
        SELECT 1 FROM LectureProgress lp WHERE lp.lectureId = l.id AND lp.studentId = ? AND lp.isCompleted = 1
      )
      ORDER BY c.title, s.sortOrder, ch.sortOrder, l.sortOrder
      LIMIT 20`,
    [session.userId, session.userId]
  );

  const [weakRows]: any = await mysqlPool.query(
    `SELECT s.name AS subjectName, ch.id AS chapterId, ch.title AS chapterName,
            SUM(CASE WHEN r.isCorrect = 1 THEN 1 ELSE 0 END) AS correct,
            COUNT(*) AS total,
            c.id AS courseId, c.title AS courseTitle
       FROM AssessmentResponses r
       JOIN AssessmentAttempts att ON r.attemptId = att.id
       JOIN Questions q ON r.questionId = q.id
       JOIN Chapters ch ON q.chapterId = ch.id
       JOIN Subjects s ON ch.subjectId = s.id
       JOIN Courses c ON s.courseId = c.id
      WHERE att.studentId = ?
      GROUP BY s.id, s.name, ch.id, ch.title, c.id, c.title
      HAVING total >= 2 AND (correct / total) < 0.5
      ORDER BY (correct / total) ASC
      LIMIT 10`,
    [session.userId]
  );

  const fmtDuration = (secs: number) => {
    const s = Number(secs || 0);
    const m = Math.floor(s / 60);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
  };

  const incomplete = (incompleteRows || []) as any[];
  const weak = (weakRows || []) as any[];

  if (incomplete.length === 0 && weak.length === 0) {
    return (
      <div className="space-y-8">
        <StudentPageHeader title="Revision Engine" description="Re-practice saved items, incomplete content, and weak chapters targeted specifically for your improvement." />
        <StudentEmptyState
          icon={<IconRefresh size={24} />}
          title="Nothing To Revise"
          description="You are all caught up. Incomplete lectures and below-average chapters will automatically surface here for revision."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StudentPageHeader title="Revision Engine" description="Re-practice saved items, incomplete content, and weak chapters targeted specifically for your improvement." />

      {weak.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--student-text)]">Revise Weak Chapters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weak.map((w: any) => {
              const pct = w.total ? Math.round((w.correct / w.total) * 100) : 0;
              return (
                <div key={w.chapterId} className="student-card p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--student-text-faint)]">{w.courseTitle}</p>
                  <p className="text-sm font-semibold text-[var(--student-text)] mt-1">{w.chapterName}</p>
                  <p className="text-[11px] text-[var(--student-text-muted)] mt-0.5">{w.subjectName}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-2 flex-1 rounded-full bg-[var(--student-surface-hover)] overflow-hidden">
                      <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                    <span className="ml-3 text-[11px] font-bold text-red-500 whitespace-nowrap">{pct}% accuracy</span>
                  </div>
                  <Link
                    href={`/app/courses/${w.courseId}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--student-primary)]"
                  >
                    Revisit Chapter <IconArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {incomplete.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--student-text)]">Continue Where You Left Off</h2>
          <div className="space-y-3">
            {incomplete.map((l: any) => (
              <Link
                key={l.id}
                href={`/app/learn/${l.courseId}?lecture=${l.id}`}
                className="student-card p-5 flex items-center justify-between gap-4 hover:border-[var(--student-primary)] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--student-text-faint)]">
                    {l.courseTitle} · {l.subjectName}
                  </p>
                  <p className="text-sm font-semibold text-[var(--student-text)] mt-1 truncate">{l.title}</p>
                  <p className="text-[11px] text-[var(--student-text-muted)] mt-0.5">{l.chapterName}{l.durationSeconds ? ` · ${fmtDuration(l.durationSeconds)}` : ''}</p>
                </div>
                <span className="w-9 h-9 rounded-full bg-[var(--student-primary)] text-white flex items-center justify-center flex-shrink-0">
                  <IconPlay size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}