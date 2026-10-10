'use client';

import { useState } from 'react';
import { IconHelpCircle, IconArrowRight } from '@/components/student/StudentIcons';

interface StudentDoubtFormProps {
  courses: { id: string; title: string }[];
  onCreated?: () => void;
}

export default function StudentDoubtForm({ courses, onCreated }: StudentDoubtFormProps) {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submit = async () => {
    setStatus(null);
    if (!courseId || !title.trim() || !description.trim()) {
      setStatus({ type: 'error', text: 'Please select a course and fill in both title and description.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/student/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, title: title.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: 'Your doubt has been submitted and assigned to your course educator.' });
        setTitle('');
        setDescription('');
        setCourseId('');
        onCreated?.();
      } else {
        setStatus({ type: 'error', text: data?.error?.message || 'Failed to submit your doubt.' });
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <IconHelpCircle size={16} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--student-text)]">Ask a Doubt</h3>
          <p className="text-[11px] text-[var(--student-text-faint)]">Get a written answer from your course educator.</p>
        </div>
      </div>

      <div className="space-y-3">
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--student-border-light)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] focus:ring-2 focus:ring-[var(--student-primary)] focus:outline-none"
        >
          <option value="">Select your course…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short title, e.g. Percentage successive discounts doubt"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--student-border-light)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] focus:ring-2 focus:ring-[var(--student-primary)] focus:outline-none"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe your doubt in detail — share the problem, your attempt, and where you are stuck…"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--student-border-light)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] focus:ring-2 focus:ring-[var(--student-primary)] focus:outline-none resize-y"
        />

        {status && (
          <p className={`text-xs ${status.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>{status.text}</p>
        )}

        <button
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          <IconArrowRight size={14} />
          {submitting ? 'Submitting…' : 'Submit Doubt'}
        </button>
      </div>
    </div>
  );
}