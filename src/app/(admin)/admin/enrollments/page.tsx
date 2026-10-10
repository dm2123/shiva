'use client';

import { useState, useEffect, useCallback } from 'react';
import { safeFetch } from '@/lib/api-client';

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    const res = await safeFetch('/api/admin/enrollments');
    if (res.success) setEnrollments(res.data.enrollments || []);
    setLoading(false);
  }, []);

  const fetchBatches = useCallback(async () => {
    const res = await safeFetch('/api/admin/batches');
    if (res.success) setBatches(res.data.batches || []);
  }, []);

  useEffect(() => {
    fetchEnrollments();
    fetchBatches();
  }, [fetchEnrollments, fetchBatches]);

  const updateEnrollment = async (id: string, payload: any) => {
    setUpdatingId(id);
    const res = await safeFetch(`/api/admin/enrollments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    setUpdatingId(null);
    if (res.success) {
      fetchEnrollments();
    } else {
      alert(res.error?.message || 'Update failed');
    }
  };

  const courseBatches = (courseId: string) => batches.filter((b: any) => b.courseId === courseId);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Student Enrollments</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Course</th>
              <th className="p-4">Batch</th>
              <th className="p-4">Status</th>
              <th className="p-4">Enrolled At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : enrollments.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">No enrollments found.</td></tr>
            ) : (
              enrollments.map((e: any) => (
                <tr key={e.id} className="hover:bg-slate-50 align-middle">
                  <td className="p-4 font-semibold">{e.studentName || e.studentId}</td>
                  <td className="p-4">{e.courseTitle || e.courseId}</td>
                  <td className="p-4">
                    <select
                      value={e.batchId || ''}
                      disabled={updatingId === e.id}
                      onChange={(ev) => updateEnrollment(e.id, { batchId: ev.target.value })}
                      className="px-2 py-1.5 border rounded text-xs bg-white"
                    >
                      <option value="">No batch</option>
                      {courseBatches(e.courseId).map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={e.status || 'ACTIVE'}
                      disabled={updatingId === e.id}
                      onChange={(ev) => updateEnrollment(e.id, { status: ev.target.value })}
                      className="px-2 py-1.5 border rounded text-xs bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}