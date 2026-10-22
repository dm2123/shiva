'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiveClass } from '@/types/models';

type FilterType = 'ALL' | 'LIVE' | 'SCHEDULED' | 'ENDED';

export default function TeacherLiveClassesClient({ initialClasses = [] }: { initialClasses?: LiveClass[] }) {
  const [classes] = useState<LiveClass[]>(initialClasses);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', courseId: 'course-001', batchId: '',
    scheduledStartAt: '', scheduledEndAt: '',
    classType: 'REGULAR', accessType: 'ENROLLED'
  });
  const router = useRouter();

  const filtered = filter === 'ALL' ? classes : classes.filter(c => c.status === filter);
  const counts = {
    ALL: classes.length,
    LIVE: classes.filter(c => c.status === 'LIVE').length,
    SCHEDULED: classes.filter(c => c.status === 'SCHEDULED').length,
    ENDED: classes.filter(c => c.status === 'ENDED').length,
  };

  const handleCreate = async () => {
    if (!form.title || !form.scheduledStartAt || !form.scheduledEndAt) return;
    setCreating(true);
    try {
      const res = await fetch('/api/teacher/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          scheduledStartAt: new Date(form.scheduledStartAt).toISOString(),
          scheduledEndAt: new Date(form.scheduledEndAt).toISOString(),
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        window.location.reload();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Classes</h1>
          <p className="text-sm text-slate-500 mt-1">{classes.length} total classes</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20"
        >
          {showCreate ? 'Cancel' : '+ New Live Class'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white border-2 border-teal-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Schedule New Live Class</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                placeholder="e.g. Physics: Laws of Motion" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                placeholder="Brief description" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Start Time *</label>
              <input type="datetime-local" value={form.scheduledStartAt}
                onChange={e => setForm({ ...form, scheduledStartAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">End Time *</label>
              <input type="datetime-local" value={form.scheduledEndAt}
                onChange={e => setForm({ ...form, scheduledEndAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Class Type</label>
              <select value={form.classType} onChange={e => setForm({ ...form, classType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                <option value="REGULAR">Regular</option>
                <option value="DEMO">Demo</option>
                <option value="REVISION">Revision</option>
                <option value="DPP">DPP Discussion</option>
                <option value="DOUBT_SESSION">Doubt Session</option>
                <option value="SPECIAL">Special</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Access</label>
              <select value={form.accessType} onChange={e => setForm({ ...form, accessType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                <option value="PUBLIC">Public</option>
                <option value="ENROLLED">Enrolled Only</option>
                <option value="BATCH_ONLY">Batch Only</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !form.title}
            className="px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500 disabled:opacity-50 transition-all">
            {creating ? 'Creating...' : 'Create Live Class'}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(['ALL', 'LIVE', 'SCHEDULED', 'ENDED'] as FilterType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              filter === f
                ? f === 'LIVE' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Class Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl">
          <div className="text-4xl mb-3">📡</div>
          <p className="text-slate-400 font-medium">No {filter !== 'ALL' ? filter.toLowerCase() : ''} classes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lc) => (
            <div key={lc.id} className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-lg ${
              lc.status === 'LIVE' ? 'border-red-200 ring-1 ring-red-100' :
              lc.status === 'SCHEDULED' ? 'border-emerald-200 ring-1 ring-emerald-100' :
              'border-slate-200'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                    lc.status === 'LIVE' ? 'bg-red-500/10 text-red-600 flex items-center gap-1.5' :
                    lc.status === 'SCHEDULED' ? 'bg-emerald-500/10 text-emerald-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {lc.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                    {lc.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded uppercase">{lc.classType}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">{lc.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{lc.description || 'No description'}</p>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>🕐</span>
                  {new Date(lc.scheduledStartAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
                {lc.status === 'SCHEDULED' ? (
                  <>
                    <button onClick={() => router.push(`/teacher/live-studio?classId=${lc.id}`)}
                      className="flex-1 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-500 transition-all">
                      Enter Studio
                    </button>
                    <button onClick={() => router.push(`/teacher/live-classes/${lc.id}`)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all">
                      Details
                    </button>
                  </>
                ) : lc.status === 'LIVE' ? (
                  <>
                    <button onClick={() => router.push(`/teacher/live-studio?classId=${lc.id}`)}
                      className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-all shadow-lg shadow-red-900/20 animate-pulse">
                      Join Live
                    </button>
                    <button onClick={() => router.push(`/teacher/live-classes/${lc.id}`)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all">
                      Control
                    </button>
                  </>
                ) : (
                  <button onClick={() => router.push(`/teacher/live-classes/${lc.id}`)}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all">
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
