'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface BookmarkManagerProps {
  initialBookmarks?: Bookmark[];
}

const TABS = [
  { key: 'LECTURE', label: 'Lectures' },
  { key: 'NOTE', label: 'Notes' },
  { key: 'DPP', label: 'DPPs' },
  { key: 'PYQ', label: 'PYQs' },
] as const;

export default function BookmarkManager({ initialBookmarks = [] }: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [activeTab, setActiveTab] = useState<string>('LECTURE');
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async (type?: string) => {
    setLoading(true);
    try {
      const url = type ? `/api/student/bookmarks?type=${type}` : '/api/student/bookmarks';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.data.bookmarks || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks(activeTab);
  }, [activeTab, fetchBookmarks]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/student/bookmarks?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {}
  };

  const filteredBookmarks = bookmarks.filter((b) => b.contentType === activeTab);
  const contentTypeIcon: Record<string, string> = {
    LECTURE: '🎬',
    NOTE: '📝',
    DPP: '📋',
    PYQ: '📄',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-[var(--student-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[var(--student-primary)] text-white shadow-md'
                : 'text-[var(--student-text-muted)] hover:text-[var(--student-text)] hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="student-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-[var(--student-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--student-text-muted)] mt-3">Loading bookmarks...</p>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="student-card p-12 text-center space-y-2">
          <span className="text-4xl">{contentTypeIcon[activeTab] || '📌'}</span>
          <p className="text-[var(--student-text-muted)]">No bookmarks in this category yet.</p>
          <p className="text-xs text-[var(--student-text-faint)]">Bookmark content while watching lectures or practicing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="student-card p-5 flex items-start gap-4 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: bookmark.highlightColor ? `${bookmark.highlightColor}20` : 'rgba(200,169,110,0.1)' }}
              >
                {contentTypeIcon[bookmark.contentType] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-[var(--student-text)] text-sm truncate">
                  {bookmark.title || 'Untitled Bookmark'}
                </h4>
                {bookmark.note && (
                  <p className="text-xs text-[var(--student-text-muted)] mt-1 line-clamp-2">{bookmark.note}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--student-text-faint)]">
                  {bookmark.positionSeconds !== null && (
                    <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono">
                      {Math.floor(bookmark.positionSeconds / 60)}:{String(bookmark.positionSeconds % 60).padStart(2, '0')}
                    </span>
                  )}
                  <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                title="Remove bookmark"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
