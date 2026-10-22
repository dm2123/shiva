'use client';

import { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  courseId: string;
  onSuccess: () => void;
}

export default function ReviewForm({ courseId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/student/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title: title.trim(), content: content.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to submit review');
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Write a Review</h3>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Your Rating</label>
        <StarRating rating={rating} onRate={setRating} size="lg" interactive />
      </div>

      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
      />

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Share your experience with this course..."
        className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || rating === 0}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
