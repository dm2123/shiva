'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IconDownload,
  IconVideo,
  IconBook,
  IconCalculator,
  IconPlay,
  IconChevronRight,
  IconCheck,
  IconClock,
} from '@/components/student/ShivaIcons';

interface DownloadItem {
  id: string;
  title: string;
  contentType: string;
  sizeMB?: number;
  status?: string;
  downloadedAt?: string;
}

const TYPE_ICON: Record<string, (p: { size?: number; className?: string }) => JSX.Element> = {
  LECTURE_VIDEO: IconVideo,
  RECORDING: IconPlay,
  EBOOK: IconBook,
  FORMULA_SHEET: IconCalculator,
  LECTURE_NOTES: IconBook,
  DPP: IconDownload,
  PYQ: IconDownload,
};

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DOWNLOADING: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING: 'bg-slate-100 text-slate-500 border-slate-200',
  FAILED: 'bg-red-50 text-red-600 border-red-200',
};

function formatSize(mb?: number) {
  if (!mb && mb !== 0) return '—';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

export default function OfflineDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const storageLimit = 2048; // MB

  useEffect(() => {
    fetch('/api/student/offline-downloads')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setDownloads(d.data);
          setStorageUsed(d.data.reduce((sum: number, item: any) => sum + (item.sizeMB || 0), 0));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100);
  const barColor =
    storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-amber-500' : 'bg-indigo-600';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <IconDownload size={22} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Offline Downloads
          </h1>
          <p className="text-[13px] text-slate-500">Study without internet — your saved content lives here.</p>
        </div>
      </div>

      {/* Storage meter */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-900">Device Storage</span>
          <span className="text-xs font-semibold text-slate-500">
            {formatSize(storageUsed)} of {formatSize(storageLimit)} used
          </span>
        </div>
        <div
          className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(storagePercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${storagePercent}%` }} />
        </div>
        <div className="flex justify-between mt-2.5">
          <span className="text-[11px] font-semibold text-slate-400">{Math.round(storagePercent)}% used</span>
          <span className="text-[11px] font-semibold text-slate-400">{formatSize(storageLimit - storageUsed)} free</span>
        </div>
      </div>

      {/* How it works — honest info card (replaces dead install-app banner) */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 md:p-6 text-white overflow-hidden relative">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <IconDownload size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[15px]">Download & learn offline</h3>
            <p className="text-[12.5px] text-indigo-100 mt-1 leading-relaxed">
              Open any lecture or study material and tap the download icon — it will appear here
              for offline access.
            </p>
            <Link
              href="/app/my-courses"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-white text-indigo-700 text-[13px] font-bold hover:bg-indigo-50 transition-colors"
            >
              Browse My Courses
              <IconChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Download list */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 mb-3">
          Downloaded Content
          {downloads.length > 0 && (
            <span className="ml-2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {downloads.length}
            </span>
          )}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : downloads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 md:p-14 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
              <IconDownload size={30} />
            </div>
            <h3 className="text-base font-bold text-slate-900">No downloads yet</h3>
            <p className="text-[13px] text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Download lectures, notes and books for offline study — perfect for low-network areas.
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
          <div className="space-y-3">
            {downloads.map((d) => {
              const TypeIcon = TYPE_ICON[d.contentType] || IconDownload;
              const status = (d.status || 'COMPLETED').toUpperCase();
              const pill = STATUS_STYLE[status] || STATUS_STYLE.COMPLETED;
              return (
                <div
                  key={d.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 hover:shadow-lg hover:shadow-slate-100 transition-shadow"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* title null ho sakta hai: OfflineContent me title sirf
                        writer ke snapshot se aata hai; tab tak content-type
                        label dikhao — koi nakli title nahi. */}
                    <p className="text-[14px] font-bold text-slate-900 truncate">{d.title || d.contentType.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-400 font-medium">{formatSize(d.sizeMB)}</span>
                      {d.downloadedAt && (
                        <>
                          <span className="text-slate-200">•</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(d.downloadedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${pill}`}
                  >
                    {status === 'COMPLETED' ? (
                      <IconCheck size={11} />
                    ) : status === 'DOWNLOADING' || status === 'PENDING' ? (
                      <IconClock size={11} />
                    ) : null}
                    {status === 'COMPLETED' ? 'Saved' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
