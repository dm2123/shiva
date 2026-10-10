'use client';

interface ScholarshipResultsProps {
  score: number;
  maxScore: number;
  percentage: number;
  scholarshipAmount: number;
  xpEarned: number;
  leaderboard?: Array<{
    studentId: string;
    name: string;
    score: number;
    percentage: number;
    userRank: number;
  }>;
}

export default function ScholarshipResults({
  score,
  maxScore,
  percentage,
  scholarshipAmount,
  xpEarned,
  leaderboard = []
}: ScholarshipResultsProps) {
  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100', message: 'Outstanding!' };
    if (pct >= 75) return { grade: 'A', color: 'text-blue-600', bg: 'bg-blue-100', message: 'Excellent!' };
    if (pct >= 60) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100', message: 'Good Job!' };
    if (pct >= 40) return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-100', message: 'Keep Trying!' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100', message: 'Needs Improvement' };
  };

  const { grade, color, bg, message } = getGrade(percentage);

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
        <p className="text-sm opacity-80">Your Score</p>
        <p className="text-6xl font-bold mt-2">{score}/{maxScore}</p>
        <div className={`inline-block mt-4 px-4 py-2 rounded-full ${bg} ${color} font-bold`}>
          {grade} — {percentage}%
        </div>
        <p className="mt-4 text-lg">{message}</p>
      </div>

      {/* Rewards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">₹{scholarshipAmount}</p>
          <p className="text-sm text-slate-500">Scholarship</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">+{xpEarned}</p>
          <p className="text-sm text-slate-500">XP Earned</p>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Top Performers</h3>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.studentId}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700"
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold">
                  {entry.userRank}
                </span>
                <span className="flex-1 text-sm text-slate-900 dark:text-white">{entry.name}</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {entry.score} ({entry.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
