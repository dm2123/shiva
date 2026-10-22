'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Adds scroll-reveal animation (matches marketing homepage) */
export default function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion / no-IO fallback: content must never stay hidden.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const d = delay > 0 ? ` d${Math.min(delay, 4)}` : '';
  return (
    <div ref={ref} className={`reveal${d} ${className}`}>
      {children}
    </div>
  );
}
