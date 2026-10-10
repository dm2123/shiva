'use client';

import { useState, useEffect } from 'react';

interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  facilities: string;
}

export default function CentersList() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');

  const fetchCenters = async () => {
    try {
      const params = city ? `?city=${city}` : '';
      const res = await fetch(`/api/student/centers${params}`);
      const data = await res.json();
      if (data.success) setCenters(data.data.centers);
    } catch (err) {
      console.error('Fetch centers error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCenters(); }, [city]);

  const enroll = async (centerId: string) => {
    if (!confirm('Request enrollment at this center?')) return;
    try {
      const res = await fetch(`/api/student/centers/${centerId}/enroll`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Enrollment request submitted!');
      } else {
        alert(data.error.message);
      }
    } catch (err) {
      alert('Failed to enroll');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading centers...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Filter by city..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      {/* Centers */}
      {centers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No centers found</p>
        </div>
      ) : (
        centers.map(center => (
          <div
            key={center.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{center.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{center.address}</p>
                <p className="text-sm text-slate-500">{center.city}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  {center.phone && <span>📞 {center.phone}</span>}
                  {center.email && <span>✉️ {center.email}</span>}
                </div>
                {center.facilities && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {JSON.parse(center.facilities).map((f: string, i: number) => (
                      <span key={i} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => enroll(center.id)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Enroll
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
