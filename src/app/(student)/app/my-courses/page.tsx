import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader, StudentSection } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconBook, IconBookOpen, IconPlay, IconArrowRight,
  IconClock, IconCheckCircle, IconLayers, IconAward,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

// Stable gradient per course (original THE SHIVA palette — deep purple + gold family)
const BANNER_GRADIENTS = [
  'from-[#2a1650] via-[#4c1d95] to-[#6d28d9]',
  'from-violet-700 via-purple-600 to-fuchsia-500',
  'from-indigo-700 via-[#6d28d9] to-violet-500',
  'from-[#3b1d73] via-indigo-600 to-sky-500',
  'from-purple-800 via-[#6d28d9] to-amber-500',
  'from-[#2a1650] via-rose-700 to-orange-500',
];

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[h % BANNER_GRADIENTS.length];
}

function fmtDate(d: any): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

/** Ek course ki resume/next lecture (asal LectureProgress se; na mile to null) */
async function lecturePointers(studentId: string, courseId: string) {
  let resumeLecture: { id: string; title: string } | null = null;
  let nextLecture: { id: string; title: string } | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id, l.title FROM LectureProgress lp
         JOIN Lectures l ON l.id = lp.lectureId
         JOIN Chapters ch ON ch.id = l.chapterId
         JOIN Subjects s ON s.id = ch.subjectId
        WHERE lp.studentId = ? AND s.courseId = ?
          AND lp.positionSeconds > 0
          AND (lp.isCompleted IS NULL OR lp.isCompleted = 0)
        ORDER BY lp.lastWatchedAt DESC LIMIT 1`,
      [studentId, courseId]
    );
    if (rows?.[0]) resumeLecture = { id: String(rows[0].id), title: rows[0].title };
  } catch { /* pointer nahi — plain learn link chalega */ }
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id, l.title FROM Subjects s
         JOIN Chapters ch ON ch.subjectId = s.id
         JOIN Lectures l ON l.chapterId = ch.id
         LEFT JOIN LectureProgress lp ON lp.lectureId = l.id AND lp.studentId = ?
        WHERE s.courseId = ?
          AND (lp.isCompleted IS NULL OR lp.isCompleted = 0)
        ORDER BY s.sortOrder ASC, ch.sortOrder ASC, l.sortOrder ASC LIMIT 1`,
      [studentId, courseId]
    );
    if (rows?.[0]) nextLecture = { id: String(rows[0].id), title: rows[0].title };
  } catch { /* ignore */ }
  return { resumeLecture, nextLecture };
}

export default async function MyCoursesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const studentId = (session as any).userId as string;

  // Enrolled courses + asal lecture progress (ek aggregate query, N+1 nahi).
  // Aakhri dekhi gayi activity sabse upar — "jahan chhoda tha" wala order.
  let myCourses: any[] = [];
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT c.id, c.title, c.slug, c.description, c.price, c.status,
              e.enrolledAt,
              COUNT(DISTINCT l.id) AS totalLectures,
              COUNT(DISTINCT CASE WHEN lp.isCompleted = 1 THEN l.id END) AS completedLectures,
              MAX(lp.lastWatchedAt) AS lastActivityAt
         FROM StudentEnrollments e
         JOIN Courses c ON e.courseId = c.id
         LEFT JOIN Subjects s ON s.courseId = c.id
         LEFT JOIN Chapters ch ON ch.subjectId = s.id
         LEFT JOIN Lectures l ON l.chapterId = ch.id
         LEFT JOIN LectureProgress lp ON lp.lectureId = l.id AND lp.studentId = e.studentId
        WHERE e.studentId = ? AND e.status = 'ACTIVE'
        GROUP BY c.id, c.title, c.slug, c.description, c.price, c.status, e.enrolledAt
        ORDER BY (lastActivityAt IS NULL), lastActivityAt DESC, e.enrolledAt DESC`,
      [studentId]
    );
    myCourses = rows || [];
  } catch {
    // Fallback: bina progress wali purani query — course list to dikhe
    const [rows]: any = await mysqlPool.query(
      `SELECT c.id, c.title, c.slug, c.description, c.price, c.status, e.enrolledAt
         FROM StudentEnrollments e
         JOIN Courses c ON e.courseId = c.id
        WHERE e.studentId = ? AND e.status = 'ACTIVE'
        ORDER BY e.enrolledAt DESC`,
      [studentId]
    );
    myCourses = (rows || []).map((c: any) => ({ ...c, totalLectures: 0, completedLectures: 0 }));
  }

  // Resume/next pointers har enrolled course ke liye (parallel, best-effort)
  myCourses = await Promise.all(
    myCourses.map(async (c) => ({ ...c, ...(await lecturePointers(studentId, String(c.id))) }))
  );

  const totalCompleted = myCourses.reduce((s, c) => s + (Number(c.completedLectures) || 0), 0);
  const totalLecturesAll = myCourses.reduce((s, c) => s + (Number(c.totalLectures) || 0), 0);
  const overallPct = totalLecturesAll === 0 ? 0 : Math.round((totalCompleted / totalLecturesAll) * 100);

  // Real published courses the student has NOT enrolled in (explore section)
  const enrolledIds = myCourses.map((c) => c.id);
  let exploreCourses: any[] = [];
  try {
    const [allRows]: any = await mysqlPool.query(
      `SELECT id, title, slug, description, price FROM Courses WHERE status = 'PUBLISHED' ORDER BY createdAt DESC LIMIT 6`
    );
    exploreCourses = (allRows || []).filter((c: any) => !enrolledIds.includes(c.id));
  } catch {
    exploreCourses = [];
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 pb-24 space-y-10">
      <StudentPageHeader
        title="My Courses"
        description="Jahan chhoda tha, wahin se jaari rakho — tumhare saare enrolled courses aur unki asal progress yahan hai."
        action={myCourses.length > 0 ? { text: 'Explore Courses', href: '/app/courses' } : undefined}
      />

      {/* ── Asal progress summary (sirf enrolled ho tab) ──── */}
      {myCourses.length > 0 && totalLecturesAll > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] text-white p-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Enrolled courses</p>
            <p className="text-2xl font-black mt-0.5">{myCourses.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Lectures completed</p>
            <p className="text-2xl font-black mt-0.5">{totalCompleted}<span className="text-sm font-bold text-white/60"> / {totalLecturesAll}</span></p>
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5">
              <span>Kul progress</span><span className="text-[#f5b942]">{overallPct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#f5b942] to-amber-300 transition-all duration-700" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Enrolled courses ───────────────────────────────── */}
      <StudentSection
        title="Continue Learning"
        subtitle={`${myCourses.length} enrolled`}
      >
        {myCourses.length === 0 ? (
          <StudentEmptyState
            icon={<IconBook size={22} />}
            title="Abhi koi course nahi liya hai"
            description="Tumne abhi tak kisi course me enroll nahi kiya. Courses dekho, apne goal ke hisaab se course chuno aur padhai aaj se shuru karo."
            actionText="Courses dekhein"
            actionHref="/app/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myCourses.map((course) => {
              const total = Number(course.totalLectures) || 0;
              const completed = Number(course.completedLectures) || 0;
              const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
              const done = total > 0 && completed >= total;
              const resume = course.resumeLecture ?? course.nextLecture;
              const continueHref = resume
                ? `/app/learn/${course.id}?lecture=${resume.id}`
                : `/app/learn/${course.id}`;
              return (
                <article key={course.id} className="student-card overflow-hidden flex flex-col sm:flex-row group">
                  {/* Cover */}
                  <div className={`relative bg-gradient-to-br ${gradientFor(String(course.id))} sm:w-44 flex-shrink-0 min-h-[132px] flex items-center justify-center overflow-hidden`}>
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute right-3 top-3 w-12 h-12 rounded-full bg-white/10" />
                    <div className="relative w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <IconLayers size={26} />
                    </div>
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-white/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                      <IconCheckCircle size={11} /> Enrolled
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col min-w-0">
                    <h3 className="text-[15px] font-bold text-[var(--student-text)] leading-snug group-hover:text-[#6d28d9] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-[12px] text-[var(--student-text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-[var(--student-text-faint)]">
                      <span className="font-bold text-emerald-600">
                        {Number(course.price) > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free'}
                      </span>
                      {course.enrolledAt && (
                        <span className="flex items-center gap-1">
                          <IconClock size={12} /> Enrolled {fmtDate(course.enrolledAt)}
                        </span>
                      )}
                    </div>

                    {/* Asal progress */}
                    {total > 0 ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="text-[var(--student-text-muted)]">{completed} / {total} lectures</span>
                          <span className="font-bold text-[#6d28d9]">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--student-surface-hover)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#f5b942] transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {done ? (
                          <p className="text-[11px] font-semibold text-emerald-600 mt-2">🎉 Course poora ho gaya — badhai ho!</p>
                        ) : course.resumeLecture ? (
                          <p className="text-[11px] text-[var(--student-text-muted)] mt-2 truncate">
                            <span className="font-semibold text-[var(--student-text)]">Wahin se jaari rakho:</span> {course.resumeLecture.title}
                          </p>
                        ) : course.nextLecture ? (
                          <p className="text-[11px] text-[var(--student-text-muted)] mt-2 truncate">
                            <span className="font-semibold text-[var(--student-text)]">Up next:</span> {course.nextLecture.title}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[var(--student-text-faint)] mt-4">
                        Is course ki lectures jald aa rahi hain.
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-[var(--student-border-light)]">
                      <Link
                        href={continueHref}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6d28d9] text-white text-[13px] font-bold hover:bg-[#5b21b6] transition-colors"
                      >
                        <IconPlay size={14} />
                        {done ? 'Dobara dekho' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </StudentSection>

      {/* ── Explore more (real published courses only) ──────── */}
      {exploreCourses.length > 0 && (
        <StudentSection
          title="Explore More"
          subtitle="Available courses"
          action={{ text: 'View all', href: '/app/courses' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {exploreCourses.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className="student-card overflow-hidden group"
              >
                <div className={`relative bg-gradient-to-br ${gradientFor(String(course.id))} h-28 flex items-center justify-center overflow-hidden`}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                  <div className="relative w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <IconBookOpen size={24} />
                  </div>
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-white text-[#6d28d9] px-2.5 py-1 rounded-full">
                    {Number(course.price) > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-bold text-[var(--student-text)] leading-snug line-clamp-2 group-hover:text-[#6d28d9] transition-colors">
                    {course.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold text-[#6d28d9]">
                    View details <IconArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </StudentSection>
      )}

      {/* ── Achievements strip (honest, no fake stats) ─────── */}
      {myCourses.length > 0 && (
        <div className="student-card p-5 flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <IconAward size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--student-text)]">Keep the streak going</p>
            <p className="text-[12px] text-[var(--student-text-muted)] mt-0.5">
              Upar wale course se aaj ki agli lecture poori karo — chhoti jeet roz badi taiyaari banati hai.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
