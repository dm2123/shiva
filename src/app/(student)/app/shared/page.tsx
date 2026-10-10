'use client';

import { useState, useEffect } from 'react';

export default function ContentSharesPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', contentUrl: '', shareType: 'BATCH' });

  useEffect(() => {
    fetch('/api/student/content-shares').then(r => r.json()).then(d => {
      if (d.success) setShares(d.data);
      setLoading(false);
    });
  }, []);

  const share = async () => {
    if (!form.title) return;
    await fetch('/api/student/content-shares', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, contentType: 'LINK' })
    });
    setShowForm(false);
    setForm({ title: '', message: '', contentUrl: '', shareType: 'BATCH' });
    const refreshed = await fetch('/api/student/content-shares').then(r => r.json());
    if (refreshed.success) setShares(refreshed.data);
  };

  const typeIcons: Record<string, string> = {
    LECTURE: '🎬', NOTE: '📝', DPP: '📋', PYQ: '📚', EBOOK: '📖', FORMULA_SHEET: '📐', RECORDING: '📹', LINK: '🔗'
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shared Content</h1>
          <p className="text-sm text-slate-500 mt-1">Content shared by batchmates</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-500">
          {showForm ? 'Cancel' : '+ Share'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-teal-200 p-5 space-y-3">
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input placeholder="URL (optional)" value={form.contentUrl} onChange={e => setForm({ ...form, contentUrl: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <textarea placeholder="Message (optional)" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={2} />
          <button onClick={share} className="px-6 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-500">Share</button>
        </div>
      )}

      {shares.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-3xl mb-2">🔗</p>
          <p className="text-slate-400 font-medium">No shared content yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg">{typeIcons[s.contentType] || '📄'}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  {s.message && <p className="text-xs text-slate-500 mt-1">{s.message}</p>}
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                    <span>By {s.sharedByName || s.sharedByEmail?.split('@')[0]}</span>
                    <span>•</span>
                    <span>{new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                    <span>•</span>
                    <span>{s.viewCountActual} views</span>
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
