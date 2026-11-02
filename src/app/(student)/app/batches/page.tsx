import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import {
  IconUsers, IconPlay, IconArrowRight,
  IconBookOpen, IconClock, IconZap, IconTarget,
} from '@/components/student/StudentIcons';
import BatchesClient, { type BatchCardData } from './BatchesClient';

export const revalidate = 0;

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
    gradient: 'from-indigo-700 via-[#6d28d9] to-violet-500',
  },
];

/* v2 (PW grammar, light) tokens — dashboard wale hi */
const SECTION_TITLE = 'text-[17px] font-bold leading-snug text-gray-900';
const CARD =
  'rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]';

export default async function BatchesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  // Real enrolled batches for this student
  const [rows]: any = await mysqlPool.query(
    `SELECT b.id, b.name, b.status, b.startDate, b.endDate,
            c.id AS courseId, c.title AS courseTitle, c.thumbnailUrl AS courseThumbnail,
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

  // Client component ke liye serializable roop (dates → ISO string)
  const batchData: BatchCardData[] = batches.map((b) => ({
    id: String(b.id),
    name: b.name,
    status: b.status,
    startDate: b.startDate ? new Date(b.startDate).toISOString() : null,
    endDate: b.endDate ? new Date(b.endDate).toISOString() : null,
    courseId: String(b.courseId),
    courseTitle: b.courseTitle,
    courseThumbnail: b.courseThumbnail ?? null,
    teacherName: b.teacherName ?? null,
  }));

  // Real published free course for the "explore" section
  const [courseRows]: any = await mysqlPool.query(
    `SELECT id, title, slug, description, price FROM Courses
      WHERE slug = 'aptitude-foundation-free' AND status = 'PUBLISHED' LIMIT 1`
  );
  const aptitudeCourse: any = courseRows?.[0] || null;

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-5 px-4 py-5 pb-10">
      {/* ── Page header — title + asal count line ─────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold leading-tight text-gray-900">My Batches</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
            {batches.length > 0
              ? `${batches.length} ${batches.length === 1 ? 'batch' : 'batches'} joined — schedule aur mentors, sab ek jagah.`
              : 'Tumhare enrolled batches, unke schedule aur mentors yahan dikhenge.'}
          </p>
        </div>
        {batches.length > 0 && (
          <Link
            href="/app/courses"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-[12.5px] font-bold text-gray-700 transition hover:border-violet-300 hover:text-[#6d28d9]"
          >
            Explore Courses
            <IconArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* ── Enrolled batches ─────────────────────────────── */}
      <section aria-label="Enrolled Batches">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <h2 className={SECTION_TITLE}>Enrolled Batches</h2>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11.5px] font-bold text-[#6d28d9]">
            {batches.length} joined
          </span>
        </div>
        {batches.length === 0 ? (
          /* Compact designed empty state — PW 'No batches available' pattern:
             bold title + ek gray line + CTA; lamba khaali dabba nahi */
          <div className={`flex flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:text-left ${CARD}`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[#6d28d9]">
              <IconUsers size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-gray-900">No batch assigned yet</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
                Tum abhi kisi batch ka hissa nahi ho. Kisi course me enroll karte hi tumhara batch
                yahan apne aap dikhega — schedule aur mentor ke saath.
              </p>
            </div>
            <Link
              href="/app/courses"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#5b21b6]"
            >
              <IconBookOpen size={15} />
              Browse Courses
            </Link>
          </div>
        ) : (
          <BatchesClient batches={batchData} />
        )}
      </section>

      {/* ── Start learning: real free course ───────────────── */}
      {aptitudeCourse && (
        <section aria-label="Start Learning Today">
          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <h2 className={SECTION_TITLE}>Start Learning Today</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11.5px] font-bold text-emerald-600">
              Free course · Enroll anytime
            </span>
          </div>
          <Link
            href={`/app/courses/${aptitudeCourse.id}`}
            className={`group flex flex-col overflow-hidden sm:flex-row ${CARD}`}
          >
            <div className="relative flex min-h-[132px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f5b942] via-amber-500 to-orange-600 sm:w-60">
              <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute right-4 top-4 h-14 w-14 rounded-full bg-white/10" />
              <span className="relative text-white"><IconBookOpen size={44} /></span>
              <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-600">
                100% Free
              </span>
            </div>
            <div className="min-w-0 flex-1 p-5">
              <h3 className="text-[16px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#6d28d9]">
                {aptitudeCourse.title}
              </h3>
              {aptitudeCourse.description && (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
                  {aptitudeCourse.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-[12px] text-gray-400">
                <span className="flex items-center gap-1.5"><IconClock size={13} /> Self-paced</span>
                <span className="flex items-center gap-1.5"><IconPlay size={13} /> Video lessons</span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6d28d9]">
                View course <IconArrowRight size={14} />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ── Coming soon (honest) ───────────────────────────── */}
      <section aria-label="Coming Soon">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <h2 className={SECTION_TITLE}>Coming Soon</h2>
          <span className="text-[12.5px] text-gray-400">New batches in the making</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {COMING_SOON.map((c) => (
            <div key={c.id} className={`overflow-hidden ${CARD}`}>
              <div className={`relative overflow-hidden bg-gradient-to-br px-5 py-5 text-white ${c.gradient}`}>
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold leading-snug">{c.title}</h3>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/80">{c.target}</p>
                  </div>
                </div>
                <span className="absolute right-3 top-3 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                  Coming Soon
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-[12px] leading-relaxed text-gray-500">
                  We are preparing this batch. Talk to a counsellor to get notified at launch.
                </p>
                <Link
                  href="/app/counsellor"
                  className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-[#6d28d9] hover:text-[#5b21b6]"
                >
                  Notify me <IconArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
