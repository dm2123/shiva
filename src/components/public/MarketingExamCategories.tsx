'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { label: 'SSC', exams: ['CGL', 'CHSL', 'GD', 'MTS'], color: '#8b5cf6' },
  { label: 'Railway', exams: ['NTPC', 'Group D'], color: '#14b8a6' },
  { label: 'Banking', exams: ['IBPS', 'SBI', 'PO'], color: '#3b82f6' },
  { label: 'Defence', exams: ['Army', 'Air Force', 'CRPF'], color: '#f43f5e' },
  { label: 'Police', exams: ['UP Police', 'दरोगा', 'PET'], color: '#f59e0b' },
  { label: 'Teaching', exams: ['CTET', 'Super TET', 'B.Ed.'], color: '#c8a96e' },
  { label: 'State', exams: ['UPSSSC', 'Lekhpal', 'PSU'], color: '#22d3ee' },
  { label: 'Practice', exams: ['PYQ', 'Test Series', 'CSAT'], color: '#a78bfa' },
];

export default function MarketingExamCategories() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-gsap="exam-heading"]',
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, scrollTrigger: { trigger: '[data-gsap="exam-heading"]', start: 'top 80%' } }
      );
      gsap.fromTo('[data-gsap="exam-card"]',
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '[data-gsap="exam-grid"]', start: 'top 78%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="marketing-section relative overflow-hidden" aria-labelledby="exam-categories-heading">
      <div className="marketing-container relative z-10">
        <div data-gsap="exam-heading" className="section-header mb-10">
          <span className="section-eyebrow section-eyebrow-violet">Exam Focus</span>
          <h2 id="exam-categories-heading" className="section-title text-white">
            Prepare for the exams that matter.
          </h2>
          <p className="section-description text-slate-300">
            Structured paths for government competitive exams — not a generic marketplace.
          </p>
        </div>

        <div data-gsap="exam-grid" className="marketing-grid-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href="/courses"
              data-gsap="exam-card"
              className="exam-category-card"
            >
              <h3 className="exam-category-title" style={{ color: cat.color }}>
                {cat.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.exams.map((exam) => (
                  <span 
                    key={exam} 
                    className="exam-capsule-badge"
                    style={{ 
                      background: `${cat.color}15`, 
                      color: cat.color, 
                      borderColor: `${cat.color}40` 
                    }}
                  >
                    {exam}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
