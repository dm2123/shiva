import { getCourseSyllabusTree } from '@/services/academic.service';
import { isStudentEnrolledInCourseDb } from '@/lib/db';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { StudentPageHeader } from '@/components/student/StudentShared';
import {
  IconBook, IconShield, IconPlay, IconCheckCircle, IconArrowRight, IconTarget, IconClock, IconBarChart,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function StudentCourseDetailsPage({ params }: { params: { courseId: string } }) {
  let courseTree;
  try {
    courseTree = await getCourseSyllabusTree(params.courseId);
  } catch {
    return notFound();
  }
  if (!courseTree) return notFound();

  const session = await getSessionFromHeaders(headers());
  if (!session) redirect('/login');

  const isEnrolled = await isStudentEnrolledInCourseDb(session.userId, courseTree.id);

  const subjects = courseTree.subjects || [];
  const chapters = subjects.flatMap((s: any) => s.chapters || []);
  const lectures = chapters.flatMap((c: any) => c.lectures || []);
  const price = Number(courseTree.price || 0);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title={courseTree.title}
        description={courseTree.description}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-8 min-w-0">
          <section>
            <h2 className="text-lg font-bold text-[var(--student-text)] mb-4">Course Syllabus</h2>
            {subjects.length === 0 ? (
              <div className="student-card p-10 text-center">
                <IconBook size={24} className="mx-auto text-[var(--student-text-faint)] mb-3" />
                <p className="text-sm text-[var(--student-text-muted)]">
                  The syllabus for this course is being finalized. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {subjects.map((subject: any) => (
                  <div key={subject.id} className="student-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[var(--student-text)]">{subject.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)]">
                        {subject.chapters.length} {subject.chapters.length === 1 ? 'chapter' : 'chapters'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {subject.chapters.map((chapter: any) => (
                        <div key={chapter.id} className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[12px] font-semibold text-[var(--student-text-secondary)] leading-snug">{chapter.title}</p>
                            <IconCheckCircle size={13} className="text-[var(--student-text-faint)] flex-shrink-0" />
                          </div>
                          <p className="text-[11px] text-[var(--student-text-faint)] mt-1">
                            {chapter.lectures.length} {chapter.lectures.length === 1 ? 'lecture' : 'lectures'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {isEnrolled && (
            <section>
              <div className="student-card p-5 border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <IconCheckCircle size={18} className="text-emerald-600" />
                    <p className="text-sm font-bold text-[var(--student-text)]">You are enrolled in this course</p>
                  </div>
                  <Link
                    href={`/app/learn/${courseTree.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Continue Learning
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="student-card p-6 sticky top-4">
            <div className="space-y-3">
              {[
                { icon: <IconBook size={14} className="text-[var(--student-primary)]" />, label: 'Subjects', value: String(subjects.length) },
                { icon: <IconBarChart size={14} className="text-violet-500" />, label: 'Chapters', value: String(chapters.length) },
                { icon: <IconPlay size={14} className="text-amber-500" />, label: 'Lectures', value: String(lectures.length) },
                { icon: <IconClock size={14} className="text-emerald-600" />, label: 'Batches', value: String((courseTree.batches || []).length) },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-[var(--student-text-muted)]">{s.icon} {s.label}</span>
                  <span className="text-sm font-black text-[var(--student-text)]">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--student-border-light)]">
              {isEnrolled ? (
                <Link
                  href={`/app/learn/${courseTree.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <IconPlay size={15} />
                  Start Learning
                </Link>
              ) : (
                <>
                  <form action="/api/student/enrollments" method="POST">
                    <input type="hidden" name="courseId" value={courseTree.id} />
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      <IconTarget size={15} />
                      {price === 0 ? 'Enroll Now' : `Enroll Now · ₹${price}`}
                    </button>
                  </form>
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--student-text-muted)]">
                    <IconShield size={12} className="text-amber-500" />
                    Enrolled students unlock every lecture in this syllabus.
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}