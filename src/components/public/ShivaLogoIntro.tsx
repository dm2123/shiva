'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface LogoIntroProps {
  onComplete?: () => void;
}

/**
 * THE SHIVA — Cinematic Logo Intro Animation
 * Full-screen opening sequence with particles and reveal
 */
export default function ShivaLogoIntro({ onComplete }: LogoIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReduced) {
      // Skip animation for reduced motion
      setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, 1000);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          setIsComplete(true);
          onComplete?.();
        }, 800);
      },
    });

    // Initial setup
    gsap.set('[data-anim="particle"]', { scale: 0, opacity: 0 });
    gsap.set('[data-anim="ring"]', { scale: 0.3, opacity: 0, rotation: -90 });
    gsap.set('[data-anim="logo"]', { scale: 0, opacity: 0, rotation: -180 });
    gsap.set('[data-anim="letter"]', { y: 30, opacity: 0 });
    gsap.set('[data-anim="subtitle"]', { y: 20, opacity: 0 });
    gsap.set('[data-anim="glow"]', { scale: 0.5, opacity: 0 });

    // Animation sequence
    // 0.0s - Particles converge
    tl.to('[data-anim="particle"]', {
      scale: 1,
      opacity: 0.8,
      duration: 0.8,
      stagger: {
        amount: 0.4,
        from: 'random',
      },
      ease: 'back.out(2)',
    }, 0);

    // 0.4s - Glow ring appears
    tl.to('[data-anim="glow"]', {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    }, 0.4);

    // 0.5s - Gold ring spins in
    tl.to('[data-anim="ring"]', {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 1.2,
      ease: 'power3.out',
    }, 0.5);

    // 0.8s - Logo image rotates in
    tl.to('[data-anim="logo"]', {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 1.2,
      ease: 'back.out(1.2)',
    }, 0.8);

    // 1.5s - Text letters stagger in
    tl.to('[data-anim="letter"]', {
      y: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power3.out',
    }, 1.5);

    // 2.0s - Subtitle fades in
    tl.to('[data-anim="subtitle"]', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, 2.0);

    // 2.5s - Particles fade out
    tl.to('[data-anim="particle"]', {
      scale: 0.5,
      opacity: 0,
      duration: 0.6,
      stagger: 0.02,
    }, 2.5);

    // 3.0s - Hold for a moment before fading out
    tl.to({}, { duration: 0.8 }, 3.0);

    // 3.8s - Fade out entire intro
    tl.to(container, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    }, 3.8);

    return () => { tl.kill(); };
  }, [onComplete]);

  if (isComplete) return null;

  // Particle positions (orbital)
  const particles = [
    { x: 0, y: -120, delay: 0 },
    { x: 85, y: -85, delay: 0.05 },
    { x: 120, y: 0, delay: 0.1 },
    { x: 85, y: 85, delay: 0.15 },
    { x: 0, y: 120, delay: 0.2 },
    { x: -85, y: 85, delay: 0.25 },
    { x: -120, y: 0, delay: 0.3 },
    { x: -85, y: -85, delay: 0.35 },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a12]"
      aria-label="Loading animation"
    >
      {/* Ambient glow */}
      <div
        data-anim="glow"
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(200,169,110,0.15) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          data-anim="particle"
          className="absolute w-2 h-2 rounded-full bg-[#c8a96e]"
          style={{
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            boxShadow: '0 0 12px rgba(200,169,110,0.8)',
          }}
          aria-hidden="true"
        />
      ))}

      {/* Golden ring */}
      <div
        data-anim="ring"
        className="absolute w-56 h-56 rounded-full border-4 border-[#c8a96e]"
        style={{
          boxShadow: '0 0 40px rgba(200,169,110,0.4), inset 0 0 40px rgba(200,169,110,0.1)',
        }}
        aria-hidden="true"
      />

      {/* Logo container */}
      <div className="relative w-44 h-44">
        <div
          data-anim="logo"
          className="absolute inset-4 rounded-full overflow-hidden border-2 border-[#c8a96e] shadow-2xl"
          style={{
            boxShadow: '0 8px 32px rgba(200,169,110,0.4), 0 0 0 1px rgba(200,169,110,0.2)',
          }}
        >
          <Image
            src="/assets/logo.jpeg"
            alt="THE SHIVA Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Text below logo */}
      <div className="absolute top-[calc(50%+140px)] flex flex-col items-center gap-3">
        {/* THE SHIVA */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span data-anim="letter" className="text-white font-black text-xl tracking-tight">T</span>
            <span data-anim="letter" className="text-white font-black text-xl tracking-tight">H</span>
            <span data-anim="letter" className="text-white font-black text-xl tracking-tight">E</span>
          </div>
          <div className="flex items-center gap-1">
            <span data-anim="letter" className="text-shiva-gold font-black text-4xl tracking-tight">S</span>
            <span data-anim="letter" className="text-shiva-gold font-black text-4xl tracking-tight">H</span>
            <span data-anim="letter" className="text-shiva-gold font-black text-4xl tracking-tight">I</span>
            <span data-anim="letter" className="text-shiva-gold font-black text-4xl tracking-tight">V</span>
            <span data-anim="letter" className="text-shiva-gold font-black text-4xl tracking-tight">A</span>
          </div>
        </div>

        {/* Subtitle */}
        <span data-anim="subtitle" className="text-slate-400 text-xs uppercase tracking-[0.3em] font-semibold">
          Online Education Platform
        </span>
      </div>
    </div>
  );
}
