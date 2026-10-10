'use client';

import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  LIVE: 'bg-red-50 text-red-700 border-red-200',
  ENDED: 'bg-slate-100 text-slate-500 border-slate-200',
  CANCELLED: 'bg-slate-100 text-slate-400 border-slate-200',
};

function toLocalInput(dt: string | null) {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminLiveClassesClient({
  initialClasses,
  courses,
  teachers,
}: {
  initialClasses: any[];
  courses: any[];
  teachers: any[];
}) {
  const [classes, setClasses] = useState<any[]>(initialClasses);
  const [scheduling, setScheduling] = useState(false);
  const [managing, setManaging] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: courses[0]?.id || '',
    teacherId: '',
    meetingUrl: '',
    recordingUrl: '',
    startTime: '',
    endTime: '',
  });

  const schedule = async () => {
    setMsg(null);
    if (!form.title || !form.courseId || !form.startTime || !form.endTime) {
      setMsg({ type: 'error', text: 'Title, course, start and end time are required.' });
      return;
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setMsg({ type: 'error', text: 'End time must be after start time.' });
      return;
    }
    try {
      const res = await fetch('/api/admin/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, teacherId: form.teacherId || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Failed to schedule');
      setClasses((prev) => [...prev, data.data.liveClass]);
      setScheduling(false);
      setMsg({ type: 'success', text: `Live class '${data.data.liveClass.title}' scheduled.` });
      setForm({ title: '', description: '', courseId: courses[0]?.id || '', teacherId: '', meetingUrl: '', recordingUrl: '', startTime: '', endTime: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/live-classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Update failed');
      setClasses((prev) => prev.map((c) => (c.id === id ? data.data.liveClass : c)));
      setManaging(null);
      setMsg({ type: 'success', text: 'Live class updated.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const cancel = async (id: string) => {
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/live-classes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Cancel failed');
      setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'CANCELLED' } : c)));
      setMsg({ type: 'success', text: 'Live class cancelled.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const saveManage = async (id: string) => {
    const c = classes.find((x) => x.id === id);
    if (!c) return;
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/live-classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingUrl: c.editMeetingUrl || null, recordingUrl: c.editRecordingUrl || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Update failed');
      setClasses((prev) => prev.map((x) => (x.id === id ? data.data.liveClass : x)));
      setManaging(null);
      setMsg({ type: 'success', text: 'Meeting details updated.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const manageable = classes.find((c) => c.id === managing);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Live Class Management</h1>
          <p className="text-sm text-slate-500 mt-1">{classes.length} scheduled classes on the platform</p>
        </div>
        <button
          onClick={() => setScheduling((s) => !s)}
          className="bg-red-950 text-white px-4 py-2 rounded text-xs font-bold hover:bg-black transition-colors"
        >
          {scheduling ? 'Close Form' : 'Schedule New Class'}
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded text-xs border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {scheduling && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Schedule New Class</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Course</span>
              <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none">
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Description</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Assign Teacher</span>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none">
                <option value="">Unassigned</option>
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.email}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Start Time</span>
              <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">End Time</span>
              <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Meeting URL (optional)</span>
              <input value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Recording URL (optional)</span>
              <input value={form.recordingUrl} onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </label>
          </div>
          <button onClick={schedule} className="px-6 py-2 bg-red-950 hover:bg-black text-white text-sm font-bold rounded-lg transition-colors">
            Publish Class
          </button>
        </div>
      )}

      {managing && manageable && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Manage: {manageable.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Meeting URL</span>
              <input
                value={manageable.editMeetingUrl ?? manageable.meetingUrl ?? ''}
                onChange={(e) => setClasses((prev) => prev.map((x) => (x.id === managing ? { ...x, editMeetingUrl: e.target.value } : x)))}
                placeholder="https://..."
                className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 uppercase">Recording URL</span>
              <input
                value={manageable.editRecordingUrl ?? manageable.recordingUrl ?? ''}
                onChange={(e) => setClasses((prev) => prev.map((x) => (x.id === managing ? { ...x, editRecordingUrl: e.target.value } : x)))}
                placeholder="https://..."
                className="mt-1 w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => saveManage(managing)} className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded transition-colors">Save Links</button>
            {manageable.status === 'SCHEDULED' && (
              <button onClick={() => updateStatus(managing, 'LIVE')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors">Start Live</button>
            )}
            {(manageable.status === 'LIVE' || manageable.status === 'SCHEDULED') && (
              <button onClick={() => updateStatus(managing, 'ENDED')} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded transition-colors">Mark Ended</button>
            )}
            <button onClick={() => setManaging(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors">Close</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {classes.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No live classes scheduled yet.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Course</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Start</th>
                <th className="p-4">End</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900 max-w-[200px] truncate">{c.title}</td>
                  <td className="p-4 text-slate-600">{c.courseTitle || '—'}</td>
                  <td className="p-4 text-slate-600">{c.teacherEmail || 'Unassigned'}</td>
                  <td className="p-4">{new Date(c.startTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-4">{c.endTime ? new Date(c.endTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_COLORS[c.status] || STATUS_COLORS.SCHEDULED}`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {c.status === 'SCHEDULED' && (
                      <button onClick={() => cancel(c.id)} className="text-red-700 font-bold hover:underline mr-3">Cancel</button>
                    )}
                    <button onClick={() => setManaging(c.id)} className="text-slate-900 font-bold hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}