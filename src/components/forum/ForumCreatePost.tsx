'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ForumCreatePostProps {
  courseId?: string;
  onSuccess?: () => void;
}

export default function ForumCreatePost({ courseId, onSuccess }: ForumCreatePostProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/student/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), courseId }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/app/forum/${data.data.id}`);
        onSuccess?.();
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to create post');
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Start a Discussion</h3>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Question title"
        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Describe your question in detail..."
        className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting || !title.trim() || !content.trim()}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post Question'}
      </button>
    </div>
  );
}
