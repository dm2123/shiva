'use client';

import { useState } from 'react';
import Link from 'next/link';
import LiveStream from '@/components/live/LiveStream';
import LiveChat from '@/components/live/LiveChat';
import LivePolls from '@/components/live/LivePolls';
import HandRaise from '@/components/live/HandRaise';
import { IconPlay, IconCalendar, IconClock } from '@/components/student/StudentIcons';

interface StudentLiveViewProps {
  liveClass: any;
  studentId: string;
  studentEmail: string;
}

export default function StudentLiveView({ liveClass, studentId, studentEmail }: StudentLiveViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'polls' | 'hands'>('chat');
  const roomId = liveClass.id;

  const startLabel = (() => {
    try {
      return new Date(liveClass.startTime || liveClass.scheduledStartAt).toLocaleString('en-IN', {
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
  })();

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
          {liveClass.status === 'LIVE' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/15 text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {liveClass.status === 'LIVE' ? (
            <div className="student-card overflow-hidden">
              <LiveStream roomId={roomId} displayName={studentEmail.split('@')[0]} isTeacher={false} />
            </div>
          ) : (
            <div
              className="aspect-video rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }}
            >
              <div className="text-center px-6">
                {liveClass.status === 'SCHEDULED' || liveClass.status === 'UPCOMING' ? (
                  <>
                    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <IconCalendar size={26} className="text-white" />
                    </div>
                    <p className="text-white text-lg font-extrabold">Class not started yet</p>
                    {startLabel && (
                      <p className="text-indigo-200 text-sm mt-2">Scheduled: {startLabel}</p>
                    )}
                    <p className="text-indigo-300/70 text-xs mt-1">
                      Class shuru hote hi yahan stream dikhega.
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
                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 text-sm font-extrabold rounded-xl hover:bg-indigo-50 transition-colors"
                      >
                        <IconPlay size={15} />
                        Watch Recording
                      </a>
                    ) : (
                      <p className="text-indigo-300/70 text-xs mt-2">
                        Recording jald available hogi.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div
            className="flex gap-1 rounded-2xl p-1.5"
            style={{ background: 'var(--student-surface-hover)' }}
          >
            {(['chat', 'polls', 'hands'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  activeTab === tab
                    ? 'bg-[var(--student-surface)] text-[var(--student-text)] shadow-sm'
                    : 'text-[var(--student-text-faint)] hover:text-[var(--student-text-muted)]'
                }`}
              >
                {tab === 'chat' ? '💬 Chat' : tab === 'polls' ? '📊 Polls' : '✋ Hand Raise'}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="student-card p-5">
            <h3 className="font-extrabold text-[var(--student-text)] mb-3 text-sm">Class Details</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--student-text-muted)]">Status</dt>
                <dd className="font-bold text-[var(--student-text)]">{liveClass.status}</dd>
              </div>
              {startLabel && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--student-text-muted)]">Starts</dt>
                  <dd className="font-bold text-[var(--student-text)] text-right">{startLabel}</dd>
                </div>
              )}
              {liveClass.courseTitle && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--student-text-muted)]">Course</dt>
                  <dd className="font-bold text-[var(--student-text)] text-right">{liveClass.courseTitle}</dd>
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
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)' }}
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
