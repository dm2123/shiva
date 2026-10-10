'use client';

import { useState, useEffect } from 'react';

interface Doubt {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  category: string;
  studentName: string;
  assignedToName: string;
  waitMinutes: number;
  slaDeadline: string;
  createdAt: string;
}

interface DoubtQueueProps {
  teacherId: string;
}

export default function DoubtQueue({ teacherId }: DoubtQueueProps) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [filter, setFilter] = useState('assigned');
  const [loading, setLoading] = useState(true);
  const [slaBreaches, setSlaBreaches] = useState(0);

  const fetchDoubts = async () => {
    try {
      const res = await fetch(`/api/teacher/doubts/queue?filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setDoubts(data.data.doubts);
        setSlaBreaches(data.data.slaBreaches);
      }
    } catch (err) {
      console.error('Fetch doubts error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDoubts(); }, [filter]);

  const assignDoubt = async (doubtId: string) => {
    try {
      await fetch(`/api/teacher/doubts/${doubtId}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign' }),
      });
      fetchDoubts();
    } catch (err) {
      console.error('Assign error:', err);
    }
  };

  const resolveDoubt = async (doubtId: string, resolution: string) => {
    if (!resolution.trim()) return;
    try {
      await fetch(`/api/teacher/doubts/${doubtId}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', content: resolution }),
      });
      fetchDoubts();
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 flex-1">
          <p className="text-sm text-slate-500">Pending Doubts</p>
          <p className="text-2xl font-bold text-slate-900">{doubts.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 flex-1">
          <p className="text-sm text-slate-500">SLA Breaches</p>
          <p className="text-2xl font-bold text-red-600">{slaBreaches}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['assigned', 'unassigned', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Doubts */}
      {doubts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No doubts in queue</p>
        </div>
      ) : (
        doubts.map(doubt => (
          <DoubtCard
            key={doubt.id}
            doubt={doubt}
            onAssign={() => assignDoubt(doubt.id)}
            onResolve={(resolution) => resolveDoubt(doubt.id, resolution)}
          />
        ))
      )}
    </div>
  );
}

function DoubtCard({ doubt, onAssign, onResolve }: { doubt: Doubt; onAssign: () => void; onResolve: (r: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [resolution, setResolution] = useState('');

  const priorityColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(doubt.priority)}`}>
              {doubt.priority}
            </span>
            <span className="text-xs text-slate-500">{doubt.category}</span>
            <span className="text-xs text-slate-500">by {doubt.studentName}</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">{doubt.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{doubt.content}</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-xs text-slate-500">{doubt.waitMinutes}m waiting</p>
          {doubt.status === 'OPEN' && !doubt.assignedToName && (
            <button
              onClick={onAssign}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
            >
              Take
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <textarea
            value={resolution}
            onChange={e => setResolution(e.target.value)}
            placeholder="Write resolution..."
            className="w-full h-20 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
          />
          <button
            onClick={() => { onResolve(resolution); setResolution(''); }}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            Mark Resolved
          </button>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs text-indigo-600 hover:underline"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
}
