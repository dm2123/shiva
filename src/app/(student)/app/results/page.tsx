import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconTrendingUp, IconArrowRight, IconTarget } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function ResultsListPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT a.id, a.assessmentId, a.score, a.status, a.startedAt, a.completedAt,
            t.title AS testTitle, t.totalMarks, t.passingMarks
       FROM AssessmentAttempts a
       JOIN Tests t ON a.assessmentId = t.id
      WHERE a.studentId = ? AND a.status <> 'STARTED'
      ORDER BY a.startedAt DESC`,
    [session.userId]
  );

  const results = rows || [];

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Test Results"
        description="Review your performance across all submitted tests and examinations."
      />

      {results.length === 0 ? (
        <StudentEmptyState
          icon={<IconTrendingUp size={24} />}
          title="No Results Yet"
          description="Submit a test to generate your performance report. Results will appear here once your attempts are evaluated."
        />
      ) : (
        <div className="space-y-4">
          {results.map((r: any) => {
            const score = Number(r.score || 0);
            const max = Number(r.totalMarks || 0);
            const pct = max > 0 ? Math.round((score / max) * 100) : 0;
            const passed = r.passingMarks != null ? score >= Number(r.passingMarks) : pct >= 35;
            return (
              <Link
                key={r.id}
                href={`/app/results/${r.id}`}
                className="student-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--student-primary)] transition-colors"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--student-text)] truncate">{r.testTitle}</h3>
                  <p className="text-[11px] text-[var(--student-text-faint)] mt-1 uppercase tracking-wider">
                    {new Date(r.completedAt || r.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-black ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                      {score}<span className="text-xs text-[var(--student-text-faint)] font-semibold">/{max}</span>
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                      {passed ? 'Passed' : 'Needs Improvement'}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-white" style={{
                    background: `conic-gradient(var(--student-primary) ${pct * 3.6}deg, var(--student-surface-hover) 0deg)`,
                    boxShadow: 'inset 0 0 0 8px var(--student-surface)',
                  }}>
                    {pct}%
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}