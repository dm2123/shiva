'use client';

import { useState, useEffect } from 'react';

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const res = await fetch('/api/admin/live-classes');
        const data = await res.json();
        if (data.success) {
          setRecordings(data.data.liveClasses?.filter((lc: any) => lc.recordingUrl) || []);
        }
      } catch (err) {
        console.error('Fetch recordings error:', err);
      }
      setLoading(false);
    };
    fetchRecordings();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading recordings...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Recordings</h1>
      {recordings.length === 0 ? (
        <p className="text-slate-500">No recordings available</p>
      ) : (
        <div className="grid gap-4">
          {recordings.map((rec: any) => (
            <div key={rec.id} className="bg-white rounded-xl border p-4">
              <h3 className="font-bold">{rec.title}</h3>
              <p className="text-sm text-slate-500">{rec.courseTitle}</p>
              <a href={rec.recordingUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                Watch Recording
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
