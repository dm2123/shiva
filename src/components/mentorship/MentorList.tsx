'use client';

import { useState, useEffect } from 'react';

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

interface MentorListProps {
  onSelect: (mentorId: string) => void;
}

export default function MentorList({ onSelect }: MentorListProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch('/api/student/mentors');
        const data = await res.json();
        if (data.success) setMentors(data.data.mentors);
      } catch (err) {
        console.error('Fetch mentors error:', err);
      }
      setLoading(false);
    };
    fetchMentors();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading mentors...</div>;
  }

  return (
    <div className="space-y-4">
      {mentors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No mentors available</p>
        </div>
      ) : (
        mentors.map(mentor => (
          <div
            key={mentor.userId}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">{mentor.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{mentor.name}</h3>
                <p className="text-sm text-slate-500">{mentor.specialization}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{mentor.bio}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>{mentor.experience} years exp</span>
                  <span>{mentor.activeStudents} students</span>
                  <span>{mentor.totalSessions} sessions</span>
                </div>
              </div>
              <button
                onClick={() => onSelect(mentor.userId)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Book
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
