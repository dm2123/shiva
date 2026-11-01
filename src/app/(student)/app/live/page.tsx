import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconRadio, IconPlay, IconCalendar, IconClock } from '@/components/student/StudentIcons';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { listStudentLiveClasses } from '@/services/live-class.service';
import Link from 'next/link';
import { redirect } from 'next/navigation';

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/** Honest relative label from the real scheduled time — no invented data. */
function startsInLabel(iso: string): string | null {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(diffMs)) return null;
  if (diffMs <= 0) return 'Shuru hone wala hai';
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins} min me shuru`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60 > 0 ? `${mins % 60}m ` : ''}me shuru`;
  const days = Math.floor(hours / 24);
  return `${days} din me shuru`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Live
      </span>
    );
  }
  if (status === 'ENDED') {
    return (
      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--student-surface-hover)] text-[var(--student-text-faint)]">
        Ended
      </span>
    );
  }
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#6d28d9]/10 text-[#6d28d9] dark:text-[#a78bfa]">
      Upcoming
    </span>
  );
}

export default async function LiveClassesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  const liveClasses = await listStudentLiveClasses(session.userId);

  const byStartAsc = (a: any, b: any) =>
    new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime();
  const byStartDesc = (a: any, b: any) => -byStartAsc(a, b);
  // Live pehle, upcoming sabse pehle shuru hone wali pehle, past sabse recent pehle
  const liveNow = liveClasses.filter((c: any) => c.status === 'LIVE').sort(byStartAsc);
  const upcoming = liveClasses
    .filter((c: any) => c.status === 'SCHEDULED' || c.status === 'UPCOMING')
    .sort(byStartAsc);
  const ended = liveClasses.filter((c: any) => c.status === 'ENDED').sort(byStartDesc);

  const nextClass = upcoming[0];

  return (
    <div className="space-y-8">
      {/* ── Hero band (brand deep-purple, PW-style) ─────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white"
        style={{ background: 'linear-gradient(120deg, #2a1650 0%, #4c1d95 55%, #6d28d9 100%)' }}
      >
        <div
          className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#f5b942]/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <IconRadio size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Live Classes</h1>
              <p className="text-[13px] text-violet-200 mt-0.5">
                Join real-time sessions with your teachers. Missed one? Catch the recording.
              </p>
            </div>
          </div>

          {/* Asal status line — sirf wahi jo data me hai */}
          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {liveNow.length > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {liveNow.length} class{liveNow.length > 1 ? 'es' : ''} live now
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-violet-300" />
                Abhi koi class live nahi hai
              </span>
            )}
            {nextClass && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-violet-100">
                <IconClock size={13} className="text-[#f5b942]" />
                Agli class: {nextClass.title}
                {startsInLabel(nextClass.scheduledStartAt)
                  ? ` · ${startsInLabel(nextClass.scheduledStartAt)}`
                  : ` · ${formatDateTime(nextClass.scheduledStartAt)}`}
              </span>
            )}
            {ended.length > 0 && (
              <Link
                href="/app/recordings"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5b942] text-[#2a1650] px-3.5 py-1.5 text-xs font-extrabold hover:opacity-90 transition-opacity"
              >
                <IconPlay size={13} />
                Recordings dekho
              </Link>
            )}
          </div>
        </div>
      </div>

      {liveClasses.length === 0 ? (
        <StudentEmptyState
          icon={<IconRadio size={22} />}
          title="Abhi koi live class nahi hai"
          description="Is samay koi live ya upcoming class scheduled nahi hai. Jab tumhare teachers live class schedule karenge, wo yahan dikhegi. Tab tak courses explore karo ya purani recordings dekho."
          actionText="Browse Courses"
          actionHref="/app/courses"
          secondaryActionText="View Recordings"
          secondaryActionHref="/app/recordings"
          variant="large"
        />
      ) : (
        <>
          {/* Live Now */}
          {liveNow.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--student-text)] mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {liveNow.map((lc: any) => (
                  <div
                    key={lc.id}
                    className="student-card overflow-hidden relative"
                    style={{ borderColor: 'rgba(239,68,68,.35)' }}
                  >
                    <span
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 to-[#6d28d9]"
                      aria-hidden="true"
                    />
                    <div
                      className="px-5 pt-5 pb-4 pl-6"
                      style={{ background: 'linear-gradient(135deg, rgba(239,68,68,.10), rgba(109,40,217,.10))' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <StatusBadge status={lc.status} />
                        {lc.classType && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)]">
                            {lc.classType}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-[var(--student-text)] leading-snug">
                        {lc.title}
                      </h3>
                      {lc.courseTitle && (
                        <p className="text-xs text-[var(--student-text-muted)] mt-1">{lc.courseTitle}</p>
                      )}
                      {lc.actualStartedAt && (
                        <p className="flex items-center gap-1.5 text-[11px] font-medium text-red-500 mt-1.5">
                          <IconClock size={11} />
                          Started {formatDateTime(lc.actualStartedAt)}
                        </p>
                      )}
                    </div>
                    <div className="p-5 pt-4 pl-6">
                      {lc.description && (
                        <p className="text-sm text-[var(--student-text-muted)] line-clamp-2 mb-4">
                          {lc.description}
                        </p>
                      )}
                      <Link
                        href={`/app/live/${lc.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white text-sm font-extrabold hover:bg-red-600 transition-colors"
                      >
                        <IconPlay size={15} />
                        Join Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--student-text)] mb-4">Upcoming</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map((lc: any) => (
                  <Link
                    key={lc.id}
                    href={`/app/live/${lc.id}`}
                    className="student-card p-5 pl-6 block relative overflow-hidden"
                  >
                    <span
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#6d28d9] to-[#2a1650]"
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={lc.status} />
                      {lc.classType && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)]">
                          {lc.classType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-bold text-[var(--student-text)] leading-snug mb-2">
                      {lc.title}
                    </h3>
                    {lc.courseTitle && (
                      <p className="text-xs text-[var(--student-text-faint)] mb-1.5">{lc.courseTitle}</p>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-[var(--student-text-muted)]">
                      <IconCalendar size={13} />
                      {formatDateTime(lc.scheduledStartAt)}
                    </p>
                    {startsInLabel(lc.scheduledStartAt) && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#f5b942]/15 px-2.5 py-1 text-[11px] font-bold text-[#92600a] dark:text-[#f5b942]">
                        <IconClock size={11} />
                        {startsInLabel(lc.scheduledStartAt)}
                      </p>
                    )}
                    {lc.description && (
                      <p className="text-xs text-[var(--student-text-faint)] line-clamp-2 mt-2">
                        {lc.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-[var(--student-primary)]">
                      View Details
                      <span aria-hidden>→</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recordings — khatm hui classes; recording sirf tab jab asal URL hai */}
          {ended.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-[var(--student-text)] mb-4">Past Classes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ended.map((lc: any) => (
                  <Link
                    key={lc.id}
                    href={`/app/live/${lc.id}`}
                    className="student-card p-5 pl-6 block relative overflow-hidden opacity-90"
                  >
                    <span
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--student-border-strong)]"
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={lc.status} />
                      {lc.recordingUrl ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Recording ready
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[var(--student-surface-hover)] text-[var(--student-text-faint)]">
                          Recording pending
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-bold text-[var(--student-text)] leading-snug mb-2">
                      {lc.title}
                    </h3>
                    {lc.courseTitle && (
                      <p className="text-xs text-[var(--student-text-faint)] mb-1.5">{lc.courseTitle}</p>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-[var(--student-text-muted)]">
                      <IconClock size={13} />
                      {formatDateTime(lc.scheduledStartAt)}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-[var(--student-primary)]">
                      {lc.recordingUrl ? 'Watch Recording' : 'Recording jald aayegi'}
                      <span aria-hidden>→</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recordings CTA */}
          <Link
            href="/app/recordings"
            className="student-card p-5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2a1650 0%, #6d28d9 100%)' }}
              >
                <IconPlay size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--student-text)]">All Recordings</p>
                <p className="text-xs text-[var(--student-text-muted)]">
                  Missed a class? Watch it anytime.
                </p>
              </div>
            </div>
            <span className="text-[var(--student-primary)] font-bold" aria-hidden>→</span>
          </Link>
        </>
      )}
    </div>
  );
}
