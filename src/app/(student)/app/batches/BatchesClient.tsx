'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  IconCalendar, IconUser, IconPlay, IconSearch, IconX,
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

/**
 * Enrolled batches ki list — client-side search (batch naam, course, mentor)
 * aur status filter, dono sirf asal enrollment data par. Koi server call nahi,
 * koi nakli data nahi. Design: dashboard v2 wale light PW tokens.
 */
export default function BatchesClient({ batches }: { batches: BatchCardData[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('ALL');

  // Filter chips sirf un statuses se jo asal data me maujood hain
  const statuses = useMemo(
    () => Array.from(new Set(batches.map((b) => b.status).filter(Boolean))),
    [batches]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return batches.filter((b) => {
      if (status !== 'ALL' && b.status !== status) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.courseTitle.toLowerCase().includes(q) ||
        (b.teacherName || '').toLowerCase().includes(q)
      );
    });
  }, [batches, query, status]);

  const isFiltering = query.trim() !== '' || status !== 'ALL';

  return (
    <div className="space-y-4">
      {/* ── Search + status filter (asal data par, client-side) ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search batches, courses ya mentor…"
            aria-label="Search batches"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6d28d9] focus:ring-2 focus:ring-[#6d28d9]/25"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Search clear karo"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700"
            >
              <IconX size={15} />
            </button>
          )}
        </div>
        {statuses.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', ...statuses].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  status === s
                    ? 'bg-[#6d28d9] text-white'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-[#6d28d9]/50 hover:text-[#6d28d9]'
                }`}
              >
                {s === 'ALL' ? 'All' : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {isFiltering && (
        <p className="text-[12px] text-gray-400">
          {filtered.length} of {batches.length} batches
        </p>
      )}

      {/* ── Batch cards — PW enrolled anatomy, 3-col grid ──── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-7 text-center shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-[#6d28d9]">
            <IconSearch size={22} />
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">Koi batch nahi mila</h3>
            <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-gray-500">
              {query.trim()
                ? `“${query.trim()}” se koi enrolled batch match nahi hua. Kuch aur search karke dekho.`
                : 'Is filter me koi enrolled batch nahi hai.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setQuery(''); setStatus('ALL'); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#5b21b6]"
          >
            <IconX size={14} />
            Filters clear karo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => {
            const start = fmtDate(b.startDate);
            const end = fmtDate(b.endDate);
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
                  <p className="mt-0.5 line-clamp-1 text-[12.5px] text-gray-500">{b.courseTitle}</p>

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
