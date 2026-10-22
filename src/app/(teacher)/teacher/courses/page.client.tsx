'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { 
  TeacherPageHeader, TeacherGlassPanel, TeacherStatusCapsule 
} from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import { 
  IconPlus, IconSearch, IconFilter, IconMoreVertical, IconEdit, IconTrash, IconEye, IconBookOpen
} from '@/components/teacher/TeacherIcons';

interface TeacherCoursesClientProps {
  courses: any[];
}

export default function TeacherCoursesClient({ courses }: TeacherCoursesClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' 
      ? true 
      : activeTab === 'PUBLISHED' ? c.isPublished : !c.isPublished;
    return matchesSearch && matchesTab;
  });

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.stagger-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [filteredCourses, activeTab]); // Re-run when filter changes

  return (
    <div className="space-y-6 md:space-y-8 relative" ref={containerRef}>
      
      {/* ── Header with Liquid Accent ───────────────── */}
      <div className="relative z-10">
        <div className="absolute top-0 left-1/4 w-1/2 h-32 bg-teal-500/10 blur-3xl rounded-[100%] -z-10 pointer-events-none"></div>
        <TeacherPageHeader
          title="Courses"
          description="Manage your curriculum, review course analytics, and publish new material."
        />
      </div>

      {/* ── Glassmorphism Filter Toolbar ────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-[var(--teacher-surface)]/70 backdrop-blur-md border border-[var(--teacher-border)] rounded-2xl shadow-sm z-20 relative">
        <div className="flex w-full md:w-auto overflow-x-auto custom-scrollbar p-1 items-center gap-1">
          {['ALL', 'PUBLISHED', 'DRAFT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                activeTab === tab 
                  ? 'bg-[var(--teacher-primary)] text-white shadow-md' 
                  : 'text-[var(--teacher-text-muted)] hover:bg-[var(--teacher-primary-light)] hover:text-[var(--teacher-text)]'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 px-2 md:px-0">
          <div className="relative flex-1 md:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--teacher-primary)] outline-none text-[var(--teacher-text)] transition-shadow"
            />
          </div>
          <button className="p-2.5 text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <IconFilter size={20} />
          </button>
        </div>
      </div>

      {/* ── Course Grid / Empty State ─────────────────── */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <TeacherGlassPanel key={course.id} className="stagger-card group flex flex-col h-full border border-[var(--teacher-border)] hover:border-teal-400/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="h-40 bg-slate-100 dark:bg-slate-800 relative w-full overflow-hidden">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500/20 to-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
                    <IconBookOpen size={40} className="text-teal-600/50" />
                  </div>
                )}
                <div className="absolute top-3 inset-x-3 flex justify-between items-start">
                  <TeacherStatusCapsule status={course.isPublished ? "Published" : "Draft"} />
                </div>
              </div>
              
              <div className="flex-1 p-5 flex flex-col">
                <h2 className="text-xl font-bold text-[var(--teacher-text)] mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">{course.title}</h2>
                <p className="text-sm text-[var(--teacher-text-muted)] line-clamp-2 mb-4 flex-1">
                  {course.description || "No description provided."}
                </p>
                
                <div className="pt-4 border-t border-[var(--teacher-border)] flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[var(--teacher-text)] rounded-md">Assigned</span>
                  </div>
                  <Link 
                    href={`/teacher/lectures?courseId=${course.id}`}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 px-4 py-2 rounded-lg transition-colors"
                  >
                    Manage Content
                  </Link>
                </div>
              </div>
            </TeacherGlassPanel>
          ))}
        </div>
      ) : (
        <TeacherEmptyState 
          illustrationType="courses"
          title={searchQuery ? "No courses found" : "No assigned courses"}
          description={searchQuery ? `Your search for "${searchQuery}" didn't match any courses.` : "The administrator has not assigned you any courses yet. Contact your admin to get course assignments."}
          actionLabel={searchQuery ? "Clear Search" : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      )}
    </div>
  );
}