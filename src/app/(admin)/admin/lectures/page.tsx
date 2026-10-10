import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';

export const revalidate = 0;

function fmtDuration(secs: number) {
  const s = Number(secs || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default async function AdminLecturesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [rows]: any = await mysqlPool.query(
    `SELECT l.id, l.title, l.videoUrl, l.durationSeconds, l.isPreviewable, l.createdAt,
            c.title AS courseTitle, s.name AS subjectName, ch.title AS chapterTitle,
            (SELECT COUNT(*) FROM LectureProgress lp WHERE lp.lectureId = l.id AND lp.isCompleted = 1) AS completions
       FROM Lectures l
       LEFT JOIN Chapters ch ON l.chapterId = ch.id
       LEFT JOIN Subjects s ON ch.subjectId = s.id
       LEFT JOIN Courses c ON s.courseId = c.id
      ORDER BY c.title, s.name
      LIMIT 300`
  );
  const lectures = rows || [];
  const totalMin = lectures.reduce((s: number, l: any) => s + Number(l.durationSeconds || 0), 0) / 60;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lecture Library</h1>
        <p className="text-sm text-slate-500 mt-1">
          {lectures.length} lectures · {Math.round(totalMin)} minutes of content
        </p>
      </div>

      {lectures.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-sm text-slate-500">
          No lectures have been uploaded yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {lectures.map((l: any) => (
              <div key={l.id} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 text-red-800 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  {Math.ceil(Number(l.durationSeconds || 0) / 60)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-slate-900 text-sm truncate">{l.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {l.courseTitle || 'No course'} · {l.subjectName || '—'} · {l.chapterTitle || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {l.isPreviewable ? (
                    <span className="px-2 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold uppercase border border-teal-200">Preview</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase border border-slate-200">Student-only</span>
                  )}
                  <span className="text-xs text-slate-400 w-10 text-right">{l.completions}✓</span>
                  {l.videoUrl && (
                    <a href={l.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-800 hover:underline">
                      {fmtDuration(l.durationSeconds)}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}