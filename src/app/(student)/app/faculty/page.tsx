'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconUser, IconChevronRight, IconSearch, IconBook, IconClock, IconCheckCircle,
} from '@/components/student/StudentIcons';

interface Teacher {
  userId: string;
  name: string;
  specialization: string;
  experience: number;
  bio: string;
}

function FacultyCardSkeleton() {
  return (
    <div className="student-card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--student-surface)] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-[var(--student-surface)]" />
          <div className="h-3 w-1/3 rounded bg-[var(--student-surface)]" />
          <div className="h-3 w-full rounded bg-[var(--student-surface)]" />
        </div>
      </div>
    </div>
  );
}

function FacultyCard({ teacher }: { teacher: Teacher }) {
  return (
    <Link
      href={`/app/faculty/${teacher.userId}`}
      className="student-card group p-5 flex items-start gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
    >
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-2xl font-black text-white">
            {teacher.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
          <IconCheckCircle size={12} className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[var(--student-text)] group-hover:text-indigo-600 transition-colors">
            {teacher.name}
          </h3>
          <IconChevronRight size={16} className="text-[var(--student-text-faint)] group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
        </div>
        {teacher.specialization && (
          <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
            <IconBook size={11} />
            {teacher.specialization}
          </span>
        )}
        {teacher.bio && (
          <p className="text-[13px] text-[var(--student-text-muted)] mt-2 line-clamp-2 leading-relaxed">
            {teacher.bio}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2.5 text-[11px] font-medium text-[var(--student-text-faint)]">
          <span className="inline-flex items-center gap-1">
            <IconClock size={12} />
            {teacher.experience} yrs experience
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FacultyPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('/api/student/mentors');
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.mentors)) {
          setTeachers(data.data.mentors);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  const specializations = useMemo(
    () => Array.from(new Set(teachers.map((t) => t.specialization).filter(Boolean))),
    [teachers]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q)
    );
  }, [teachers, query]);

  return (
    <div className="space-y-6">
      <StudentPageHeader
        title="Our Faculty"
        description="Learn from experienced educators — real teachers, real guidance."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <FacultyCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <StudentEmptyState
          icon={<IconUser size={28} />}
          title="Couldn't load faculty"
          description="Something went wrong while fetching our faculty list. Please try again in a moment."
          actionText="Retry"
          actionHref="/app/faculty"
        />
      ) : teachers.length === 0 ? (
        <StudentEmptyState
          icon={<IconUser size={28} />}
          title="Faculty joining soon"
          description="We're onboarding experienced educators for THE SHIVA. Our faculty team will appear here as soon as the first teachers join."
          actionText="Explore Courses"
          actionHref="/app/courses"
          variant="large"
        />
      ) : (
        <>
          {teachers.length > 3 && (
            <div className="relative max-w-md">
              <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--student-text-faint)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or subject…"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--student-border-light)] bg-white text-sm text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
          )}

          {specializations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specializations.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-full bg-[var(--student-surface)] border border-[var(--student-border-light)] text-xs font-semibold text-[var(--student-text-secondary)]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <StudentEmptyState
              icon={<IconSearch size={28} />}
              title="No matching faculty"
              description={`No faculty found for "${query}". Try a different name or subject.`}
              variant="compact"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((teacher) => (
                <FacultyCard key={teacher.userId} teacher={teacher} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
