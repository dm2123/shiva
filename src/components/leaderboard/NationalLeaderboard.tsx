'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * THE SHIVA XP Leaderboard.
 *
 * Data sirf asal API se: GET /api/student/leaderboard
 *   -> { success, data: { leaderboard: [{ studentId, name, totalXP, userRank }],
 *                         me: { totalXP, userRank } } }
 * (LeaderboardCache + StudentProfiles par based hai — koi static ya
 * andaz wala data nahi. Khali ho to honest empty state dikhta hai.)
 */

interface LeaderboardEntry {
  studentId: string;
  name: string;
  totalXP: number;
  userRank: number;
}

interface MyRank {
  totalXP: number;
  userRank: number;
}

interface NationalLeaderboardProps {
  courseId?: string;
  currentUserId?: string;
}

function rankBadge(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return String(rank);
}

function rankRowClasses(rank: number, isMe: boolean) {
  if (isMe) return 'border-[#6d28d9] bg-[#6d28d9]/5 ring-1 ring-[#6d28d9]/40';
  if (rank === 1) return 'border-[#f5b942]/60 bg-[#f5b942]/10';
  if (rank === 2) return 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50';
  if (rank === 3) return 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10';
  return 'border-[var(--student-border-light)] bg-[var(--student-surface)]';
}

export default function NationalLeaderboard({ courseId, currentUserId }: NationalLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const url = courseId
          ? `/api/student/leaderboard?courseId=${encodeURIComponent(courseId)}`
          : '/api/student/leaderboard';
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setEntries(
            (data.data.leaderboard || []).map((e: any) => ({
              studentId: String(e.studentId),
              name: e.name || 'Student',
              totalXP: Number(e.totalXP || 0),
              userRank: Number(e.userRank || 0),
            }))
          );
          setMe(
            data.data.me
              ? { totalXP: Number(data.data.me.totalXP || 0), userRank: Number(data.data.me.userRank || 0) }
              : null
          );
        } else {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="student-card p-4 animate-pulse flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--student-surface-hover)]" />
            <div className="flex-1">
              <div className="h-3.5 w-1/3 rounded bg-[var(--student-surface-hover)]" />
            </div>
            <div className="h-3.5 w-14 rounded bg-[var(--student-surface-hover)]" />
          </div>
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="student-card p-8 text-center">
        <p className="text-sm font-bold text-[var(--student-text)]">Leaderboard abhi load nahi ho paya</p>
        <p className="text-xs text-[var(--student-text-muted)] mt-1">Thodi der me dobara try karo — tumhara XP aur rank safe hai.</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="student-card p-8 md:p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#6d28d9]/15 to-[#f5b942]/20 flex items-center justify-center text-3xl">
          🏆
        </div>
        <p className="text-base font-bold text-[var(--student-text)] mt-4">Abhi koi attempt nahi hai — pehle test dekar rank banao</p>
        <p className="text-sm text-[var(--student-text-muted)] mt-1.5 max-w-md mx-auto leading-relaxed">
          Jaise hi students tests aur practice se XP kamayenge, asal ranks yahan dikhengi.
          Pehla test dekar leaderboard ki shuruaat tum hi karo.
        </p>
        <Link
          href="/app/tests"
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#2a1650] text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Pehla Test Do
        </Link>
      </div>
    );
  }

  const myEntryInList = currentUserId ? entries.some((e) => e.studentId === currentUserId) : false;

  return (
    <div className="space-y-4">
      {/* My rank — asal API ke `me` block se */}
      {me && (
        <div className="rounded-2xl bg-gradient-to-r from-[#2a1650] to-[#6d28d9] p-5 text-white flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Your Rank</p>
            <p className="text-3xl font-black mt-0.5">
              {me.totalXP > 0 ? `#${me.userRank}` : '—'}
            </p>
            {me.totalXP <= 0 && (
              <p className="text-[11px] text-white/70 mt-1">Abhi XP nahi kamaaya — pehla test dekar rank banao.</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Total XP</p>
            <p className="text-3xl font-black mt-0.5 text-[#f5b942]">{me.totalXP.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {entries.map((entry) => {
          const isMe = !!currentUserId && entry.studentId === currentUserId;
          return (
            <div
              key={entry.studentId}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${rankRowClasses(entry.userRank, isMe)}`}
            >
              <div className="w-9 h-9 rounded-full bg-[var(--student-surface-hover)] border border-[var(--student-border-light)] flex items-center justify-center text-sm font-black text-[var(--student-text)] flex-shrink-0">
                {rankBadge(entry.userRank)}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {entry.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--student-text)] truncate">
                  {entry.name}
                  {isMe && (
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6d28d9] text-white uppercase tracking-wider align-middle">
                      You
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-[var(--student-text-faint)]">Rank #{entry.userRank}</p>
              </div>
              <p className="text-sm font-black text-[var(--student-text)] flex-shrink-0">
                {entry.totalXP.toLocaleString('en-IN')}
                <span className="text-[10px] font-bold text-[#b8860b] dark:text-[#f5b942] ml-1">XP</span>
              </p>
            </div>
          );
        })}
      </div>

      {me && me.totalXP > 0 && !myEntryInList && currentUserId && (
        <p className="text-[11px] text-[var(--student-text-faint)] text-center">
          Tum top {entries.length} ke bahar ho — aur XP kama kar list me aao.
        </p>
      )}
    </div>
  );
}
