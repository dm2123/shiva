'use client';

import { useState, useEffect } from 'react';

interface DownloadButtonProps {
  contentType: string;
  contentId: string;
  contentTitle: string;
  fileUrl: string;
  fileSizeMB?: number;
}

export default function DownloadButton({
  contentType,
  contentId,
  contentTitle,
  fileUrl,
  fileSizeMB = 0
}: DownloadButtonProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkDownload = async () => {
      try {
        const res = await fetch('/api/student/downloads');
        const data = await res.json();
        if (data.success) {
          const exists = data.data.downloads.some(
            (d: any) => d.contentType === contentType && d.contentId === contentId
          );
          setIsDownloaded(exists);
        }
      } catch (err) {
        console.error('Check download error:', err);
      }
    };
    checkDownload();
  }, [contentType, contentId]);

  const toggleDownload = async () => {
    setLoading(true);
    try {
      if (isDownloaded) {
        // Remove
        const res = await fetch('/api/student/downloads');
        const data = await res.json();
        const dl = data.data.downloads.find(
          (d: any) => d.contentType === contentType && d.contentId === contentId
        );
        if (dl) {
          await fetch(`/api/student/downloads/${dl.id}`, { method: 'DELETE' });
          setIsDownloaded(false);
        }
      } else {
        // Add
        const res = await fetch('/api/student/downloads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentType, contentId, contentTitle, fileUrl, fileSizeMB }),
        });
        const data = await res.json();
        if (data.success) setIsDownloaded(true);
      }
    } catch (err) {
      console.error('Toggle download error:', err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleDownload}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        isDownloaded
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : isDownloaded ? (
        <span>✅</span>
      ) : (
        <span>⬇️</span>
      )}
      {isDownloaded ? 'Downloaded' : 'Download Offline'}
    </button>
  );
}
