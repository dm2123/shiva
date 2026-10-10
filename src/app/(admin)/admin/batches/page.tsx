'use client';

import { useState, useEffect, FormEvent } from 'react';
import { safeFetch } from '@/lib/api-client';

export default function AdminBatchesPage() {
  const [courseId, setCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState<{id: string, title: string}[]>([]);
  const [teachers, setTeachers] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
      safeFetch('/api/admin/courses').then(res => {
        if (res.success) setCourses(res.data.courses);
      });
      // Fetch teachers from the updated route
      safeFetch('/api/admin/teachers').then(res => {
        if (res.success) setTeachers(res.data.educators);
      });
    }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);

    const res = await safeFetch('/api/admin/batches', {
      method: 'POST',
      body: JSON.stringify({
        courseId,
        teacherId, // Added teacher mapping
        name,
        startDate,
        endDate,
        status,
      }),
    });

    if (!res.success) {
      setStatusMsg({ type: 'error', text: res.error?.message || 'Failed to create batch.' });
    } else {
      setStatusMsg({ type: 'success', text: `Batch '${res.data.batch.name}' created successfully!` });
      setName('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Operational Batch Cohort Management</h1>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Create Batch Cohort</h2>

        {statusMsg && (
          <div
            className={`p-3 mb-4 rounded text-xs border ${
              statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign Teacher</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="">Select a teacher...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batch Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. JEE 2026 Morning Super-30 Batch"
              className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-950 text-white rounded text-xs font-bold hover:bg-black transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Batch Cohort'}
          </button>
        </form>
      </div>
    </div>
  );
}
