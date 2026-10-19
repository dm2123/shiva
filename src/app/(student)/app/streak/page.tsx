'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentPageHeader, StudentSection, StudentStatCard } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconFlame,
  IconCheck,
  IconTrophy,
  IconCalendar,
  IconChevronRight,
  IconTarget,
} from '@/components/student/ShivaIcons';

interface StreakDay {
  streakDate: string;
  loginMinutes: number;
}

interface StreakData {
  currentStreak: number;
  totalDays: number;
  streaks: StreakDay[];
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function longestStreak(streaks: StreakDay[]): number {
  if (!streaks.length) return 0;
  const dates = [...new Set(streaks.map((s) => toDateStr(new Date(s.streakDate))))].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const cur = new Date(dates[i]);
    const diff = (cur.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export default function StreakPage() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/student/streak');
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch {
      /* honest empty state below */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/student/streak/checkin', { method: 'POST' });
      const result = await res.json();
      if (result.success) await fetchStreak();
    } catch {
      /* ignore */
    } finally {
      setCheckingIn(false);
    }
  };

  const todayStr = toDateStr(new Date());
  const checkedToday =
    data?.streaks.some((s) => toDateStr(new Date(s.streakDate)) === todayStr) ?? false;

  // Last 35 days (5 rows x 7 cols) — newest last
  const days: { date: string; active: boolean; isToday: boolean; label: string }[] = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = toDateStr(d);
    days.push({
      date: ds,
      active: data?.streaks.some((s) => toDateStr(new Date(s.streakDate)) === ds) ?? false,
      isToday: i === 0,
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    });
  }

  const best = data ? longestStreak(data.streaks) : 0;
  const weekActive = days.slice(-7).filter((d) => d.active).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24">
      <StudentPageHeader
        title="Daily Streak"
        description="Roz login karo, streak badhao. Consistency hi selection dilati hai."
      />

      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading">
          <div className="student-card p-8"><div className="skeleton h-8 w-1/2 mx-auto" /></div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="student-card p-5"><div className="skeleton h-6 w-2/3" /></div>
            ))}
          </div>
        </div>
      ) : !data ? (
        <StudentEmptyState
          icon={<IconFlame size={28} />}
          title="Streak data load nahi hua"
          description="Thodi der baad dobara try karo. Tab tak padhai jaari rakho!"
          actionText="Dashboard par wapas jao"
          actionHref="/app"
        />
      ) : (
        <>
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-500 p-6 md:p-8 text-white shadow-xl shadow-orange-500/20">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-black/10 blur-2xl" />
            <div className="relative flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <IconFlame size={48} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Current Streak</p>
                <p className="text-5xl md:text-6xl font-black tracking-tight leading-none mt-1">
                  {data.currentStreak}
                  <span className="text-xl font-bold ml-2">{data.currentStreak === 1 ? 'din' : 'din'}</span>
                </p>
                <p className="text-white/85 text-sm mt-2">
                  {checkedToday
                    ? 'Aaj ka check-in ho gaya. Kal phir aana!'
                    : 'Aaj ka check-in baaki hai — streak bachao!'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCheckIn}
              disabled={checkedToday || checkingIn}
              className={`relative mt-6 w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
                checkedToday
                  ? 'bg-white/25 text-white cursor-not-allowed'
                  : 'bg-white text-orange-600 hover:bg-orange-50 active:scale-[0.99] shadow-lg'
              }`}
            >
              {checkingIn ? (
                'Check-in ho raha hai...'
              ) : checkedToday ? (
                <span className="inline-flex items-center gap-2"><IconCheck size={16} /> Aaj check-in ho gaya</span>
              ) : (
                <span className="inline-flex items-center gap-2"><IconFlame size={16} /> Aaj ka check-in karo</span>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StudentStatCard
              label="Total active din"
              value={data.totalDays}
              icon={<IconCalendar size={18} />}
            />
            <StudentStatCard
              label="Sabse lambi streak"
              value={best}
              icon={<IconTrophy size={18} />}
            />
            <StudentStatCard
              label="Is hafte active"
              value={`${weekActive}/7`}
              icon={<IconTarget size={18} />}
            />
          </div>

          {/* Calendar */}
          <StudentSection
            title="Pichhle 5 hafte"
            subtitle="Activity calendar"
          >
            <div className="student-card p-5 md:p-6">
              <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-bold text-[var(--student-text-faint)] uppercase">
                    {d}
                  </div>
                ))}
                {days.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.label} — ${day.active ? 'Active' : 'Missed'}`}
                    className={`aspect-square rounded-lg md:rounded-xl flex items-center justify-center transition-all ${
                      day.active
                        ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-sm shadow-orange-500/30'
                        : day.isToday
                        ? 'border-2 border-dashed border-[var(--student-primary)] bg-[var(--student-primary-light)]'
                        : 'bg-[var(--student-surface-hover)]'
                    }`}
                  >
                    {day.active && <IconFlame size={14} className="text-white" />}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-5 mt-4 text-xs text-[var(--student-text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gradient-to-br from-orange-400 to-red-500" /> Active din
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[var(--student-surface-hover)] border border-[var(--student-border-light)]" /> Chhoota din
                </span>
              </div>
            </div>
          </StudentSection>

          {/* Tips */}
          <StudentSection title="Streak banaye rakhne ke nuskhe" subtitle="Chhoti aadatein, bade nateeje">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: <IconCalendar size={20} />, title: 'Roz 10 minute', desc: 'Sirf login hi kaafi nahi — roz thoda padho, streak ke saath knowledge bhi badhegi.' },
                { icon: <IconTarget size={20} />, title: 'Ek lakshya rakho', desc: 'Aaj ka ek chhota target set karo — 1 chapter, 20 questions, ya 1 mock.' },
                { icon: <IconTrophy size={20} />, title: '7-30-100 ka khel', desc: 'Pehle 7 din, phir 30, phir 100 — milestone todne par khud ko shabashi do.' },
              ].map((tip) => (
                <div key={tip.title} className="student-card p-5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--student-primary-light)] text-[var(--student-primary)] flex items-center justify-center mb-3">
                    {tip.icon}
                  </div>
                  <p className="font-bold text-sm text-[var(--student-text)] mb-1">{tip.title}</p>
                  <p className="text-xs text-[var(--student-text-muted)] leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </StudentSection>

          {/* CTA */}
          <Link
            href="/app/my-courses"
            className="flex items-center justify-between student-card p-5 hover:shadow-md transition group"
          >
            <div>
              <p className="font-bold text-[var(--student-text)]">Aaj kuch naya seekho</p>
              <p className="text-xs text-[var(--student-text-muted)] mt-0.5">Apne courses par wapas jao aur streak ko matlab do</p>
            </div>
            <IconChevronRight size={20} className="text-[var(--student-text-faint)] group-hover:text-[var(--student-primary)] group-hover:translate-x-1 transition" />
          </Link>
        </>
      )}
    </div>
  );
}
