'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Scholarship {
  id: string;
  title: string;
  courseTitle: string;
  totalMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  scholarshipPercentage: number;
  totalAttempts: number;
  highScore: number | null;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function testStatus(start: string, end: string): 'live' | 'upcoming' | 'ended' {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now >= s && now <= e) return 'live';
  if (now < s) return 'upcoming';
  return 'ended';
}

const STATUS_STYLE: Record<string, { dot: string; text: string; label: string }> = {
  live: { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'LIVE NOW' },
  upcoming: { dot: 'bg-amber-500', text: 'text-amber-700', label: 'UPCOMING' },
  ended: { dot: 'bg-slate-400', text: 'text-slate-500', label: 'ENDED' },
};

export default function ScholarshipList() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const res = await fetch('/api/student/scholarships');
        const data = await res.json();
        if (data.success) {
          setScholarships(data.data.scholarships || []);
        } else {
          setError('Scholarships load nahi ho paye. Thodi der baad try karo.');
        }
      } catch {
        setError('Scholarships load nahi ho paye. Thodi der baad try karo.');
      }
      setLoading(false);
    };
    fetchScholarships();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="student-card p-5 animate-pulse" aria-hidden>
            <div className="h-5 w-2/3 rounded bg-[var(--student-border-light)]" />
            <div className="mt-3 h-4 w-1/2 rounded bg-[var(--student-border-light)]" />
            <div className="mt-4 flex gap-3">
              <div className="h-8 w-20 rounded-lg bg-[var(--student-border-light)]" />
              <div className="h-8 w-20 rounded-lg bg-[var(--student-border-light)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
          ⚠️
        </div>
        <p className="text-sm font-semibold text-[var(--student-text)]">Kuch gadbad ho gayi</p>
        <p className="mt-1 text-sm text-[var(--student-text-muted)]">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-[var(--student-primary)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          Dobara try karo
        </button>
      </div>
    );
  }

  if (scholarships.length === 0) {
    return (
      <div className="student-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 text-3xl">
          🎓
        </div>
        <h3 className="text-base font-bold text-[var(--student-text)]">Abhi koi scholarship test nahi hai</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--student-text-muted)]">
          Naye scholarship tests yahin dikhenge. Apni taiyaari jaari rakho — mauka milte hi
          hum tumhe bata denge.
        </p>
        <Link
          href="/app/tests"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--student-primary)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          Practice tests dekho →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {scholarships.map((s) => {
        const status = testStatus(s.startTime, s.endTime);
        const st = STATUS_STYLE[status];
        return (
          <article key={s.id} className="student-card overflow-hidden">
            {/* Banner */}
            <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${st.dot} animate-pulse`} />
                  <span className="text-[11px] font-black tracking-widest text-white/90">{st.label}</span>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white backdrop-blur">
                  {s.scholarshipPercentage}% tak scholarship
                </span>
              </div>
              <h3 className="mt-2 text-lg font-black text-white leading-snug">{s.title}</h3>
              {s.courseTitle && (
                <p className="mt-0.5 text-[13px] font-medium text-white/75">{s.courseTitle}</p>
              )}
            </div>

            {/* Details */}
            <div className="p-5">
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)]">Total marks</dt>
                  <dd className="mt-0.5 text-sm font-black text-[var(--student-text)]">{s.totalMarks}</dd>
                </div>
                <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)]">Duration</dt>
                  <dd className="mt-0.5 text-sm font-black text-[var(--student-text)]">{s.durationMinutes} min</dd>
                </div>
                <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)]">Attempts</dt>
                  <dd className="mt-0.5 text-sm font-black text-[var(--student-text)]">{s.totalAttempts}</dd>
                </div>
                <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] px-3 py-2.5">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)]">High score</dt>
                  <dd className="mt-0.5 text-sm font-black text-[var(--student-text)]">
                    {s.highScore != null ? s.highScore : '—'}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] text-[var(--student-text-muted)]">
                <span>
                  🟢 <span className="font-semibold">Shuru:</span> {formatDate(s.startTime)}
                </span>
                <span>
                  🔴 <span className="font-semibold">Khatm:</span> {formatDate(s.endTime)}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] text-[var(--student-text-faint)]">
                  Test window ke andar kabhi bhi attempt kar sakte ho.
                </p>
                {status === 'ended' ? (
                  <span className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] px-6 py-3 text-sm font-bold text-[var(--student-text-faint)]">
                    Test khatm ho gaya
                  </span>
                ) : (
                  <Link
                    href={`/app/scholarships/${s.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--student-primary)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-90"
                  >
                    {status === 'live' ? 'Abhi test do →' : 'Details dekho →'}
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
