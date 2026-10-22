'use client';

import { useState, useEffect } from 'react';


interface VerifiedNote {
  id: number;
  title: string;
  content: string;
  subject?: string;
  teacherName: string;
  lectureTitle?: string;
  createdAt: string;
}

interface VerifiedNotesProps {
  lectureId?: string;
}

export default function VerifiedNotes({ lectureId }: VerifiedNotesProps) {
  const [notes, setNotes] = useState<VerifiedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const params = new URLSearchParams();
        if (lectureId) params.set('lectureId', lectureId);

        const res = await fetch(`/api/student/verified-notes?${params}`);
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error('Failed to fetch verified notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [lectureId]);

  if (loading) return <p className="text-gray-500">Loading verified notes...</p>;
  if (notes.length === 0) return <p className="text-gray-500">No verified notes available.</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Verified Notes</h3>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{note.title}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  By {note.teacherName}
                  {note.lectureTitle && ` · ${note.lectureTitle}`}
                </p>
                {note.subject && (
                  <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {note.subject}
                  </span>
                )}
                <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</div>
              </div>
              <a
                href={`/api/student/verified-notes/${note.id}/download`}
                className="ml-4 shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Download
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
