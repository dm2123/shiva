import Link from 'next/link';
import { mysqlPool } from '@/lib/db';

/* ------------------------------------------------------------------ */
/* MarketingBatches — homepage/marketing section (koi props nahi).     */
/* Data: Batches ⨝ Courses (title, slug, price, description)           */
/*       ⨝ TeacherProfiles (name). Sirf asal fields dikhte hain;       */
/* language/category DB me hai hi nahi, isliye kabhi nahi dikhta.      */
/* Exam tag batch/course ke asal naam se derive hota hai.             */
/* ------------------------------------------------------------------ */

type BatchRow = {
  id: string;
  name: string;
  startDate: string | Date | null;
  endDate: string | Date | null;
  status: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
  coursePrice: number | string | null;
  courseDescription: string | null;
  teacherName: string | null;
};

async function getUpcomingBatches(): Promise<BatchRow[]> {
  try {
    const [rows]: any = await mysqlPool.query(`
      SELECT b.id, b.name, b.startDate, b.endDate, b.status,
             c.title as courseTitle, c.slug as courseSlug,
             c.price as coursePrice, c.description as courseDescription,
             tp.name as teacherName
      FROM Batches b
      LEFT JOIN Courses c ON b.courseId = c.id
      LEFT JOIN TeacherProfiles tp ON b.teacherId = tp.id
      WHERE b.status IN ('UPCOMING', 'ACTIVE')
      ORDER BY
        CASE b.status WHEN 'ACTIVE' THEN 0 ELSE 1 END,
        b.startDate ASC
      LIMIT 6
    `);
    return rows || [];
  } catch {
    return [];
  }
}

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

export default async function MarketingBatches() {
  const batches = await getUpcomingBatches();

  if (!batches || batches.length === 0) {
    return (
      <section className="marketing-section-xs relative">
        <div className="marketing-container-narrow">
          <div className="shiva-glass space-y-4 rounded-2xl border border-white/10 px-6 py-8 text-center md:px-10 md:py-10">
            <span className="section-eyebrow inline-block">Batches</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Live &amp; Upcoming Batches</h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
              Abhi koi batch available nahi hai. Jaise hi naye batches publish honge, woh yahan
              dikhenge — tab tak hamare courses dekho.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                href="/courses"
                className="inline-block rounded-full bg-[#6d28d9] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#7c3aed]"
              >
                Courses Dekho
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-full border border-[#f5b942]/50 px-6 py-2.5 text-sm font-bold text-[#f5b942] transition-all hover:bg-[#f5b942]/10"
              >
                Register Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const liveCount = batches.filter((b) => (b.status || '').toUpperCase() === 'ACTIVE').length;
  const upcomingCount = batches.length - liveCount;

  return (
    <section className="marketing-section-xs relative">
      <div className="marketing-container">
        <div className="mb-8 flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="space-y-2">
            <span className="section-eyebrow inline-block">Batches · THE SHIVA</span>
            <h2 className="text-2xl font-bold text-white md:text-3xl">Live &amp; Upcoming Batches</h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              {liveCount > 0 && <>{liveCount} live</>}
              {liveCount > 0 && upcomingCount > 0 && ' · '}
              {upcomingCount > 0 && <>{upcomingCount} upcoming</>}
              {(liveCount > 0 || upcomingCount > 0) && ' — '}
              apne exam ke hisaab se batch chuno aur course details dekho.
            </p>
          </div>
          <Link
            href="/batches"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#f5b942] transition-colors hover:text-[#ffd06a]"
          >
            Saare batches dekho
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            const isLive = (batch.status || '').toUpperCase() === 'ACTIVE';
            const exam = deriveExam(batch);
            const price = formatINR(batch.coursePrice);
            const start = formatDate(batch.startDate);
            const end = formatDate(batch.endDate);
            const href = batch.courseSlug ? `/courses/${batch.courseSlug}` : '/batches';

            const isFree = price === 'FREE';
            return (
              <article
                key={batch.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#ede9fe] bg-white shadow-[0_6px_24px_rgba(42,22,80,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(42,22,80,0.28)]"
              >
                <div
                  className="h-1 w-full bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#f5b942]"
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {exam && (
                      <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-orange-700">
                        {exam}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${
                        isLive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isLive ? 'animate-pulse bg-emerald-500' : 'bg-[#f5b942]'}`}
                        aria-hidden="true"
                      />
                      {isLive ? 'Live · Running' : 'Upcoming'}
                    </span>
                    {isFree && (
                      <span className="inline-flex items-center rounded-full bg-[#f5b942] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#2a1650]">
                        100% Free
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold leading-snug text-[#2a1650]">{batch.name}</h3>
                  {batch.courseTitle && batch.courseTitle !== batch.name && (
                    <p className="-mt-1.5 text-xs text-slate-500">{batch.courseTitle}</p>
                  )}
                  {batch.courseDescription && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {batch.courseDescription}
                    </p>
                  )}
                  {batch.teacherName && (
                    <p className="text-xs text-slate-600">
                      Teacher:{' '}
                      <span className="font-semibold text-[#6d28d9]">{batch.teacherName}</span>
                    </p>
                  )}

                  <div className="mt-auto space-y-3 border-t border-[#ede9fe] pt-3">
                    {(start || end) && (
                      <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
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
                      </p>
                    )}
                    {/* Price row — pakka pattern: bold price (asal data me MRP
                        column hai hi nahi, isliye kata MRP / % OFF chip nahi) */}
                    {price &&
                      (isFree ? (
                        <p className="text-base font-extrabold text-emerald-600">
                          Free
                          <span className="ml-2 align-middle text-[11px] font-semibold normal-case tracking-normal text-slate-500">
                            Poora access, koi fee nahi
                          </span>
                        </p>
                      ) : (
                        <p className="text-lg font-extrabold text-[#2a1650]">{price}</p>
                      ))}
                    {/* CTA row — kharid/enroll = solid KAALA; detail = purple outline */}
                    <div className="flex items-stretch gap-2.5">
                      <Link
                        href={href}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#111111] px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-black"
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
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
