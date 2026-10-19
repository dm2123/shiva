'use client';

import { useState, useEffect, useMemo } from 'react';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconBell, IconCheckCircle } from '@/components/student/StudentIcons';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: number | boolean;
  pinToTop: number | boolean;
  createdAt: string;
  teacherName?: string;
  courseTitle?: string;
  batchName?: string;
}

const PRIORITY_STYLE: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-500',
  MEDIUM: 'bg-indigo-100 text-indigo-700',
  HIGH: 'bg-amber-100 text-amber-800',
  URGENT: 'bg-red-100 text-red-700',
};

// Original SVG icon per announcement type (brand-consistent, stroke style)
function TypeIcon({ type }: { type: string }) {
  const cls = 'w-5 h-5';
  switch (type) {
    case 'TEST':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </svg>
      );
    case 'LIVE_CLASS':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <rect x="2" y="6" width="13" height="12" rx="2" />
          <path d="M15 10.5l6-3.5v10l-6-3.5" />
        </svg>
      );
    case 'RESULTS':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M3 3v16a2 2 0 0 0 2 2h16" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
      );
    case 'HOMEWORK':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
    case 'IMPORTANT':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
  }
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    TEST: 'bg-violet-100 text-violet-700',
    LIVE_CLASS: 'bg-red-100 text-red-700',
    RESULTS: 'bg-emerald-100 text-emerald-700',
    HOMEWORK: 'bg-amber-100 text-amber-800',
    IMPORTANT: 'bg-orange-100 text-orange-800',
    GENERAL: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors[type] || colors.GENERAL}`}>
      <TypeIcon type={type} />
    </span>
  );
}

function DateBadge({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return (
    <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 rounded-2xl bg-slate-50 border border-slate-100 py-2">
      <span className="text-lg font-black text-slate-800 leading-none">{day}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{month}</span>
      <span className="text-[9px] text-slate-300">{year}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3" aria-label="Loading announcements">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4 animate-pulse">
          <div className="w-14 h-[72px] rounded-2xl bg-slate-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await fetch('/api/student/announcements');
      const d = await r.json();
      if (d.success && Array.isArray(d.data?.announcements)) {
        setAnnouncements(d.data.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    try {
      await fetch('/api/student/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId: id }),
      });
    } catch {
      /* non-critical — still update UI optimistically */
    }
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: 1 } : a))
    );
  };

  const markAllRead = async () => {
    const unread = announcements.filter((a) => !a.isRead);
    await Promise.all(unread.map((a) => markRead(a.id)));
  };

  const sorted = useMemo(() => {
    return [...announcements].sort((a, b) => {
      const pinA = a.pinToTop ? 1 : 0;
      const pinB = b.pinToTop ? 1 : 0;
      if (pinA !== pinB) return pinB - pinA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [announcements]);

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Announcements</h1>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold text-white bg-indigo-600 rounded-full px-2.5 py-1">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Batch updates, test alerts aur important notices yahan milenge.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-4 py-2 hover:bg-indigo-100 transition flex-shrink-0"
          >
            <IconCheckCircle size={14} />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="font-bold text-gray-800">Kuch gadbad ho gayi</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Announcements load nahi ho paye. Dobara try karo.</p>
          <button
            onClick={load}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition"
          >
            Retry
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
          <StudentEmptyState
            icon={<IconBell size={26} />}
            title="All Caught Up! 🎉"
            description="Abhi koi announcement nahi hai. Nayi batch updates, test alerts aur notices yahan dikhenge."
            actionText="Explore Courses"
            actionHref="/app/courses"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ann) => {
            const read = !!ann.isRead;
            return (
              <article
                key={ann.id}
                onClick={() => !read && markRead(ann.id)}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
                  read
                    ? 'border-slate-100'
                    : 'border-indigo-200 ring-1 ring-indigo-100 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.99]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <DateBadge dateStr={ann.createdAt} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {!read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" aria-label="Unread" />}
                      {ann.pinToTop ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M16 3a1 1 0 0 1 .7.3l4 4a1 1 0 0 1-1.4 1.4l-2.6-2.6-8.3 8.3-2.1 2.1a1 1 0 0 1-1.4-1.4l2.1-2.1 8.3-8.3L13 2.3A1 1 0 0 1 16 3z"/></svg>
                          Pinned
                        </span>
                      ) : null}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[ann.priority] || PRIORITY_STYLE.LOW}`}>
                        {ann.priority}
                      </span>
                    </div>
                    <h3 className={`text-[15px] font-bold leading-snug ${read ? 'text-slate-600' : 'text-slate-900'}`}>
                      {ann.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{ann.message}</p>
                    <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400 flex-wrap">
                      {ann.teacherName && <span className="font-medium">By {ann.teacherName}</span>}
                      {ann.courseTitle && <span>• {ann.courseTitle}</span>}
                      {ann.batchName && <span>• {ann.batchName}</span>}
                    </div>
                  </div>
                  <TypeBadge type={ann.type} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      {!loading && !error && sorted.length > 0 && (
        <p className="text-center text-[11px] text-slate-400 pt-2">
          Unread announcement par tap karke use read mark karo ✓
        </p>
      )}
    </div>
  );
}
