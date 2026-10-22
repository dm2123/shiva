'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    title: 'Structured Courses',
    desc: 'Subject → Chapter → Lecture hierarchy designed for competitive exam patterns. Every concept in its logical place.',
    color: '#8b5cf6',
    tag: 'SSC / Railway / Banking',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
    title: 'Video Lectures',
    desc: 'High-quality lecture content authored by assigned educators. Watch, rewatch, and master at your pace.',
    color: '#a78bfa',
    tag: 'Self-Paced',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: 'Practice & Tests',
    desc: 'Chapter-wise tests, full-length mock exams, and exam-pattern practice sessions to sharpen your accuracy.',
    color: '#f59e0b',
    tag: 'Exam Pattern',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M7.76 16.24a6 6 0 0 1 0-8.49"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>
      </svg>
    ),
    title: 'Live Classes',
    desc: 'Attend real-time sessions with your faculty. Ask questions, participate, and learn alongside peers.',
    color: '#6d28d9',
    tag: 'Real-Time',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Doubt Resolution',
    desc: 'Raise questions on any lecture or topic and get authoritative answers directly from your teacher.',
    color: '#f5b942',
    tag: 'Direct Support',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Performance Analytics',
    desc: 'Track your progress across every subject and chapter. Understand strengths and close knowledge gaps.',
    color: '#c8a96e',
    tag: 'Data-Driven',
  },
];

export default function MarketingFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('[data-gsap="feat-heading"]',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8,
          scrollTrigger: { trigger: '[data-gsap="feat-heading"]', start: 'top 80%' },
        }
      );

      gsap.fromTo('[data-gsap="feat-card"]',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-gsap="feat-grid"]', start: 'top 75%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  // Tilt interaction
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    // Track mouse for radial gradient
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width * 100).toFixed(0)}%`);
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height * 100).toFixed(0)}%`);
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  };

  return (
    <section ref={sectionRef} className="relative py-28 px-6 overflow-hidden">
      {/* Liquid background */}
      <div className="shiva-liquid-section absolute inset-0" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div data-gsap="feat-heading" className="text-center mb-16 space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">Platform</span>
          <h2 className="text-shiva-section text-white">
            Everything you need<br />
            <span className="text-shiva-gold">to learn better.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            A complete, purpose-built ecosystem — not a collection of disconnected tools.
          </p>
        </div>

        <div data-gsap="feat-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={i}
              data-gsap="feat-card"
              className="shiva-feature-card p-8 flex flex-col gap-5 cursor-default"
              onMouseMove={handleTilt}
              onMouseLeave={handleTiltLeave}
              style={{ transition: 'transform 0.15s ease, box-shadow 0.3s ease' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${feat.color}18`, color: feat.color }}
              >
                {feat.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
              <div className="mt-auto">
                <span className="shiva-capsule" style={{
                  background: `${feat.color}18`,
                  color: feat.color,
                  borderColor: `${feat.color}40`
                }}>
                  {feat.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
