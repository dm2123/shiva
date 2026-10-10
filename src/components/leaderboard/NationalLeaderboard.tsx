'use client';

import { useState, useEffect } from 'react';


interface LeaderboardEntry {
  id: number;
  userId: number;
  exam: string;
  score: number;
  state: string;
  city: string;
  userName: string;
  avatar?: string;
}

interface UserRank {
  score: number;
  rank: number;
  state: string;
  city: string;
}

const EXAMS = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE'];

export default function NationalLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [selectedExam, setSelectedExam] = useState('JEE');
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/national-leaderboard?exam=${selectedExam}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.userRank || null);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedExam]);

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-yellow-100 border-yellow-300';
    if (index === 1) return 'bg-gray-100 border-gray-300';
    if (index === 2) return 'bg-orange-100 border-orange-300';
    return '';
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">National Leaderboard</h2>

      <div className="flex gap-2 flex-wrap">
        {EXAMS.map((exam) => (
          <button
            key={exam}
            onClick={() => setSelectedExam(exam)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedExam === exam
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {exam}
          </button>
        ))}
      </div>

      {userRank && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-gray-600">Your Rank</p>
          <p className="text-2xl font-bold text-blue-600">#{userRank.rank}</p>
          <p className="text-sm text-gray-600">Score: {userRank.score}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No entries yet.</td>
              </tr>
            ) : (
              leaderboard.map((entry, index) => (
                <tr key={entry.id} className={getRankStyle(index)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {getRankBadge(index)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          entry.userName?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{entry.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {entry.score.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.state || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.city || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
