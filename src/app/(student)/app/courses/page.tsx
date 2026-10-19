import { listCoursesDb, getStudentEnrollmentsDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { parseSessionCookie, validateServerSession } from '@/lib/auth';
import Link from 'next/link';
import { IconBook, IconArrowRight, IconCheckCircle, IconPlay, IconZap } from '@/components/student/StudentIcons';

export const revalidate = 0;

// Gradient covers cycle — THE SHIVA brand palette, no external assets
const COVERS = [
  'from-[#312e81] via-[#4f46e5] to-[#7c3aed]',
  'from-[#0c4a6e] via-[#0284c7] to-[#22d3ee]',
  'from-[#581c87] via-[#9333ea] to-[#e879f9]',
  'from-[#7c2d12] via-[#ea580c] to-[#fbbf24]',
];

export default async function StudentCoursesPage() {
  const cookieHeader = cookies().toString();
  const sessionId = parseSessionCookie(cookieHeader);
  const session = sessionId ? await validateServerSession(sessionId) : null;
  const allCourses = await listCoursesDb(false);

  let enrolledCourseIds: Set<string> = new Set();
  if (session) {
    const enrollments = await getStudentEnrollmentsDb(session.userId);
    enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── Hero strip ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#312e81] via-[#4f46e5] to-[#7c3aed] p-6 sm:p-8 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-2xl" />
        <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">THE SHIVA Courses</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Apne exam ki taiyaari<br className="hidden sm:block" /> yahin se shuru karo
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100">
            Structured curriculum, Hinglish me — pehla course poori tarah FREE hai.
          </p>
        </div>
      </section>

      {allCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--student-border-strong)] bg-[var(--student-surface)] p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--student-primary-light)]">
            <IconBook size={24} className="text-[var(--student-primary)]" />
          </div>
          <p className="text-base font-bold text-[var(--student-text)]">Courses jald aa rahe hain</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--student-text-muted)]">
            Naye courses publish hote hi yahan dikhenge. Tab tak dashboard par Free Learning Festival explore karo.
          </p>
          <Link
            href="/app"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--student-primary)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            Dashboard par wapas
            <IconArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-[var(--student-text)]">
              Sabhi Courses
              <span className="ml-2 rounded-full bg-[var(--student-primary-light)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--student-primary)]">
                {allCourses.length}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {allCourses.map((course: any, idx: number) => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              const isFree = Number(course.price || 0) === 0;
              const cover = COVERS[idx % COVERS.length];
              return (
                <Link
                  key={course.id}
                  href={`/app/courses/${course.id}`}
                  className="group overflow-hidden rounded-3xl border border-[var(--student-border)] bg-[var(--student-surface)] transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  {/* cover */}
                  <div className={`relative h-44 bg-gradient-to-br ${cover} p-5`}>
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                    <div className="absolute left-4 top-4 flex gap-2">
                      {isFree ? (
                        <span className="rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-950">
                          Free
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                          ₹{Number(course.price).toLocaleString('en-IN')}
                        </span>
                      )}
                      {isEnrolled && (
                        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#4338ca]">
                          <IconCheckCircle size={11} />
                          Enrolled
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur transition-transform group-hover:scale-110">
                        <IconBook size={22} className="text-white" />
                      </div>
                    </div>
                    <span className="absolute bottom-4 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#4338ca] opacity-0 shadow-lg transition-all group-hover:opacity-100">
                      <IconArrowRight size={16} />
                    </span>
                  </div>

                  {/* body */}
                  <div className="p-5">
                    <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[var(--student-text)] transition-colors group-hover:text-[var(--student-primary)]">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--student-text-muted)]">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-[var(--student-border-light)] pt-4">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--student-text-faint)]">
                        <IconPlay size={12} />
                        Self-paced · Hinglish
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                          isEnrolled
                            ? 'bg-[var(--student-primary)] text-white'
                            : 'bg-[var(--student-primary-light)] text-[var(--student-primary)] group-hover:bg-[var(--student-primary)] group-hover:text-white'
                        }`}
                      >
                        {isEnrolled ? (
                          <>
                            <IconPlay size={12} />
                            Continue
                          </>
                        ) : (
                          <>
                            <IconZap size={12} />
                            {isFree ? 'Enroll Free' : 'View Course'}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
