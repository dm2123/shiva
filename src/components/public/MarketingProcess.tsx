'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { n: '01', title: 'Choose a course', desc: 'Pick SSC, Railway, Banking, Defence, or Teaching paths published on THE SHIVA.' },
  { n: '02', title: 'Learn in sequence', desc: 'Course → Subject → Chapter → Lecture. Watch, take notes, and mark progress as data exists.' },
  { n: '03', title: 'Practice & test', desc: 'Chapter tests, PYQ, and mocks when the question bank is available — no invented scores.' },
  { n: '04', title: 'Track performance', desc: 'Results and analytics appear only from real attempts inside your student portal.' },
];

export default function MarketingProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-gsap="process-step"]',
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '[data-gsap="process-grid"]', start: 'top 78%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative py-24 px-6" aria-labelledby="process-heading">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 space-y-3">
          <span className="shiva-capsule shiva-capsule-gold">Learning process</span>
          <h2 id="process-heading" className="text-shiva-section text-white">
            How learning works<br />
            <span className="text-shiva-gold">on THE SHIVA.</span>
          </h2>
        </div>
        <div data-gsap="process-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.n} data-gsap="process-step" className="shiva-feature-card p-7 space-y-3">
              <p className="text-sm font-black text-[#c8a96e]">{step.n}</p>
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
