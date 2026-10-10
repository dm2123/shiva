'use client';

import { useState, useEffect } from 'react';

interface Download {
  id: string;
  contentType: string;
  contentTitle: string;
  fileUrl: string;
  fileSizeMB: number;
  downloadStatus: string;
  lastAccessedAt: string;
  createdAt: string;
}

export default function DownloadManager() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDownloads = async () => {
    try {
      const res = await fetch('/api/student/downloads');
      const data = await res.json();
      if (data.success) setDownloads(data.data.downloads);
    } catch (err) {
      console.error('Fetch downloads error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDownloads(); }, []);

  const removeDownload = async (id: string) => {
    if (!confirm('Remove this download?')) return;
    try {
      await fetch(`/api/student/downloads/${id}`, { method: 'DELETE' });
      fetchDownloads();
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'LECTURE_VIDEO': return '🎬';
      case 'LECTURE_NOTES': return '📝';
      case 'MATERIAL_PDF': return '📄';
      case 'MATERIAL_SLIDES': return '📊';
      case 'DPP': return '📋';
      case 'TEST_PAPER': return '📝';
      default: return '📁';
    }
  };

  const totalSize = downloads.reduce((sum, d) => sum + (d.fileSizeMB || 0), 0);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading downloads...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Offline Content</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{downloads.length} files</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Size</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSize.toFixed(1)} MB</p>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      {downloads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No offline downloads yet</p>
          <p className="text-sm text-slate-400 mt-1">Download lectures and notes to watch offline</p>
        </div>
      ) : (
        <div className="space-y-2">
          {downloads.map(dl => (
            <div key={dl.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{typeIcon(dl.contentType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{dl.contentTitle}</p>
                  <p className="text-xs text-slate-500">
                    {dl.contentType.replace(/_/g, ' ')} • {dl.fileSizeMB} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={dl.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => removeDownload(dl.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
