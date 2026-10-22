'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const whyItems = [
  {
    number: '01',
    title: 'Purpose-built for competitive exams',
    desc: 'Every feature — from the chapter hierarchy to the test format — is designed around SSC, Railway, Banking, Defence, and Teaching exam patterns. Not a generic LMS.',
    color: '#8b5cf6',
  },
  {
    number: '02',
    title: 'Assigned expert faculty, not a marketplace',
    desc: 'Teachers are provisioned by administrators and assigned to specific courses — ensuring quality control and institutional accountability.',
    color: '#a78bfa',
  },
  {
    number: '03',
    title: 'Isolated role portals with strict RBAC',
    desc: 'Student, Teacher, and Admin environments are completely separated — your data, workspace, and tools are private to your role.',
    color: '#f5b942',
  },
  {
    number: '04',
    title: 'Live + async learning in one place',
    desc: 'Attend live classes, revisit recorded lectures, practice with tests, and resolve doubts — all without leaving the platform.',
    color: '#c8a96e',
  },
];

export default function MarketingWhyShiva() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      // Horizontal line draw
      gsap.fromTo('[data-gsap="why-line"]',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-gsap="why-line"]', start: 'top 85%' },
        }
      );
      // Items stagger in
      gsap.fromTo('[data-gsap="why-item"]',
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.65, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-gsap="why-list"]', start: 'top 80%' },
        }
      );
      // Right visual
      gsap.fromTo('[data-gsap="why-visual"]',
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-gsap="why-visual"]', start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative py-28 px-6 overflow-hidden">
      {/* Blob accent */}
      <div className="shiva-blob w-[500px] h-[500px] bg-violet-700 absolute right-[-150px] top-[10%] opacity-10" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-4">
          <span className="shiva-capsule shiva-capsule-gold">Why THE SHIVA</span>
        </div>
        <div data-gsap="why-line" className="h-px bg-gradient-to-r from-[#c8a96e] via-[#8b5cf6] to-transparent mb-14" />

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Left — numbered list */}
          <div data-gsap="why-list" className="flex-1 space-y-10">
            {whyItems.map((item) => (
              <div key={item.number} data-gsap="why-item" className="flex gap-6 group">
                <div
                  className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  {item.number}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#c8a96e] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right — decorative dashboard mock (illustrative preview, not real student data) */}
          <div data-gsap="why-visual" className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Illustrative preview — student dashboard aisa dikhta hai
              </p>
              {/* Glass card mock */}
              <div className="shiva-glass rounded-3xl p-8 space-y-5" aria-hidden="true">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Your Progress</p>
                    <p className="text-sm font-bold text-white">Quantitative Aptitude</p>
                  </div>
                  <span className="ml-auto shiva-capsule shiva-capsule-blue">74%</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                </div>

                {/* Mock stat row */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[['12', 'Lectures done'], ['3', 'Tests taken'], ['89%', 'Avg. score']].map(([val, lbl]) => (
                    <div key={lbl} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-white">{val}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{lbl}</p>
                    </div>
                  ))}
                </div>

                {/* Mock upcoming */}
                <div className="border-t border-white/8 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming</p>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-sm text-white font-medium">Live: SSC CGL Maths</span>
                    <span className="ml-auto text-xs text-slate-400">3:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-sm text-white font-medium">Test: Reasoning PYQ</span>
                    <span className="ml-auto text-xs text-slate-400">Tomorrow</span>
                  </div>
                </div>
              </div>

              {/* Floating small card */}
              <div className="absolute -bottom-5 -right-5 shiva-glass-strong rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl" aria-hidden="true">
                <span className="text-lg">🏆</span>
                <div>
                  <p className="text-xs font-bold text-white">Mock Tests</p>
                  <p className="text-[10px] text-slate-400">Apni progress track karo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
