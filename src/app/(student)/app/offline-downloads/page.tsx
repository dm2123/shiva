'use client';

import { useState, useEffect } from 'react';

export default function OfflineDownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const storageLimit = 2048;

  useEffect(() => {
    fetch('/api/student/offline-downloads').then(r => r.json()).then(d => {
      if (d.success) {
        setDownloads(d.data);
        setStorageUsed(d.data.reduce((sum: number, item: any) => sum + (item.sizeMB || 0), 0));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const typeIcons: Record<string, string> = {
    LECTURE_VIDEO: '🎬', EBOOK: '📖', FORMULA_SHEET: '📐', LECTURE_NOTES: '📝', RECORDING: '📹', DPP: '📋', PYQ: '📚'
  };
  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    DOWNLOADING: 'bg-amber-100 text-amber-700',
    PENDING: 'bg-slate-100 text-slate-500',
    FAILED: 'bg-red-100 text-red-700',
  };

  const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading downloads...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Offline Downloads</h1>
        <p className="text-sm text-slate-500 mt-1">Access content without internet</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-900">Storage Used</span>
          <span className="text-xs text-slate-500">{Math.round(storageUsed)} MB / {storageLimit} MB</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${
            storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-amber-500' : 'bg-teal-500'
          }`} style={{ width: `${storagePercent}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-400">
          <span>{Math.round(storagePercent)}% used</span>
          <span>{Math.round(storageLimit - storageUsed)} MB free</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold">Install THE SHIVA App</h3>
            <p className="text-xs opacity-80">Access offline content, get push notifications, and faster loading</p>
          </div>
          <button className="px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50">
            Install
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-3">Downloaded Content ({downloads.length})</h3>
        {downloads.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <p className="text-3xl mb-2">📥</p>
            <p className="text-slate-400 font-medium">No downloads yet</p>
            <p className="text-xs text-slate-400 mt-1">Download lectures, notes, and books for offline access</p>
          </div>
        ) : (
          <div className="space-y-3">
            {downloads.map((d: any) => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg flex-shrink-0">
                    {typeIcons[d.contentType] || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{d.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{d.contentType}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">{d.sizeMB || 0} MB</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[d.status] || 'bg-slate-100 text-slate-500'}`}>
                    {d.status || 'DOWNLOADED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
