'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  studentId: string;
  name: string;
  totalXP: number;
  userRank: number;
}

interface LeaderboardProps {
  courseId?: string;
}

export default function Leaderboard({ courseId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const url = courseId ? `/api/student/leaderboard?courseId=${courseId}` : '/api/student/leaderboard';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setEntries(data.data.leaderboard);
          setMe(data.data.me);
        }
      } catch (err) {
        console.error('Fetch leaderboard error:', err);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [courseId]);

  const medalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 2: return 'bg-slate-100 border-slate-300 text-slate-800';
      case 3: return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const medalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-4">
      {/* My Rank */}
      {me && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Your Rank</p>
              <p className="text-3xl font-bold">#{me.userRank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Total XP</p>
              <p className="text-3xl font-bold">{me.totalXP}</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No leaderboard data yet</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.studentId}
              className={`flex items-center gap-3 p-3 rounded-xl border ${medalColor(entry.userRank)} ${
                me?.studentId === entry.studentId ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold">
                {medalEmoji(entry.userRank)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{entry.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.totalXP} XP</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
