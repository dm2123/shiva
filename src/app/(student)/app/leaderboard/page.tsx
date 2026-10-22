import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import Link from 'next/link';
import NationalLeaderboard from '@/components/leaderboard/NationalLeaderboard';
import XPDisplay from '@/components/gamification/XPDisplay';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconAward,
  IconZap,
  IconClipboard,
  IconBook,
  IconTarget,
  IconArrowRight,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

// All links point to pages that exist in the student portal
const EARN_XP = [
  {
    title: 'Attempt tests',
    description: 'Score high in test series to earn big XP.',
    href: '/app/tests',
    icon: IconClipboard,
    gradient: 'from-[#6d28d9] to-[#2a1650]',
  },
  {
    title: 'Watch lectures',
    description: 'Complete lectures in your courses.',
    href: '/app/my-courses',
    icon: IconBook,
    gradient: 'from-violet-500 to-purple-700',
  },
  {
    title: 'Keep your streak',
    description: 'Study daily to build XP streaks.',
    href: '/app/streak',
    icon: IconZap,
    gradient: 'from-[#f5b942] to-amber-600',
  },
];

interface TestRankRow {
  studentId: string;
  name: string;
  attempts: number;
  totalScore: number;
  bestScore: number;
}

const PODIUM: Record<number, { badge: string; ring: string }> = {
  1: { badge: '🥇', ring: 'border-[#f5b942]/70 bg-[#f5b942]/10' },
  2: { badge: '🥈', ring: 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50' },
  3: { badge: '🥉', ring: 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10' },
};

export default async function LeaderboardPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  // ── Test Leaderboard: sirf asal submitted attempts se ────
  // Rank = saare EVALUATED/COMPLETED attempts ke total score par.
  let testRanks: TestRankRow[] = [];
  let myTestRank: (TestRankRow & { rank: number }) | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT a.studentId AS studentId,
              sp.name AS name,
              COUNT(*) AS attempts,
              SUM(a.score) AS totalScore,
              MAX(a.score) AS bestScore
         FROM AssessmentAttempts a
         LEFT JOIN StudentProfiles sp ON sp.userId = a.studentId
        WHERE a.status IN ('EVALUATED', 'COMPLETED')
        GROUP BY a.studentId, sp.name
        ORDER BY totalScore DESC, attempts DESC
        LIMIT 50`
    );
    testRanks = (rows || []).map((r: any) => ({
      studentId: String(r.studentId),
      name: r.name || 'Student',
      attempts: Number(r.attempts || 0),
      totalScore: Number(r.totalScore || 0),
      bestScore: Number(r.bestScore || 0),
    }));

    const myIdx = testRanks.findIndex((r) => r.studentId === session.userId);
    if (myIdx >= 0) {
      myTestRank = { ...testRanks[myIdx], rank: myIdx + 1 };
    } else {
      // Top-50 ke bahar hai to asal rank count karke nikalo
      const [mine]: any = await mysqlPool.query(
        `SELECT COUNT(*) AS attempts, COALESCE(SUM(score), 0) AS totalScore, COALESCE(MAX(score), 0) AS bestScore
           FROM AssessmentAttempts
          WHERE studentId = ? AND status IN ('EVALUATED', 'COMPLETED')`,
        [session.userId]
      );
      const myAgg = mine?.[0];
      if (myAgg && Number(myAgg.attempts) > 0) {
        const [above]: any = await mysqlPool.query(
          `SELECT COUNT(*) AS n FROM (
             SELECT studentId, SUM(score) AS ts FROM AssessmentAttempts
              WHERE status IN ('EVALUATED', 'COMPLETED')
              GROUP BY studentId HAVING ts > ?
           ) better`,
          [Number(myAgg.totalScore)]
        );
        myTestRank = {
          studentId: session.userId,
          name: 'You',
          attempts: Number(myAgg.attempts),
          totalScore: Number(myAgg.totalScore),
          bestScore: Number(myAgg.bestScore),
          rank: Number(above?.[0]?.n || 0) + 1,
        };
      }
    }
  } catch { /* attempts table best-effort — page baaki sections ke saath chalegi */ }

  return (
    <div className="space-y-6 pb-8">
      {/* ── Shaant header (andar ke pages ka standard) ─────── */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center flex-shrink-0">
            <IconAward size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--student-text)] tracking-tight">Leaderboard</h1>
            <p className="text-sm text-[var(--student-text-muted)] mt-0.5">
              Asal attempts aur XP par based ranks — mehnat dikhegi, naam chamkega
            </p>
          </div>
        </div>

        <div className="student-card mt-5 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6d28d9]/10 flex items-center justify-center flex-shrink-0">
            <IconTarget size={18} className="text-[#6d28d9]" />
          </div>
          <p className="text-[13px] text-[var(--student-text-muted)] leading-relaxed">
            Test Leaderboard tumhare submitted test attempts ke total score par banta hai,
            aur XP Leaderboard lectures, practice aur streaks se mile XP par. Dono me sirf
            asal performance ginti hai.
          </p>
        </div>

        {myTestRank && (
          <div className="mt-4 grid grid-cols-3 gap-3 md:gap-5">
            <div className="student-card px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--student-text-faint)]">Your Test Rank</p>
              <p className="text-xl font-black text-[#6d28d9] mt-0.5">#{myTestRank.rank}</p>
            </div>
            <div className="student-card px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--student-text-faint)]">Total Test Score</p>
              <p className="text-xl font-black text-[var(--student-text)] mt-0.5">{myTestRank.totalScore}</p>
            </div>
            <div className="student-card px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--student-text-faint)]">Tests Given</p>
              <p className="text-xl font-black text-[var(--student-text)] mt-0.5">{myTestRank.attempts}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Your XP ────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--student-text)] mb-3">Your progress</h2>
        <XPDisplay />
      </section>

      {/* ── Test Leaderboard (asal attempts) ───────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--student-text)] mb-1">Test Leaderboard</h2>
        <p className="text-xs text-[var(--student-text-muted)] mb-3">
          Submitted test attempts ke total score par rank — best score tie-break jaisa dikhaya gaya hai.
        </p>

        {testRanks.length === 0 ? (
          <StudentEmptyState
            icon={<IconAward size={22} />}
            title="Abhi koi attempt nahi hai — pehle test dekar rank banao"
            description="Abhi tak kisi student ne koi test submit nahi kiya. Pehla test submit karte hi tum seedha Rank #1 par hoge."
            actionText="Test Series Kholo"
            actionHref="/app/tests"
            secondaryActionText="Practice Se Shuru Karo"
            secondaryActionHref="/app/practice"
          />
        ) : (
          <div className="space-y-2">
            {testRanks.map((row, i) => {
              const rank = i + 1;
              const isMe = row.studentId === session.userId;
              const podium = PODIUM[rank];
              return (
                <div
                  key={row.studentId}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
                    isMe
                      ? 'border-[#6d28d9] bg-[#6d28d9]/5 ring-1 ring-[#6d28d9]/40'
                      : podium
                        ? podium.ring
                        : 'border-[var(--student-border-light)] bg-[var(--student-surface)]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--student-surface-hover)] border border-[var(--student-border-light)] flex items-center justify-center text-sm font-black text-[var(--student-text)] flex-shrink-0">
                    {podium ? podium.badge : rank}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {row.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--student-text)] truncate">
                      {row.name}
                      {isMe && (
                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6d28d9] text-white uppercase tracking-wider align-middle">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[var(--student-text-faint)]">
                      {row.attempts} test{row.attempts !== 1 ? 's' : ''} · Best {row.bestScore}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-[var(--student-text)]">{row.totalScore}</p>
                    <p className="text-[10px] font-bold text-[var(--student-text-faint)] uppercase tracking-wider">Total Score</p>
                  </div>
                </div>
              );
            })}
            {myTestRank && !testRanks.some((r) => r.studentId === session.userId) && (
              <p className="text-[11px] text-[var(--student-text-faint)] text-center pt-1">
                Tumhari rank #{myTestRank.rank} hai ({myTestRank.totalScore} total score) — top {testRanks.length} me aane ke liye aur tests do.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── XP Leaderboard (asal XP API) ───────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--student-text)] mb-1">XP Leaderboard</h2>
        <p className="text-xs text-[var(--student-text-muted)] mb-3">
          Tests, lectures, DPP aur streaks se kamaaye gaye kul XP par rank.
        </p>
        <NationalLeaderboard currentUserId={session.userId} />
      </section>

      {/* ── How to earn XP ─────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--student-text)] mb-3">How to earn XP</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EARN_XP.map((e) => {
            const EarnIcon = e.icon;
            return (
              <Link
                key={e.href}
                href={e.href}
                className="student-card p-5 group block hover:-translate-y-0.5 transition-transform"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${e.gradient} flex items-center justify-center mb-4 shadow-sm`}
                >
                  <EarnIcon size={20} className="text-white" />
                </div>
                <p className="text-sm font-bold text-[var(--student-text)] flex items-center gap-1.5">
                  {e.title}
                  <IconArrowRight
                    size={14}
                    className="text-[var(--student-text-faint)] group-hover:text-[#6d28d9] group-hover:translate-x-0.5 transition-all"
                  />
                </p>
                <p className="text-[12px] text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  {e.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
