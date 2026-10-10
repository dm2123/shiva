'use client';

import { useState, useEffect } from 'react';

export default function StreakEnhancedPage() {
  const [data, setData] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/streak-enhanced').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  const checkIn = async () => {
    setChecking(true);
    const res = await fetch('/api/student/streak-enhanced', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginMinutes: 30, testsAttempted: 1, lecturesAttended: 1 })
    });
    const d = await res.json();
    if (d.success) {
      const refreshed = await fetch('/api/student/streak-enhanced').then(r => r.json());
      if (refreshed.success) setData(refreshed.data);
    }
    setChecking(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading streak...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load</div>;

  const maxStreak = Math.max(...data.rewards.map((r: any) => r.streakDays), 1);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Streak Counter */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute text-4xl" style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}>🔥</div>
          ))}
        </div>
        <div className="relative z-10">
          <p className="text-8xl font-black mb-2">{data.currentStreak}</p>
          <p className="text-xl font-bold opacity-90">Day Streak</p>
          <p className="text-sm opacity-70 mt-1">Longest: {data.longestStreak} days</p>
          <button onClick={checkIn} disabled={checking}
            className="mt-6 px-8 py-3 bg-white text-orange-600 font-black rounded-xl hover:bg-orange-50 disabled:opacity-50 transition-all text-sm">
            {checking ? 'Checking In...' : '🔥 Check In Today'}
          </button>
        </div>
      </div>

      {/* XP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total XP Earned</p>
        <p className="text-3xl font-black text-teal-600 mt-1">{data.totalXP.toLocaleString()}</p>
      </div>

      {/* Streak Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-4">Last 30 Days</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {data.calendar.map((day: any, i: number) => {
            const d = new Date(day.date);
            const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
            return (
              <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] ${
                day.active
                  ? isToday ? 'bg-orange-500 text-white ring-2 ring-orange-300' : 'bg-orange-100 text-orange-700'
                  : isToday ? 'bg-slate-200 text-slate-700 ring-2 ring-slate-300' : 'bg-slate-50 text-slate-400'
              }`}>
                <span className="font-bold">{d.getDate()}</span>
                {day.active && <span>🔥</span>}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-100 rounded"></span> Active</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-50 rounded border"></span> Missed</span>
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-4">Streak Rewards</h3>
        <div className="space-y-3">
          {data.rewards.map((reward: any, i: number) => {
            const achieved = data.currentStreak >= reward.streakDays;
            const progress = Math.min(100, (data.currentStreak / reward.streakDays) * 100);
            return (
              <div key={i} className={`p-4 rounded-xl border transition-all ${
                achieved ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                    achieved ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    {achieved ? '🏆' : reward.badgeIcon === 'fire' ? '🔥' : reward.badgeIcon === 'lightning' ? '⚡' :
                     reward.badgeIcon === 'medal' ? '🏅' : reward.badgeIcon === 'diamond' ? '💎' :
                     reward.badgeIcon === 'crown' ? '👑' : reward.badgeIcon === 'star' ? '⭐' :
                     reward.badgeIcon === 'trophy' ? '🏆' : reward.badgeIcon === 'sparkle' ? '✨' :
                     reward.badgeIcon === 'infinity' ? '♾️' : '🎯'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{reward.rewardName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        achieved ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {reward.rewardType === 'XP' ? `+${reward.rewardValue} XP` :
                         reward.rewardType === 'BADGE' ? 'Badge' : `+${reward.rewardValue} Days`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{reward.description}</p>
                    {!achieved && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>{data.currentStreak}/{reward.streakDays} days</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
