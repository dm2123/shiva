'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  IconUsers, IconCalendar, IconUser, IconPlay, IconSearch,
  IconCheckCircle, IconX,
} from '@/components/student/StudentIcons';

export interface BatchCardData {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  courseId: string;
  courseTitle: string;
  teacherName: string | null;
}

// Status chip — sirf asal b.status field se (banner par solid, padhne layak)
const STATUS_CHIP: Record<string, string> = {
  ACTIVE: 'bg-emerald-500 text-white',
  UPCOMING: 'bg-[#f5b942] text-[#2a1650]',
  COMPLETED: 'bg-white/30 text-white backdrop-blur-sm',
};
const STATUS_CHIP_FALLBACK = 'bg-white/25 text-white backdrop-blur-sm';

// Stable gradient per batch (original THE SHIVA palette — deep purple + gold family)
const BANNER_GRADIENTS = [
  'from-[#2a1650] via-[#4c1d95] to-[#6d28d9]',
  'from-[#3b1d73] via-[#6d28d9] to-[#8b5cf6]',
  'from-indigo-700 via-[#6d28d9] to-violet-500',
  'from-[#2a1650] via-indigo-700 to-[#6d28d9]',
  'from-purple-800 via-[#6d28d9] to-[#f5b942]',
  'from-[#4c1d95] via-fuchsia-700 to-[#6d28d9]',
];

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[h % BANNER_GRADIENTS.length];
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

/**
 * Enrolled batches ki list — client-side search (batch naam, course, mentor)
 * aur status filter, dono sirf asal enrollment data par. Koi server call nahi,
 * koi nakli data nahi.
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
    <div className="space-y-5">
      {/* ── Search + status filter (asal data par, client-side) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--student-text-faint)] pointer-events-none">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search batches, courses ya mentor…"
            aria-label="Search batches"
            className="w-full rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] pl-10 pr-10 py-3 outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-[#6d28d9]/25 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Search clear karo"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--student-text-faint)] hover:text-[var(--student-text)] transition-colors"
            >
              <IconX size={15} />
            </button>
          )}
        </div>
        {statuses.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', ...statuses].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  status === s
                    ? 'bg-[#6d28d9] text-white'
                    : 'bg-[var(--student-surface)] border border-[var(--student-border)] text-[var(--student-text-muted)] hover:border-[#6d28d9]/50 hover:text-[#6d28d9]'
                }`}
              >
                {s === 'ALL' ? 'All' : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {isFiltering && (
        <p className="text-[12px] text-[var(--student-text-faint)] -mt-1">
          {filtered.length} of {batches.length} batches
        </p>
      )}

      {/* ── Batch cards ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="student-card p-8 md:p-10 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6d28d9]/10 flex items-center justify-center text-[#6d28d9] mb-4">
            <IconSearch size={26} />
          </div>
          <h3 className="text-base font-bold text-[var(--student-text)]">Koi batch nahi mila</h3>
          <p className="text-sm text-[var(--student-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
            {query.trim()
              ? `“${query.trim()}” se koi enrolled batch match nahi hua. Kuch aur search karke dekho.`
              : 'Is filter me koi enrolled batch nahi hai.'}
          </p>
          <button
            type="button"
            onClick={() => { setQuery(''); setStatus('ALL'); }}
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#6d28d9] text-white text-[13px] font-bold hover:bg-[#5b21b6] transition-colors"
          >
            <IconX size={14} />
            Filters clear karo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((b) => (
            <article key={b.id} className="student-card overflow-hidden flex flex-col group">
              {/* Banner */}
              <div className={`relative bg-gradient-to-br ${gradientFor(b.id)} px-5 pt-5 pb-6 text-white overflow-hidden`}>
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute right-10 -bottom-10 w-24 h-24 rounded-full bg-white/10" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <IconUsers size={24} className="text-white" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_CHIP[b.status] || STATUS_CHIP_FALLBACK}`}>
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
                    <IconCalendar size={15} className="text-[#6d28d9] flex-shrink-0" />
                    <span>{fmtDate(b.startDate)}{b.endDate ? ` → ${fmtDate(b.endDate)}` : ''}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <IconUser size={15} className="text-[#6d28d9] flex-shrink-0" />
                    <span>Mentor: <span className="font-semibold text-[var(--student-text)]">{b.teacherName || 'To be assigned'}</span></span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <IconCheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                    <span>Enrollment active</span>
                  </p>
                </div>

                <div className="mt-auto pt-4">
                  <Link
                    href={`/app/learn/${b.courseId}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#6d28d9] text-white text-sm font-bold hover:bg-[#5b21b6] transition-colors"
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
    </div>
  );
}
