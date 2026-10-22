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
            className={`text-2xl ${n <= value ? 'text-[#f5b942]' : 'text-[var(--student-text-faint)]'}`}
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
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 text-center text-sm font-bold">
        Dhanyavaad! Tumhara feedback mil gaya hai.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] p-6 space-y-4">
      <h3 className="text-[var(--student-text)] font-bold">Is class ko rate karo</h3>

      {categories.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-[var(--student-text-secondary)] text-sm">{label}</span>
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
        placeholder="Kuch aur kehna hai? (optional)"
        className="w-full bg-[var(--student-surface)] border border-[var(--student-border)] rounded-md p-3 text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] text-sm resize-y focus:outline-none focus:border-[#6d28d9] min-h-[80px]"
        disabled={submitting}
      />

      <button
        onClick={handleSubmit}
        disabled={!allFilled || submitting}
        className="flex items-center gap-2 bg-[#6d28d9] hover:bg-[#2a1650] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md font-bold transition text-sm"
      >
        ➤
        {submitting ? 'Bhej raha hai...' : 'Rating Bhejo'}
      </button>
    </div>
  );
}
