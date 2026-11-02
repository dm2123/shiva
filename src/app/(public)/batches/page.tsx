import Link from 'next/link';
import { mysqlPool } from '@/lib/db';
import ShareButton from '@/components/public/ShareButton';
import CourseBanner from '@/components/student/CourseBanner';

export const revalidate = 0;

export const metadata = {
  title: 'Batches — THE SHIVA',
  description:
    'THE SHIVA ke live aur upcoming batches — structured group learning, live classes aur peer ke saath taiyaari. Apne exam ke hisaab se batch chuno.',
};

/* ------------------------------------------------------------------ */
/* Types — sirf wohi fields jo asal DB query laati hai                 */
/* Batches: name, startDate, endDate, status                           */
/* Courses (join): title, slug, price, description, thumbnailUrl       */
/* TeacherProfiles (join): name                                        */
/* Note: Batches/Courses me language ya MRP column nahi hai — isliye   */
/* language kabhi dikhaya nahi jaata aur kata MRP / % OFF kabhi        */
/* invent nahi hota. Exam tag sirf batch/course ke asal naam se        */
/* derive hota hai.                                                    */
/*                                                                     */
/* Wave B1 (PW catalog parity): page ab shudh catalog hai — halka     */
/* gray bg, safed bade banner cards, upar gol search bar, status/     */
/* exam chips. PW catalog par na hone wale sections (promo carousel,  */
/* bottom CTA, FAQ) hata diye gaye hain.                              */
/* ------------------------------------------------------------------ */
type BatchRow = {
  id: string;
  name: string;
  startDate: string | Date | null;
  endDate: string | Date | null;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | string | null;
  courseTitle: string | null;
  courseSlug: string | null;
  coursePrice: number | string | null;
  courseDescription: string | null;
  courseThumbnail: string | null;
  teacherName: string | null;
};

async function getAllBatches(): Promise<BatchRow[]> {
  try {
    const [rows]: any = await mysqlPool.query(`
      SELECT b.id, b.name, b.startDate, b.endDate, b.status,
             c.title as courseTitle, c.slug as courseSlug,
             c.price as coursePrice, c.description as courseDescription,
             c.thumbnailUrl as courseThumbnail,
             tp.name as teacherName
      FROM Batches b
      LEFT JOIN Courses c ON b.courseId = c.id
      LEFT JOIN TeacherProfiles tp ON b.teacherId = tp.id
      ORDER BY
        CASE b.status WHEN 'ACTIVE' THEN 0 WHEN 'UPCOMING' THEN 1 ELSE 2 END,
        b.startDate ASC
    `);
    return rows || [];
  } catch {
    return [];
  }
}

/* ------------------------- helpers (real data only) ------------------------- */

const EXAM_RULES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bssc\b|\bcgl\b|\bchsl\b|\bmts\b|ssc\s*gd/i, label: 'SSC' },
  { pattern: /railway|\brrb\b|\bntpc\b|group\s*d/i, label: 'Railway' },
  { pattern: /bank|\bibps\b|\bsbi\b/i, label: 'Banking' },
  { pattern: /\bctet\b|\btet\b|teaching|teacher|\bkvs\b|\bdsssb\b/i, label: 'Teaching' },
  { pattern: /defence|defense|\bnda\b|\bcds\b|\bafcat\b/i, label: 'Defence' },
  { pattern: /\bupsc\b|\bias\b|\bpcs\b|civil\s*service/i, label: 'UPSC' },
  { pattern: /\bneet\b/i, label: 'NEET' },
  { pattern: /\bjee\b/i, label: 'JEE' },
];

/** Exam tag sirf batch/course ke asal naam-slug se derive hota hai. Match na ho to null — koi tag nahi dikhega. */
function deriveExam(batch: BatchRow): string | null {
  const haystack = `${batch.name || ''} ${batch.courseTitle || ''} ${batch.courseSlug || ''}`;
  for (const rule of EXAM_RULES) {
    if (rule.pattern.test(haystack)) return rule.label;
  }
  return null;
}

function formatINR(value: number | string | null): string | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n <= 0 ? 'FREE' : `₹${n.toLocaleString('en-IN')}`;
}

function formatDate(value: string | Date | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
  ACTIVE: {
    label: 'Live · Running',
    chip: 'bg-emerald-500 text-white',
    dot: 'bg-white animate-pulse',
  },
  UPCOMING: {
    label: 'Upcoming',
    chip: 'bg-[#f5b942] text-[#2a1650]',
    dot: 'bg-[#2a1650]',
  },
  COMPLETED: {
    label: 'Completed',
    chip: 'bg-slate-600/90 text-white',
    dot: 'bg-slate-300',
  },
};

function statusMeta(status: string | null) {
  return STATUS_META[(status || '').toUpperCase()] || STATUS_META.COMPLETED;
}

/* ------------------------------- card ------------------------------- */
/* PW catalog anatomy (light): 16:9 banner (asal course thumbnail; na  */
/* ho/load fail ho to designed gradient tile) → safed body: exam line */
/* → title (2 line) → course line → date line → price row + daayen    */
/* KAALA CTA. Asal data me MRP nahi hai — kata MRP / % OFF kabhi      */
/* invent nahi hota.                                                   */

function BatchCard({ batch }: { batch: BatchRow }) {
  const meta = statusMeta(batch.status);
  const exam = deriveExam(batch);
  const price = formatINR(batch.coursePrice);
  const isFree = price === 'FREE';
  const start = formatDate(batch.startDate);
  const end = formatDate(batch.endDate);
  const href = batch.courseSlug ? `/courses/${batch.courseSlug}` : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_6px_24px_rgba(42,22,80,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(42,22,80,0.12)]">
      {/* Banner — 16:9, asal thumbnail ya designed tile; chips overlay */}
      <CourseBanner
        src={batch.courseThumbnail}
        title={batch.courseTitle || batch.name}
        seed={batch.courseSlug || batch.id}
      >
        <ShareButton title={batch.name} url={href ?? '/courses'} className="absolute right-3 top-3 z-10" />
        <span
          className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow ${meta.chip}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
          {meta.label}
        </span>
        {isFree && (
          <span className="absolute bottom-3 right-3 rounded-md bg-[#f5b942] px-2.5 py-1 text-[11px] font-extrabold text-[#2a1650] shadow">
            100% Free
          </span>
        )}
      </CourseBanner>

      <div className="flex flex-1 flex-col p-5">
        {/* Exam line — narangi, chhoti, bold (PW pattern); sirf asal derive par */}
        {exam && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-orange-600">
            {exam}
          </p>
        )}

        {/* Title — batch ka asal naam, zyada se zyada 2 line */}
        <h3 className="mt-1.5 line-clamp-2 text-[17px] font-bold leading-snug text-gray-900">
          {batch.name}
        </h3>

        {/* Audience line — linked course (naam alag ho tab) */}
        {batch.courseTitle && batch.courseTitle !== batch.name && (
          <p className="mt-1 line-clamp-1 text-[13px] font-medium text-gray-500">
            For {batch.courseTitle}
          </p>
        )}
        {batch.courseDescription && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
            {batch.courseDescription}
          </p>
        )}

        {/* Teacher — sirf asal naam par */}
        {batch.teacherName && (
          <p className="mt-3 flex items-center gap-2 text-[13px] text-gray-500">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-[11px] font-extrabold text-white"
              aria-hidden="true"
            >
              {batch.teacherName.trim().charAt(0).toUpperCase()}
            </span>
            <span>
              Teacher: <span className="font-semibold text-gray-800">{batch.teacherName}</span>
            </span>
          </p>
        )}

        {/* Date line — sirf asal dates, calendar icon ke saath */}
        {(start || end) && (
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-400">
            <span aria-hidden="true">📅</span>
            {start && (
              <span>
                Shuru: <span className="font-semibold text-gray-600">{start}</span>
              </span>
            )}
            {start && end && <span className="text-gray-300" aria-hidden="true">·</span>}
            {end && (
              <span>
                Khatm: <span className="font-semibold text-gray-600">{end}</span>
              </span>
            )}
          </p>
        )}

        {/* Price row + KAALA CTA — PW pattern. FREE par emerald 'Free';
            MRP column hai hi nahi, isliye kata MRP / % OFF kabhi nahi. */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            {price ? (
              isFree ? (
                <>
                  <p className="text-[19px] font-extrabold leading-tight text-emerald-600">Free</p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-gray-400">
                    Poora access, koi fee nahi
                  </p>
                </>
              ) : (
                <p className="text-[20px] font-extrabold leading-tight text-gray-900">{price}</p>
              )
            ) : (
              <span />
            )}
          </div>
          {href ? (
            <Link
              href={href}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#111111] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition-all hover:bg-black"
            >
              {isFree ? 'Register Now' : 'Buy Now'}
            </Link>
          ) : (
            <Link
              href="/courses"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#111111] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition-all hover:bg-black"
            >
              Course dekho
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------- page ------------------------------- */

type PageProps = {
  searchParams?: { status?: string; exam?: string; q?: string };
};

const STATUS_FILTERS = [
  { key: 'all', label: 'Saare Batches' },
  { key: 'ACTIVE', label: '🟢 Live / Running' },
  { key: 'UPCOMING', label: '🟡 Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
] as const;

function chipHref(status: string, exam: string | null, q: string): string {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (exam) params.set('exam', exam);
  if (q) params.set('q', q);
  const qs = params.toString();
  return qs ? `/batches?${qs}` : '/batches';
}

export default async function PublicBatchesPage({ searchParams }: PageProps) {
  const batches = await getAllBatches();

  const liveCount = batches.filter((b) => (b.status || '').toUpperCase() === 'ACTIVE').length;
  const upcomingCount = batches.filter((b) => (b.status || '').toUpperCase() === 'UPCOMING').length;

  // Exam chips — sirf wohi exams jo asal data me maujood hain
  const exams = Array.from(
    new Set(batches.map(deriveExam).filter((e): e is string => Boolean(e))),
  ).sort();

  const activeStatus = (searchParams?.status || 'all').toUpperCase();
  const validStatus = ['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].includes(activeStatus)
    ? activeStatus
    : 'ALL';
  const activeExam =
    searchParams?.exam && exams.includes(searchParams.exam) ? searchParams.exam : null;

  /* Search — sirf asal fields par: batch naam, course title/description, teacher naam */
  const query = (searchParams?.q || '').trim();
  const qLower = query.toLowerCase();

  const filtered = batches.filter((b) => {
    if (validStatus === 'ACTIVE' && (b.status || '').toUpperCase() !== 'ACTIVE') return false;
    if (validStatus === 'UPCOMING' && (b.status || '').toUpperCase() !== 'UPCOMING') return false;
    if (
      validStatus === 'COMPLETED' &&
      ['ACTIVE', 'UPCOMING'].includes((b.status || '').toUpperCase())
    )
      return false;
    if (activeExam && deriveExam(b) !== activeExam) return false;
    if (qLower) {
      const haystack =
        `${b.name || ''} ${b.courseTitle || ''} ${b.courseDescription || ''} ${b.teacherName || ''}`.toLowerCase();
      if (!haystack.includes(qLower)) return false;
    }
    return true;
  });

  const isFiltered = validStatus !== 'ALL' || activeExam !== null || query !== '';

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb — chhota, halka (listing-page pattern) */}
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-gray-400">
          <Link href="/" className="font-semibold text-[#6d28d9] hover:text-[#2a1650]">
            Home
          </Link>
          {' / '}
          <span aria-current="page" className="text-gray-500">
            Batches
          </span>
        </nav>

        {/* ── Header: bada title + counts (left) · gol search bar (right) ── */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[34px] font-extrabold leading-tight text-gray-900 sm:text-[40px]">
              Batches
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-gray-500">
              Apne exam ke hisaab se batch chuno — scheduled live classes, saathi students ke saath
              padhai, aur har batch ke saath linked course ka poora syllabus.
            </p>
            {/* Real counts — sirf asal data se */}
            {batches.length > 0 && (
              <p className="mt-3 text-[13px] font-semibold text-gray-500">
                Kul batches: <span className="text-gray-900">{batches.length}</span>
                {liveCount > 0 && (
                  <>
                    {' · '}
                    <span className="text-emerald-600">Live: {liveCount}</span>
                  </>
                )}
                {upcomingCount > 0 && (
                  <>
                    {' · '}
                    <span className="text-amber-600">Upcoming: {upcomingCount}</span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Search — gol bar (PW pattern), GET form (server-side filter,
              asal fields par). Status/exam hidden fields se barkarar. */}
          {batches.length > 0 && (
            <form
              method="get"
              action="/batches"
              role="search"
              className="flex w-full max-w-md items-center gap-2 lg:shrink-0"
            >
              {validStatus !== 'ALL' && (
                <input type="hidden" name="status" value={validStatus} />
              )}
              {activeExam && <input type="hidden" name="exam" value={activeExam} />}
              <div className="relative flex-1">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] opacity-50"
                >
                  🔍
                </span>
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search for batches, courses…"
                  aria-label="Batch search karo"
                  className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6d28d9] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#111111] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all hover:bg-black"
              >
                Search
              </button>
              {query && (
                <Link
                  href={chipHref(validStatus === 'ALL' ? 'all' : validStatus, activeExam, '')}
                  className="inline-flex shrink-0 items-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
                >
                  ✕ Saaf
                </Link>
              )}
            </form>
          )}
        </div>

        {batches.length === 0 ? (
          /* Honest empty state — koi batch hi publish nahi hai */
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]">
            <div className="text-5xl opacity-40" aria-hidden="true">🗓️</div>
            <h2 className="mt-5 text-xl font-bold text-gray-900">Abhi koi batch available nahi hai</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Jaise hi naye batches publish honge, woh yahan dikhenge. Tab tak hamare published
              courses dekho ya free register karke sabse pehle khabar pao.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses"
                className="inline-block rounded-full bg-[#6d28d9] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#6d28d9]/30 transition-all hover:-translate-y-0.5 hover:bg-[#7c3aed]"
              >
                Courses Dekho
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-full bg-[#111111] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                Register Free
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filter chips — status */}
            <div className="mb-4 flex flex-wrap items-center gap-2" role="navigation" aria-label="Batch status filter">
              {STATUS_FILTERS.map((f) => {
                const isActive = validStatus === f.key.toUpperCase() || (f.key === 'all' && validStatus === 'ALL');
                return (
                  <Link
                    key={f.key}
                    href={chipHref(f.key === 'all' ? 'all' : f.key, activeExam, query)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                      isActive
                        ? 'bg-[#6d28d9] text-white shadow-lg shadow-[#6d28d9]/25'
                        : 'border border-gray-300 bg-white text-gray-600 hover:border-[#6d28d9]/60 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>

            {/* Filter chips — exam (sirf data me maujood exams) */}
            {exams.length > 1 && (
              <div className="mb-8 flex flex-wrap items-center gap-2" role="navigation" aria-label="Exam filter">
                <Link
                  href={chipHref(validStatus === 'ALL' ? 'all' : validStatus, null, query)}
                  aria-current={!activeExam ? 'page' : undefined}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    !activeExam
                      ? 'bg-[#111111] text-white shadow-lg shadow-black/20'
                      : 'border border-gray-300 bg-white text-gray-600 hover:border-[#6d28d9]/60 hover:text-gray-900'
                  }`}
                >
                  Saare Exams
                </Link>
                {exams.map((exam) => (
                  <Link
                    key={exam}
                    href={chipHref(validStatus === 'ALL' ? 'all' : validStatus, exam, query)}
                    aria-current={activeExam === exam ? 'page' : undefined}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      activeExam === exam
                        ? 'bg-[#111111] text-white shadow-lg shadow-black/20'
                        : 'border border-gray-300 bg-white text-gray-600 hover:border-[#6d28d9]/60 hover:text-gray-900'
                    }`}
                  >
                    {exam}
                  </Link>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              /* Filter ke baad khaali — honest state */
              <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]">
                <h2 className="text-lg font-bold text-gray-900">
                  Is filter me abhi koi batch available nahi hai
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {query
                    ? `“${query}” se match karta koi batch nahi mila. Spelling check karo, dusra status ya exam chuno — ya saare batches ek saath dekho.`
                    : 'Dusra status ya exam chunkar dekho — ya saare batches ek saath dekho.'}
                </p>
                <Link
                  href="/batches"
                  className="mt-5 inline-block rounded-full bg-[#111111] px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-black"
                >
                  Saare Batches Dekho
                </Link>
              </div>
            ) : (
              /* Catalog grid — PW anatomy ke bade banner cards (query order:
                 ACTIVE pehle, phir UPCOMING — server query waisi hi hai) */
              <section aria-label="Batches catalog">
                <p className="mb-5 text-sm text-gray-500">
                  <span className="font-bold text-gray-900">{filtered.length}</span>{' '}
                  {filtered.length === 1 ? 'batch mila' : 'batches mile'}
                  {query ? ` · “${query}”` : ''}
                  {activeExam ? ` · ${activeExam}` : ''}
                  {validStatus !== 'ALL' ? ` · ${statusMeta(validStatus).label}` : ''}
                  {isFiltered && (
                    <>
                      {' — '}
                      <Link href="/batches" className="font-semibold text-[#6d28d9] hover:underline">
                        filter hatao
                      </Link>
                    </>
                  )}
                </p>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((batch) => (
                    <BatchCard key={batch.id} batch={batch} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
