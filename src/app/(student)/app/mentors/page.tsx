'use client';

import { useState } from 'react';
import MentorList from '@/components/mentorship/MentorList';
import MentorBooking from '@/components/mentorship/MentorBooking';
import Link from 'next/link';

export default function MentorsPage() {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);

  if (selectedMentor) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedMentor(null)}
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Back to mentors
        </button>
        <MentorBooking
          mentorId={selectedMentor}
          onBooked={() => {
            setSelectedMentor(null);
            alert('Session booked!');
          }}
          onCancel={() => setSelectedMentor(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mentorship</h1>
          <p className="text-slate-500 mt-1">Get 1:1 guidance from expert teachers</p>
        </div>
        <Link
          href="/app/mentors/sessions"
          className="text-sm text-indigo-600 hover:underline"
        >
          My Sessions →
        </Link>
      </div>
      <MentorList onSelect={setSelectedMentor} />
    </div>
  );
}
