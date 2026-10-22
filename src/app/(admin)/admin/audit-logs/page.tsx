'use client';

import { useState, useEffect } from 'react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/audit-logs');
        const data = await res.json();
        if (data.success) setLogs(data.data.logs || []);
      } catch (err) {
        console.error('Fetch logs error:', err);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading audit logs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
      {logs.length === 0 ? (
        <p className="text-slate-500">No audit logs available</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Action</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-sm">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm">{log.userEmail}</td>
                  <td className="px-4 py-3 text-sm font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
