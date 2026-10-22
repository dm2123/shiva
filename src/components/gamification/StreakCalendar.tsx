'use client';

import { useState, useEffect } from 'react';

interface StreakData {
  currentStreak: number;
  totalDays: number;
  streaks: Array<{ streakDate: string; loginMinutes: number }>;
}

export default function StreakCalendar() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch('/api/student/streak');
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch streak error:', err);
      }
      setLoading(false);
    };
    fetchStreak();
  }, []);

  const checkIn = async () => {
    try {
      const res = await fetch('/api/student/streak/checkin', { method: 'POST' });
      const result = await res.json();
      if (result.success && result.data.checkedIn) {
        // Refresh streak data
        const streakRes = await fetch('/api/student/streak');
        const streakData = await streakRes.json();
        if (streakData.success) setData(streakData.data);
      }
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasStreak = data?.streaks.some(s => {
        const d = new Date(s.streakDate).toISOString().split('T')[0];
        return d === dateStr;
      }) || false;
      days.push({ date: dateStr, hasStreak, isToday: i === 0 });
    }
    return days;
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading streak data...</div>;
  }

  const days = getLast30Days();
  const todayChecked = data?.streaks.some(s => {
    const d = new Date(s.streakDate).toISOString().split('T')[0];
    return d === new Date().toISOString().split('T')[0];
  }) || false;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Current Streak</p>
          <p className="text-4xl font-bold">{data?.currentStreak || 0}</p>
          <p className="text-xs opacity-70 mt-1">days</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
          <p className="text-sm opacity-80">Total Days</p>
          <p className="text-4xl font-bold">{data?.totalDays || 0}</p>
          <p className="text-xs opacity-70 mt-1">logins</p>
        </div>
      </div>

      {/* Check-in Button */}
      <button
        onClick={checkIn}
        disabled={todayChecked}
        className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
          todayChecked
            ? 'bg-green-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
        }`}
      >
        {todayChecked ? '✅ Checked In Today' : '🔥 Check In Today (+2 XP)'}
      </button>

      {/* 30-Day Calendar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Last 30 Days</h3>
        <div className="grid grid-cols-10 gap-1">
          {days.map((day) => (
            <div
              key={day.date}
              title={day.date}
              className={`w-full aspect-square rounded-md ${
                day.hasStreak
                  ? 'bg-green-500'
                  : day.isToday
                  ? 'bg-indigo-200 dark:bg-indigo-800 border-2 border-indigo-500'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Active</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded" /> Missed</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-200 dark:bg-indigo-800 rounded border border-indigo-500" /> Today</span>
        </div>
      </div>
    </div>
  );
}
