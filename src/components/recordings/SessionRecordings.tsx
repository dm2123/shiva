'use client';

import { useState, useEffect } from 'react';


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

  if (loading) return <p className="text-gray-500">Loading recordings...</p>;
  if (recordings.length === 0) return <p className="text-gray-500">No recordings available.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Session Recordings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((rec) => (
          <div key={rec.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              {rec.thumbnailUrl ? (
                <img
                  src={rec.thumbnailUrl}
                  alt={rec.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              )}
              <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                {formatDuration(rec.duration)}
              </span>
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 truncate">{rec.title}</h4>
              {rec.courseTitle && (
                <p className="text-sm text-gray-500 mt-1">{rec.courseTitle}</p>
              )}
              {rec.lectureTitle && (
                <p className="text-xs text-gray-400 mt-0.5">{rec.lectureTitle}</p>
              )}
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">
                  {rec.viewCount.toLocaleString()} views
                </span>
                <a
                  href={rec.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Watch
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
