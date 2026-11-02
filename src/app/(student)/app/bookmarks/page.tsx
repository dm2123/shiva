'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  IconBookmark,
  IconVideo,
  IconBook,
  IconAssignment,
  IconTarget,
  IconChevronRight,
  IconX,
} from '@/components/student/ShivaIcons';

interface Bookmark {
  id: string;
  contentType: string;
  contentId: string;
  title: string | null;
  note: string | null;
  highlightColor: string | null;
  positionSeconds: number | null;
  createdAt: string;
}

/* Tabs wahi jo ContentBookmarks ke asal content types hain —
   koi invent tab nahi (data GET ?type= se hi filter hota hai). */
const TABS = [
  { key: 'LECTURE', label: 'Lectures', Icon: IconVideo },
  { key: 'NOTE', label: 'Notes', Icon: IconBook },
  { key: 'DPP', label: 'DPPs', Icon: IconAssignment },
  { key: 'PYQ', label: 'PYQs', Icon: IconTarget },
  { key: 'COURSE', label: 'Courses', Icon: IconBook },
] as const;

const TAB_ICON: Record<string, (p: { size?: number; className?: string }) => JSX.Element> = {
  LECTURE: IconVideo,
  NOTE: IconBook,
  DPP: IconAssignment,
  PYQ: IconTarget,
  COURSE: IconBook,
};

function formatTimestamp(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function SkeletonCard() {
  return (
    <div className="flex animate-pulse items-start gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gray-100" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState<string>('LECTURE');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/bookmarks?type=${type}`);
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.data.bookmarks || []);
      }
    } catch {
      /* network error — show empty state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks(activeTab);
  }, [activeTab, fetchBookmarks]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/student/bookmarks?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {
      /* keep item on failure */
    } finally {
      setDeletingId(null);
    }
  };

  const ActiveTabIcon = TABS.find((t) => t.key === activeTab)?.Icon || IconBookmark;

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-6 px-4 py-5 pb-10">
      {/* ── Page header — wave-A pattern (28px extrabold) ── */}
      <div>
        <h1 className="text-[28px] font-extrabold leading-tight text-gray-900">Bookmarks</h1>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
          Save kiye hue lectures, notes, DPPs, PYQs aur courses — revision ke liye ek jagah.
        </p>
      </div>

      {/* ── Tabs — PW pattern: text tabs, active par violet bold
          + neeche violet underline ── */}
      <div
        role="tablist"
        aria-label="Bookmark categories"
        className="flex gap-1 overflow-x-auto border-b border-gray-200 sm:gap-2"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`relative -mb-px flex items-center gap-2 whitespace-nowrap px-3 pb-3 pt-1 text-[14px] transition sm:px-4 sm:text-[15px] ${
                isActive ? 'font-bold text-[#6d28d9]' : 'font-semibold text-gray-500 hover:text-gray-800'
              }`}
            >
              <tab.Icon size={17} />
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[#6d28d9] sm:inset-x-4" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center sm:p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6d28d9]/10 text-[#6d28d9]">
            <ActiveTabIcon size={30} />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900">No bookmarks here yet</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
            Lecture dekhte hue ya practice karte hue bookmark icon dabao — zaroori
            moments yahan save ho jayenge, taaki revision aasan ho.
          </p>
          <Link
            href="/app/my-courses"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#6d28d9] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#5b21b6]"
          >
            Go to My Courses
            <IconChevronRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-400">
            {bookmarks.length} saved {bookmarks.length === 1 ? 'item' : 'items'}
          </p>
          <div className="space-y-3 sm:space-y-4">
            {bookmarks.map((bookmark) => {
              const TypeIcon = TAB_ICON[bookmark.contentType] || IconBookmark;
              // Asal link sirf wahan jahan route contentId se seedha
              // banta hai: COURSE → /app/courses/{id} (asal course page).
              // Baaki types par API course context deta hi nahi, isliye
              // nakli link nahi banaya gaya.
              const openHref =
                bookmark.contentType === 'COURSE' ? `/app/courses/${bookmark.contentId}` : null;
              return (
                <div
                  key={bookmark.id}
                  className="group flex items-start gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:border-violet-300 hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#6d28d9]/10 text-[#6d28d9]">
                    <TypeIcon size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-bold leading-snug text-gray-900">
                      {bookmark.title || 'Untitled Bookmark'}
                    </h4>
                    {bookmark.note && (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
                        {bookmark.note}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {bookmark.positionSeconds !== null && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-gray-600">
                          <IconVideo size={11} />
                          {formatTimestamp(bookmark.positionSeconds)}
                        </span>
                      )}
                      <span className="text-[12px] text-gray-400">
                        {new Date(bookmark.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {openHref && (
                        <Link
                          href={openHref}
                          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#6d28d9] hover:underline"
                        >
                          Course kholo
                          <IconChevronRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    disabled={deletingId === bookmark.id}
                    aria-label="Remove bookmark"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100"
                  >
                    {deletingId === bookmark.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    ) : (
                      <IconX size={16} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
