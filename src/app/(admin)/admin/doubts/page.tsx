import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import { ensureCoreTablesSchema } from '@/lib/ensure-core-tables-schema';

export const revalidate = 0;

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default async function AdminDoubtsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  // LEFT JOIN Users/Courses: purane DB par ye tables missing hon to
  // page 1146 par 500 deta tha (Doubts ka apna leg alag hai).
  await ensureCoreTablesSchema();

  const [rows]: any = await mysqlPool.query(
    `SELECT d.id, d.title, d.description, d.status, d.teacherResponse, d.createdAt,
            sp.name AS studentName, st.email AS studentEmail, c.title AS courseTitle,
            u.email AS teacherEmail, ch.title AS chapterTitle
       FROM Doubts d
       LEFT JOIN StudentProfiles sp ON d.studentId = sp.userId
       LEFT JOIN Users st ON d.studentId = st.id
       LEFT JOIN Courses c ON d.courseId = c.id
       LEFT JOIN Users u ON d.teacherId = u.id
       LEFT JOIN Chapters ch ON d.chapterId = ch.id
      ORDER BY d.createdAt DESC`
  );
  const doubts = rows || [];

  const open = doubts.filter((d: any) => d.status === 'OPEN').length;
  const resolved = doubts.filter((d: any) => d.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doubt Resolution Queue</h1>
          <p className="text-sm text-slate-500 mt-1">{doubts.length} total doubts · {open} open · {resolved} resolved</p>
        </div>
      </div>

      {doubts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-sm text-slate-500">
          No doubts have been raised on the platform yet.
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((d: any) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_COLORS[d.status] || STATUS_COLORS.CLOSED}`}>
                  {d.status}
                </span>
                <h2 className="font-bold text-slate-900 text-sm">{d.title}</h2>
                <span className="ml-auto text-xs text-slate-400">
                  {d.createdAt ? new Date(d.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{d.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span><b className="text-slate-700">Student:</b> {d.studentName || d.studentEmail}</span>
                <span><b className="text-slate-700">Course:</b> {d.courseTitle || '—'}</span>
                {d.chapterTitle && <span><b className="text-slate-700">Chapter:</b> {d.chapterTitle}</span>}
                <span><b className="text-slate-700">Assigned Teacher:</b> {d.teacherEmail || 'Unassigned'}</span>
              </div>
              {d.teacherResponse && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher Response</span>
                  <p className="mt-1">{d.teacherResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}