'use client';

/**
 * Student Courses Catalog — client hissa (Wave B1, PW catalog parity).
 *
 * PW catalog ki anatomy: upar gol search bar; bade banner cards —
 * 16:9 banner (CourseBanner: asal thumbnail ya designed tile),
 * neeche bold title, audience/description line, meta line
 * (language · validity), price row + daayen KAALA CTA jo
 * enrollment state ke hisaab se badalta hai:
 *   enrolled → Continue · free → Enroll Free · paid → View Course.
 * Saara data server page se asal DB rows ke roop me aata hai;
 * yahan koi count/price invent nahi hota.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import CourseBanner from '@/components/student/CourseBanner';
import { IconPlay, IconCheckCircle, IconClock } from '@/components/student/StudentIcons';

export interface StudentCourseItem {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  language: string | null;
  validityMonths: number | null;
  targetAudience: string | null;
}

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

function CourseCard({
  course,
  isEnrolled,
}: {
  course: StudentCourseItem;
  isEnrolled: boolean;
}) {
  const isFree = course.price <= 0;
  const href = `/app/courses/${course.id}`;
  const audience = course.targetAudience
    ? course.targetAudience.split('\n').map((s) => s.trim()).find(Boolean)
    : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_6px_24px_rgba(42,22,80,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(42,22,80,0.12)]">
      {/* Banner — 16:9, asal thumbnail ya designed tile */}
      <Link href={href} aria-label={`${course.title} kholo`} className="block">
        <CourseBanner src={course.thumbnailUrl} title={course.title} seed={course.slug || course.id}>
          {isFree && (
            <span className="absolute left-3 top-3 rounded-full bg-[#f5b942] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#2a1650] shadow">
              100% Free
            </span>
          )}
          {isEnrolled && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#6d28d9] shadow">
              <IconCheckCircle size={11} />
              Enrolled
            </span>
          )}
        </CourseBanner>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* Title — course ka asal naam */}
        <Link href={href}>
          <h3 className="line-clamp-2 text-[16px] font-bold leading-snug text-gray-900 transition-colors hover:text-[#6d28d9]">
            {course.title}
          </h3>
        </Link>

        {/* Audience line — "For <audience>", sirf asal targetAudience par */}
        {audience && (
          <p className="mt-1 line-clamp-1 text-[13px] font-medium text-gray-500">For {audience}</p>
        )}
        {course.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
            {course.description}
          </p>
        )}

        {/* Meta line — sirf asal language / validity par (invent nahi) */}
        {(course.language || (course.validityMonths && course.validityMonths > 0)) && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-gray-400">
            {course.language && <span>🗣️ {course.language}</span>}
            {course.language && course.validityMonths && course.validityMonths > 0 && (
              <span className="text-gray-300" aria-hidden="true">•</span>
            )}
            {course.validityMonths && course.validityMonths > 0 && (
              <span className="inline-flex items-center gap-1">
                <IconClock size={12} />
                {course.validityMonths} mahine validity
              </span>
            )}
          </p>
        )}

        {/* Price row + KAALA CTA (state ke hisaab se) */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            {isFree ? (
              <p className="text-[19px] font-extrabold leading-tight text-emerald-600">Free</p>
            ) : (
              <p className="text-[20px] font-extrabold leading-tight text-gray-900">
                {formatINR(course.price)}
              </p>
            )}
          </div>
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111111] px-5 py-2.5 text-[13px] font-extrabold text-white shadow-lg shadow-black/20 transition-all hover:bg-black"
          >
            {isEnrolled && <IconPlay size={12} />}
            {isEnrolled ? 'Continue' : isFree ? 'Enroll Free' : 'View Course'}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function CoursesClient({
  courses,
  enrolledIds,
}: {
  courses: StudentCourseItem[];
  enrolledIds: string[];
}) {
  const [query, setQuery] = useState('');
  const enrolledSet = useMemo(() => new Set(enrolledIds), [enrolledIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      `${c.title} ${c.description ?? ''} ${(c.slug ?? '').replace(/-/g, ' ')}`
        .toLowerCase()
        .includes(q),
    );
  }, [courses, query]);

  return (
    <div>
      {/* Gol search bar — PW catalog pattern */}
      <div className="relative max-w-xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] opacity-50"
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for courses…"
          aria-label="Course search karo"
          className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-10 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-[#6d28d9] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Search saaf karo"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#ede9fe] font-extrabold text-[#6d28d9]"
          >
            ×
          </button>
        )}
      </div>

      {/* Result count — asal ginati */}
      <p className="mt-5 text-[13.5px] font-semibold text-gray-500" aria-live="polite">
        {filtered.length === courses.length
          ? `Kul ${courses.length} course${courses.length === 1 ? '' : 's'}`
          : `${filtered.length} of ${courses.length} courses dikh rahe hain`}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]" role="status">
          <p className="text-[15px] font-bold text-gray-900">
            “{query.trim()}” se match karta koi course nahi mila
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
            Spelling check karo ya search saaf karke saare courses dekho.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-black"
          >
            Saare Courses Dekho
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} isEnrolled={enrolledSet.has(course.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
