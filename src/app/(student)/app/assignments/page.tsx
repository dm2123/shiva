'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  courseName: string;
  submitted: number;
  submissionId: number | null;
  marks: number | null;
}

type Filter = 'all' | 'pending' | 'submitted' | 'graded';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'graded', label: 'Graded' },
];

function IconClipboard(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function IconClock(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconChevron(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconTrophy(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m-7-17h14v5a7 7 0 01-14 0V4zm-2 2H3v2a3 3 0 003 3m14-5h2v2a3 3 0 01-3 3" />
    </svg>
  );
}

function statusOf(a: Assignment): 'pending' | 'submitted' | 'graded' {
  if (a.marks !== null) return 'graded';
  if (a.submitted) return 'submitted';
  return 'pending';
}

const STATUS_STYLE: Record<string, { label: string; pill: string; dot: string }> = {
  pending: {
    label: 'Pending',
    pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  submitted: {
    label: 'Submitted',
    pill: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40',
    dot: 'bg-blue-500',
  },
  graded: {
    label: 'Graded',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
};

function formatDue(dueDate: string): { text: string; overdue: boolean } {
  const d = new Date(dueDate);
  const now = new Date();
  const overdue = d.getTime() < now.getTime();
  const text = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return { text, overdue };
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch('/api/student/assignments')
      .then((res) => res.json())
      .then((data) => setAssignments(data.assignments || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const counts: Record<Filter, number> = {
    all: assignments.length,
    pending: assignments.filter((a) => statusOf(a) === 'pending').length,
    submitted: assignments.filter((a) => statusOf(a) === 'submitted').length,
    graded: assignments.filter((a) => statusOf(a) === 'graded').length,
  };

  const filtered = assignments.filter((a) => filter === 'all' || statusOf(a) === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--student-text)] tracking-tight">Assignments</h1>
          <p className="text-sm text-[var(--student-text-muted)] mt-1">
            Complete your assignments on time to stay ahead.
          </p>
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <IconClipboard className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
              filter === f.key
                ? 'bg-[var(--student-primary)] text-white border-transparent shadow-md'
                : 'bg-white dark:bg-white/5 text-[var(--student-text-muted)] border-[var(--student-border)] hover:border-[var(--student-primary)]/50'
            }`}
          >
            {f.label}
            <span
              className={`min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ${
                filter === f.key ? 'bg-white/25 text-white' : 'bg-[var(--student-surface)] text-[var(--student-text-muted)]'
              }`}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="student-card p-5 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-[var(--student-surface)]" />
              <div className="h-3 w-1/3 rounded bg-[var(--student-surface)] mt-3" />
              <div className="h-3 w-1/4 rounded bg-[var(--student-surface)] mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="student-card p-10 text-center">
          <p className="text-sm font-semibold text-[var(--student-text)]">Couldn't load assignments</p>
          <p className="text-xs text-[var(--student-text-muted)] mt-1">Check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 rounded-xl bg-[var(--student-primary)] text-white text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="student-card p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
            <IconClipboard className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-sm font-bold text-[var(--student-text)] mt-4">
            {assignments.length === 0 ? 'No assignments yet' : `No ${filter} assignments`}
          </p>
          <p className="text-xs text-[var(--student-text-muted)] mt-1 max-w-xs mx-auto">
            {assignments.length === 0
              ? 'Your teachers will post assignments here. Keep learning — they will appear soon.'
              : 'Try a different filter to see more assignments.'}
          </p>
          <Link
            href="/app/courses"
            className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-semibold hover:opacity-90"
          >
            Browse Courses
            <IconChevron className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const st = statusOf(a);
            const style = STATUS_STYLE[st];
            const due = formatDue(a.dueDate);
            const showOverdue = due.overdue && st === 'pending';
            return (
              <Link
                key={a.id}
                href={`/app/assignments/${a.id}`}
                className="student-card p-5 flex items-center gap-4 hover:border-[var(--student-primary)]/60 hover:shadow-lg transition-all group"
              >
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${
                    st === 'graded'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : st === 'submitted'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-amber-50 dark:bg-amber-900/20'
                  }`}
                >
                  {st === 'graded' ? (
                    <IconTrophy className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <IconClipboard
                      className={`w-6 h-6 ${st === 'submitted' ? 'text-blue-500' : 'text-amber-500'}`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[15px] font-bold text-[var(--student-text)] truncate">{a.title}</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${style.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--student-text-muted)] mt-1 truncate">{a.courseName}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        showOverdue ? 'text-red-500' : 'text-[var(--student-text-muted)]'
                      }`}
                    >
                      <IconClock className="w-3.5 h-3.5" />
                      {showOverdue ? `Overdue · ${due.text}` : `Due ${due.text}`}
                    </span>
                    {a.marks !== null && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {a.marks} marks
                      </span>
                    )}
                  </div>
                </div>

                <IconChevron className="w-5 h-5 flex-shrink-0 text-[var(--student-text-faint)] group-hover:text-[var(--student-primary)] group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
