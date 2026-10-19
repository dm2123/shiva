import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader, StudentSection } from '@/components/student/StudentShared';
import {
  IconUsers, IconCalendar, IconUser, IconPlay, IconArrowRight,
  IconBookOpen, IconClock, IconCheckCircle, IconZap, IconTarget,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  UPCOMING: 'bg-amber-50 text-amber-700 border border-amber-100',
  COMPLETED: 'bg-slate-100 text-slate-600 border border-slate-200',
};

// Stable gradient per batch (picked from id hash — original SHIVA palette)
const BANNER_GRADIENTS = [
  'from-indigo-600 via-indigo-500 to-violet-500',
  'from-emerald-600 via-emerald-500 to-teal-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-sky-600 via-blue-500 to-indigo-500',
  'from-fuchsia-600 via-purple-500 to-indigo-500',
];

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[h % BANNER_GRADIENTS.length];
}

function fmtDate(d: any): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

// Honest upcoming batches — clearly marked, no fake enrollments
const COMING_SOON = [
  {
    id: 'ssc-cgl-2026',
    title: 'MISSION SSC CGL 2026',
    target: 'SSC CGL 2026',
    icon: <IconTarget size={26} />,
    gradient: 'from-violet-600 via-purple-500 to-indigo-500',
  },
  {
    id: 'railway-2026',
    title: 'MISSION RAILWAY 2026',
    target: 'RRB NTPC / Group D',
    icon: <IconZap size={26} />,
    gradient: 'from-sky-600 via-blue-500 to-indigo-500',
  },
];

export default async function BatchesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  // Real enrolled batches for this student
  const [rows]: any = await mysqlPool.query(
    `SELECT b.id, b.name, b.status, b.startDate, b.endDate,
            c.id AS courseId, c.title AS courseTitle,
            tp.name AS teacherName
       FROM StudentEnrollments e
       JOIN Batches b ON e.batchId = b.id
       JOIN Courses c ON e.courseId = c.id
       LEFT JOIN TeacherProfiles tp ON b.teacherId = tp.userId
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY b.createdAt DESC`,
    [session.userId]
  );
  const batches: any[] = rows || [];

  // Real published free course for the "explore" section
  const [courseRows]: any = await mysqlPool.query(
    `SELECT id, title, slug, description, price FROM Courses
      WHERE slug = 'aptitude-foundation-free' AND status = 'PUBLISHED' LIMIT 1`
  );
  const aptitudeCourse: any = courseRows?.[0] || null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 pb-24 space-y-10">
      <StudentPageHeader
        title="My Batches"
        description="Your enrolled batches, schedules and mentors — everything in one place."
        action={batches.length > 0 ? { text: 'Explore Courses', href: '/app/courses' } : undefined}
      />

      {/* ── Enrolled batches ─────────────────────────────── */}
      <StudentSection
        title="Enrolled Batches"
        subtitle={`${batches.length} active`}
      >
        {batches.length === 0 ? (
          <div className="student-card p-8 md:p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
              <IconUsers size={30} />
            </div>
            <h3 className="text-base font-bold text-[var(--student-text)]">No batch assigned yet</h3>
            <p className="text-sm text-[var(--student-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
              You are not part of any batch right now. Enroll in a course below to get started —
              your batch will appear here automatically.
            </p>
            <Link
              href="/app/courses"
              className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <IconBookOpen size={16} />
              Browse Courses
              <IconArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {batches.map((b) => (
              <article key={b.id} className="student-card overflow-hidden flex flex-col">
                {/* Banner */}
                <div className={`relative bg-gradient-to-br ${gradientFor(String(b.id))} px-5 pt-5 pb-6 text-white overflow-hidden`}>
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute right-8 top-10 w-16 h-16 rounded-full bg-white/10" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <IconUsers size={24} className="text-white" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[b.status] || STATUS_STYLES.ACTIVE}`}>
                      {b.status}
                    </span>
                  </div>
                  <h3 className="relative mt-3 text-lg font-bold leading-snug">{b.name}</h3>
                  <p className="relative text-[12px] text-white/80 mt-0.5 uppercase tracking-wider">{b.courseTitle}</p>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="space-y-2.5 text-[13px] text-[var(--student-text-muted)]">
                    <p className="flex items-center gap-2.5">
                      <IconCalendar size={15} className="text-[var(--student-text-faint)] flex-shrink-0" />
                      <span>{fmtDate(b.startDate)}{b.endDate ? ` → ${fmtDate(b.endDate)}` : ''}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <IconUser size={15} className="text-[var(--student-text-faint)] flex-shrink-0" />
                      <span>Mentor: <span className="font-semibold text-[var(--student-text)]">{b.teacherName || 'To be assigned'}</span></span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <IconCheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                      <span>Enrollment active</span>
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[var(--student-border-light)]">
                    <Link
                      href={`/app/learn/${b.courseId}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      <IconPlay size={15} />
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </StudentSection>

      {/* ── Start learning: real free course ───────────────── */}
      {aptitudeCourse && (
        <StudentSection
          title="Start Learning Today"
          subtitle="Free course · Enroll anytime"
        >
          <Link
            href={`/app/courses/${aptitudeCourse.id}`}
            className="student-card overflow-hidden flex flex-col sm:flex-row group"
          >
            <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 sm:w-56 flex-shrink-0 min-h-[140px] flex items-center justify-center overflow-hidden">
              <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute right-4 top-4 w-14 h-14 rounded-full bg-white/10" />
              <span className="relative text-white"><IconBookOpen size={44} /></span>
              <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-white text-orange-600 px-2.5 py-1 rounded-full">
                100% Free
              </span>
            </div>
            <div className="p-5 flex-1">
              <h3 className="text-[16px] font-bold text-[var(--student-text)] group-hover:text-indigo-600 transition-colors leading-snug">
                {aptitudeCourse.title}
              </h3>
              {aptitudeCourse.description && (
                <p className="text-[13px] text-[var(--student-text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                  {aptitudeCourse.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-[12px] text-[var(--student-text-faint)]">
                <span className="flex items-center gap-1.5"><IconClock size={13} /> Self-paced</span>
                <span className="flex items-center gap-1.5"><IconPlay size={13} /> Video lessons</span>
              </div>
              <span className="inline-flex items-center gap-1.5 mt-4 text-[13px] font-bold text-indigo-600">
                View course <IconArrowRight size={14} />
              </span>
            </div>
          </Link>
        </StudentSection>
      )}

      {/* ── Coming soon (honest) ───────────────────────────── */}
      <StudentSection
        title="Coming Soon"
        subtitle="New batches in the making"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COMING_SOON.map((c) => (
            <div key={c.id} className="student-card overflow-hidden opacity-95">
              <div className={`relative bg-gradient-to-br ${c.gradient} px-5 py-5 text-white overflow-hidden`}>
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-white">
                    {c.icon}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold leading-snug">{c.title}</h3>
                    <p className="text-[11px] text-white/80 uppercase tracking-wider mt-0.5">{c.target}</p>
                  </div>
                </div>
                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-white/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="p-5 flex items-center justify-between gap-3">
                <p className="text-[12px] text-[var(--student-text-muted)] leading-relaxed">
                  We are preparing this batch. Talk to a counsellor to get notified at launch.
                </p>
                <Link
                  href="/app/counsellor"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Notify me <IconArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </StudentSection>
    </div>
  );
}
