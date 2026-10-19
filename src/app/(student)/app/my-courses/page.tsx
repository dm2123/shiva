import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader, StudentSection } from '@/components/student/StudentShared';
import {
  IconBook, IconBookOpen, IconPlay, IconArrowRight,
  IconClock, IconCheckCircle, IconLayers, IconAward,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

// Stable gradient per course (original SHIVA palette)
const BANNER_GRADIENTS = [
  'from-indigo-600 via-indigo-500 to-violet-500',
  'from-emerald-600 via-emerald-500 to-teal-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-sky-600 via-blue-500 to-indigo-500',
  'from-fuchsia-600 via-purple-500 to-indigo-500',
  'from-rose-600 via-pink-500 to-fuchsia-500',
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

export default async function MyCoursesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  // One JOIN query — enrolled courses with enrollment date (no N+1)
  const [rows]: any = await mysqlPool.query(
    `SELECT c.id, c.title, c.slug, c.description, c.price, c.status,
            e.enrolledAt
       FROM StudentEnrollments e
       JOIN Courses c ON e.courseId = c.id
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY e.enrolledAt DESC`,
    [session.userId]
  );
  const myCourses: any[] = rows || [];

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
        description="Pick up where you left off — your learning journey continues here."
        action={myCourses.length > 0 ? { text: 'Explore Courses', href: '/app/courses' } : undefined}
      />

      {/* ── Enrolled courses ───────────────────────────────── */}
      <StudentSection
        title="Continue Learning"
        subtitle={`${myCourses.length} enrolled`}
      >
        {myCourses.length === 0 ? (
          <div className="student-card p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
              <IconBook size={30} />
            </div>
            <h3 className="text-base font-bold text-[var(--student-text)]">No courses yet</h3>
            <p className="text-sm text-[var(--student-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
              You have not enrolled in any course. Start with our free Aptitude Foundation course —
              no payment needed, learn at your own pace.
            </p>
            <Link
              href="/app/courses"
              className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <IconBookOpen size={16} />
              Explore Courses
              <IconArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myCourses.map((course) => (
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
                  <h3 className="text-[15px] font-bold text-[var(--student-text)] leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
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
                  <div className="mt-auto pt-3 border-t border-[var(--student-border-light)]">
                    <Link
                      href={`/app/learn/${course.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-colors"
                    >
                      <IconPlay size={14} />
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </article>
            ))}
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
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-white text-indigo-600 px-2.5 py-1 rounded-full">
                    {Number(course.price) > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-bold text-[var(--student-text)] leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold text-indigo-600">
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
              Open a course above and finish your next lesson today.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
