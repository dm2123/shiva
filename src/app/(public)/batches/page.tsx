import Link from 'next/link';
import { mysqlPool } from '@/lib/db';
import ShivaPromoCarousel from '@/components/public/ShivaPromoCarousel';
import ListingInfo from '@/components/public/ListingInfo';
import ShareButton from '@/components/public/ShareButton';

export const revalidate = 0;

export const metadata = {
  title: 'Batches — THE SHIVA',
  description:
    'THE SHIVA ke live aur upcoming batches — structured group learning, live classes aur peer ke saath taiyaari. Apne exam ke hisaab se batch chuno.',
};

/* ------------------------------------------------------------------ */
/* Types — sirf wohi fields jo asal DB query laati hai                 */
/* Batches: name, startDate, endDate, status                           */
/* Courses (join): title, slug, price, description                     */
/* TeacherProfiles (join): name                                        */
/* Note: Batches/Courses me language ya category column nahi hai —     */
/* isliye language kabhi dikhaya nahi jaata, aur exam tag sirf batch/  */
/* course ke asal naam se derive hota hai (invent nahi hota).          */
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
  teacherName: string | null;
};

async function getAllBatches(): Promise<BatchRow[]> {
  try {
    const [rows]: any = await mysqlPool.query(`
      SELECT b.id, b.name, b.startDate, b.endDate, b.status,
             c.title as courseTitle, c.slug as courseSlug,
             c.price as coursePrice, c.description as courseDescription,
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
    chip: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500 animate-pulse',
  },
  UPCOMING: {
    label: 'Upcoming',
    chip: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-[#f5b942]',
  },
  COMPLETED: {
    label: 'Completed',
    chip: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
  },
};

function statusMeta(status: string | null) {
  return STATUS_META[(status || '').toUpperCase()] || STATUS_META.COMPLETED;
}

/* ------------------------------- card ------------------------------- */

function BatchCard({ batch }: { batch: BatchRow }) {
  const meta = statusMeta(batch.status);
  const exam = deriveExam(batch);
  const price = formatINR(batch.coursePrice);
  const isFree = price === 'FREE';
  const start = formatDate(batch.startDate);
  const end = formatDate(batch.endDate);
  const href = batch.courseSlug ? `/courses/${batch.courseSlug}` : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ede9fe] bg-white shadow-[0_6px_24px_rgba(42,22,80,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-[#6d28d9]/40 hover:shadow-[0_18px_44px_rgba(42,22,80,0.30)]">
      {/* Top strip — deep purple → violet, gold edge */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#f5b942]" aria-hidden="true" />

      {/* Share — card ke upar-right kone me; url card ke apne detail href par */}
      <ShareButton title={batch.name} url={href ?? '/courses'} className="absolute right-3 top-3.5" />

      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Badges row: narangi exam tag + status (right me share button ki jagah chhodi) */}
        <div className="flex flex-wrap items-center gap-2 pr-11">
          {exam && (
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-orange-700">
              {exam}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${meta.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
            {meta.label}
          </span>
          {isFree && (
            <span className="inline-flex items-center rounded-full bg-[#f5b942] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#2a1650]">
              100% Free
            </span>
          )}
        </div>

        {/* Batch name + linked course */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold leading-snug text-[#2a1650]">{batch.name}</h3>
          {batch.courseTitle && batch.courseTitle !== batch.name && (
            <p className="text-sm font-medium text-slate-600">{batch.courseTitle}</p>
          )}
          {batch.courseDescription && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500">
              {batch.courseDescription}
            </p>
          )}
        </div>

        {/* Meta — sirf asal fields */}
        <dl className="mt-auto space-y-2 border-t border-[#ede9fe] pt-4 text-[13px]">
          {batch.teacherName && (
            <div className="flex items-center gap-2">
              <dt className="sr-only">Teacher</dt>
              <dd className="flex items-center gap-2 text-slate-600">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-[11px] font-extrabold text-white"
                  aria-hidden="true"
                >
                  {batch.teacherName.trim().charAt(0).toUpperCase()}
                </span>
                <span>
                  Teacher: <span className="font-semibold text-[#6d28d9]">{batch.teacherName}</span>
                </span>
              </dd>
            </div>
          )}
          {(start || end) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
              {start && (
                <span>
                  🗓️ Shuru: <span className="font-semibold text-slate-700">{start}</span>
                </span>
              )}
              {end && (
                <span>
                  Khatm: <span className="font-semibold text-slate-700">{end}</span>
                </span>
              )}
            </div>
          )}
        </dl>

        {/* Price row — pakka pattern: bold price; FREE par green 'Free'.
            Asal query me MRP column hai hi nahi, isliye kata MRP / % OFF
            chip yahan nahi dikhta (invent nahi hota). */}
        {price &&
          (isFree ? (
            <p className="text-lg font-extrabold text-emerald-600">
              Free
              <span className="ml-2 align-middle text-[11px] font-semibold normal-case tracking-normal text-slate-500">
                Poora access, koi fee nahi
              </span>
            </p>
          ) : (
            <p className="text-xl font-extrabold text-[#2a1650]">{price}</p>
          ))}

        {/* CTA row — kharid/enroll = solid KAALA; detail = purple outline */}
        {href ? (
          <div className="mt-1 flex items-stretch gap-2.5">
            <Link
              href={href}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-black"
            >
              {isFree ? 'Register Now' : 'Buy Now'}
            </Link>
            <Link
              href={href}
              aria-label={`${batch.name} — details dekho`}
              className="inline-flex w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#6d28d9] bg-white text-lg font-black leading-none text-[#6d28d9] transition-colors hover:bg-[#f5f3ff]"
            >
              ›
            </Link>
          </div>
        ) : (
          <Link
            href="/courses"
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#6d28d9] bg-white px-6 py-3 text-sm font-bold text-[#6d28d9] transition-all hover:bg-[#f5f3ff]"
          >
            Course dekho →
          </Link>
        )}
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

  const live = batches.filter((b) => (b.status || '').toUpperCase() === 'ACTIVE');
  const upcoming = batches.filter((b) => (b.status || '').toUpperCase() === 'UPCOMING');
  const completed = batches.filter(
    (b) => !['ACTIVE', 'UPCOMING'].includes((b.status || '').toUpperCase()),
  );

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

  const groups: Array<{ key: string; title: string; blurb: string; items: BatchRow[] }> = [
    {
      key: 'live',
      title: '🟢 Live / Running Batches',
      blurb: 'Ye batches abhi chal rahe hain — join karke turant padhai shuru karo.',
      items: live,
    },
    {
      key: 'upcoming',
      title: '🟡 Upcoming Batches',
      blurb: 'Ye batches jald shuru hone wale hain — pehle se apni seat pakki karo.',
      items: upcoming,
    },
    {
      key: 'completed',
      title: 'Completed Batches',
      blurb: 'Ye batches poore ho chuke hain.',
      items: completed,
    },
  ];

  return (
    <div className="shiva-liquid-hero shiva-grid relative min-h-screen overflow-hidden px-6 py-24">
      <div className="shiva-blob left-[-150px] top-[10%] h-[600px] w-[600px] bg-violet-600" aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 bottom-[10%] right-[-100px] h-[500px] w-[500px] bg-[#6d28d9]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Breadcrumb — chhota, halka (listing-page pattern) */}
        <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-slate-400">
          <Link href="/" className="font-semibold text-[#c4b5fd] hover:text-white">
            Home
          </Link>
          {' / '}
          <span aria-current="page" className="text-slate-300">
            Batches
          </span>
        </nav>

        {/* Hero */}
        <div className="mb-12 space-y-5 text-center">
          <span className="shiva-capsule shiva-capsule-violet">Organized Learning · THE SHIVA</span>
          <h1 className="text-shiva-section text-white">
            Join a<br />
            <span className="text-shiva-gold">structured batch</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
            Apne exam ke hisaab se batch chuno — scheduled live classes, saathi students ke saath
            padhai, aur har batch ke saath linked course ka poora syllabus.
          </p>

          {/* Real counts — sirf asal data se */}
          {batches.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[13px] font-semibold">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                Kul batches: <span className="text-[#f5b942]">{batches.length}</span>
              </span>
              {live.length > 0 && (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-emerald-300">
                  Live: {live.length}
                </span>
              )}
              {upcoming.length > 0 && (
                <span className="rounded-full border border-[#f5b942]/20 bg-[#f5b942]/10 px-4 py-2 text-[#f5b942]">
                  Upcoming: {upcoming.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Promo carousel — hero ke turant baad, filters/search se pehle */}
        <div className="mb-12 overflow-hidden rounded-3xl shadow-[0_18px_44px_rgba(13,11,30,0.45)]">
          <ShivaPromoCarousel />
        </div>

        {batches.length === 0 ? (
          /* Honest empty state — koi batch hi publish nahi hai */
          <div className="shiva-glass mx-auto max-w-2xl space-y-5 rounded-3xl p-12 text-center">
            <div className="text-5xl opacity-40" aria-hidden="true">🗓️</div>
            <h2 className="text-xl font-bold text-white">Abhi koi batch available nahi hai</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Jaise hi naye batches publish honge, woh yahan dikhenge. Tab tak hamare published
              courses dekho ya free register karke sabse pehle khabar pao.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                href="/courses"
                className="inline-block rounded-full bg-[#6d28d9] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#6d28d9]/30 transition-all hover:-translate-y-0.5 hover:bg-[#7c3aed]"
              >
                Courses Dekho
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-full bg-[#111111] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                Register Free
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Search — GET form (server-side filter, asal fields par).
                Status/exam selection hidden fields se barkarar rehti hai. */}
            <form
              method="get"
              action="/batches"
              role="search"
              className="mx-auto mb-8 flex max-w-xl items-stretch gap-2"
            >
              {validStatus !== 'ALL' && (
                <input type="hidden" name="status" value={validStatus} />
              )}
              {activeExam && <input type="hidden" name="exam" value={activeExam} />}
              <div className="relative flex-1">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] opacity-60"
                >
                  🔍
                </span>
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Batch, course ya teacher khojo…"
                  aria-label="Batch search karo"
                  className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#6d28d9] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#6d28d9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#6d28d9]/30 transition-all hover:bg-[#7c3aed]"
              >
                Khojo
              </button>
              {query && (
                <Link
                  href={chipHref(validStatus === 'ALL' ? 'all' : validStatus, activeExam, '')}
                  className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                >
                  ✕ Saaf
                </Link>
              )}
            </form>

            {/* Filter chips — status */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2" role="navigation" aria-label="Batch status filter">
              {STATUS_FILTERS.map((f) => {
                const isActive = validStatus === f.key.toUpperCase() || (f.key === 'all' && validStatus === 'ALL');
                return (
                  <Link
                    key={f.key}
                    href={chipHref(f.key === 'all' ? 'all' : f.key, activeExam, query)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                      isActive
                        ? 'bg-[#f5b942] text-[#2a1650] shadow-lg shadow-[#f5b942]/25'
                        : 'border border-white/15 bg-white/5 text-slate-300 hover:border-[#6d28d9]/60 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>

            {/* Filter chips — exam (sirf data me maujood exams) */}
            {exams.length > 1 && (
              <div className="mb-10 flex flex-wrap items-center justify-center gap-2" role="navigation" aria-label="Exam filter">
                <Link
                  href={chipHref(validStatus === 'ALL' ? 'all' : validStatus, null, query)}
                  aria-current={!activeExam ? 'page' : undefined}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    !activeExam
                      ? 'bg-[#6d28d9] text-white shadow-lg shadow-[#6d28d9]/30'
                      : 'border border-white/15 bg-white/5 text-slate-300 hover:border-[#6d28d9]/60 hover:text-white'
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
                        ? 'bg-[#6d28d9] text-white shadow-lg shadow-[#6d28d9]/30'
                        : 'border border-white/15 bg-white/5 text-slate-300 hover:border-[#6d28d9]/60 hover:text-white'
                    }`}
                  >
                    {exam}
                  </Link>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              /* Filter ke baad khaali — honest state */
              <div className="shiva-glass mx-auto max-w-2xl space-y-4 rounded-3xl p-10 text-center">
                <h2 className="text-lg font-bold text-white">
                  Is filter me abhi koi batch available nahi hai
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  {query
                    ? `“${query}” se match karta koi batch nahi mila. Spelling check karo, dusra status ya exam chuno — ya saare batches ek saath dekho.`
                    : 'Dusra status ya exam chunkar dekho — ya saare batches ek saath dekho.'}
                </p>
                <Link
                  href="/batches"
                  className="inline-block rounded-full bg-[#f5b942] px-7 py-3 text-sm font-bold text-[#2a1650] transition-all hover:-translate-y-0.5"
                >
                  Saare Batches Dekho
                </Link>
              </div>
            ) : isFiltered ? (
              /* Filtered flat grid */
              <section aria-label="Filtered batches">
                <p className="mb-6 text-center text-sm text-slate-400">
                  <span className="font-bold text-white">{filtered.length}</span>{' '}
                  {filtered.length === 1 ? 'batch mila' : 'batches mile'}
                  {query ? ` · “${query}”` : ''}
                  {activeExam ? ` · ${activeExam}` : ''}
                  {validStatus !== 'ALL' ? ` · ${statusMeta(validStatus).label}` : ''}
                  {' — '}
                  <Link href="/batches" className="font-semibold text-[#f5b942] hover:underline">
                    filter hatao
                  </Link>
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((batch) => (
                    <BatchCard key={batch.id} batch={batch} />
                  ))}
                </div>
              </section>
            ) : (
              /* Default: status ke hisaab se grouped sections */
              <div className="space-y-16">
                {groups
                  .filter((g) => g.items.length > 0)
                  .map((group) => (
                    <section key={group.key} aria-label={group.title}>
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                        <div>
                          <h2 className="text-2xl font-extrabold text-white">{group.title}</h2>
                          <p className="mt-1 text-sm text-slate-400">{group.blurb}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                          {group.items.length} {group.items.length === 1 ? 'batch' : 'batches'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((batch) => (
                          <BatchCard key={batch.id} batch={batch} />
                        ))}
                      </div>
                    </section>
                  ))}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-16 rounded-3xl border border-[#6d28d9]/40 bg-gradient-to-br from-[#2a1650] to-[#6d28d9]/40 p-8 text-center md:p-10">
              <h2 className="text-xl font-extrabold text-white md:text-2xl">
                Samajh nahi aa raha kaunsa batch sahi hai?
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                Free register karo — apna target exam set karo aur apne goal ke hisaab se batches
                aur courses apne dashboard me dekho.
              </p>
              <Link
                href="/register"
                className="mt-5 inline-block rounded-full bg-[#111111] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                Register Free →
              </Link>
            </div>
          </>
        )}

        {/* Why THE SHIVA + FAQ — page ke aakhir me (footer se pehle) */}
        <ListingInfo />
      </div>
    </div>
  );
}
