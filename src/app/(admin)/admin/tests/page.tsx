import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';

export const revalidate = 0;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-500 border-slate-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-slate-100 text-slate-400 border-slate-200',
};

export default async function AdminTestsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [rows]: any = await mysqlPool.query(
    `SELECT t.id, t.title, t.description, t.durationMinutes, t.totalMarks, t.passingMarks, t.status, t.createdAt,
            c.title AS courseTitle,
            (SELECT COUNT(*) FROM AssessmentAttempts a WHERE a.assessmentId = t.id) AS attempts,
            (SELECT AVG(a.score) FROM AssessmentAttempts a JOIN AssessmentResponses r ON r.attemptId = a.id WHERE a.assessmentId = t.id AND a.status = 'EVALUATED') AS avgScore
       FROM Tests t
       LEFT JOIN Courses c ON t.courseId = c.id
      ORDER BY t.createdAt DESC
      LIMIT 200`
  );
  const tests = rows || [];
  const published = tests.filter((t: any) => t.status === 'PUBLISHED').length;
  const totalAttempts = tests.reduce((s: number, t: any) => s + Number(t.attempts || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Exam Governance</h1>
        <p className="text-sm text-slate-500 mt-1">
          {tests.length} test series · {published} published · {totalAttempts} total attempts
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-sm text-slate-500">
          No test series have been created yet.
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((t: any) => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_COLORS[t.status] || STATUS_COLORS.DRAFT}`}>
                  {t.status}
                </span>
                <h2 className="font-bold text-slate-900 text-sm">{t.title}</h2>
                <span className="ml-auto text-xs text-slate-400">
                  {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {t.description && <p className="text-sm text-slate-600 mt-2">{t.description}</p>}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                <span><b className="text-slate-700">Course:</b> {t.courseTitle || '—'}</span>
                <span><b className="text-slate-700">Duration:</b> {t.durationMinutes} min</span>
                <span><b className="text-slate-700">Marks:</b> {Number(t.totalMarks)}</span>
                <span><b className="text-slate-700">Passing:</b> {t.passingMarks != null ? Number(t.passingMarks) : '—'}</span>
                <span><b className="text-slate-700">Attempts:</b> {t.attempts}</span>
                <span><b className="text-slate-700">Avg Score:</b> {t.avgScore != null ? Math.round(Number(t.avgScore)) : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}