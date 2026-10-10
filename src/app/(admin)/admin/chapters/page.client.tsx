'use client';

import { useState, FormEvent } from 'react';

export default function AdminChaptersClient({
  courses,
  subjects,
  chapters: initialChapters,
}: {
  courses: any[];
  subjects: any[];
  chapters: any[];
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [chapters, setChapters] = useState<any[]>(initialChapters);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const courseSubjects = subjects.filter((s: any) => s.courseId === courseId);
  const subject = subjects.find((s: any) => s.id === subjectId);
  const subjectName = subject?.name || '';
  const courseTitle = courses.find((c) => c.id === courseId)?.title || '';
  const filtered = chapters.filter((ch) => ch.subjectId === subjectId);

  const handleCourseChange = (cid: string) => {
    setCourseId(cid);
    const first = subjects.find((s: any) => s.courseId === cid);
    setSubjectId(first?.id || '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!subjectId) {
      setStatusMsg({ type: 'error', text: 'No subject available under this course. Create a subject first.' });
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/admin/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          title,
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
        throw new Error(data?.error?.message || 'Failed to create chapter.');
      }

      const created = {
        ...data.data.chapter,
        subjectName,
        subjectId,
        courseId,
        courseTitle,
      };
      setChapters((prev) => [...prev, created]);
      setStatusMsg({ type: 'success', text: `Chapter '${created.title}' created successfully!` });
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Master Chapter Audit & Creation</h1>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Course</label>
            <select
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {courseSubjects.length === 0 && <option value="">No subjects yet</option>}
              {courseSubjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chapter Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Chapter 1: Kinematics"
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Chapter scope..."
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || courseSubjects.length === 0}
            className="w-full py-2.5 bg-red-950 text-white rounded text-xs font-bold hover:bg-black transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Chapter'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Chapters · <span className="text-slate-500">{subjectName || courseTitle || 'All'}</span>
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No chapters under {subjectName || 'the selected subject'} yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((ch) => (
              <div key={ch.id} className="p-4 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{ch.title}</span>
                  <span className="text-xs text-slate-400">#{ch.sortOrder ?? ch.orderIndex}</span>
                </div>
                {ch.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ch.description}</p>}
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