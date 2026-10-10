'use client';

import { useState, useEffect } from 'react';

export default function TeacherAnnouncementsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'MEDIUM', type: 'GENERAL', targetAudience: 'ENROLLED', pinToTop: false });

  useEffect(() => {
    fetch('/api/teacher/announcements').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  const create = async () => {
    if (!form.title || !form.message) return;
    await fetch('/api/teacher/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setShowForm(false);
    setForm({ title: '', message: '', priority: 'MEDIUM', type: 'GENERAL', targetAudience: 'ENROLLED', pinToTop: false });
    const refreshed = await fetch('/api/teacher/announcements').then(r => r.json());
    if (refreshed.success) setData(refreshed.data);
  };

  const deleteAnn = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await fetch(`/api/teacher/announcements?id=${id}`, { method: 'DELETE' });
    setData(data.filter(a => a.id !== id));
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-500', MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700', URGENT: 'bg-red-100 text-red-700'
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">{data.length} announcements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-500">
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-teal-200 p-5 space-y-3">
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <textarea placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={3} />
          <div className="flex gap-3">
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option><option value="URGENT">Urgent</option>
            </select>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="GENERAL">General</option><option value="HOMEWORK">Homework</option>
              <option value="TEST">Test</option><option value="LIVE_CLASS">Live Class</option>
              <option value="IMPORTANT">Important</option>
            </select>
            <select value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="ALL">All</option><option value="ENROLLED">Enrolled</option><option value="BATCH">Batch</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={form.pinToTop} onChange={e => setForm({ ...form, pinToTop: e.target.checked })} />
            Pin to top
          </label>
          <button onClick={create} className="px-6 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-500">Publish</button>
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-3xl mb-2">📢</p>
          <p className="text-slate-400 font-medium">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(ann => (
            <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.pinToTop === 1 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">📌</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColors[ann.priority]}`}>{ann.priority}</span>
                    <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{ann.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Read by {ann.readCount || 0} students</p>
                </div>
                <button onClick={() => deleteAnn(ann.id)} className="text-xs text-red-500 hover:text-red-700 px-2">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
