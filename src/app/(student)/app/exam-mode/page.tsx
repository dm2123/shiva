'use client';

import { useState, useEffect } from 'react';

export default function ExamModePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/exam-session').then(r => r.json()).then(d => {
      if (d.success) setSessions(d.data);
      setLoading(false);
    });
  }, []);

  const modeColors: Record<string, string> = {
    PRACTICE: 'bg-blue-100 text-blue-700', TIMED: 'bg-amber-100 text-amber-700',
    PROCTORED: 'bg-red-100 text-red-700', MOCK: 'bg-purple-100 text-purple-700'
  };
  const statusColors: Record<string, string> = {
    IN_PROGRESS: 'bg-amber-100 text-amber-700', SUBMITTED: 'bg-emerald-100 text-emerald-700',
    TIMED_OUT: 'bg-red-100 text-red-700', DISQUALIFIED: 'bg-red-100 text-red-700'
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Exam Mode</h1>
        <p className="text-sm text-slate-500 mt-1">Timed exam simulations with proctoring</p>
      </div>

      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-2">Exam Mode Features</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2"><span>⏱️</span> Timer with auto-submit</div>
          <div className="flex items-center gap-2"><span>🔒</span> Tab switch detection</div>
          <div className="flex items-center gap-2"><span>🖥️</span> Fullscreen enforcement</div>
          <div className="flex items-center gap-2"><span>📊</span> Detailed analytics</div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-slate-400 font-medium">No exam sessions yet</p>
          <p className="text-xs text-slate-400 mt-1">Start a test in exam mode to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{s.testTitle || 'Test'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modeColors[s.mode]}`}>{s.mode}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[s.status]}`}>{s.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Tab switches: {s.tabSwitchCount}</p>
                  <p>Fullscreen exits: {s.fullscreenExits}</p>
                  <p>{new Date(s.startedAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
