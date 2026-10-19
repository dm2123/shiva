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

const TABS = [
  { key: 'LECTURE', label: 'Lectures', Icon: IconVideo },
  { key: 'NOTE', label: 'Notes', Icon: IconBook },
  { key: 'DPP', label: 'DPPs', Icon: IconAssignment },
  { key: 'PYQ', label: 'PYQs', Icon: IconTarget },
] as const;

const TAB_ICON: Record<string, (p: { size?: number; className?: string }) => JSX.Element> = {
  LECTURE: IconVideo,
  NOTE: IconBook,
  DPP: IconAssignment,
  PYQ: IconTarget,
};

function formatTimestamp(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
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
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <IconBookmark size={22} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">My Bookmarks</h1>
          <p className="text-[13px] text-slate-500">Saved lectures, notes, DPPs & PYQs — revise anytime.</p>
        </div>
      </div>

      {/* Segmented tab bar */}
      <div
        role="tablist"
        aria-label="Bookmark categories"
        className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[12px] md:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.Icon size={17} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 md:p-14 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
            <ActiveTabIcon size={30} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No bookmarks here yet</h3>
          <p className="text-[13px] text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            While watching lectures or solving practice sets, tap the bookmark icon to save
            important moments for quick revision.
          </p>
          <Link
            href="/app/my-courses"
            className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Go to My Courses
            <IconChevronRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {bookmarks.length} saved {bookmarks.length === 1 ? 'item' : 'items'}
          </p>
          <div className="space-y-3">
            {bookmarks.map((bookmark) => {
              const TypeIcon = TAB_ICON[bookmark.contentType] || IconBookmark;
              return (
                <div
                  key={bookmark.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3.5 hover:shadow-lg hover:shadow-slate-100 hover:border-indigo-200 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-[14px] leading-snug">
                      {bookmark.title || 'Untitled Bookmark'}
                    </h4>
                    {bookmark.note && (
                      <p className="text-[12.5px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {bookmark.note}
                      </p>
                    )}
                    <div className="flex items-center flex-wrap gap-2 mt-2.5">
                      {bookmark.positionSeconds !== null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold">
                          <IconVideo size={11} />
                          {formatTimestamp(bookmark.positionSeconds)}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {new Date(bookmark.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    disabled={deletingId === bookmark.id}
                    aria-label="Remove bookmark"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50"
                  >
                    {deletingId === bookmark.id ? (
                      <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
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
    </div>
  );
}
