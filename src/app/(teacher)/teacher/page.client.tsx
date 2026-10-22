'use client';

import { useRef, Suspense, lazy } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TeacherGlassPanel, TeacherStatusCapsule } from '@/components/teacher/TeacherShared';
import { 
  IconPlus, IconBookOpen, IconVideo, IconUsers, IconHelpCircle, 
  IconTarget, IconRadio, IconArrowRight
} from '@/components/teacher/TeacherIcons';

// Lazy load WebGL
const TeacherWebGLHero = lazy(() => import('@/components/teacher/TeacherWebGLHero'));

interface TeacherDashboardClientProps {
  userEmail: string;
  courses: any[];
  pendingDoubts: number;
  courseStats?: Record<string, any>;
}

export default function TeacherDashboardClient({ userEmail, courses, pendingDoubts, courseStats = {} }: TeacherDashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('[data-gsap="hero"]',
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 }
      )
      .fromTo('[data-gsap="card"]',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
        '-=0.4'
      )
      .fromTo('[data-gsap="action"]',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05 },
        '-=0.4'
      );
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  const displayName = userEmail.split('@')[0];

  return (
    <div className="space-y-8 relative" ref={containerRef}>
      
      {/* ── Premium Hero ────────────────────────────── */}
      <section 
        data-gsap="hero" 
        className="relative z-10 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-teal-800/50"
      >
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Floating WebGL layer for desktop */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-[45%] z-0">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-32 h-32 rounded-full bg-teal-500/20 animate-pulse blur-2xl" /></div>}>
            <TeacherWebGLHero />
          </Suspense>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col lg:flex-row p-8 md:p-12">
          <div className="w-full lg:w-3/5 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-widest border border-teal-500/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Educator Workspace
            </span>
            
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Welcome back, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Dr. {displayName}</span>
            </h1>
            
            <p className="text-slate-300 max-w-md text-sm md:text-base leading-relaxed">
              Command your digital classroom. You have {courses.length} active courses and {pendingDoubts} pending student doubts requiring attention.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/teacher/questions" className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-teal-500/30">
                <IconPlus size={18} />
                Add Questions
              </Link>
              <Link href="/teacher/lectures" className="flex items-center gap-2 px-6 py-3 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-white font-semibold rounded-xl transition-all border border-white/10 backdrop-blur-md">
                Upload Lecture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Actions (Floating UI) ──────────────── */}
      <section data-gsap="card" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { name: 'Tests', icon: IconTarget, href: '/teacher/tests', color: 'text-indigo-500' },
          { name: 'Live Class', icon: IconRadio, href: '/teacher/live-classes', color: 'text-pink-500' },
          { name: 'Doubts', icon: IconHelpCircle, href: '/teacher/doubts', color: 'text-amber-500', badge: pendingDoubts },
          { name: 'Students', icon: IconUsers, href: '/teacher/students', color: 'text-emerald-500' },
        ].map((action, i) => {
          const ActionIcon = action.icon;
          return (
            <Link key={i} data-gsap="action" href={action.href} className="group relative flex flex-col items-center justify-center p-4 bg-[var(--teacher-surface)] border border-[var(--teacher-border)] rounded-2xl hover:border-teal-500 hover:shadow-lg shadow-teal-500/10 transition-all duration-300">
              {action.badge && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {action.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl bg-[var(--teacher-background)] flex items-center justify-center group-hover:scale-110 transition-transform ${action.color}`}>
                <ActionIcon size={24} />
              </div>
              <span className="text-xs font-semibold text-[var(--teacher-text)] mt-3 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                {action.name}
              </span>
            </Link>
          );
        })}
      </section>

      {/* ── Overview Layout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1 & 2: Active Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-[var(--teacher-text)]">Active Courses</h2>
            <Link href="/teacher/courses" className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <IconArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {courses.length === 0 ? (
              <TeacherGlassPanel>
                <div className="text-center py-8 text-[var(--teacher-text-muted)]">
                  <IconBookOpen size={32} className="mx-auto mb-3 opacity-50" />
                  <p>You have not been assigned any courses yet.</p>
                </div>
              </TeacherGlassPanel>
            ) : (
              courses.slice(0, 3).map((course, i) => (
                <TeacherGlassPanel key={course.id} data-gsap="card" className="group flex flex-col sm:flex-row items-center gap-6 p-5 hover:border-teal-500/50 transition-colors">
                  <div className="w-full sm:w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 relative">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500/20 to-emerald-500/20">
                        <IconBookOpen size={32} className="text-teal-600/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-[var(--teacher-text)] leading-tight">{course.title}</h3>
                      <TeacherStatusCapsule status={course.isPublished ? "Published" : "Draft"} />
                    </div>
                    <p className="text-sm text-[var(--teacher-text-muted)] line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex gap-2 text-[10px] font-bold">
                        <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          {(courseStats[course.id]?.students ?? 0)} students
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-[var(--teacher-border)]">
                          {(courseStats[course.id]?.lectures ?? 0)} lectures
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-[var(--teacher-border)]">
                          {(courseStats[course.id]?.questions ?? 0)} questions
                        </span>
                      </div>
                      <Link href={`/teacher/lectures?courseId=${course.id}`} className="px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors ml-auto">
                        Manage Content
                      </Link>
                    </div>
                  </div>
                </TeacherGlassPanel>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Content Snapshot */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--teacher-text)]">Content Snapshot</h2>
          
          <TeacherGlassPanel data-gsap="card" className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Assigned Courses', value: courses.length },
                { label: 'Total Students', value: Object.values(courseStats).reduce((t: number, s: any) => t + (s.students || 0), 0) },
                { label: 'Total Lectures', value: Object.values(courseStats).reduce((t: number, s: any) => t + (s.lectures || 0), 0) },
                { label: 'Total Questions', value: Object.values(courseStats).reduce((t: number, s: any) => t + (s.questions || 0), 0) },
                { label: 'Subjects', value: Object.values(courseStats).reduce((t: number, s: any) => t + (s.subjects || 0), 0) },
                { label: 'Chapters', value: Object.values(courseStats).reduce((t: number, s: any) => t + (s.chapters || 0), 0) },
              ].map((x) => (
                <div key={x.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                  <p className="text-xl font-black text-[var(--teacher-text)]">{x.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--teacher-text-muted)] mt-0.5">{x.label}</p>
                </div>
              ))}
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-2 before:-ml-px before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
              {courses.slice(0, 3).map((course, i) => {
                const s = courseStats[course.id] || {};
                return (
                  <div key={course.id} className="relative">
                    <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-teal-500 ring-4 ring-[var(--teacher-surface)]"></div>
                    <h4 className="text-sm font-bold text-[var(--teacher-text)] leading-tight">{course.title}</h4>
                    <p className="text-xs text-[var(--teacher-text-muted)] mt-1">
                      {s.lectures || 0} lectures · {s.questions || 0} questions · {s.chapters || 0} chapters · {s.students || 0} students
                    </p>
                    <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, ((s.lectures || 0) / Math.max(1, (i + 1) * 5)) * 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TeacherGlassPanel>
        </div>

      </div>
    </div>
  );
}
