import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { hasTestTypeColumns } from '@/lib/ensure-test-schema';
import { StudentPageHeader, StudentStatCard } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconTrendingUp, IconArrowRight, IconTarget, IconClock, IconAward, IconPlay } from '@/components/student/StudentIcons';

export const revalidate = 0;

function categoryLabel(row: any): string | null {
  const raw = String(row?.testType || row?.testCategory || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('pyq') || raw.includes('previous')) return 'PYQ';
  if (raw.includes('practice') || raw.includes('dpp')) return 'Practice';
  if (raw.includes('mock')) return 'Mock Test';
  return String(row.testCategory || row.testType).trim();
}

export default async function ResultsListPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  await hasTestTypeColumns();

  // type/category sirf tab select karo jab columns asal me maujood hon
  let testCols = '';
  try {
    const [colRows]: any = await mysqlPool.query(
      `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Tests'`
    );
    const cols = new Set<string>((colRows || []).map((r: any) => String(r.name)));
    if (cols.has('type')) testCols += ', t.`type` AS testType';
    if (cols.has('category')) testCols += ', t.`category` AS testCategory';
  } catch { /* best-effort */ }

  const [rows]: any = await mysqlPool.query(
    `SELECT a.id, a.assessmentId, a.score, a.status, a.startedAt, a.completedAt,
            t.title AS testTitle, t.totalMarks, t.passingMarks${testCols}
       FROM AssessmentAttempts a
       JOIN Tests t ON a.assessmentId = t.id
      WHERE a.studentId = ? AND a.status <> 'STARTED'
      ORDER BY a.startedAt DESC`,
    [session.userId]
  );

  const results = rows || [];

  // Adhoore (STARTED) attempts — resume strip ke liye, asal data se
  let inProgress: any[] = [];
  try {
    const [ip]: any = await mysqlPool.query(
      `SELECT a.id, a.assessmentId, a.startedAt, t.title AS testTitle
         FROM AssessmentAttempts a
         JOIN Tests t ON a.assessmentId = t.id
        WHERE a.studentId = ? AND a.status = 'STARTED'
        ORDER BY a.startedAt DESC`,
      [session.userId]
    );
    inProgress = ip || [];
  } catch { /* best-effort */ }

  // Summary — sirf asal results se
  const pcts = results.map((r: any) => {
    const max = Number(r.totalMarks || 0);
    return max > 0 ? (Number(r.score || 0) / max) * 100 : 0;
  });
  const avgPct = pcts.length > 0 ? Math.round(pcts.reduce((s: number, p: number) => s + p, 0) / pcts.length) : 0;
  const bestPct = pcts.length > 0 ? Math.round(Math.max(...pcts)) : 0;
  const passedCount = results.filter((r: any, i: number) => {
    const score = Number(r.score || 0);
    return r.passingMarks != null ? score >= Number(r.passingMarks) : pcts[i] >= 35;
  }).length;

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Test Results"
        description="Har submitted test ki full analysis — score, accuracy, time aur topic-wise strong/weak areas."
      />

      {inProgress.length > 0 && (
        <div className="space-y-3">
          {inProgress.map((a: any) => (
            <div
              key={a.id}
              className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <IconClock size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--student-text)] truncate">{a.testTitle}</p>
                  <p className="text-[11px] text-[var(--student-text-muted)]">Attempt in progress — jahan chhoda tha, wahi se jaari rakho.</p>
                </div>
              </div>
              <Link
                href={`/app/tests/${a.assessmentId}/attempt/${a.id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors flex-shrink-0"
              >
                <IconPlay size={14} />
                Resume Test
              </Link>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          <StudentStatCard
            label="Tests Attempted"
            value={results.length}
            icon={<IconTarget size={18} />}
          />
          <StudentStatCard
            label="Average Score"
            value={`${avgPct}%`}
            icon={<IconTrendingUp size={18} />}
          />
          <StudentStatCard
            label="Best Score"
            value={`${bestPct}%`}
            icon={<IconAward size={18} />}
          />
        </div>
      )}

      {results.length === 0 ? (
        <StudentEmptyState
          icon={<IconTrendingUp size={22} />}
          title="No Results Yet"
          description="Submit a test to generate your performance report. Results will appear here once your attempts are evaluated."
          actionText="Tests Dekho"
          actionHref="/app/tests"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[var(--student-text-muted)]">
            {passedCount}/{results.length} tests me passing score achieve kiya. Kisi bhi result par click karke poori analysis dekho.
          </p>
          {results.map((r: any) => {
            const score = Number(r.score || 0);
            const max = Number(r.totalMarks || 0);
            const pct = max > 0 ? Math.round((score / max) * 100) : 0;
            const passed = r.passingMarks != null ? score >= Number(r.passingMarks) : pct >= 35;
            const cat = categoryLabel(r);
            return (
              <Link
                key={r.id}
                href={`/app/results/${r.id}`}
                className="student-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#6d28d9] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[var(--student-text)] truncate">{r.testTitle}</h3>
                    {cat && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#6d28d9]/10 text-[#6d28d9]">
                        {cat}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--student-text-faint)] mt-1 uppercase tracking-wider">
                    {new Date(r.completedAt || r.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}Analysis ready
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
                    background: `conic-gradient(#6d28d9 ${pct * 3.6}deg, var(--student-surface-hover) 0deg)`,
                    boxShadow: 'inset 0 0 0 8px var(--student-surface)',
                  }}>
                    <span className="text-[var(--student-text)]">{pct}%</span>
                  </div>
                  <IconArrowRight size={16} className="text-[var(--student-text-faint)] hidden sm:block" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
