'use client';

import { useRouter } from 'next/navigation';


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

export default function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const router = useRouter();

  const getStatus = () => {
    if (assignment.marks !== null) return { label: 'Graded', color: 'text-green-400', icon: '🏆' };
    if (assignment.submitted) return { label: 'Submitted', color: 'text-blue-400', icon: '✓' };
    return { label: 'Pending', color: 'text-yellow-400', icon: '⏰' };
  };

  const status = getStatus();
  const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.submitted;

  return (
    <div
      onClick={() => router.push(`/app/assignments/${assignment.id}`)}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold text-lg">{assignment.title}</h3>
        <span className={`flex items-center gap-1 text-sm ${status.color}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-3">{assignment.courseName}</p>

      <div className="flex items-center justify-between">
        <span className={`text-sm ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </span>
        {assignment.marks !== null && (
          <span className="text-green-400 font-semibold">{assignment.marks} marks</span>
        )}
      </div>
    </div>
  );
}
