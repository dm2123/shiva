'use client';
import { useState, useRef } from 'react';

interface DemoVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export default function DemoVideoPlayer({ src, poster, title }: DemoVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative group w-full rounded-2xl overflow-hidden bg-black/50 border border-white/10 aspect-video">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        controls={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-all hover:bg-black/20">
          <button
            onClick={togglePlay}
            className="w-16 h-16 flex items-center justify-center bg-[#c8a96e] text-black rounded-full shadow-[0_0_30px_rgba(200,169,110,0.5)] transition-transform hover:scale-110"
            aria-label="Play Demo Video"
          >
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {title && !isPlaying && (
        <div className="absolute bottom-4 left-4 right-4 text-left">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white/90 text-sm font-medium inline-block">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
