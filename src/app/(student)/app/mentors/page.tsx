'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import MentorBooking from '@/components/mentorship/MentorBooking';
import {
  IconUsers, IconArrowLeft, IconCalendar, IconClock, IconCheckCircle, IconSearch,
} from '@/components/student/StudentIcons';

interface Mentor {
  userId: string;
  name: string;
  email: string;
  specialization: string;
  experience: number;
  bio: string;
  activeStudents: number;
  totalSessions: number;
}

function MentorCardSkeleton() {
  return (
    <div className="student-card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--student-surface)] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded bg-[var(--student-surface)]" />
          <div className="h-3 w-1/3 rounded bg-[var(--student-surface)]" />
          <div className="h-3 w-full rounded bg-[var(--student-surface)]" />
        </div>
        <div className="h-9 w-20 rounded-xl bg-[var(--student-surface)] flex-shrink-0" />
      </div>
    </div>
  );
}

function MentorCard({ mentor, onSelect }: { mentor: Mentor; onSelect: (id: string) => void }) {
  return (
    <div className="student-card group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xl font-black text-white">
              {mentor.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--student-text)]">{mentor.name}</h3>
          {mentor.specialization && (
            <p className="text-[12px] font-semibold text-indigo-600 mt-0.5">{mentor.specialization}</p>
          )}
          {mentor.bio && (
            <p className="text-[13px] text-[var(--student-text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
              {mentor.bio}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] font-medium text-[var(--student-text-faint)]">
            <span className="inline-flex items-center gap-1">
              <IconClock size={12} />
              {mentor.experience} yrs exp
            </span>
            {mentor.totalSessions > 0 && (
              <span className="inline-flex items-center gap-1">
                <IconCalendar size={12} />
                {mentor.totalSessions} sessions
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onSelect(mentor.userId)}
          className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[13px] font-bold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all min-h-[44px]"
        >
          Book
        </button>
      </div>
    </div>
  );
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch('/api/student/mentors');
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.mentors)) {
          setMentors(data.data.mentors);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetchMentors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.specialization?.toLowerCase().includes(q)
    );
  }, [mentors, query]);

  if (selectedMentor) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => {
            setSelectedMentor(null);
            setBooked(false);
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--student-text-muted)] hover:text-indigo-600 transition-colors min-h-[44px]"
        >
          <IconArrowLeft size={16} />
          Back to mentors
        </button>

        {booked ? (
          <div className="student-card p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <IconCheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-[var(--student-text)]">Session booked!</h2>
            <p className="text-sm text-[var(--student-text-muted)] mt-2 max-w-sm mx-auto">
              Your mentorship session with <strong>{selectedMentor.name}</strong> is confirmed.
              Check <Link href="/app/mentors/sessions" className="text-indigo-600 font-semibold hover:underline">My Sessions</Link> for details.
            </p>
            <button
              onClick={() => {
                setSelectedMentor(null);
                setBooked(false);
              }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] text-sm font-bold text-[var(--student-text)] hover:border-indigo-300 transition-colors min-h-[44px]"
            >
              Back to mentors
            </button>
          </div>
        ) : (
          <MentorBooking
            mentorId={selectedMentor.userId}
            onBooked={() => setBooked(true)}
            onCancel={() => setSelectedMentor(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StudentPageHeader
        title="Mentorship"
        description="Get 1:1 guidance from experienced teachers — book a personal session."
        action={{ text: 'My Sessions', href: '/app/mentors/sessions' }}
      />

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <MentorCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <StudentEmptyState
          icon={<IconUsers size={28} />}
          title="Couldn't load mentors"
          description="Something went wrong while fetching mentors. Please try again in a moment."
          actionText="Retry"
          actionHref="/app/mentors"
        />
      ) : mentors.length === 0 ? (
        <StudentEmptyState
          icon={<IconUsers size={28} />}
          title="Mentors joining soon"
          description="Our 1:1 mentorship program launches with our first teachers. Until then, explore courses and keep learning — mentors will appear here soon."
          actionText="Explore Courses"
          actionHref="/app/courses"
          variant="large"
        />
      ) : (
        <>
          {mentors.length > 3 && (
            <div className="relative max-w-md">
              <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--student-text-faint)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mentors by name or subject…"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--student-border-light)] bg-white text-sm text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
          )}

          {filtered.length === 0 ? (
            <StudentEmptyState
              icon={<IconSearch size={28} />}
              title="No matching mentors"
              description={`No mentors found for "${query}". Try a different name or subject.`}
              variant="compact"
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((mentor) => (
                <MentorCard
                  key={mentor.userId}
                  mentor={mentor}
                  onSelect={(id) => setSelectedMentor(mentors.find((m) => m.userId === id) || null)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
