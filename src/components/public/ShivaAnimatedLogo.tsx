'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface AnimatedLogoProps {
  size?: number;
  variant?: 'image' | 'text' | 'full';
  animated?: boolean;
  className?: string;
}

/**
 * THE SHIVA — Animated Logo Component
 * 
 * Variants:
 * - 'image': Uses logo.jpeg with animated reveal
 * - 'text': Pure SVG text with letter-by-letter animation
 * - 'full': Image + Text combination
 */
export default function ShivaAnimatedLogo({
  size = 120,
  variant = 'full',
  animated = true,
  className = '',
}: AnimatedLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animated || !containerRef.current || hasAnimated.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    hasAnimated.current = true;
    const container = containerRef.current;

    const tl = gsap.timeline({ delay: 0.2 });

    // Animate glow ring
    const glow = container.querySelector('[data-anim="glow"]');
    if (glow) {
      gsap.set(glow, { scale: 0.5, opacity: 0 });
      tl.to(glow, { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0);
    }

    // Animate logo image/circle
    const logoEl = container.querySelector('[data-anim="logo"]');
    if (logoEl) {
      gsap.set(logoEl, { scale: 0, opacity: 0, rotation: -180 });
      tl.to(logoEl, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1,
        ease: 'back.out(1.4)',
      }, 0.1);
    }

    // Animate text letters
    const letters = container.querySelectorAll('[data-anim="letter"]');
    if (letters.length > 0) {
      gsap.set(letters, { y: 20, opacity: 0 });
      tl.to(letters, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power3.out',
      }, 0.4);
    }

    // Animate subtitle
    const subtitle = container.querySelector('[data-anim="subtitle"]');
    if (subtitle) {
      gsap.set(subtitle, { y: 10, opacity: 0 });
      tl.to(subtitle, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.8);
    }

    // Idle float animation
    tl.add(() => {
      if (logoEl) {
        gsap.to(logoEl, {
          y: -5,
          duration: 2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
      if (glow) {
        gsap.to(glow, {
          scale: 1.1,
          opacity: 0.7,
          duration: 2.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
    });

    return () => { tl.kill(); };
  }, [animated]);

  // Text variant - SVG text logo
  if (variant === 'text') {
    return (
      <div ref={containerRef} className={`flex flex-col items-center gap-2 ${className}`}>
        <svg
          width={size * 2}
          height={size * 0.6}
          viewBox="0 0 300 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="THE SHIVA"
        >
          <defs>
            <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c8a96e" />
              <stop offset="50%" stopColor="#e8d5a3" />
              <stop offset="100%" stopColor="#c8a96e" />
            </linearGradient>
          </defs>
          
          {/* THE */}
          <text data-anim="letter" x="10" y="35" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900" fill="#ffffff">T</text>
          <text data-anim="letter" x="35" y="35" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900" fill="#ffffff">H</text>
          <text data-anim="letter" x="65" y="35" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900" fill="#ffffff">E</text>
          
          {/* SHIVA */}
          <text data-anim="letter" x="10" y="70" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#text-gradient)">S</text>
          <text data-anim="letter" x="50" y="70" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#text-gradient)">H</text>
          <text data-anim="letter" x="100" y="70" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#text-gradient)">I</text>
          <text data-anim="letter" x="125" y="70" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#text-gradient)">V</text>
          <text data-anim="letter" x="170" y="70" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#text-gradient)">A</text>
        </svg>
      </div>
    );
  }

  // Image variant - logo.jpeg with animation
  if (variant === 'image') {
    return (
      <div ref={containerRef} className={`relative ${className}`} style={{ width: size, height: size }}>
        {/* Glow ring */}
        <div
          data-anim="glow"
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,169,110,0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          aria-hidden="true"
        />
        
        {/* Logo */}
        <div
          data-anim="logo"
          className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#c8a96e] shadow-xl"
          style={{
            boxShadow: '0 8px 32px rgba(200,169,110,0.3), 0 0 0 1px rgba(200,169,110,0.1)',
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
    );
  }

  // Full variant - Image + Text
  return (
    <div ref={containerRef} className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Logo Image */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow ring */}
        <div
          data-anim="glow"
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,169,110,0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          aria-hidden="true"
        />
        
        {/* Logo */}
        <div
          data-anim="logo"
          className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#c8a96e] shadow-xl"
          style={{
            boxShadow: '0 8px 32px rgba(200,169,110,0.3), 0 0 0 1px rgba(200,169,110,0.1)',
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

      {/* Text Logo */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span data-anim="letter" className="text-white font-black text-xl tracking-tight">T</span>
          <span data-anim="letter" className="text-white font-black text-xl tracking-tight">H</span>
          <span data-anim="letter" className="text-white font-black text-xl tracking-tight">E</span>
        </div>
        <div className="flex items-center gap-1">
          <span data-anim="letter" className="text-shiva-gold font-black text-3xl tracking-tight">S</span>
          <span data-anim="letter" className="text-shiva-gold font-black text-3xl tracking-tight">H</span>
          <span data-anim="letter" className="text-shiva-gold font-black text-3xl tracking-tight">I</span>
          <span data-anim="letter" className="text-shiva-gold font-black text-3xl tracking-tight">V</span>
          <span data-anim="letter" className="text-shiva-gold font-black text-3xl tracking-tight">A</span>
        </div>
        <span data-anim="subtitle" className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
          Online Education Platform
        </span>
      </div>
    </div>
  );
}
