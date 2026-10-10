'use client';

import { useState } from 'react';


interface Props {
  liveClassId: string;
  onRated?: () => void;
}

const categories = [
  { key: 'teachingQuality', label: 'Teaching Quality' },
  { key: 'contentClarity', label: 'Content Clarity' },
  { key: 'engagement', label: 'Engagement' },
] as const;

function StarInput({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => !disabled && onChange(n)}
          disabled={disabled}
          className="disabled:cursor-not-allowed"
        >
          <span
            className={`text-2xl ${n <= value ? 'text-yellow-400' : 'text-gray-500'}`}
          >
            {n <= value ? '★' : '☆'}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function InstructorRating({ liveClassId, onRated }: Props) {
  const [ratings, setRatings] = useState<Record<string, number>>({
    teachingQuality: 0,
    contentClarity: 0,
    engagement: 0,
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const allFilled = Object.values(ratings).every((v) => v > 0);

  const handleSubmit = async () => {
    if (!allFilled) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/student/instructor-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId, ...ratings, feedback }),
      });
      if (res.ok) {
        setDone(true);
        onRated?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-gray-800 border border-green-600 rounded-lg p-4 text-green-400 text-center">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
      <h3 className="text-white font-semibold">Rate this class</h3>

      {categories.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">{label}</span>
          <StarInput
            value={ratings[key]}
            onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
            disabled={submitting}
          />
        </div>
      ))}

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Optional feedback..."
        className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 text-sm resize-y focus:outline-none focus:border-purple-500 min-h-[80px]"
        disabled={submitting}
      />

      <button
        onClick={handleSubmit}
        disabled={!allFilled || submitting}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md font-medium transition text-sm"
      >
        ➤
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
}
