'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { safeFetch } from '@/lib/api-client';

interface Assignment {
  id: string;
  teacherId: string;
  courseId: string;
  assignedAt: string;
  teacherName: string;
  courseTitle: string;
}

export default function AdminTeachersPage() {
  // Provision State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  // Assignment State
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [courseId, setCourseId] = useState('');

  const [provStatus, setProvStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assignStatus, setAssignStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [tRes, cRes, aRes] = await Promise.all([
      safeFetch('/api/admin/teachers'),
      safeFetch('/api/admin/courses'),
      safeFetch('/api/admin/teachers/assignments'),
    ]);
    if (tRes.success) setTeachers(tRes.data.educators || []);
    if (cRes.success) setCourses(cRes.data.courses || []);
    if (aRes.success) setAssignments(aRes.data.assignments || []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProvision = async (e: FormEvent) => {
    e.preventDefault();
    setProvStatus(null);
    setLoading(true);

    try {
      const res = await safeFetch('/api/admin/teachers/provision', {
        method: 'POST',
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          qualification: qualification || undefined,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
        }),
      });

      if (!res.success) throw new Error(res.error?.message || 'Failed to provision teacher.');

      setProvStatus({ type: 'success', text: `Success! Teacher registered with ID: ${res.data.id}` });
      setName('');
      setEmail('');
      setPassword('');
      setQualification('');
      setExperienceYears('');
      fetchData();
    } catch (err: any) {
      setProvStatus({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    setAssignStatus(null);
    setLoading(true);

    try {
      const res = await safeFetch('/api/admin/teachers/assignments', {
        method: 'POST',
        body: JSON.stringify({ teacherId, courseId }),
      });

      if (!res.success) throw new Error(res.error?.message || 'Failed to assign teacher.');

      setAssignStatus({ type: 'success', text: 'Teacher assigned to course successfully!' });
      fetchData();
    } catch (err: any) {
      setAssignStatus({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Teacher Provisioning & Course Authorization</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Register Teacher Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Provision Teacher Account</h2>

          {provStatus && (
            <div
              className={`p-3 mb-4 rounded text-xs border break-all ${
                provStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {provStatus.text}
            </div>
          )}

          <form onSubmit={handleProvision} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. John Doe" className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="teacher@shiva.world" className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Temporary Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="SecurePassword123!" className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qualification</label>
                <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="M.Sc., M.A. etc." className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Experience (yrs)</label>
                <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} min={0} placeholder="7" className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-red-950 text-white rounded text-xs font-bold hover:bg-black transition disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Teacher Account'}
            </button>
          </form>
        </div>

        {/* Assign Teacher Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Assign Teacher to Course</h2>

          {assignStatus && (
            <div
              className={`p-3 mb-4 rounded text-xs border ${
                assignStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {assignStatus.text}
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teacher</label>
              <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white">
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.userId} value={t.userId}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white">
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-gray-900 text-white rounded text-xs font-bold hover:bg-black transition disabled:opacity-50">
              {loading ? 'Assigning...' : 'Assign Teacher to Course'}
            </button>
          </form>

          <div className="mt-8 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-red-400 mb-2">Security Authorization Policy</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Teachers can ONLY access and upload lectures to courses explicitly assigned by an administrator via database relationship verification. Object-level checks enforce this isolation across all teacher API routes.
            </p>
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Current Course Assignments</h2>
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{assignments.length} assignments</span>
        </div>
        {assignments.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">No teacher-course assignments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-500">
                <tr>
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Assigned At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{a.teacherName || a.teacherId}</td>
                    <td className="p-3">{a.courseTitle || a.courseId}</td>
                    <td className="p-3 text-slate-500">{a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}