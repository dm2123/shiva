'use client';

import { useState, useEffect } from 'react';
import AssignmentCard from '@/components/assignments/AssignmentCard';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  courseName: string;
  submitted: number;
  submissionId: number | null;
  marks: number | null;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    fetch('/api/student/assignments')
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data.assignments || []);
        setLoading(false);
      });
  }, []);

  const filtered = assignments.filter((a) => {
    if (filter === 'pending') return !a.submitted;
    if (filter === 'submitted') return a.submitted && a.marks === null;
    if (filter === 'graded') return a.marks !== null;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Assignments</h1>

        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'submitted', 'graded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading assignments...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No assignments found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
