'use client';

import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface TeacherEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  illustrationType?: 'courses' | 'lectures' | 'doubts' | 'students' | 'analytics';
}

export default function TeacherEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  illustrationType = 'courses'
}: TeacherEmptyStateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate a programmatic Lottie animation for empty states (so we don't rely on external JSON files that might be missing).
    // This creates a minimal, modern pulsing geometry based on the type.

    const createAnimationData = () => {
      // Basic fallback animation: a pulsing circle/shape
      return {
        v: "5.7.4",
        fr: 30,
        ip: 0,
        op: 60,
        w: 400,
        h: 400,
        nm: "Teacher Empty State",
        ddd: 0,
        assets: [],
        layers: [
          {
            ddd: 0, ind: 1, ty: 4, nm: "Shape Layer 1", sr: 1, ks: {
              o: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [10] }, { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 30, s: [50] }, { t: 60, s: [10] }] },
              r: { a: 0, k: 0, ix: 2 },
              p: { a: 0, k: [200, 200, 0], ix: 2 },
              a: { a: 0, k: [0, 0, 0], ix: 1 },
              s: { a: 1, k: [{ i: { x: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167] }, t: 0, s: [100, 100, 100] }, { i: { x: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167] }, t: 30, s: [120, 120, 100] }, { t: 60, s: [100, 100, 100] }] }
            },
            ao: 0,
            shapes: [
              {
                ty: "el",
                d: 1,
                p: { a: 0, k: [0, 0], ix: 3 },
                s: { a: 0, k: [200, 200], ix: 4 },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.05, 0.72, 0.51, 1], ix: 4 }, // Teal
                o: { a: 0, k: 100, ix: 5 },
                r: 1,
                bm: 0,
                nm: "Fill 1",
                mn: "ADBE Vector Graphic - Fill",
                hd: false
              }
            ]
          }
        ]
      };
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: !prefersReducedMotion,
      autoplay: !prefersReducedMotion,
      animationData: createAnimationData(),
    });

    if (prefersReducedMotion) {
      anim.goToAndStop(30, true);
    }

    return () => anim.destroy();
  }, [illustrationType]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      <div className="w-64 h-64 mb-6 relative">
        <div ref={containerRef} className="w-full h-full opacity-60"></div>
        {/* Subtle morphing blob specifically for empty state (static fallback on reduce motion) */}
        <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-3xl -z-10 mix-blend-overlay"></div>
      </div>
      
      <h3 className="text-2xl font-bold text-[var(--teacher-text)] mb-3">{title}</h3>
      <p className="text-[var(--teacher-text-muted)] mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--teacher-primary)] hover:bg-[var(--teacher-primary-hover)] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
