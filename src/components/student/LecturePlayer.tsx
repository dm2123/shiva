'use client';

import { useState, useEffect } from 'react';
import {
  IconPlay, IconCheckCircle, IconClock, IconArrowLeft, IconChevronRight,
} from '@/components/student/StudentIcons';

interface LecturePlayerProps {
  courseId: string;
  lecture: {
    id: string;
    title: string;
    description?: string | null;
    videoUrl?: string | null;
    durationSeconds: number;
    isCompleted: boolean;
    positionSeconds: number;
  };
  prevLectureId?: string | null;
  nextLectureId?: string | null;
}

export default function LecturePlayer({ courseId, lecture, prevLectureId, nextLectureId }: LecturePlayerProps) {
  const goTo = (lectureId: string) => {
    if (!lectureId) return;
    window.location.href = `/app/learn/${courseId}?lecture=${lectureId}`;
  };
  const [isCompleted, setIsCompleted] = useState(lecture.isCompleted);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setIsCompleted(lecture.isCompleted);
    setSaved(false);
  }, [lecture.id, lecture.isCompleted]);

  async function toggleComplete() {
    const next = !isCompleted;
    setIsCompleted(next);
    setSaving(true);
    try {
      const res = await fetch('/api/student/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lectureId: lecture.id, isCompleted: next, positionSeconds: 0 }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const minutes = Math.max(1, Math.round(lecture.durationSeconds / 60));
  const hasPrev = !!prevLectureId;
  const hasNext = !!nextLectureId;

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-[11px] text-[var(--student-text-faint)] font-semibold uppercase tracking-widest">
        <IconPlay size={12} />
        Now Playing
      </div>

      {lecture.videoUrl ? (
        <video controls className="w-full aspect-video rounded-xl bg-black" src={lecture.videoUrl} />
      ) : (
        <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center">
            <IconPlay size={26} className="text-[var(--student-primary)] ml-1" />
          </div>
          <p className="text-xs text-[var(--student-text-muted)] font-medium">
            Please add a video source to watch this lecture
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--student-text)] tracking-tight leading-snug">
            {lecture.title}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-[var(--student-text-muted)] mt-1.5">
            <IconClock size={12} />
            ~{minutes} min
          </p>
          {lecture.description && (
            <p className="text-sm text-[var(--student-text-muted)] mt-3 leading-relaxed max-w-2xl">
              {lecture.description}
            </p>
          )}
        </div>

        <button
          onClick={toggleComplete}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-[var(--student-primary)] text-white hover:opacity-90'
          }`}
        >
          <IconCheckCircle size={16} />
          {isCompleted ? 'Completed' : 'Mark as Complete'}
        </button>
      </div>

      {saved && (
        <p className="mt-3 text-xs text-emerald-600 font-semibold">Progress saved.</p>
      )}

      <div className="mt-6 pt-5 border-t border-[var(--student-border-light)] flex items-center justify-between">
        <button
          onClick={() => goTo(prevLectureId!)}
          disabled={!hasPrev}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <IconArrowLeft size={16} />
          Previous
        </button>
        <span className="text-xs text-[var(--student-text-faint)]">{courseId}</span>
        <button
          onClick={() => goTo(nextLectureId!)}
          disabled={!hasNext}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Next
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}