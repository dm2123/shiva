import { StudentPageHeader } from '@/components/student/StudentShared';
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
    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500">
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

  const liveNow = liveClasses.filter((c: any) => c.status === 'LIVE');
  const upcoming = liveClasses.filter((c: any) => c.status === 'SCHEDULED' || c.status === 'UPCOMING');
  const ended = liveClasses.filter((c: any) => c.status === 'ENDED');

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Live Classes"
        description="Join real-time sessions with your teachers. Missed one? Catch the recording."
      />

      {liveClasses.length === 0 ? (
        <div className="student-card p-10 md:p-14 text-center">
          <div
            className="mx-auto mb-5 w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)' }}
          >
            <IconRadio size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-[var(--student-text)] mb-2">
            No live classes scheduled yet
          </h2>
          <p className="text-sm text-[var(--student-text-muted)] max-w-md mx-auto mb-6">
            Jab tumhare teachers live class schedule karenge, wo yahan dikhegi.
            Tab tak courses explore karo ya purani recordings dekho.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/app/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <IconPlay size={15} />
              Browse Courses
            </Link>
            <Link
              href="/app/recordings"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] text-sm font-bold hover:bg-[var(--student-surface-hover)] transition-colors"
            >
              View Recordings
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Live Now */}
          {liveNow.length > 0 && (
            <section>
              <h2 className="text-lg font-extrabold text-[var(--student-text)] mb-4 flex items-center gap-2">
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
              <h2 className="text-lg font-extrabold text-[var(--student-text)] mb-4">Upcoming</h2>
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

          {/* Ended */}
          {ended.length > 0 && (
            <section>
              <h2 className="text-lg font-extrabold text-[var(--student-text)] mb-4">Past Classes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ended.map((lc: any) => (
                  <Link key={lc.id} href={`/app/live/${lc.id}`} className="student-card p-5 block opacity-90">
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={lc.status} />
                    </div>
                    <h3 className="text-[15px] font-bold text-[var(--student-text)] leading-snug mb-2">
                      {lc.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-[var(--student-text-muted)]">
                      <IconClock size={13} />
                      {formatDateTime(lc.scheduledStartAt)}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-[var(--student-primary)]">
                      {lc.recordingUrl ? 'Watch Recording' : 'View Details'}
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
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)' }}
              >
                <IconPlay size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[var(--student-text)]">All Recordings</p>
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
