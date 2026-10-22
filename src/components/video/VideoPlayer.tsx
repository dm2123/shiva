'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  lectureId: string;
  durationSeconds?: number;
  title?: string;
  onBookmark?: (timestamp: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoPlayer({ src, poster, lectureId, durationSeconds = 0, title, onBookmark }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [resumedFrom, setResumedFrom] = useState(0);
  const lastSaveRef = useRef<number>(0);

  useEffect(() => {
    fetch(`/api/student/video-progress?lectureId=${lectureId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.progress && videoRef.current) {
          const pos = res.data.progress.positionSeconds || 0;
          videoRef.current.currentTime = pos;
          setCurrentTime(pos);
          if (pos > 30) setResumedFrom(pos);
          if (res.data.progress.playbackSpeed) {
            setPlaybackSpeed(res.data.progress.playbackSpeed);
            videoRef.current.playbackRate = res.data.progress.playbackSpeed;
          }
        }
      })
      .catch(() => {});
  }, [lectureId]);

  const saveProgress = useCallback(
    async (position: number) => {
      try {
        await fetch('/api/student/video-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lectureId, positionSeconds: Math.floor(position), playbackSpeed }),
        });
        lastSaveRef.current = Date.now();
      } catch {}
    },
    [lectureId, playbackSpeed]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!isSeeking) setCurrentTime(video.currentTime);
      if (Date.now() - lastSaveRef.current >= 10000) {
        saveProgress(video.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration || durationSeconds);
    };
    const onEnded = () => {
      setIsPlaying(false);
      saveProgress(video.currentTime);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      saveProgress(video.currentTime);
    };
  }, [durationSeconds, isSeeking, saveProgress]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(Math.floor(currentTime));
    }
  };

  const skipBy = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(Math.max(0, video.currentTime + delta), duration || video.duration || 0);
    video.currentTime = next;
    setCurrentTime(next);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = Math.max(0, duration - currentTime);

  return (
    <div ref={containerRef} className="w-full rounded-2xl overflow-hidden bg-black border border-white/10">
      {title && (
        <div className="px-4 py-2 bg-[#2a1650] border-b border-white/10 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-white/90 truncate">{title}</span>
          {duration > 0 && currentTime > 5 && (
            <span className="shrink-0 text-[11px] font-bold text-[#f5b942]">
              {Math.min(100, Math.round(progress))}% watched
            </span>
          )}
        </div>
      )}

      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
        />

        {resumedFrom > 0 && !isPlaying && (
          <div className="absolute top-3 left-3 z-10 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-bold text-[#f5b942] backdrop-blur">
            Jahan chhoda tha, wahi se — {formatTime(resumedFrom)}
          </div>
        )}

        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 flex items-center justify-center bg-[#f5b942] text-[#2a1650] rounded-full shadow-lg hover:scale-110 transition-transform">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-3 bg-white/5">
        <div className="relative group">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#f5b942] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={() => setIsSeeking(false)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => skipBy(-10)}
              className="h-9 px-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-[11px] font-bold"
              title="10 second peeche"
              aria-label="10 second peeche"
            >
              −10s
            </button>
            <button
              onClick={() => skipBy(10)}
              className="h-9 px-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-[11px] font-bold"
              title="10 second aage"
              aria-label="10 second aage"
            >
              +10s
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 text-xs font-medium rounded bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label="Playback speed"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#2a1650] border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                        playbackSpeed === speed ? 'text-[#f5b942] font-bold' : 'text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleBookmark}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Bookmark at current time"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-white/60 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatTime(duration)}</span>
              <span className="ml-2 text-white/40">(-{formatTime(remaining)})</span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Fullscreen"
              aria-label="Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
