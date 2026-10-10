'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AssignmentSubmit from '@/components/assignments/AssignmentSubmit';

import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  courseName: string;
  questions: string;
}

interface Submission {
  id: number;
  content: string;
  fileUrl: string;
  status: string;
  marks: number | null;
  feedback: string | null;
  createdAt: string;
}

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch(`/api/student/assignments/${id}`);
    const data = await res.json();
    setAssignment(data.assignment);
    setSubmission(data.submission);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (content: string, fileUrl?: string) => {
    await fetch(`/api/student/assignments/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, fileUrl }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <p className="text-red-400">Assignment not found.</p>
      </div>
    );
  }

  const questions = (() => {
    try {
      return JSON.parse(assignment.questions || '[]');
    } catch {
      return [];
    }
  })();

  const isOverdue = new Date(assignment.dueDate) < new Date() && !submission;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/app/assignments" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4">
          ←
          Back to Assignments
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{assignment.title}</h1>
          <p className="text-purple-400 text-sm mb-4">{assignment.courseName}</p>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              📅
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
            {isOverdue && <span className="text-red-400">Overdue</span>}
          </div>

          {assignment.description && (
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{assignment.description}</p>
          )}

          {questions.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-white font-semibold">Questions</h3>
              {questions.map((q: string, i: number) => (
                <div key={i} className="bg-gray-800 rounded-md p-3 text-gray-300 text-sm">
                  <span className="text-purple-400 font-medium">Q{i + 1}.</span> {q}
                </div>
              ))}
            </div>
          )}
        </div>

        {submission ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              Your Submission
              <span className={`text-xs px-2 py-0.5 rounded ${
                submission.status === 'graded' ? 'bg-green-900 text-green-400' : 'bg-blue-900 text-blue-400'
              }`}>
                {submission.status}
              </span>
            </h3>

            {submission.content && (
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{submission.content}</p>
            )}

            {submission.fileUrl && (
              <p className="text-purple-400 text-sm">Attached: {submission.fileUrl}</p>
            )}

            <p className="text-gray-500 text-xs">
              Submitted: {new Date(submission.createdAt).toLocaleString()}
            </p>

            {submission.marks !== null && (
              <div className="bg-gray-800 rounded-md p-4 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400 text-lg">🏆</span>
                  <span className="text-green-400 font-bold text-lg">{submission.marks} marks</span>
                </div>
                {submission.feedback && (
                  <p className="text-gray-400 text-sm">{submission.feedback}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <AssignmentSubmit assignmentId={Number(id)} onSubmit={handleSubmit} disabled={isOverdue} />
        )}
      </div>
    </div>
  );
}
