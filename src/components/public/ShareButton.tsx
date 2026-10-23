'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ShareButton — listing cards ke liye chhota share button (client).
 *
 * Click par:
 *  1. `navigator.share` available ho to native share sheet khulta hai.
 *  2. Warna poora URL clipboard par copy hota hai aur button 2 second
 *     ke liye 'Copied ✓' dikhata hai.
 * Clipboard bhi fail ho jaye to koi jhootha 'Copied' nahi dikhta —
 * button apni asal sthiti me rehta hai.
 *
 * Card ke banner/top area ke upar absolute rakhne ke liye parent ko
 * `relative` hona chahiye; position class parent se `className` me
 * di ja sakti hai (default: top-right).
 */
export default function ShareButton({
  title,
  url,
  className = '',
}: {
  title: string;
  /** Relative path — jaise `/courses/<slug>` (card ka apna detail href). */
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleShare() {
    const fullUrl = `${window.location.origin}${url}`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url: fullUrl });
        return;
      } catch {
        // User ne share sheet band kar diya ya share fail hua —
        // chup chaap clipboard fallback par jao.
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission na mile to kuch nahi karte —
      // galat 'Copied' daava nahi karte.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`${title} share karo`}
      title="Share karo"
      className={`z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ede9fe] bg-white/95 text-[15px] leading-none text-[#6d28d9] shadow-[0_4px_14px_rgba(42,22,80,0.18)] transition-all hover:bg-[#f5f3ff] ${copied ? 'w-auto px-3 text-[12px] font-extrabold text-emerald-600' : ''} ${className}`}
    >
      {copied ? 'Copied ✓' : '🔗'}
    </button>
  );
}
