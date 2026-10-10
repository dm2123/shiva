'use client';

import { useState, useEffect } from 'react';

export default function BattlegroundsPage() {
  const [battlegrounds, setBattlegrounds] = useState<any[]>([]);
  const [filter, setFilter] = useState('WAITING');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/student/battlegrounds?status=${filter}`).then(r => r.json()).then(d => {
      if (d.success) setBattlegrounds(d.data);
      setLoading(false);
    });
  }, [filter]);

  const joinBattle = async (bgId: string) => {
    setJoining(bgId);
    await fetch('/api/student/battlegrounds', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battlegroundId: bgId })
    });
    const refreshed = await fetch(`/api/student/battlegrounds?status=${filter}`).then(r => r.json());
    if (refreshed.success) setBattlegrounds(refreshed.data);
    setJoining(null);
  };

  const modeIcons: Record<string, string> = { SOLO: '⚔️', DUO: '👥', SQUAD: '🎯', BRACKET: '🏆' };
  const statusColors: Record<string, string> = {
    WAITING: 'bg-emerald-100 text-emerald-700', LIVE: 'bg-red-100 text-red-700 animate-pulse',
    FINISHED: 'bg-slate-100 text-slate-500', CANCELLED: 'bg-red-100 text-red-500'
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">⚔️ Battleground</h1>
        <p className="text-sm text-slate-500 mt-1">Compete against other students and win XP!</p>
      </div>

      <div className="flex justify-center gap-2">
        {['WAITING', 'LIVE', 'FINISHED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading battlegrounds...</div>
      ) : battlegrounds.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-4xl mb-3">⚔️</p>
          <p className="text-slate-400 font-medium">No {filter.toLowerCase()} battlegrounds</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {battlegrounds.map(bg => (
            <div key={bg.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{modeIcons[bg.mode] || '⚔️'}</span>
                  <div>
                    <h3 className="font-bold text-slate-900">{bg.title}</h3>
                    <p className="text-[10px] text-slate-400">{bg.courseTitle} • {bg.mode}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[bg.status]}`}>
                  {bg.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{bg.description}</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-slate-900">{bg.questionCount}</p>
                  <p className="text-[10px] text-slate-400">Questions</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <p className="text-sm font-bold text-slate-900">{Math.floor(bg.timeLimitSeconds / 60)}m</p>
                  <p className="text-[10px] text-slate-400">Time Limit</p>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-xl">
                  <p className="text-sm font-bold text-amber-700">+{bg.prizeXP} XP</p>
                  <p className="text-[10px] text-amber-500">Prize</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-slate-700">{bg.currentParticipants}/{bg.maxParticipants}</span> joined
                </div>
                {bg.userJoined > 0 ? (
                  bg.userFinished > 0 ? (
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl">Completed ✓</span>
                  ) : (
                    <span className="px-4 py-2 bg-amber-100 text-amber-700 text-xs font-bold rounded-xl">In Progress</span>
                  )
                ) : bg.status === 'WAITING' ? (
                  <button onClick={() => joinBattle(bg.id)} disabled={joining === bg.id}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-xl hover:from-red-400 hover:to-orange-400 disabled:opacity-50 transition-all shadow-lg shadow-red-900/20">
                    {joining === bg.id ? 'Joining...' : '⚔️ Join Battle'}
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl">Closed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
