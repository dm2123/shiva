'use client';

import { useState, useEffect } from 'react';

const TASK_ICONS: Record<string, string> = {
  STUDY: '📖', PRACTICE: '✏️', REVISION: '🔄', TEST: '📝', DPP: '📋', PYQ: '📚'
};
const TASK_COLORS: Record<string, string> = {
  STUDY: 'bg-blue-50 text-blue-700 border-blue-200',
  PRACTICE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REVISION: 'bg-amber-50 text-amber-700 border-amber-200',
  TEST: 'bg-purple-50 text-purple-700 border-purple-200',
  DPP: 'bg-rose-50 text-rose-700 border-rose-200',
  PYQ: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-500',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  SKIPPED: 'bg-red-100 text-red-500',
};
const PACE_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  AGGRESSIVE: { label: 'Aggressive', desc: '10-12 hrs/day', color: 'bg-red-100 text-red-700' },
  MODERATE: { label: 'Moderate', desc: '6-8 hrs/day', color: 'bg-blue-100 text-blue-700' },
  RELAXED: { label: 'Relaxed', desc: '4-5 hrs/day', color: 'bg-green-100 text-green-700' },
};

export default function Tracker360Page() {
  const [data, setData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = () => {
    fetch(`/api/student/tracker-360?date=${selectedDate}`).then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const updateTask = async (taskId: string, status: string, planId: string) => {
    setUpdating(taskId);
    await fetch('/api/student/tracker-360', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_task', taskId, planId, status })
    });
    fetchData();
    setUpdating(null);
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading Tracker 360...</div>;

  const { plan, todayTasks, stats, reviews } = data || {};

  // Generate week dates for selector
  const weekDates = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tracker 360</h1>
          <p className="text-sm text-slate-500 mt-1">Personalized daily study planner</p>
        </div>
        {plan && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${PACE_LABELS[plan.pace]?.color || 'bg-slate-100'}`}>
            {PACE_LABELS[plan.pace]?.label} • {plan.dailyStudyHours}h/day
          </span>
        )}
      </div>

      {!plan ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-bold text-slate-900">No active study plan</p>
          <p className="text-sm text-slate-500 mt-1">Create a personalized plan to start tracking</p>
        </div>
      ) : (
        <>
          {/* Plan Info Bar */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-black">{plan.name}</h2>
                <p className="text-xs opacity-80">{plan.targetExam} • {plan.pace} pace</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{stats?.completionPercent || plan.completionPercent}%</p>
                <p className="text-xs opacity-80">Complete</p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${stats?.completionPercent || plan.completionPercent}%` }}></div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-lg font-black">{stats?.currentStreak || 0}</p>
                <p className="text-[10px] opacity-70">Day Streak</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-lg font-black">{stats?.completedToday || 0}/{stats?.totalToday || 0}</p>
                <p className="text-[10px] opacity-70">Today</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-lg font-black">{stats?.totalMinutesToday || 0}m</p>
                <p className="text-[10px] opacity-70">Studied</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-lg font-black">{plan.totalDays}</p>
                <p className="text-[10px] opacity-70">Total Days</p>
              </div>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weekDates.map(d => {
              const date = new Date(d);
              const isToday = d === new Date().toISOString().split('T')[0];
              const isSelected = d === selectedDate;
              const dayTasks = data?.tasks?.filter((t: any) => new Date(t.taskDate).toISOString().split('T')[0] === d) || [];
              const completedCount = dayTasks.filter((t: any) => t.status === 'COMPLETED').length;
              return (
                <button key={d} onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                    isSelected ? 'bg-indigo-600 text-white shadow-lg' :
                    isToday ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200' :
                    'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200'
                  }`}>
                  <p className="text-[10px] font-bold uppercase">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                  <p className="text-lg font-black">{date.getDate()}</p>
                  {dayTasks.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {dayTasks.map((t: any, i: number) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'COMPLETED' ? 'bg-emerald-400' :
                          t.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-slate-300'
                        }`}></span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tasks for Selected Date */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">
              Tasks for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {todayTasks?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-slate-400 font-medium">No tasks for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks?.map((task: any) => (
                  <div key={task.id} className={`bg-white rounded-2xl border p-4 transition-all ${
                    task.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:shadow-md'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: task.status === 'COMPLETED' ? '#d1fae5' : '#f1f5f9' }}>
                        {task.status === 'COMPLETED' ? '✅' : TASK_ICONS[task.taskType] || '📖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TASK_COLORS[task.taskType] || 'bg-slate-50'}`}>
                            {task.taskType}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className={`text-sm font-bold ${task.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                          {task.subjectName && <span>{task.subjectName}</span>}
                          {task.chapterName && <span>• {task.chapterName}</span>}
                          <span>• {task.estimatedMinutes} min</span>
                        </div>
                      </div>
                      {task.status !== 'COMPLETED' && task.status !== 'SKIPPED' && (
                        <div className="flex gap-1 flex-shrink-0">
                          {task.status === 'PENDING' && (
                            <button onClick={() => updateTask(task.id, 'IN_PROGRESS', plan.id)}
                              className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg hover:bg-amber-100">
                              Start
                            </button>
                          )}
                          <button onClick={() => updateTask(task.id, 'COMPLETED', plan.id)}
                            disabled={updating === task.id}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg hover:bg-emerald-100 disabled:opacity-50">
                            {updating === task.id ? '...' : 'Done'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Reviews */}
          {reviews?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Weekly Reviews</h3>
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-700">
                        {new Date(r.weekStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(r.weekEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={`text-sm ${star <= r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-2">
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{r.tasksCompleted}/{r.tasksPlanned}</p>
                        <p className="text-[10px] text-slate-400">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{r.totalStudyMinutes}m</p>
                        <p className="text-[10px] text-slate-400">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{r.avgDailyMinutes}m</p>
                        <p className="text-[10px] text-slate-400">Avg/Day</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{r.streakDays}</p>
                        <p className="text-[10px] text-slate-400">Streak</p>
                      </div>
                    </div>
                    {r.aiRecommendation && (
                      <div className="mt-2 p-2 bg-indigo-50 rounded-lg">
                        <p className="text-[10px] font-bold text-indigo-700 mb-0.5">AI Recommendation</p>
                        <p className="text-xs text-indigo-600">{r.aiRecommendation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
