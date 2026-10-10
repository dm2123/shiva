'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/announcements').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  const markRead = async (id: string) => {
    await fetch('/api/student/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId: id })
    });
    setData((prev: any) => ({
      ...prev,
      announcements: prev.announcements.map((a: any) => a.id === id ? { ...a, isRead: 1 } : a),
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-500', MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700', URGENT: 'bg-red-100 text-red-700'
  };
  const typeIcons: Record<string, string> = {
    GENERAL: '📢', HOMEWORK: '📝', TEST: '📋', LIVE_CLASS: '🔴', RESULTS: '📊', IMPORTANT: '⚠️'
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">{data?.unreadCount || 0} unread</p>
        </div>
      </div>

      {data?.announcements?.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-3xl mb-2">📢</p>
          <p className="text-slate-400 font-medium">No announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.announcements?.map((ann: any) => (
            <div key={ann.id} onClick={() => !ann.isRead && markRead(ann.id)}
              className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer ${
                ann.isRead ? 'border-slate-100' : 'border-teal-200 ring-1 ring-teal-100 hover:shadow-md'
              }`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg flex-shrink-0">
                  {typeIcons[ann.type] || '📢'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!ann.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></span>}
                    {ann.pinToTop === 1 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">📌 Pinned</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColors[ann.priority]}`}>
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h3 className={`text-sm font-bold ${ann.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{ann.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{ann.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    {ann.teacherName && <span>By {ann.teacherName}</span>}
                    {ann.courseTitle && <span>• {ann.courseTitle}</span>}
                    {ann.batchName && <span>• {ann.batchName}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
