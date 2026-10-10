'use client';

import { useState, useEffect } from 'react';

interface NotesEditorProps {
  lectureId: string;
}

export default function NotesEditor({ lectureId }: NotesEditorProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/student/lectures/${lectureId}/notes`);
        const data = await res.json();
        if (data.success && data.data.note) {
          setContent(data.data.note.content);
        }
      } catch (err) {
        console.error('Fetch notes error:', err);
      }
    };
    fetchNotes();
  }, [lectureId]);

  const saveNotes = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/student/lectures/${lectureId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Save notes error:', err);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900 dark:text-white">My Notes</h3>
        <button
          onClick={saveNotes}
          disabled={saving || !content.trim()}
          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Notes'}
        </button>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your notes for this lecture..."
        className="w-full h-40 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
