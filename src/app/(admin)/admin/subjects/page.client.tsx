'use client';

import { useState, FormEvent } from 'react';

export default function AdminSubjectsClient({
  courses,
  subjects: initialSubjects,
}: {
  courses: any[];
  subjects: any[];
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [subjects, setSubjects] = useState<any[]>(initialSubjects);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = subjects.filter((s) => s.courseId === courseId);
  const courseTitle = courses.find((c) => c.id === courseId)?.title || '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          name,
          code,
          description,
          sortOrder: Number(sortOrder),
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error('Server returned an unexpected response format. Please try again.');
      }

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to create subject.');
      }

      const created = { ...data.data.subject, courseTitle, courseId };
      setSubjects((prev) => [...prev, created]);
      setStatusMsg({ type: 'success', text: `Subject '${created.name}' created successfully!` });
      setName('');
      setCode('');
      setDescription('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Master Subject Taxonomy Manager</h1>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
        >
          {courses.map((c: any) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Physics"
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. PHY101"
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Subject scope..."
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-950 text-white rounded text-xs font-bold hover:bg-black transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Subject'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Subjects · <span className="text-slate-500">{courseTitle || 'All'}</span>
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No subjects under {courseTitle || 'this course'} yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <div key={s.id} className="p-4 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{s.code || '—'}</span>
                </div>
                {s.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded text-xs border ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}
    </div>
  );
}