import Link from 'next/link';
import { Course } from '@/types/models';
import { IconArrowRight, IconLayers, IconClock } from './StudentIcons';

interface StudentCourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

export default function StudentCourseCard({ course, isEnrolled = false }: StudentCourseCardProps) {
  return (
    <div className="student-card overflow-hidden flex flex-col group">
      {/* Card cover */}
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-violet-500/5 group-hover:from-indigo-500/10 group-hover:to-violet-500/10 transition-all duration-500" />

        {/* Course icon */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border border-white/50 dark:border-slate-600/50 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-indigo transition-all duration-500">
          <IconLayers size={24} className="text-[var(--student-primary)]" />
        </div>

        {/* Status capsule */}
        <div className="absolute top-3 right-3">
          <span className={`capsule ${
            course.status === 'PUBLISHED' ? 'capsule-success' : 'capsule-warning'
          }`}>
            {course.status === 'PUBLISHED' ? 'Active' : 'Draft'}
          </span>
        </div>

        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute top-3 left-3">
            <span className="capsule capsule-primary">Enrolled</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[15px] font-bold text-[var(--student-text)] line-clamp-2 leading-snug mb-1.5 group-hover:text-[var(--student-primary)] transition-colors duration-200">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-[var(--student-text-muted)] line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-[var(--student-text-faint)] mt-auto mb-4">
          <span className="flex items-center gap-1">
            <IconClock size={12} />
            Self-paced
          </span>
        </div>

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--student-border-light)]">
          <span className="text-sm font-bold text-[var(--student-text)]">
            {course.price > 0 ? `₹${course.price.toLocaleString()}` : 'Free'}
          </span>

          <Link
            href={isEnrolled ? `/app/learn/${course.id}` : `/app/courses`}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
              isEnrolled
                ? 'bg-[var(--student-primary)] text-white hover:bg-[var(--student-primary-hover)] shadow-sm shadow-indigo-500/15'
                : 'bg-[var(--student-surface)] text-[var(--student-text)] border border-[var(--student-border)] hover:border-[var(--student-primary)] hover:text-[var(--student-primary)]'
            }`}
          >
            {isEnrolled ? 'Continue' : 'View'}
            <IconArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
