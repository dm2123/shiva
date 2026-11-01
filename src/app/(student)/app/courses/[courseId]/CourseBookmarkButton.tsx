'use client';

import { useEffect, useState } from 'react';
import { IconBookmark } from '@/components/student/ShivaIcons';

/**
 * Course bookmark toggle — maujooda ContentBookmarks API par.
 *
 * Bookmarks schema pehle se polymorphic hai (contentType + contentId),
 * isliye course ke liye koi migration nahi chahiye tha: contentType
 * 'COURSE', contentId = courseId, title = course ka asal title.
 * State isi API se aata hai (GET ?type=COURSE), toggle POST/DELETE
 * se hota hai — koi local nakli state nahi.
 */
export default function CourseBookmarkButton({
  courseId,
  courseTitle,
  variant = 'hero',
}: {
  courseId: string;
  courseTitle: string;
  variant?: 'hero' | 'card';
}) {
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/student/bookmarks?type=COURSE')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const rows = d?.data?.bookmarks || [];
        const mine = rows.find((b: any) => b.contentId === courseId);
        setBookmarkId(mine ? mine.id : null);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function toggle() {
    if (busy || !loaded) return;
    setBusy(true);
    try {
      if (bookmarkId) {
        const res = await fetch(`/api/student/bookmarks?id=${bookmarkId}`, { method: 'DELETE' });
        const d = await res.json();
        if (d.success) setBookmarkId(null);
      } else {
        const res = await fetch('/api/student/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType: 'COURSE', contentId: courseId, title: courseTitle }),
        });
        const d = await res.json();
        if (d.success && d.data?.bookmarkId) setBookmarkId(d.data.bookmarkId);
      }
    } catch {
      /* network fail — state waisa hi rakho, nakli success nahi */
    } finally {
      setBusy(false);
    }
  }

  const saved = !!bookmarkId;

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={!loaded || busy}
        aria-pressed={saved}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition disabled:opacity-50 ${
          saved
            ? 'border-[#f5b942] bg-[#f5b942]/10 text-[#92600a] dark:text-[#f5b942]'
            : 'border-[var(--student-border)] text-[var(--student-text)] hover:bg-[var(--student-surface-hover)]'
        }`}
      >
        <IconBookmark size={15} />
        {saved ? 'Bookmarked — Saved' : 'Bookmark Course'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!loaded || busy}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold backdrop-blur transition disabled:opacity-50 ${
        saved ? 'bg-[#f5b942] text-[#2a1650]' : 'bg-white/15 text-white hover:bg-white/25'
      }`}
    >
      <IconBookmark size={12} />
      {saved ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
