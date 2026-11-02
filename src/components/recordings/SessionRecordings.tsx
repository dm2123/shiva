'use client';

import { useState, useEffect } from 'react';

/**
 * THE SHIVA — Session Recordings list.
 *
 * Sirf /app/recordings page par mount hota hai (page ka hero hi iska
 * title hai — yahan alag heading nahi). Style portal ke light system
 * par: safed cards, gray-200 border, radius 12px, violet accent.
 * Data aur fetch pehle jaise hi — /api/student/session-recordings.
 */

interface Recording {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  viewCount: number;
  lectureTitle?: string;
  courseTitle?: string;
  createdAt: string;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="h-40 animate-pulse bg-gray-100" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function SessionRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const res = await fetch('/api/student/session-recordings');
        const data = await res.json();
        setRecordings(data.recordings || []);
      } catch (error) {
        console.error('Failed to fetch recordings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Recordings load ho rahi hain">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6d28d9]/10 text-[#6d28d9]">
          <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
        <p className="text-[15px] font-bold text-gray-900">Abhi koi recording nahi hai</p>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
          Jab tumhari live classes ki recordings taiyaar hongi, wo yahan dikhengi —
          class khatm hone ke baad recording aane me thoda samay lag sakta hai.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {recordings.map((rec) => (
        <article
          key={rec.id}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-[#6d28d9]/50 hover:shadow-md"
        >
          <div className="relative">
            {rec.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rec.thumbnailUrl}
                alt={rec.title}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#6d28d9] to-[#2a1650]">
                <svg className="h-12 w-12 text-white/90" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            )}
            <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs font-semibold text-white">
              {formatDuration(rec.duration)}
            </span>
          </div>

          <div className="p-4">
            <h3 className="text-sm font-bold leading-snug text-gray-900 line-clamp-2">{rec.title}</h3>
            {rec.courseTitle && (
              <p className="mt-1 truncate text-[13px] text-gray-500">{rec.courseTitle}</p>
            )}
            {rec.lectureTitle && (
              <p className="mt-0.5 truncate text-xs text-gray-400">{rec.lectureTitle}</p>
            )}
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                {rec.viewCount.toLocaleString('en-IN')} views
                {rec.createdAt ? ` · ${formatDate(rec.createdAt)}` : ''}
              </span>
              <a
                href={rec.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-shrink-0 items-center gap-1 text-sm font-bold text-[#6d28d9] hover:underline"
              >
                Watch
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
