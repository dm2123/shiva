import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';

export const revalidate = 0;

const DIFF_COLORS: Record<string, string> = {
  EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HARD: 'bg-red-50 text-red-700 border-red-200',
};

function normalizeOptions(raw: any): any[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.options)) return parsed.options;
  return [];
}

export default async function AdminQuestionsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [rows]: any = await mysqlPool.query(
    `SELECT q.id, q.title, q.type, q.difficulty, q.marks, q.negativeMarks, q.correctAnswer, q.options, q.createdAt,
            c.title AS courseTitle, s.name AS subjectName, ch.title AS chapterTitle
       FROM Questions q
       LEFT JOIN Chapters ch ON q.chapterId = ch.id
       LEFT JOIN Subjects s ON ch.subjectId = s.id
       LEFT JOIN Courses c ON s.courseId = c.id
      ORDER BY c.title, s.name, ch.sortOrder
      LIMIT 500`
  );
  const questions = rows || [];

  const byType: Record<string, number> = {};
  for (const q of (questions || []) as any[]) {
    byType[q.type] = (byType[q.type] || 0) + 1;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Question Bank Audit</h1>
        <p className="text-sm text-slate-500 mt-1">
          {questions.length} questions · {Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'empty bank'}
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-sm text-slate-500">
          The question bank is empty. Questions are authored by teachers under the educator portal.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q: any) => {
            const options = normalizeOptions(q.options).map((o: any) => o.text);
            return (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${DIFF_COLORS[q.difficulty] || DIFF_COLORS.MEDIUM}`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border border-slate-200">
                    {q.type}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                    +{Number(q.marks)} / -{Number(q.negativeMarks)}
                  </span>
                  <span className="ml-auto text-xs text-slate-400">
                    {new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="font-bold text-slate-900 text-sm mt-3 leading-relaxed">{q.title}</h2>
                {options.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {options.map((opt: string, i: number) => (
                      <p key={i} className={`text-xs px-3 py-1.5 rounded-lg ${q.correctAnswer === String.fromCharCode(65 + i) || i === options.length - 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-3">
                  {q.courseTitle || 'Unlinked course'} · {q.subjectName || 'No subject'} · {q.chapterTitle || 'No chapter'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}