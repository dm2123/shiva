'use client';

import { useState, useEffect } from 'react';

interface Poll {
  id: string;
  question: string;
  options: string[];
  responseCount: number;
  results: { optionIndex: number; count: number }[];
  userVote: number | null;
}

interface LivePollsProps {
  liveClassId: string;
  userRole: 'TEACHER' | 'STUDENT';
}

export default function LivePolls({ liveClassId, userRole }: LivePollsProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [voting, setVoting] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchPoll = async () => {
    try {
      const base = userRole === 'TEACHER' ? '/api/teacher' : '/api/student';
      const res = await fetch(`${base}/live-classes/${liveClassId}/polls`);
      const data = await res.json();
      if (data.success) {
        setPoll(data.data.poll);
      }
    } catch (err) {
      console.error('Poll fetch error:', err);
    }
  };

  useEffect(() => {
    fetchPoll();
    const interval = setInterval(fetchPoll, 3000);
    return () => clearInterval(interval);
  }, [liveClassId]);

  const createPoll = async () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/teacher/live-classes/${liveClassId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), options: options.filter(o => o.trim()) }),
      });

      if (res.ok) {
        setQuestion('');
        setOptions(['', '']);
        fetchPoll();
      }
    } catch (err) {
      console.error('Create poll error:', err);
    }
    setCreating(false);
  };

  const vote = async (optionIndex: number) => {
    if (voting || poll?.userVote !== null) return;

    setVoting(true);
    try {
      const res = await fetch(`/api/student/live-classes/${liveClassId}/polls/${poll!.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOption: optionIndex }),
      });

      if (res.ok) {
        fetchPoll();
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
    setVoting(false);
  };

  const totalVotes = poll?.results?.reduce((sum, r) => sum + r.count, 0) || 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Live Poll</h3>

      {userRole === 'TEACHER' && !poll && (
        <div className="space-y-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Enter poll question..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={e => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }}
              placeholder={`Option ${i + 1}`}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          ))}
          <div className="flex gap-2">
            <button
              onClick={() => setOptions([...options, ''])}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              + Option
            </button>
            <button
              onClick={createPoll}
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </div>
      )}

      {poll && (
        <div className="space-y-3">
          <p className="font-medium text-slate-900 dark:text-white">{poll.question}</p>

          {poll.options.map((opt, i) => {
            const result = poll.results?.find(r => r.optionIndex === i);
            const count = result?.count || 0;
            const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isSelected = poll.userVote === i;

            return (
              <button
                key={i}
                onClick={() => vote(i)}
                disabled={poll.userVote !== null || voting}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                } ${poll.userVote !== null ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                  {poll.userVote !== null && (
                    <span className="text-xs font-bold text-indigo-600">{Math.round(pct)}%</span>
                  )}
                </div>
                {poll.userVote !== null && (
                  <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}

          <p className="text-xs text-slate-500">{totalVotes} votes</p>
        </div>
      )}

      {!poll && userRole === 'STUDENT' && (
        <p className="text-sm text-slate-500 text-center py-4">No active poll. Waiting for teacher to start one...</p>
      )}
    </div>
  );
}
