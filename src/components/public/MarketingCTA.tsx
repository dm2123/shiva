'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShivaIcon from './ShivaIcon';

gsap.registerPlugin(ScrollTrigger);

export default function MarketingCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-gsap="cta-inner"]',
        { y: 50, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-gsap="cta-inner"]', start: 'top 85%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative py-28 px-6 overflow-hidden">
      {/* Background blobs */}
      <div className="shiva-blob w-[700px] h-[700px] bg-violet-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[400px] h-[400px] bg-[#c8a96e] absolute top-0 right-0 opacity-[0.05]" aria-hidden="true" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div
          data-gsap="cta-inner"
          className="shiva-glass rounded-[2.5rem] p-12 md:p-16 text-center space-y-8 border border-white/10 relative overflow-hidden"
        >
          {/* Gradient accent top edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a96e]/60 to-transparent" />

          <ShivaIcon size={64} animated variant="gold" className="mx-auto" />

          <div className="space-y-4">
            <span className="shiva-capsule shiva-capsule-gold">Start Today</span>
            <h2 className="text-shiva-section text-white">
              Ready to begin your<br />
              <span className="text-shiva-gold">exam journey?</span>
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
              Join THE SHIVA and get access to structured courses, live classes, exam-pattern tests, and doubt support for enrolled students — all in one platform.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-[#c8a96e] hover:bg-[#e8d5a3] text-[#0a0a12] font-bold text-sm rounded-full shadow-xl shadow-[#c8a96e]/20 hover:shadow-[#c8a96e]/40 transition-all hover:-translate-y-1"
            >
              Create Free Account
            </Link>
            <Link
              href="/courses"
              className="px-8 py-4 border border-white/15 hover:border-white/30 text-white font-semibold text-sm rounded-full hover:bg-white/5 transition-all hover:-translate-y-1"
            >
              Browse Courses
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="text-[#c8a96e] hover:underline font-semibold">Sign in here →</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
