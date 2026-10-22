'use client';

import { useState, useEffect } from 'react';

interface Session {
  id: string;
  mentorName: string;
  scheduledAt: string;
  durationMinutes: number;
  notes: string;
  status: string;
}

export default function MentorSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/student/mentors/sessions');
      const data = await res.json();
      if (data.success) setSessions(data.data.sessions);
    } catch (err) {
      console.error('Fetch sessions error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const cancelSession = async (id: string) => {
    if (!confirm('Cancel this session?')) return;
    try {
      await fetch(`/api/student/mentors/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      fetchSessions();
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading sessions...</div>;
  }

  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No mentorship sessions yet</p>
        </div>
      ) : (
        sessions.map(session => (
          <div
            key={session.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{session.mentorName}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(session.scheduledAt).toLocaleString('en-IN')} • {session.durationMinutes} min
                </p>
                {session.notes && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{session.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(session.status)}`}>
                  {session.status}
                </span>
                {session.status === 'PENDING' && (
                  <button
                    onClick={() => cancelSession(session.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
