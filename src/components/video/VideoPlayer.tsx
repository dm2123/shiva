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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const lastSaveRef = useRef<number>(0);

  useEffect(() => {
    fetch(`/api/student/video-progress?lectureId=${lectureId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.progress && videoRef.current) {
          const pos = res.data.progress.positionSeconds || 0;
          videoRef.current.currentTime = pos;
          setCurrentTime(pos);
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

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = Math.max(0, duration - currentTime);

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black border border-white/10">
      {title && (
        <div className="px-4 py-2 bg-white/5 border-b border-white/10">
          <span className="text-sm font-medium text-white/90">{title}</span>
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

        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 flex items-center justify-center bg-[#c8a96e] text-black rounded-full shadow-lg hover:scale-110 transition-transform">
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
            <div className="h-full bg-[#c8a96e] rounded-full transition-all" style={{ width: `${progress}%` }} />
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

            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 text-xs font-medium rounded bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                        playbackSpeed === speed ? 'text-[#c8a96e] font-bold' : 'text-white'
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

          <div className="text-xs text-white/60 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
            <span className="ml-2 text-white/40">(-{formatTime(remaining)})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
