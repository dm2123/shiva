'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LiveChat from '@/components/live/LiveChat';
import LivePolls from '@/components/live/LivePolls';

interface Props {
  liveClass: any;
  teacherId: string;
  attendance?: any[];
}

export default function LiveClassControl({ liveClass, teacherId, attendance = [] }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'polls' | 'attendance' | 'recordings'>('chat');
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  const startClass = async () => {
    setStarting(true);
    await fetch(`/api/teacher/live-classes/${liveClass.id}/start`, { method: 'POST' });
    window.location.reload();
  };

  const endClass = async () => {
    if (!confirm('End this live class?')) return;
    setEnding(true);
    await fetch(`/api/teacher/live-classes/${liveClass.id}/end`, { method: 'POST' });
    window.location.reload();
  };

  const statusMap: Record<string, string> = {
    LIVE: 'bg-red-500 text-white',
    SCHEDULED: 'bg-emerald-500/20 text-emerald-500',
    ENDED: 'bg-slate-200 text-slate-500',
    CANCELLED: 'bg-red-100 text-red-500',
  };
  const statusColor = statusMap[liveClass.status] || 'bg-slate-200 text-slate-500';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{liveClass.title}</h1>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${statusColor}`}>
              {liveClass.status === 'LIVE' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse"></span>}
              {liveClass.status}
            </span>
          </div>
          <p className="text-sm text-slate-500">{liveClass.description || 'No description'}</p>
        </div>
        <div className="flex gap-2">
          {liveClass.status === 'SCHEDULED' && (
            <button onClick={startClass} disabled={starting}
              className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500 disabled:opacity-50 transition-all shadow-lg shadow-green-900/20">
              {starting ? 'Starting...' : '▶ Start Class'}
            </button>
          )}
          {liveClass.status === 'LIVE' && (
            <button onClick={endClass} disabled={ending}
              className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-500 disabled:opacity-50 transition-all shadow-lg shadow-red-900/20">
              {ending ? 'Ending...' : '■ End Class'}
            </button>
          )}
          {liveClass.status === 'LIVE' && (
            <button onClick={() => router.push(`/teacher/live-studio?classId=${liveClass.id}`)}
              className="px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500 transition-all">
              Open Studio
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Type', value: liveClass.classType, color: 'bg-blue-50 text-blue-700' },
          { label: 'Access', value: liveClass.accessType, color: 'bg-purple-50 text-purple-700' },
          { label: 'Start', value: new Date(liveClass.scheduledStartAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), color: 'bg-slate-50 text-slate-700' },
          { label: 'Attendees', value: `${attendance.length} students`, color: 'bg-emerald-50 text-emerald-700' },
        ].map((card, i) => (
          <div key={i} className={`${card.color} rounded-xl p-4`}>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{card.label}</p>
            <p className="text-sm font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(['chat', 'polls', 'attendance', 'recordings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab === 'chat' ? '💬 Chat' : tab === 'polls' ? '📊 Polls' : tab === 'attendance' ? '👥 Attendance' : '🎬 Recordings'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 min-h-[400px]">
        {activeTab === 'chat' && (
          <div className="h-[500px]">
            <LiveChat liveClassId={liveClass.id} userRole="TEACHER" />
          </div>
        )}
        {activeTab === 'polls' && (
          <div className="p-4">
            <LivePolls liveClassId={liveClass.id} userRole="TEACHER" />
          </div>
        )}
        {activeTab === 'attendance' && (
          <div className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Attendance ({attendance.length})</h3>
            {attendance.length === 0 ? (
              <p className="text-sm text-slate-400">No attendance records yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {attendance.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-sm font-bold text-teal-700">
                      {(a.studentName || 'S')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.studentEmail || a.studentId}</p>
                      <p className="text-xs text-slate-500">{a.durationMinutes || 0} min • {a.cameraOn ? '📷' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'recordings' && (
          <div className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Recordings</h3>
            {liveClass.recordingUrl ? (
              <div className="bg-slate-900 rounded-xl p-6 text-center">
                <p className="text-white font-bold mb-2">Recording Available</p>
                <a href={liveClass.recordingUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-500 transition">
                  Watch Recording
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No recording available for this class</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
