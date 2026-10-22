'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface MarketingStatsProps {
  stats: {
    students: number;
    teachers: number;
    courses: number;
    educators: number;
  };
}

/**
 * Marketing Stats Section with Live Counts
 * Automatically updates from real database counts
 * No fake numbers - shows actual enrolled students, teachers, published courses
 */
export default function MarketingStats({ stats }: MarketingStatsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState({ students: 0, teachers: 0, courses: 0, educators: 0 });

  useEffect(() => {
    // Animate count-up on mount
    const duration = 2;
    const tempCounts = { students: 0, teachers: 0, courses: 0, educators: 0 };
    
    gsap.to(tempCounts, {
      students: stats.students,
      teachers: stats.teachers,
      courses: stats.courses,
      educators: stats.educators,
      duration,
      ease: 'power2.out',
      onUpdate: function() {
        setCounts({
          students: Math.floor(tempCounts.students),
          teachers: Math.floor(tempCounts.teachers),
          courses: Math.floor(tempCounts.courses),
          educators: Math.floor(tempCounts.educators),
        });
      }
    });

    // Fade in on scroll
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }
  }, [stats]);

  const statItems = [
    { 
      label: 'Active Students', 
      value: counts.students, 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'text-blue-400' 
    },
    { 
      label: 'Expert Teachers', 
      value: counts.teachers, 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'text-emerald-400' 
    },
    { 
      label: 'Published Courses', 
      value: counts.courses, 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'text-violet-400' 
    },
    { 
      label: 'Partner Educators', 
      value: counts.educators, 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'text-teal-400' 
    },
  ];

  const allZero =
    stats.students === 0 && stats.teachers === 0 && stats.courses === 0 && stats.educators === 0;

  return (
    <section ref={sectionRef} className="marketing-section-xs relative" aria-label="Platform numbers">
      <div className="marketing-container">
        <div className="shiva-glass rounded-2xl px-6 py-8 md:px-10 md:py-10">
          {allZero ? (
            /* Koi asal count abhi nahi hai — nakli zero-grid ki jagah imaandaar sandesh */
            <p className="text-center text-sm md:text-base text-slate-300 leading-relaxed">
              THE SHIVA abhi shuru ho raha hai — jaise-jaise students judenge, yahan ke numbers
              <span className="text-white font-semibold"> asal platform data </span>
              se badhte jayenge. Koi nakli ankde nahi.
            </p>
          ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {statItems.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className={`stat-icon ${stat.color}`} aria-hidden="true">
                  {stat.icon}
                </div>
                <div className="stat-number">
                  {stat.value.toLocaleString('en-IN')}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          )}
          {!allZero && (
            <p className="mt-6 text-center text-[11px] text-slate-500">
              Live counts — THE SHIVA platform ke asal data se
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
