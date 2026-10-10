'use client';

import { useState, useEffect } from 'react';

interface Doubt {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  category: string;
  assignedToName: string;
  messageCount: number;
  slaDeadline: string;
  createdAt: string;
}

interface DoubtTrackerProps {
  studentId: string;
}

export default function DoubtTracker({ studentId }: DoubtTrackerProps) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchDoubts = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`/api/student/doubts/enhanced${params}`);
      const data = await res.json();
      if (data.success) setDoubts(data.data.doubts);
    } catch (err) {
      console.error('Fetch doubts error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDoubts(); }, [filter]);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'OPEN': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'RESOLVED': return 'bg-green-100 text-green-700';
      case 'REOPENED': return 'bg-purple-100 text-purple-700';
      case 'CLOSED': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTimeLeft = (deadline: string) => {
    const now = new Date();
    const dl = new Date(deadline);
    const diffMs = dl.getTime() - now.getTime();
    if (diffMs < 0) return { text: 'SLA Breached', color: 'text-red-600 font-bold' };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hours}h ${mins}m left`, color: hours < 2 ? 'text-orange-600' : 'text-slate-500' };
  };

  if (loading) return <div className="text-center py-8 text-slate-500">Loading doubts...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Doubts List */}
      {doubts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No doubts found</p>
        </div>
      ) : (
        doubts.map(doubt => (
          <div key={doubt.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(doubt.priority)}`}>
                    {doubt.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(doubt.status)}`}>
                    {doubt.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">{doubt.category}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{doubt.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{doubt.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  {doubt.assignedToName && <span>Assigned to: {doubt.assignedToName}</span>}
                  <span>{doubt.messageCount} replies</span>
                  <span>{new Date(doubt.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="text-right ml-4">
                {doubt.status !== 'RESOLVED' && (
                  <div className={getTimeLeft(doubt.slaDeadline).color}>
                    {getTimeLeft(doubt.slaDeadline).text}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
