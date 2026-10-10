'use client';

import { useState, useEffect } from 'react';

export default function QuizBattlePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch('/api/student/quiz-battle').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  const findBattle = async () => {
    setSearching(true);
    const res = await fetch('/api/student/quiz-battle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionCount: 10 })
    });
    const d = await res.json();
    if (d.success) {
      const refreshed = await fetch('/api/student/quiz-battle').then(r => r.json());
      if (refreshed.success) setData(refreshed.data);
    }
    setSearching(false);
  };

  const statusColors: Record<string, string> = {
    WAITING: 'bg-amber-100 text-amber-700', PLAYER1_TURN: 'bg-blue-100 text-blue-700',
    PLAYER2_TURN: 'bg-purple-100 text-purple-700', FINISHED: 'bg-emerald-100 text-emerald-700'
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">🥊 Quiz Battle</h1>
        <p className="text-sm text-slate-500 mt-1">1v1 real-time quiz battles</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center">
        <p className="text-4xl mb-3">🥊</p>
        <h2 className="text-xl font-black mb-2">Find an Opponent</h2>
        <p className="text-sm opacity-80 mb-4">Get matched with a student and battle it out!</p>
        <button onClick={findBattle} disabled={searching}
          className="px-8 py-3 bg-white text-purple-600 font-black rounded-xl hover:bg-purple-50 disabled:opacity-50 transition-all shadow-lg">
          {searching ? '🔍 Searching...' : '⚔️ Find Battle'}
        </button>
      </div>

      {data?.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-900 mb-3">Recent Battles</h3>
          <div className="space-y-3">
            {data.map((battle: any) => (
              <div key={battle.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                      🥊
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {battle.player1Email?.split('@')[0]} vs {battle.player2Email?.split('@')[0] || 'Waiting...'}
                      </p>
                      <p className="text-[10px] text-slate-400">{battle.questionCount} questions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[battle.status]}`}>
                      {battle.status.replace('_', ' ')}
                    </span>
                    {battle.status === 'FINISHED' && (
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {battle.player1Score} - {battle.player2Score}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
