'use client';

/**
 * CourseBanner — PW-anatomy card ka 16:9 banner hissa (shared).
 *
 * Dashboard/study-home wala pakka pattern: asal thumbnailUrl ho aur
 * image asal me load ho jaye to wahi photo; warna (URL khaali ho ya
 * image 404 ho jaye — seed/legacy paths aksar disk par hoti hi nahi)
 * designed brand-gradient tile dikhta hai jisme course/batch ka
 * title typography ke roop me hota hai. Kaala dabba ya tooti hui
 * image kabhi nahi dikhti.
 *
 * Overlays (chips/badges/share button) `children` se aate hain —
 * woh image/fallback ke upar render hote hain; unhe apni absolute
 * position khud rakhni hai.
 */

import { useState, type ReactNode } from 'react';

/* Brand gradients (deep purple family) — StudyHomeClient wali hi palette */
const BANNER_GRADIENTS = [
  'linear-gradient(120deg,#2a1650,#6d28d9)',
  'linear-gradient(120deg,#4c1d95,#7c3aed)',
  'linear-gradient(120deg,#312e81,#6d28d9)',
  'linear-gradient(120deg,#2a1650,#8b5cf6)',
];

function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length];
}

/* Graduation-cap glyph (apna SVG — StudyHomeClient wala hi CapIcon) */
function CapIcon({ size = 38, color = 'rgba(255,255,255,0.9)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 3.6 1.8 8.7 12 13.8l8.7-4.35v6.05h1.5V8.7L12 3.6Z" />
      <path d="M5.9 11.35v4.1c0 1.66 2.73 3 6.1 3s6.1-1.34 6.1-3v-4.1l-6.1 3.05-6.1-3.05Z" />
    </svg>
  );
}

export interface CourseBannerProps {
  /** Asal thumbnail URL; khaali/invalid ho to gradient tile */
  src?: string | null;
  /** Fallback tile par dikhne wala title + img alt */
  title: string;
  /** Gradient chunne ke liye stable seed (slug ya id) */
  seed: string;
  /** Overlay chips/badges — absolute positioned, banner ke upar */
  children?: ReactNode;
}

export default function CourseBanner({ src, title, seed, children }: CourseBannerProps) {
  const usable = typeof src === 'string' && src.trim().length > 0;
  const [failed, setFailed] = useState(false);
  const showImg = usable && !failed;

  return (
    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-gray-100">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center"
          style={{ background: gradientFor(seed) }}
          aria-hidden="true"
        >
          <CapIcon />
          <span className="line-clamp-2 text-[15px] font-extrabold leading-snug text-white">
            {title}
          </span>
        </span>
      )}
      {children}
    </div>
  );
}
