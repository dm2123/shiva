'use client';

import DownloadManager from '@/components/downloads/DownloadManager';

export default function DownloadsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offline Downloads</h1>
      <DownloadManager />
    </div>
  );
}
