'use client';

import { useRef, useEffect, useState } from 'react';

interface StudentEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  variant?: 'default' | 'compact' | 'large';
  useLottie?: boolean;
}

/** Floating dot animation for empty state */
function FloatingDots() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-6 left-8 w-1.5 h-1.5 rounded-full bg-indigo-300/40 animate-float-slow" />
      <div className="absolute top-12 right-12 w-1 h-1 rounded-full bg-violet-300/30 animate-float-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-10 left-1/4 w-2 h-2 rounded-full bg-indigo-200/20 animate-float-slow" style={{ animationDelay: '2s' }} />
    </div>
  );
}

/** CSS-animated box for Lottie alternative */
function AnimatedBox() {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="w-24 h-24 rounded-3xl border-4 border-indigo-500/20 bg-indigo-500/5"
          style={{
            animation: 'floatBox 3s ease-in-out infinite'
          }}
        />
      </div>
      <style jsx>{`
        @keyframes floatBox {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}

/** Lottie Player using lottie-web (client-side only) */
function LottiePlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    // Dynamically import lottie-web only on client
    import('lottie-web').then((lottie) => {
      if (!containerRef.current) return;
      
      const animation = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: {
          "v": "5.7.4",
          "fr": 30,
          "ip": 0,
          "op": 90,
          "w": 400,
          "h": 400,
          "nm": "Empty Box",
          "ddd": 0,
          "assets": [],
          "layers": [
            {
              "ddd": 0,
              "ind": 1,
              "ty": 4,
              "nm": "Box",
              "sr": 1,
              "ks": {
                "o": { "a": 0, "k": 100 },
                "r": {
                  "a": 1,
                  "k": [
                    { "t": 0, "s": [0], "h": 0 },
                    { "t": 45, "s": [5], "h": 0 },
                    { "t": 90, "s": [0], "h": 0 }
                  ]
                },
                "p": {
                  "a": 1,
                  "k": [
                    { "t": 0, "s": [200, 200, 0], "h": 0, "to": [0, -8, 0], "ti": [0, 0, 0] },
                    { "t": 45, "s": [200, 184, 0], "h": 0, "to": [0, 0, 0], "ti": [0, -8, 0] },
                    { "t": 90, "s": [200, 200, 0], "h": 0 }
                  ]
                },
                "a": { "a": 0, "k": [0, 0, 0] },
                "s": { "a": 0, "k": [100, 100, 100] }
              },
              "ao": 0,
              "shapes": [
                {
                  "ty": "rc",
                  "d": 1,
                  "s": { "a": 0, "k": [120, 120] },
                  "p": { "a": 0, "k": [0, 0] },
                  "r": { "a": 0, "k": 24 },
                  "nm": "Rectangle"
                },
                {
                  "ty": "fl",
                  "c": { "a": 0, "k": [0.392, 0.424, 0.949, 0.08] },
                  "o": { "a": 0, "k": 100 },
                  "r": 1,
                  "nm": "Fill"
                },
                {
                  "ty": "st",
                  "c": { "a": 0, "k": [0.392, 0.424, 0.949, 0.3] },
                  "o": { "a": 0, "k": 100 },
                  "w": { "a": 0, "k": 3 },
                  "lc": 2,
                  "lj": 2,
                  "nm": "Stroke"
                }
              ]
            }
          ]
        }
      });

      return () => {
        animation.destroy();
      };
    }).catch(() => {
      // Fallback if lottie-web fails to load
    });
  }, []);

  if (!mounted) {
    return <AnimatedBox />;
  }

  return <div ref={containerRef} className="w-full h-full" />;
}

export default function StudentEmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  variant = 'default',
  useLottie = false,
}: StudentEmptyStateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, []);

  const paddingClass = variant === 'compact' ? 'p-8' : variant === 'large' ? 'p-16 md:p-20' : 'p-12 md:p-16';

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center ${paddingClass} text-center rounded-3xl border border-dashed border-slate-200/80 bg-gradient-to-b from-white/80 to-slate-50/60 backdrop-blur-sm overflow-hidden group`}
    >
      <FloatingDots />

      {/* Icon or Lottie container */}
      {useLottie ? (
        <div className="relative z-10 w-32 h-32 mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
          <LottiePlayer />
        </div>
      ) : (
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-100 group-hover:bg-indigo-50/50 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-indigo-500/5">
          {icon}
        </div>
      )}

      <h3 className="relative z-10 text-lg font-bold text-[var(--student-text)] tracking-tight mb-2">{title}</h3>
      <p className="relative z-10 text-sm text-[var(--student-text-muted)] max-w-sm mx-auto leading-relaxed mb-0">
        {description}
      </p>

      {actionText && actionHref && (
        <a
          href={actionHref}
          className="relative z-10 mt-8 inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {actionText}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      )}
    </div>
  );
}
