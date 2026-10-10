'use client';

import { useRef, Suspense, lazy } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { StudentBlobBackground } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconBook, IconPencil, IconHelpCircle, IconTrendingUp,
  IconRadio, IconArrowRight, IconZap, IconTarget
} from '@/components/student/StudentIcons';

// Lazy load Three.js WebGL scene for premium visual
const WebGLHero = lazy(() => import('@/components/student/WebGLHero'));

export interface DashboardEnrollment {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  price: number;
  batchName: string | null;
  totalLectures: number;
  completedLectures: number;
}

export interface DashboardLiveClass {
  id: string;
  title: string;
  startTime: string;
  meetingUrl: string | null;
  status: string;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface DashboardClientProps {
  userEmail: string;
  enrollments: DashboardEnrollment[];
  upcomingLiveClasses: DashboardLiveClass[];
  pendingDoubts: number;
}

export default function DashboardClient({ userEmail, enrollments, upcomingLiveClasses, pendingDoubts }: DashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP dashboard entrance animation
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('[data-gsap="hero"]',
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 }
      )
      .fromTo('[data-gsap="card"]',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.3'
      )
      .fromTo('[data-gsap="action"]',
        { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06 },
        '-=0.3'
      );
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  const displayName = userEmail.split('@')[0];

  return (
    <div className="space-y-10 relative" ref={containerRef}>
      {/* Decorative morphing blobs */}
      <StudentBlobBackground />

      {/* ── Premium Welcome Hero with WebGL ──────────────────────────── */}
      <section
        data-gsap="hero"
        className="relative z-10 glass-panel rounded-3xl overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50 dark:from-slate-900/95 dark:via-slate-900/85 dark:to-slate-900/50 z-[1]" />

        <div className="relative z-[2] flex flex-col lg:flex-row items-start lg:items-center p-8 md:p-10 lg:p-12">
          <div className="space-y-5 w-full lg:w-3/5">
            <span className="capsule capsule-primary">
              <IconZap size={10} />
              Student Workspace
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--student-text)] tracking-tight leading-[1.1]">
              Welcome back,{' '}
              <span className="text-gradient-warm">{displayName}</span>
            </h1>

            <p className="text-sm md:text-base text-[var(--student-text-muted)] max-w-lg leading-relaxed">
              Continue your structured learning journey. Pick up right where you left off in your curriculum.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link href="/app/courses" className="btn-primary">
                Browse Curriculum
                <IconArrowRight size={14} />
              </Link>
              <Link href="/app/performance" className="btn-secondary hidden sm:inline-flex">
                View Progress
              </Link>
            </div>
          </div>

          {/* WebGL Three.js scene — desktop only, lazy loaded */}
          <div className="hidden xl:block absolute right-0 top-0 h-full w-[45%] z-0">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 animate-pulse-subtle blur-2xl opacity-40" />
              </div>
            }>
              <WebGLHero />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── Active Learning Section ───────────────────────── */}
      <section className="relative z-10 space-y-5" data-gsap="card">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--student-text)] tracking-tight">Active Learning</h2>
            <p className="text-xs text-[var(--student-text-faint)] font-medium uppercase tracking-widest mt-1">Enrolled courses</p>
          </div>
{enrollments.length > 0 && (
            <Link href="/app/courses" className="btn-ghost text-xs text-[var(--student-primary)]">
              View All <IconArrowRight size={12} />
            </Link>
          )}
        </div>

        {enrollments.length === 0 ? (
            <StudentEmptyState
              icon={<IconBook size={24} />}
              title="No Active Enrollments"
              description="You are not enrolled in any courses yet. Explore our curriculum and begin your structured learning journey."
              actionText="Browse Curriculum"
              actionHref="/app/courses"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => {
                const pct = enrollment.totalLectures === 0
                  ? 0
                  : Math.round((enrollment.completedLectures / enrollment.totalLectures) * 100);
                return (
                  <Link
                    key={enrollment.courseId}
                    href={`/app/learn/${enrollment.courseId}`}
                    className="student-card p-5 block hover:border-[var(--student-primary)] hover:shadow-indigo transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[var(--student-text)] truncate">{enrollment.courseTitle}</h3>
                        {enrollment.batchName && (
                          <p className="text-xs text-[var(--student-text-muted)] mt-0.5">
                            Batch: {enrollment.batchName}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${enrollment.price === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {enrollment.price === 0 ? 'Free' : `₹${enrollment.price}`}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[var(--student-text-muted)]">
                          {enrollment.completedLectures} / {enrollment.totalLectures} lectures
                        </span>
                        <span className="font-bold text-[var(--student-primary)]">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--student-surface-hover)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--student-primary)] to-amber-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[var(--student-primary)]">
                      Continue Learning
                      <IconArrowRight size={14} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Upcoming Live Classes ───────────────────────── */}
        <section className="relative z-10 space-y-5" data-gsap="card">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--student-text)] tracking-tight">Live Classes</h2>
              <p className="text-xs text-[var(--student-text-faint)] font-medium uppercase tracking-widest mt-1">Upcoming sessions</p>
            </div>
            {upcomingLiveClasses.length > 0 && (
              <Link href="/app/live" className="btn-ghost text-xs text-[var(--student-primary)]">
                View All <IconArrowRight size={12} />
              </Link>
            )}
          </div>

          {upcomingLiveClasses.length === 0 ? (
            <div className="p-8 student-card text-center">
              <p className="text-sm text-[var(--student-text-muted)]">No live classes scheduled right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingLiveClasses.map((live) => (
                <div key={live.id} className="student-card p-5 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                    <IconRadio size={16} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--student-text)] leading-snug">{live.title}</h3>
                    <p className="text-xs text-[var(--student-text-muted)] mt-1.5">
                      {formatDateTime(live.startTime)}
                    </p>
                    <span className={live.status === 'LIVE' ? 'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 mt-2' : 'hidden'}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                      Live Now
                    </span>
                  </div>
                  {live.meetingUrl && (
                    <a href={live.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs mt-auto">
                      Join Session
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      {/* ── Quick Actions (Floating UI Grid) ──────────────── */}
      <section className="relative z-10 space-y-5" data-gsap="card">
        <h2 className="text-xl font-bold text-[var(--student-text)] tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Practice',    href: '/app/practice',    icon: IconPencil,     color: 'indigo' },
            { name: 'Tests',       href: '/app/tests',       icon: IconTarget,     color: 'violet' },
            { name: 'Live Classes',href: '/app/live',        icon: IconRadio,      color: 'red' },
            { name: 'Doubts',      href: '/app/doubts',      icon: IconHelpCircle, color: 'amber' },
            { name: 'Performance', href: '/app/performance', icon: IconTrendingUp, color: 'emerald' },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                data-gsap="action"
                className="group student-card p-5 flex flex-col items-center justify-center text-center gap-3 hover:border-[var(--student-primary)] hover:shadow-indigo"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--student-surface-hover)] border border-[var(--student-border-light)] flex items-center justify-center group-hover:bg-[var(--student-primary-light)] group-hover:border-transparent group-hover:scale-110 transition-all duration-300">
                  <ActionIcon size={18} className="text-[var(--student-text-muted)] group-hover:text-[var(--student-primary)] transition-colors" />
                </div>
                <span className="text-xs font-semibold text-[var(--student-text-muted)] group-hover:text-[var(--student-text)] transition-colors">
                  {action.name}
                </span>
                {action.name === 'Doubts' && pendingDoubts > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {pendingDoubts} open
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
