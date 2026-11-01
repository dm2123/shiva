'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
    <div className="student-card group p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/20 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6d28d9] via-violet-600 to-[#2a1650] ring-2 ring-[#f5b942]/50 flex items-center justify-center shadow-lg shadow-violet-900/30">
            <span className="text-xl font-black text-white">
              {mentor.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--student-text)]">{mentor.name}</h3>
          {mentor.specialization && (
            <span className="inline-block mt-1 rounded-full bg-[var(--student-primary-light)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--student-primary)]">
              {mentor.specialization}
            </span>
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
            {mentor.activeStudents > 0 && (
              <span className="inline-flex items-center gap-1">
                <IconUsers size={12} />
                {mentor.activeStudents} students mentored
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onSelect(mentor.userId)}
          className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#2a1650] text-white text-[13px] font-bold shadow-md shadow-violet-900/30 ring-1 ring-[#f5b942]/40 hover:shadow-lg hover:shadow-violet-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all min-h-[44px]"
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--student-text-muted)] hover:text-violet-600 transition-colors min-h-[44px]"
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
              Check <Link href="/app/mentors/sessions" className="text-violet-600 font-semibold hover:underline">My Sessions</Link> for details.
            </p>
            <button
              onClick={() => {
                setSelectedMentor(null);
                setBooked(false);
              }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] text-sm font-bold text-[var(--student-text)] hover:border-violet-300 transition-colors min-h-[44px]"
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
      {/* Hero (PW-style, platform palette) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] p-6 sm:p-8 text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-[#f5b942]/20 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5b942] px-3 py-1 text-[11px] font-black tracking-widest text-[#2a1650]">
              🎓 1:1 MENTORSHIP
            </span>
            <Link
              href="/app/mentors/sessions"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-[13px] font-bold text-white backdrop-blur transition hover:bg-white/25 min-h-[40px]"
            >
              <IconCalendar size={14} />
              My Sessions
            </Link>
          </div>
          <h1 className="mt-3 text-2xl font-black sm:text-3xl">Mentorship</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Get 1:1 guidance from experienced teachers — book a personal session.
          </p>
          {!loading && mentors.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-3">
                <p className="text-xl font-black leading-none">{mentors.length}</p>
                <p className="text-[10px] text-violet-100 mt-1 uppercase tracking-wider font-semibold">
                  Mentors
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-3">
                <p className="text-xl font-black leading-none">
                  {mentors.reduce((sum, m) => sum + (m.totalSessions || 0), 0)}
                </p>
                <p className="text-[10px] text-violet-100 mt-1 uppercase tracking-wider font-semibold">
                  Sessions held
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--student-border-light)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
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
