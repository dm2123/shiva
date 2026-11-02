'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  IconCalendar, IconUser, IconPlay, IconSearch, IconX, IconClock,
} from '@/components/student/StudentIcons';
import CourseBanner from '@/components/student/CourseBanner';

export interface BatchCardData {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string | null;
  teacherName: string | null;
  /** Courses.price (asal) — sirf Paid | Free classification ke liye */
  coursePrice: number | null;
  /** StudentEnrollments.enrolledAt — validity-based expiry ka aadhaar */
  enrolledAt: string | null;
  /** Courses.validityMonths (best-effort; column na ho to null) */
  validityMonths: number | null;
}

// Status chip — sirf asal b.status field se (banner par solid, padhne layak)
const STATUS_CHIP: Record<string, string> = {
  ACTIVE: 'bg-emerald-500 text-white',
  UPCOMING: 'bg-[#f5b942] text-[#2a1650]',
  COMPLETED: 'bg-slate-500 text-white',
};
const STATUS_CHIP_FALLBACK = 'bg-slate-400 text-white';

function fmtDate(d: string | null): string | null {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

type Segment = 'PAID' | 'FREE';
type Tab = 'ALL' | 'EXPIRED';

/** Paid | Free — asal aadhaar sirf course ka price:
 *  price > 0 → Paid; price 0 ya NULL → Free. Price kahin dikhta/invent nahi hota. */
function segmentOf(b: BatchCardData): Segment {
  return (b.coursePrice ?? 0) > 0 ? 'PAID' : 'FREE';
}

/** Ek batch ki asal expiry: batch endDate pehle, warna enrolledAt +
 *  course validityMonths (dashboard ke expiryOf jaisi hi logic).
 *  Dono na hon to null — matlab koi expiry aadhaar nahi. */
function expiryOf(b: BatchCardData): Date | null {
  if (b.endDate) {
    const d = new Date(b.endDate);
    return isNaN(d.getTime()) ? null : d;
  }
  if (b.enrolledAt && b.validityMonths && b.validityMonths > 0) {
    const d = new Date(b.enrolledAt);
    if (isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + b.validityMonths);
    return d;
  }
  return null;
}

function isExpired(b: BatchCardData): boolean {
  const expiry = expiryOf(b);
  return expiry !== null && expiry.getTime() < Date.now();
}

/**
 * My Batches — PW anatomy: Paid | Free segmented control (halka violet-gray
 * dabba, active = safed card + shadow + violet bold), All | Expired tabs
 * (active = violet bold + violet underline), neeche PW card grid.
 * Saare filter sirf asal enrollment data par, client-side — koi server
 * call nahi, koi nakli data nahi.
 */
export default function BatchesClient({ batches }: { batches: BatchCardData[] }) {
  // Default segment imaandaari se: jis segment me asal batches hon wahi
  // khule; dono me hon (ya ek bhi na ho) to Paid pehle — PW jaisa.
  const [segment, setSegment] = useState<Segment>(() => {
    const hasPaid = batches.some((b) => segmentOf(b) === 'PAID');
    const hasFree = batches.some((b) => segmentOf(b) === 'FREE');
    if (hasPaid) return 'PAID';
    if (hasFree) return 'FREE';
    return 'PAID';
  });
  const [tab, setTab] = useState<Tab>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return batches.filter((b) => {
      if (segmentOf(b) !== segment) return false;
      if (tab === 'EXPIRED' && !isExpired(b)) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.courseTitle.toLowerCase().includes(q) ||
        (b.teacherName || '').toLowerCase().includes(q)
      );
    });
  }, [batches, segment, tab, query]);

  const searching = query.trim() !== '';

  return (
    <div>
      {/* ── Paid | Free segmented control (PW anatomy) ─────── */}
      <div
        className="flex w-full max-w-[340px] rounded-2xl bg-[#eef0fe] p-1.5"
        role="group"
        aria-label="Batch type"
      >
        {(
          [
            { key: 'PAID', label: 'Paid' },
            { key: 'FREE', label: 'Free' },
          ] as { key: Segment; label: string }[]
        ).map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSegment(s.key)}
            aria-pressed={segment === s.key}
            className={`flex-1 rounded-xl py-2.5 text-[15px] transition ${
              segment === s.key
                ? 'bg-white font-bold text-[#6d28d9] shadow-[0_2px_8px_rgba(16,24,40,0.10)]'
                : 'font-semibold text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── All | Expired tabs + search ────────────────────── */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-gray-200">
        <div className="flex gap-7" role="tablist" aria-label="Batch list">
          {(
            [
              { key: 'ALL', label: 'All' },
              { key: 'EXPIRED', label: 'Expired' },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`relative pb-3 text-[15px] transition ${
                tab === t.key
                  ? 'font-bold text-[#6d28d9]'
                  : 'font-medium text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#6d28d9]" />
              )}
            </button>
          ))}
        </div>

        {/* Search — asal kaam ka hai (enrolled batches me khoj), isliye
            barkarar; sirf 1 se zyada batch hon tab dikhta hai taaki
            page PW ki tarah saaf rahe. */}
        {batches.length > 1 && (
          <div className="relative mb-2.5 w-full sm:w-60">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconSearch size={15} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search batches…"
              aria-label="Search batches"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-[13px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-[#6d28d9]/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Search clear karo"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
              >
                <IconX size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {searching && (
        <p className="mt-3 text-[12px] text-gray-400">
          {filtered.length} of {batches.length} batches
        </p>
      )}

      {/* ── Grid / empty states ────────────────────────────── */}
      {filtered.length === 0 ? (
        searching ? (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-7 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-[#6d28d9]">
              <IconSearch size={22} />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Koi batch nahi mila</h3>
              <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-gray-500">
                {`“${query.trim()}” se koi enrolled batch match nahi hua. Kuch aur search karke dekho.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#5b21b6]"
            >
              <IconX size={14} />
              Search clear karo
            </button>
          </div>
        ) : (
          /* PW-style saaf empty state — bada dabba nahi, sirf text.
             PW ke live screenshot me neeche koi link/button NAHI hai,
             isliye 'Explore Courses' link hata diya (F1, 3 Nov fix list). */
          <div className="pt-5">
            <p className="text-[15px] text-gray-700">
              {tab === 'EXPIRED' ? 'No expired batches available.' : 'No batches available.'}
            </p>
          </div>
        )
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => {
            const start = fmtDate(b.startDate);
            const end = fmtDate(b.endDate);
            const expired = isExpired(b);
            const expiryLabel = expired ? fmtDate(expiryOf(b)?.toISOString() ?? null) : null;
            return (
              <article
                key={b.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:shadow-md"
              >
                {/* Banner — asal course thumbnail ya gradient fallback tile */}
                <CourseBanner src={b.courseThumbnail} title={b.name} seed={b.id}>
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow ${STATUS_CHIP[b.status] || STATUS_CHIP_FALLBACK}`}
                  >
                    {b.status}
                  </span>
                </CourseBanner>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#6d28d9]">
                    {b.name}
                  </h3>
                  {/* Course-title dusri line sirf tab jab batch name se
                      asal me alag ho — dono same hon to ek hi baat do baar
                      dikhti thi (F3, 3 Nov fix list). */}
                  {b.courseTitle.trim().toLowerCase() !== b.name.trim().toLowerCase() && (
                    <p className="mt-0.5 line-clamp-1 text-[12.5px] text-gray-500">{b.courseTitle}</p>
                  )}

                  <div className="mt-3 space-y-2 text-[12.5px] text-gray-500">
                    {(start || end) && (
                      <p className="flex items-center gap-2">
                        <IconCalendar size={14} className="shrink-0 text-[#6d28d9]" />
                        <span>
                          {start}
                          {start && end ? ' → ' : ''}
                          {end}
                        </span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <IconUser size={14} className="shrink-0 text-[#6d28d9]" />
                      <span>
                        Mentor:{' '}
                        <span className="font-semibold text-gray-800">
                          {b.teacherName || 'To be assigned'}
                        </span>
                      </span>
                    </p>
                    {expired && (
                      <p className="flex items-center gap-2 font-medium text-red-500">
                        <IconClock size={14} className="shrink-0" />
                        <span>Expired{expiryLabel ? ` · ${expiryLabel}` : ''}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-4">
                    <Link
                      href={`/app/learn/${b.courseId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#5b21b6]"
                    >
                      <IconPlay size={14} />
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
