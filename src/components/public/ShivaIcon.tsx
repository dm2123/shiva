'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ShivaIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
  variant?: 'default' | 'gold' | 'white' | 'dark';
}

/**
 * THE SHIVA — Animated SVG Brand Mark
 * Trident-inspired abstract form (evoking Shiva's trishul / trisula)
 * Pure SVG + GSAP — no raster images
 */
export default function ShivaIcon({
  size = 80,
  animated = true,
  className = '',
  variant = 'default',
}: ShivaIconProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimated = useRef(false);

  const colors = {
    default: { primary: '#c8a96e', secondary: '#8b5cf6', glow: 'rgba(200,169,110,0.6)' },
    gold:    { primary: '#c8a96e', secondary: '#e8d5a3', glow: 'rgba(200,169,110,0.8)' },
    white:   { primary: '#ffffff', secondary: '#e2e8f0', glow: 'rgba(255,255,255,0.6)' },
    dark:    { primary: '#1e293b', secondary: '#334155', glow: 'rgba(15,23,42,0.4)' },
  };
  const c = colors[variant];

  useEffect(() => {
    if (!animated || !svgRef.current || hasAnimated.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    hasAnimated.current = true;
    const svg = svgRef.current;

    const paths = svg.querySelectorAll('[data-animate="path"]');
    const particles = svg.querySelectorAll('[data-animate="particle"]');
    const glowEl = svg.querySelector('[data-animate="glow"]');
    const body = svg.querySelector('[data-animate="body"]');

    // Set initial states
    gsap.set(paths, { strokeDashoffset: (i, el) => (el as SVGPathElement).getTotalLength?.() ?? 200, opacity: 0 });
    gsap.set(particles, { scale: 0, opacity: 0, transformOrigin: 'center center' });
    gsap.set(glowEl, { opacity: 0, scale: 0.5 });
    gsap.set(body, { opacity: 0, scale: 0.8, transformOrigin: 'center center' });

    const tl = gsap.timeline({ delay: 0.1 });

    // 1. Body appears
    tl.to(body, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' });

    // 2. Paths draw
    tl.to(paths, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 1.0,
      stagger: 0.12,
      ease: 'power3.inOut',
    }, '-=0.2');

    // 3. Glow
    tl.to(glowEl, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4');

    // 4. Particles converge
    tl.to(particles, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      stagger: 0.06,
      ease: 'back.out(2)',
    }, '-=0.4');

    // 5. Idle animation
    tl.add(() => {
      // Extremely subtle breathing / idle
      gsap.to(body, {
        scale: 1.02,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: 'center center',
      });
      gsap.to(glowEl, {
        opacity: 0.6,
        scale: 1.1,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });

    return () => { tl.kill(); };
  }, [animated]);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <svg
      ref={svgRef}
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="THE SHIVA brand mark"
      role="img"
    >
      <defs>
        <filter id="shiva-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="shiva-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.primary} stopOpacity="1" />
          <stop offset="100%" stopColor={c.secondary} stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="shiva-glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.glow} stopOpacity="0.5" />
          <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow halo behind icon */}
      <circle
        data-animate="glow"
        cx="50" cy="50" r="38"
        fill="url(#shiva-glow-grad)"
      />

      {/* Main icon body group */}
      <g data-animate="body" filter="url(#shiva-glow)">

        {/* Central pillar (trishul shaft) */}
        <path
          data-animate="path"
          d="M50 70 L50 35"
          stroke="url(#shiva-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength="1"
          style={{ strokeDasharray: '1', strokeDashoffset: '1' }}
        />

        {/* Left prong */}
        <path
          data-animate="path"
          d="M50 38 C42 38 34 33 34 26 C34 22 37 19 40 20"
          stroke={c.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          pathLength="1"
          style={{ strokeDasharray: '1', strokeDashoffset: '1' }}
        />

        {/* Right prong */}
        <path
          data-animate="path"
          d="M50 38 C58 38 66 33 66 26 C66 22 63 19 60 20"
          stroke={c.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          pathLength="1"
          style={{ strokeDasharray: '1', strokeDashoffset: '1' }}
        />

        {/* Centre prong tip */}
        <path
          data-animate="path"
          d="M50 35 L50 18"
          stroke={c.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength="1"
          style={{ strokeDasharray: '1', strokeDashoffset: '1' }}
        />

        {/* Crossbar */}
        <path
          data-animate="path"
          d="M38 45 L62 45"
          stroke={c.secondary}
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="1"
          style={{ strokeDasharray: '1', strokeDashoffset: '1' }}
        />

        {/* Base arc */}
        <path
          data-animate="path"
          d="M40 70 Q50 75 60 70"
          stroke={c.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          pathLength="1"
          style={{ strokeDasharray: '1', strokeDashoffset: '1' }}
        />

        {/* Left tip star */}
        <circle cx="34" cy="20" r="2.5" fill={c.primary} opacity="0.9" />
        {/* Right tip star */}
        <circle cx="66" cy="20" r="2.5" fill={c.primary} opacity="0.9" />
        {/* Center tip */}
        <circle cx="50" cy="17" r="3" fill={c.primary} />
      </g>

      {/* Orbiting particles */}
      <circle data-animate="particle" cx="22" cy="38" r="1.5" fill={c.primary} opacity="0.7" />
      <circle data-animate="particle" cx="78" cy="35" r="1.2" fill={c.secondary} opacity="0.6" />
      <circle data-animate="particle" cx="18" cy="60" r="1" fill={c.primary} opacity="0.5" />
      <circle data-animate="particle" cx="82" cy="58" r="1.3" fill={c.secondary} opacity="0.5" />
      <circle data-animate="particle" cx="50" cy="82" r="1.5" fill={c.primary} opacity="0.6" />
      <circle data-animate="particle" cx="30" cy="75" r="1" fill={c.secondary} opacity="0.4" />
      <circle data-animate="particle" cx="70" cy="76" r="1" fill={c.secondary} opacity="0.4" />
    </svg>
  );
}
