'use client';

import { useRef, Suspense, lazy, useEffect, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ShivaIcon from './ShivaIcon';

const MarketingWebGLHero = lazy(() => import('./MarketingWebGLHero'));

// ── Floating badge ────────────────────────────────────────────
function FloatingBadge({
  children, className = '', delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div
      data-gsap="float-badge"
      style={{ animationDelay: `${delay}s` }}
      className={`shiva-float absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl shiva-glass border border-white/10 text-xs font-semibold text-white shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

// ── Magnetic button (desktop only) ───────────────────────────
function MagneticCTA({ href, children, className = '', ...rest }: { href: string; children: React.ReactNode; className?: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <Link ref={ref} href={href} className={`shiva-magnetic ${className}`} {...rest}>
      {children}
    </Link>
  );
}

// ── Hero Component ────────────────────────────────────────────
export default function MarketingHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('shiva_reg_dismissed');
      const isAuthenticated = document.cookie.includes('shiva_session_id');

      if (!dismissed && !isAuthenticated) {
        setShowPopup(true);
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const dismissPopup = () => {
    sessionStorage.setItem('shiva_reg_dismissed', 'true');
    setShowPopup(false);
  };

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('[data-gsap="blob"]', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, stagger: 0.2, ease: 'power2.out' }, 0);
      tl.fromTo('[data-gsap="badge"]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.2);
      tl.fromTo('[data-gsap="word"]', { y: '110%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.7, stagger: 0.06 }, 0.4);
      tl.fromTo('[data-gsap="sub"]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.6);
      tl.fromTo('[data-gsap="cta"]', { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }, 0.8);
      tl.fromTo('[data-gsap="visual"]', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.8 }, 1.0);
      tl.fromTo('[data-gsap="float-badge"]', { opacity: 0, scale: 0.7, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.1 }, 1.2);
    }, heroRef);

    return () => ctx.revert();
  }, { scope: heroRef });

  return (
    <>
      <section
        ref={heroRef}
        className="relative flex items-center overflow-hidden shiva-liquid-hero shiva-grid"
        style={{ minHeight: 'clamp(600px, 85vh, 900px)' }}
        aria-label="Hero section"
      >
        <div data-gsap="blob" className="shiva-blob w-[600px] h-[600px] bg-violet-600 top-[-100px] left-[-150px]" aria-hidden="true" />
        <div data-gsap="blob" className="shiva-blob shiva-blob-2 w-[500px] h-[500px] bg-blue-500 top-[40%] right-[-100px]" aria-hidden="true" />
        <div data-gsap="blob" className="shiva-blob shiva-blob-3 w-[400px] h-[400px] bg-[#c8a96e] bottom-[-80px] left-[30%]" aria-hidden="true" />

        <div className="relative z-10 marketing-container py-16 md:py-20 lg:py-24 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 flex flex-col gap-4 md:gap-5 max-w-2xl">
              <div data-gsap="badge">
                <span className="shiva-capsule shiva-capsule-gold inline-flex items-center gap-2">
                  <ShivaIcon size={16} animated={false} variant="gold" />
                  THE SHIVA — Modern Learning Platform
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                {['Learn.', 'Practice.', 'Perform.', 'Grow.'].map((word, i) => (
                  <span key={i} className="shiva-reveal-line inline-block mr-3 lg:block lg:mr-0">
                    <span data-gsap="word" className="inline-block">
                      {i === 0 || i === 3 ? <span className="text-shiva-gold">{word}</span> : word}
                    </span>
                  </span>
                ))}
              </h1>
              <p data-gsap="sub" className="text-slate-300 text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
                THE SHIVA is a focused digital learning ecosystem for SSC, Railway, Banking, Defence, and Teaching exam candidates.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <MagneticCTA href="/courses" data-gsap="cta" className="px-6 md:px-8 py-3 md:py-4 bg-[#c8a96e] hover:bg-[#e8d5a3] text-[#0a0a12] font-bold text-sm rounded-full shadow-xl">Explore Courses</MagneticCTA>
                <MagneticCTA href="/register" data-gsap="cta" className="px-6 md:px-8 py-3 md:py-4 shiva-glass text-white font-semibold text-sm rounded-full border border-white/15">Start Learning →</MagneticCTA>
              </div>
            </div>
            <div data-gsap="visual" className="relative flex-1 h-[360px] md:h-[440px] lg:h-[520px] w-full lg:w-auto">
              <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-3xl" aria-hidden="true" />
              <div className="w-full h-full relative">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><ShivaIcon size={120} animated variant="gold" className="shiva-float-slow opacity-60" /></div>}>
                  <MarketingWebGLHero />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md p-8 bg-[#0a0a12] border border-[#c8a96e]/30 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={dismissPopup} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-2xl font-bold text-white mb-2">THE SHIVA</h2>
            <p className="text-slate-400 mb-6">Start your learning journey today.</p>
            <div className="space-y-3">
              <Link href="/register" className="block w-full py-3 text-center bg-[#c8a96e] text-[#0a0a12] font-bold rounded-lg hover:bg-[#e8d5a3]">Continue with Mobile</Link>
              <Link href="/login" className="block w-full py-3 text-center border border-slate-700 text-white font-semibold rounded-lg hover:border-slate-500">Sign In</Link>
              <button onClick={dismissPopup} className="block w-full py-2 text-sm text-slate-500 hover:text-white">Not now</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
