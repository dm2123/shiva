import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import Link from 'next/link';
import Leaderboard from '@/components/gamification/Leaderboard';
import XPDisplay from '@/components/gamification/XPDisplay';
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
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Watch lectures',
    description: 'Complete lectures in your courses.',
    href: '/app/my-courses',
    icon: IconBook,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    title: 'Keep your streak',
    description: 'Study daily to build XP streaks.',
    href: '/app/streak',
    icon: IconZap,
    gradient: 'from-amber-500 to-orange-500',
  },
];

export default async function LeaderboardPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero header (PW-style) ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-6 md:p-8 text-white">
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/15 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-yellow-300/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <IconAward size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Leaderboard</h1>
              <p className="text-[13px] text-orange-100 mt-0.5">
                Compete, earn XP and climb the ranks
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <IconTarget size={18} className="text-white" />
            </div>
            <p className="text-[13px] text-orange-50 leading-relaxed">
              Rankings are based on XP earned from tests, lectures, daily
              practice and study streaks. The more consistently you learn, the
              higher you climb.
            </p>
          </div>
        </div>
      </div>

      {/* ── Your XP ────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--student-text)] mb-3">Your progress</h2>
        <XPDisplay />
      </section>

      {/* ── Rankings ───────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--student-text)] mb-3">Top learners</h2>
        <Leaderboard />
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
                    className="text-[var(--student-text-faint)] group-hover:text-[var(--student-primary)] group-hover:translate-x-0.5 transition-all"
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
