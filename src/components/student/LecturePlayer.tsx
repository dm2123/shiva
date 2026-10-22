'use client';

import { useState, useEffect, useRef } from 'react';
import {
  IconPlay, IconCheckCircle, IconClock, IconArrowLeft, IconChevronRight,
  IconBook, IconMessageCircle, IconCheck,
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
  nextLectureTitle?: string | null;
}

/** Extracts a YouTube video ID from watch / youtu.be / embed / shorts URLs. */
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** Native video player with speed control + auto-save position. */
function NativePlayer({
  videoUrl, title, lectureId, startAt,
}: { videoUrl: string; title: string; lectureId: string; startAt: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [showSpeeds, setShowSpeeds] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (v && startAt > 0) {
      const onMeta = () => { v.currentTime = Math.min(startAt, v.duration || startAt); };
      v.addEventListener('loadedmetadata', onMeta);
      return () => v.removeEventListener('loadedmetadata', onMeta);
    }
  }, [videoUrl, startAt]);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed]);

  // Save position every 15s
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const t = setInterval(() => {
      if (!v.paused && v.currentTime > 5) {
        fetch('/api/student/learn/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lectureId, positionSeconds: Math.floor(v.currentTime) }),
        }).catch(() => {});
      }
    }, 15000);
    return () => clearInterval(t);
  }, [lectureId]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
      <video
        ref={ref}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full"
        src={videoUrl}
      />
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowSpeeds((s) => !s)}
          className="px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-bold backdrop-blur hover:bg-black/90 transition-colors"
        >
          {speed}x ⚙
        </button>
        {showSpeeds && (
          <div className="absolute right-0 mt-2 w-32 rounded-xl bg-black/90 backdrop-blur p-1.5 shadow-xl">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => { setSpeed(s); setShowSpeeds(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  s === speed ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {s}x
                {s === speed && <IconCheck size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function YouTubePlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  const ytId = getYouTubeId(videoUrl);
  if (!ytId) return null;
  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${ytId}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

type Tab = 'overview' | 'notes' | 'doubt';

export default function LecturePlayer({
  courseId, lecture, prevLectureId, nextLectureId, nextLectureTitle,
}: LecturePlayerProps) {
  const goTo = (lectureId: string) => {
    if (!lectureId) return;
    window.location.href = `/app/learn/${courseId}?lecture=${lectureId}`;
  };
  const [isCompleted, setIsCompleted] = useState(lecture.isCompleted);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [doubt, setDoubt] = useState('');
  const [doubtSent, setDoubtSent] = useState(false);

  useEffect(() => {
    setIsCompleted(lecture.isCompleted);
    setSaved(false);
    setTab('overview');
    setDoubt('');
    setDoubtSent(false);
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

  async function sendDoubt() {
    if (!doubt.trim()) return;
    try {
      const res = await fetch('/api/student/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: doubt.trim().slice(0, 120), lectureId: lecture.id, courseId }),
      });
      if (res.ok) { setDoubtSent(true); setDoubt(''); }
    } catch { /* silent */ }
  }

  const minutes = Math.max(1, Math.round(lecture.durationSeconds / 60));
  const hasPrev = !!prevLectureId;
  const hasNext = !!nextLectureId;
  const ytId = lecture.videoUrl ? getYouTubeId(lecture.videoUrl) : null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: IconPlay },
    { id: 'notes', label: 'Notes', icon: IconBook },
    { id: 'doubt', label: 'Doubt Poocho', icon: IconMessageCircle },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* Now playing strip */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[11px] text-[var(--student-text-faint)] font-semibold uppercase tracking-widest">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          Now Playing
        </div>
        {lecture.positionSeconds > 30 && (
          <span className="text-[11px] font-semibold text-[var(--student-primary)] bg-[var(--student-primary)]/10 px-2.5 py-1 rounded-full">
            Resume: {Math.floor(lecture.positionSeconds / 60)}:{String(lecture.positionSeconds % 60).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Video */}
      {lecture.videoUrl ? (
        ytId ? (
          <YouTubePlayer videoUrl={lecture.videoUrl} title={lecture.title} />
        ) : (
          <NativePlayer
            videoUrl={lecture.videoUrl}
            title={lecture.title}
            lectureId={lecture.id}
            startAt={lecture.positionSeconds}
          />
        )
      ) : (
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center gap-3 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center">
            <IconPlay size={26} className="text-[var(--student-primary)] ml-1" />
          </div>
          <p className="text-xs text-[var(--student-text-muted)] font-medium">
            Video jald aa raha hai — taiyaari jaari rakho!
          </p>
        </div>
      )}

      {/* Title + actions */}
      <div className="mt-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--student-text)] tracking-tight leading-snug">
            {lecture.title}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-[var(--student-text-muted)] mt-1.5">
            <IconClock size={12} />
            ~{minutes} min
            <span className="mx-1">•</span>
            Hinglish
          </p>
        </div>

        <button
          onClick={toggleComplete}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-[var(--student-primary)] text-white hover:opacity-90 shadow-lg shadow-[var(--student-primary)]/25'
          }`}
        >
          <IconCheckCircle size={16} />
          {saving ? 'Save ho raha...' : isCompleted ? 'Completed ✓' : 'Mark as Complete'}
        </button>
      </div>

      {saved && (
        <p className="mt-2 text-xs text-emerald-600 font-semibold">Progress save ho gaya! 🎉</p>
      )}

      {/* Tabs */}
      <div className="mt-6 border-b border-[var(--student-border-light)] flex gap-1">
        {tabs.map((t) => {
          const I = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-[var(--student-primary)] text-[var(--student-primary)]'
                  : 'border-transparent text-[var(--student-text-muted)] hover:text-[var(--student-text)]'
              }`}
            >
              <I size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="py-4">
        {tab === 'overview' && (
          <div>
            {lecture.description ? (
              <p className="text-sm text-[var(--student-text-muted)] leading-relaxed">{lecture.description}</p>
            ) : (
              <p className="text-sm text-[var(--student-text-faint)] italic">
                Is lecture ka description jald aa raha hai.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[var(--student-surface-hover)] text-[var(--student-text-secondary)]">
                📹 Video Lecture
              </span>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[var(--student-surface-hover)] text-[var(--student-text-secondary)]">
                ⏱ ~{minutes} min
              </span>
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[var(--student-surface-hover)] text-[var(--student-text-secondary)]">
                🗣 Hinglish
              </span>
            </div>
          </div>
        )}

        {tab === 'notes' && (
          <div className="rounded-2xl border border-[var(--student-border-light)] bg-[var(--student-surface)] p-5 text-center">
            <IconBook size={32} className="mx-auto text-[var(--student-text-faint)] mb-3" />
            <p className="text-sm font-bold text-[var(--student-text)] mb-1">Lecture Notes</p>
            <p className="text-xs text-[var(--student-text-muted)]">
              Is lecture ke notes jald upload honge. Tab tak video se seekho!
            </p>
          </div>
        )}

        {tab === 'doubt' && (
          <div className="rounded-2xl border border-[var(--student-border-light)] bg-[var(--student-surface)] p-5">
            {doubtSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <IconCheck size={20} className="text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-[var(--student-text)]">Doubt bhej diya! ✅</p>
                <p className="text-xs text-[var(--student-text-muted)] mt-1">
                  Educator jald jawab denge. <a href="/app/doubts" className="text-[var(--student-primary)] font-bold">Mere Doubts →</a>
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-[var(--student-text)] mb-1">
                  Is lecture me kuch samajh nahi aaya?
                </p>
                <p className="text-xs text-[var(--student-text-muted)] mb-3">
                  Apna doubt likho — educator jawab denge.
                </p>
                <textarea
                  value={doubt}
                  onChange={(e) => setDoubt(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Apna doubt yahan likho..."
                  className="w-full rounded-xl border border-[var(--student-border-light)] bg-white dark:bg-slate-900 px-4 py-3 text-sm text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--student-primary)]/40 resize-none"
                />
                <button
                  onClick={sendDoubt}
                  disabled={!doubt.trim()}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-all"
                >
                  Doubt Bhejo →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Prev / Next */}
      <div className="mt-2 pt-5 border-t border-[var(--student-border-light)] flex items-center justify-between gap-3">
        <button
          onClick={() => goTo(prevLectureId!)}
          disabled={!hasPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <IconArrowLeft size={16} />
          Previous
        </button>
        {hasNext && nextLectureTitle && (
          <button
            onClick={() => goTo(nextLectureId!)}
            className="flex-1 max-w-md hidden sm:flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[var(--student-primary)]/10 hover:bg-[var(--student-primary)]/15 border border-[var(--student-primary)]/20 transition-colors text-left"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--student-primary)]">Up Next</span>
              <span className="block text-xs font-bold text-[var(--student-text)] truncate">{nextLectureTitle}</span>
            </span>
            <IconChevronRight size={18} className="text-[var(--student-primary)] shrink-0" />
          </button>
        )}
        <button
          onClick={() => goTo(nextLectureId!)}
          disabled={!hasNext}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[var(--student-primary)] text-white hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-[var(--student-primary)]/25"
        >
          Next
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
