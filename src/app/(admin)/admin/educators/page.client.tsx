'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminEducatorsClient({ initialEducators }: { initialEducators: any[] }) {
  const [educators] = useState(initialEducators);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Educator / Institute Partners</h1>
          <p className="text-sm text-slate-500">
            {educators.length} verified educators managing courses on the platform.
          </p>
        </div>
        <Link
          href="/admin/teachers"
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Manage Teacher Accounts
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Educator</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Courses</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {educators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No educators found. Onboard teachers from the Teacher Accounts page.
                  </td>
                </tr>
              ) : (
                educators.map((edu) => (
                  <tr key={edu.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{edu.displayName}</div>
                      <div className="text-xs text-slate-500">
                        {[
                          edu.qualification,
                          edu.experienceYears ? `${edu.experienceYears} yrs experience` : '',
                        ].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{edu.email || 'N/A'}</div>
                      <div className="text-xs text-slate-400">
                        Joined {edu.joined ? new Date(edu.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="font-bold text-slate-800">{edu.courseCount}</div>
                      <div className="text-xs text-slate-500 truncate">{edu.courseTitles || 'No courses assigned'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{edu.studentCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${edu.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {edu.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}