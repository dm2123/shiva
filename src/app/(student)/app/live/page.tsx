import { StudentPageHeader } from '@/components/student/StudentShared';
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
    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#6d28d9]/10 text-[#6d28d9]">
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

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Live Classes"
        description="Join real-time sessions with your teachers. Missed one? Catch the recording."
      />

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
          {/* Honest live strip — classes hain par is samay koi live nahi */}
          {liveNow.length === 0 && (
            <div className="student-card px-5 py-4 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--student-text-faint)] shrink-0" />
              <p className="text-sm text-[var(--student-text-muted)]">
                <span className="font-bold text-[var(--student-text)]">Abhi koi live class nahi hai.</span>{' '}
                {upcoming.length > 0
                  ? 'Neeche upcoming classes ka asal schedule diya hai — time par Join button yahi milega.'
                  : 'Nayi class schedule hote hi yahan dikhegi.'}
              </p>
            </div>
          )}

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
                    className="student-card overflow-hidden"
                    style={{ borderColor: 'rgba(239,68,68,.35)' }}
                  >
                    <div
                      className="px-5 pt-5 pb-4"
                      style={{ background: 'linear-gradient(135deg, rgba(239,68,68,.10), rgba(168,85,247,.10))' }}
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
                    <div className="p-5 pt-4">
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
                  <Link key={lc.id} href={`/app/live/${lc.id}`} className="student-card p-5 block">
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
                    <p className="flex items-center gap-1.5 text-xs text-[var(--student-text-muted)]">
                      <IconCalendar size={13} />
                      {formatDateTime(lc.scheduledStartAt)}
                    </p>
                    {startsInLabel(lc.scheduledStartAt) && (
                      <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#f5b942]/15 px-2.5 py-1 text-[11px] font-bold text-[#92600a]">
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
              <h2 className="text-lg font-bold text-[var(--student-text)] mb-4">Recordings</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ended.map((lc: any) => (
                  <Link key={lc.id} href={`/app/live/${lc.id}`} className="student-card p-5 block opacity-90">
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={lc.status} />
                      {lc.recordingUrl ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
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
