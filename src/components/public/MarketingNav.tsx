'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import THEShivaLogo from '@/components/brand/THEShivaLogo';
import gsap from 'gsap';

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'Educators', href: '/teachers' },
  { label: 'Batches', href: '/batches' },
  { label: 'About', href: '/about' },
];

export default function MarketingNav() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Scroll handler — glass effect on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP entrance
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !navRef.current) return;
    gsap.fromTo(navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  // Mobile drawer animation
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !drawerRef.current) return;
    if (menuOpen) {
      gsap.fromTo(drawerRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    } else {
      gsap.to(drawerRef.current, { x: '100%', opacity: 0, duration: 0.3, ease: 'power3.in' });
    }
  }, [menuOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[rgba(10,10,18,0.85)] backdrop-blur-2xl border-b border-white/8 shadow-2xl'
            : 'bg-transparent'
        }`}
        style={{ height: '3.5rem' }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="marketing-container h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="group" aria-label="THE SHIVA — Home">
            <THEShivaLogo size={32} variant="compact" className="group-hover:opacity-80 transition-opacity duration-300" priority />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs lg:text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c8a96e] group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              href="/login"
              className="px-3.5 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 lg:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-bold text-[#0a0a12] bg-[#c8a96e] hover:bg-[#e8d5a3] rounded-full transition-all shadow-lg shadow-[#c8a96e]/20 hover:shadow-[#c8a96e]/40 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-40 bg-[rgba(10,10,18,0.97)] backdrop-blur-2xl flex flex-col justify-center items-center gap-8 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            className="absolute top-6 right-6 text-slate-400 hover:text-white text-3xl leading-none"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>

          <THEShivaLogo size={64} variant="full" />

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl font-bold text-white hover:text-[#c8a96e] transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col items-center gap-4 mt-4 w-full px-12">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 border border-white/20 rounded-full font-semibold text-white hover:bg-white/5 transition">Sign In</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 bg-[#c8a96e] text-[#0a0a12] rounded-full font-bold hover:bg-[#e8d5a3] transition">Get Started</Link>
          </div>
        </div>
      )}
    </>
  );
}
