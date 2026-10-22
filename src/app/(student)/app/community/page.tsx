import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import Link from 'next/link';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconUsers,
  IconMessageCircle,
  IconHelpCircle,
  IconBell,
  IconAward,
  IconArrowRight,
  IconShield,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

// Channels link only to pages that exist in the student portal
const CHANNELS = [
  {
    title: 'Ask a Doubt',
    description: 'Stuck on a concept? Get answers from educators.',
    href: '/app/doubts',
    icon: IconHelpCircle,
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  {
    title: 'Announcements',
    description: 'Batch updates, schedules and important notices.',
    href: '/app/announcements',
    icon: IconBell,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    title: 'Leaderboard',
    description: 'See top learners and your XP rank.',
    href: '/app/leaderboard',
    icon: IconAward,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
];

const GUIDELINES = [
  'Be respectful — no abusive language towards anyone.',
  'Ask learning-related questions in Doubts, not here.',
  'Do not share personal contact details publicly.',
  'Report anything inappropriate to support.',
];

export default async function CommunityPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT DISTINCT sp.name, st.email,
            (SELECT GROUP_CONCAT(c2.title SEPARATOR ', ')
               FROM StudentEnrollments e2 JOIN Courses c2 ON e2.courseId = c2.id
              WHERE e2.studentId = e1.studentId AND e2.status = 'ACTIVE') AS courses
       FROM StudentEnrollments e1
       JOIN StudentEnrollments e2 ON e1.batchId = e2.batchId AND e1.batchId IS NOT NULL AND e2.studentId != ?
       JOIN StudentProfiles sp ON e2.studentId = sp.userId
       JOIN Users st ON e2.studentId = st.id
      WHERE e1.studentId = ? AND e1.status = 'ACTIVE'
      ORDER BY sp.name
      LIMIT 60`,
    [session.userId, session.userId]
  );

  const classmates = (rows || []) as any[];

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero header (PW-style) ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-6 md:p-8 text-white">
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-fuchsia-400/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <IconUsers size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Community</h1>
              <p className="text-[13px] text-violet-100 mt-0.5">
                Learn together with your batch mates
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <IconUsers size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black leading-none">{classmates.length}</p>
              <p className="text-[11px] text-violet-100 mt-1 uppercase tracking-wider font-semibold">
                Batch mates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Channels ───────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--student-text)] mb-3">
          Community channels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHANNELS.map((c) => {
            const ChannelIcon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="student-card p-5 group block hover:-translate-y-0.5 transition-transform"
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 shadow-sm`}
                >
                  <ChannelIcon size={20} className="text-white" />
                </div>
                <p className="text-sm font-bold text-[var(--student-text)] flex items-center gap-1.5">
                  {c.title}
                  <IconArrowRight
                    size={14}
                    className="text-[var(--student-text-faint)] group-hover:text-[var(--student-primary)] group-hover:translate-x-0.5 transition-all"
                  />
                </p>
                <p className="text-[12px] text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  {c.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Batch mates ────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[var(--student-text)]">Your batch mates</h2>
          {classmates.length > 0 && (
            <span className="text-[11px] font-semibold text-[var(--student-text-faint)]">
              {classmates.length} {classmates.length === 1 ? 'learner' : 'learners'}
            </span>
          )}
        </div>

        {classmates.length === 0 ? (
          <StudentEmptyState
            icon={<IconMessageCircle size={24} />}
            title="No batch mates yet"
            description="Once you join a learning batch, your classmates will appear here so you can learn together."
            actionText="Explore batches"
            actionHref="/app/batches"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classmates.map((c: any) => {
              const initial = (c.name || 'S')[0]?.toUpperCase() || 'S';
              return (
                <div key={c.email} className="student-card p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--student-text)] truncate">
                      {c.name}
                    </p>
                    {c.courses && (
                      <p className="text-[11px] text-[var(--student-text-muted)] truncate mt-0.5">
                        {c.courses}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Guidelines ─────────────────────────────────────── */}
      <section className="student-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--student-primary-light)] flex items-center justify-center">
            <IconShield size={18} className="text-[var(--student-primary)]" />
          </div>
          <h2 className="text-base font-bold text-[var(--student-text)]">
            Community guidelines
          </h2>
        </div>
        <ul className="space-y-2.5">
          {GUIDELINES.map((g, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[var(--student-primary-light)] text-[var(--student-primary)] text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-[13px] text-[var(--student-text-secondary)] leading-relaxed">
                {g}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
