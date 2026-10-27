import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TeacherPageHeader, TeacherGlassPanel } from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import { IconVideo, IconBookOpen, IconFolder } from '@/components/teacher/TeacherIcons';
import { getTeacherAssignmentsDb, mysqlPool } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';

export const metadata = {
  title: 'Notes & Materials | The Shiva',
};

export default async function TeacherNotes() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  // getTeacherAssignmentsDb TeacherCourseAssignments poochta hai -
  // purane DB par table missing ho to helper error swallow karke []
  // deta hai (page khaali dikhta). Page-level leg: helper me wiring
  // nahi (db <-> ensure circular import hota).
  await ensureTeacherAssignmentSchema();
  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courseIds = assignments.map((a: any) => a.courseId);

  interface Note { id: string; title: string; videoUrl: string | null; durationSeconds: number; isPreviewable: number; chapterTitle: string; subjectName: string; courseTitle: string; }
  let notes: Note[] = [];
  if (courseIds.length > 0) {
    const placeholders = courseIds.map(() => '?').join(', ');
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id, l.title, l.videoUrl, l.durationSeconds, l.isPreviewable,
              ch.title AS chapterTitle, s.name AS subjectName, c.title AS courseTitle
         FROM Lectures l
         JOIN Chapters ch ON l.chapterId = ch.id
         JOIN Subjects s ON ch.subjectId = s.id
         JOIN Courses c ON s.courseId = c.id
        WHERE s.courseId IN (${placeholders})
        ORDER BY c.title, s.sortOrder, ch.sortOrder, l.sortOrder`,
      courseIds
    );
    notes = rows || [];
  }

  const grouped = new Map<string, Note[]>();
  for (const n of notes) {
    const key = n.courseTitle;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(n);
  }

  const fmtDuration = (secs: number) => {
    const s = Number(secs || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Notes & Materials"
        description="Review your recorded lecture library — the primary learning material published to students."
      />

      <div className="mt-8 space-y-10">
        {grouped.size === 0 ? (
          <TeacherEmptyState
            illustrationType="courses"
            title="No Materials Published"
            description="Upload recorded lectures under Manage Content to build your notes & materials library."
          />
        ) : (
          Array.from(grouped.entries()).map(([courseTitle, items]) => (
            <section key={courseTitle}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-teal-500/20 text-teal-600 rounded-xl flex items-center justify-center">
                  <IconFolder size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--teacher-text)]">{courseTitle}</h2>
                  <p className="text-xs text-[var(--teacher-text-muted)]">{items.length} recorded {items.length === 1 ? 'material' : 'materials'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((n) => (
                  <TeacherGlassPanel key={n.id} className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-500/15 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconVideo size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[var(--teacher-text)] text-sm leading-tight line-clamp-1">{n.title}</h3>
                        <p className="text-xs text-[var(--teacher-text-muted)] mt-0.5">{n.subjectName} · {n.chapterTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--teacher-border)]">
                      <span className="text-xs font-bold text-[var(--teacher-text-muted)]">
                        <IconBookOpen size={12} className="inline mr-1 -mt-0.5" />
                        {fmtDuration(n.durationSeconds)}
                      </span>
                      {n.isPreviewable ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">PREVIEWABLE</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">STUDENT-ONLY</span>
                      )}
                    </div>
                    {n.videoUrl && (
                      <a
                        href={n.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Open Recording
                      </a>
                    )}
                  </TeacherGlassPanel>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}