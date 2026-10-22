'use client';

import { useState } from 'react';
import Link from 'next/link';
import LiveStream from '@/components/live/LiveStream';
import LiveChat from '@/components/live/LiveChat';
import LivePolls from '@/components/live/LivePolls';
import HandRaise from '@/components/live/HandRaise';
import InstructorRating from '@/components/live/InstructorRating';
import { IconPlay, IconCalendar, IconClock } from '@/components/student/StudentIcons';

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
  if (status === 'CANCELLED') {
    return (
      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/10 text-red-500">
        Cancelled
      </span>
    );
  }
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#6d28d9]/10 text-[#6d28d9]">
      Upcoming
    </span>
  );
}

function fmt(iso?: string | null): string {
  if (!iso) return '';
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
    return '';
  }
}

interface StudentLiveViewProps {
  liveClass: any;
  studentId: string;
  studentEmail: string;
}

export default function StudentLiveView({ liveClass, studentId, studentEmail }: StudentLiveViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'polls' | 'hands'>('chat');
  const roomId = liveClass.id;

  const startLabel = fmt(liveClass.startTime || liveClass.scheduledStartAt);
  const endLabel = fmt(liveClass.scheduledEndAt);
  const isLive = liveClass.status === 'LIVE';
  const isUpcoming = liveClass.status === 'SCHEDULED' || liveClass.status === 'UPCOMING';
  const isEnded = liveClass.status === 'ENDED';
  const isCancelled = liveClass.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/app/live"
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--student-primary)] mb-2"
        >
          <span aria-hidden>←</span> All Live Classes
        </Link>
        <h1 className="text-2xl font-extrabold text-[var(--student-text)]">{liveClass.title}</h1>
        <p className="text-sm text-[var(--student-text-muted)] mt-1 flex items-center gap-2 flex-wrap">
          {liveClass.courseTitle && <span>{liveClass.courseTitle}</span>}
          <StatusBadge status={liveClass.status} />
          {isUpcoming && startLabel && (
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <IconCalendar size={12} /> {startLabel}
            </span>
          )}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isLive ? (
            <div className="student-card overflow-hidden">
              <LiveStream roomId={roomId} displayName={studentEmail.split('@')[0]} isTeacher={false} />
            </div>
          ) : (
            <div
              className="aspect-video rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2a1650 0%, #4c1d95 60%, #6d28d9 100%)' }}
            >
              <div className="text-center px-6">
                {isUpcoming ? (
                  <>
                    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <IconCalendar size={26} className="text-white" />
                    </div>
                    <p className="text-white text-lg font-extrabold">Class not started yet</p>
                    {startLabel && (
                      <p className="text-violet-200 text-sm mt-2">Scheduled: {startLabel}</p>
                    )}
                    <p className="text-violet-300/70 text-xs mt-1">
                      Class shuru hote hi yahan stream aur Join option dikhega — usse pehle join nahi ho sakta.
                    </p>
                  </>
                ) : isCancelled ? (
                  <>
                    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <IconClock size={26} className="text-white" />
                    </div>
                    <p className="text-white text-lg font-extrabold">Ye class cancel ho gayi hai</p>
                    <p className="text-violet-300/70 text-xs mt-2">
                      Teacher ne ye class cancel kar di hai. Nayi timing schedule hote hi Live Classes page par dikhegi.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <IconClock size={26} className="text-white" />
                    </div>
                    <p className="text-white text-lg font-extrabold">Class has ended</p>
                    {liveClass.recordingUrl ? (
                      <a
                        href={liveClass.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#f5b942] text-[#2a1650] text-sm font-extrabold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        <IconPlay size={15} />
                        Watch Recording
                      </a>
                    ) : (
                      <p className="text-violet-300/70 text-xs mt-2">
                        Recording abhi available nahi hai — upload hote hi yahan aur Recordings page par milegi.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tabs — chat/polls/hand-raise class LIVE hone par hi asal kaam karte hain */}
          {isUpcoming || isCancelled ? (
            <div className="student-card p-6 text-center">
              <p className="text-sm font-bold text-[var(--student-text)]">
                {isCancelled ? 'Class cancel ho gayi hai' : 'Chat, Polls aur Hand Raise class live hone par khulenge'}
              </p>
              <p className="text-xs text-[var(--student-text-muted)] mt-1.5">
                {isCancelled
                  ? 'Is class ke panels ab available nahi hain.'
                  : 'Abhi class shuru nahi hui hai — live hote hi tum yahan sawal pooch sakoge aur polls me hissa le sakoge.'}
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex gap-1 rounded-2xl p-1.5"
                style={{ background: 'var(--student-surface-hover)' }}
                role="tablist"
                aria-label="Class panels"
              >
                {(['chat', 'polls', 'hands'] as const).map(tab => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      activeTab === tab
                        ? 'bg-[var(--student-surface)] text-[#6d28d9] shadow-sm'
                        : 'text-[var(--student-text-faint)] hover:text-[var(--student-text-muted)]'
                    }`}
                  >
                    {tab === 'chat' ? 'Chat' : tab === 'polls' ? 'Polls' : 'Hand Raise'}
                  </button>
                ))}
              </div>

              <div className="h-96 student-card overflow-hidden">
                {activeTab === 'chat' && <LiveChat liveClassId={roomId} userRole="STUDENT" />}
                {activeTab === 'polls' && <LivePolls liveClassId={roomId} userRole="STUDENT" />}
                {activeTab === 'hands' && (
                  <HandRaise liveClassId={roomId} userRole="STUDENT" userId={studentId} />
                )}
              </div>
            </>
          )}

          {/* Class khatm hone ke baad asal rating — koi pehle se bhara score nahi */}
          {isEnded && (
            <InstructorRating liveClassId={roomId} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="student-card p-5">
            <h3 className="font-extrabold text-[var(--student-text)] mb-3 text-sm">Class Details</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-2 items-center">
                <dt className="text-[var(--student-text-muted)]">Status</dt>
                <dd><StatusBadge status={liveClass.status} /></dd>
              </div>
              {startLabel && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--student-text-muted)]">Starts</dt>
                  <dd className="font-bold text-[var(--student-text)] text-right">{startLabel}</dd>
                </div>
              )}
              {endLabel && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--student-text-muted)]">Ends</dt>
                  <dd className="font-bold text-[var(--student-text)] text-right">{endLabel}</dd>
                </div>
              )}
              {liveClass.classType && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--student-text-muted)]">Type</dt>
                  <dd className="font-bold text-[var(--student-text)] text-right">{liveClass.classType}</dd>
                </div>
              )}
              {liveClass.courseTitle && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--student-text-muted)]">Course</dt>
                  <dd className="font-bold text-[var(--student-text)] text-right">{liveClass.courseTitle}</dd>
                </div>
              )}
              {isEnded && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--student-text-muted)]">Recording</dt>
                  <dd className="font-bold text-[var(--student-text)] text-right">
                    {liveClass.recordingUrl ? 'Available' : 'Not available yet'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {liveClass.description && (
            <div className="student-card p-5">
              <h3 className="font-extrabold text-[var(--student-text)] mb-2 text-sm">About this class</h3>
              <p className="text-sm text-[var(--student-text-muted)] leading-relaxed">
                {liveClass.description}
              </p>
            </div>
          )}

          <Link href="/app/recordings" className="student-card p-5 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2a1650 0%, #6d28d9 100%)' }}
            >
              <IconPlay size={17} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[var(--student-text)]">All Recordings</p>
              <p className="text-xs text-[var(--student-text-muted)]">Missed classes, anytime</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
