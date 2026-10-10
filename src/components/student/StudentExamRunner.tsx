'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IconClock, IconTarget, IconCheckCircle } from '@/components/student/StudentIcons';

export interface ExamQuestion {
  id: string;
  title: string;
  type: string;
  options: { id: string; text: string }[];
}

interface StudentExamRunnerProps {
  attemptId: string;
  testTitle: string;
  durationMinutes: number;
  questions: ExamQuestion[];
}

export default function StudentExamRunner({ attemptId, testTitle, durationMinutes, questions }: StudentExamRunnerProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | undefined>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = useCallback(async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const responses = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId: selectedOptionId || null,
      }));
      const res = await fetch(`/api/student/tests/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      if (res.ok) {
        setSubmitted(true);
        router.push(`/app/results/${attemptId}`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error?.message || 'Submission failed. Please try again.');
        setSubmitting(false);
      }
    } catch {
      alert('Network error during submission.');
      setSubmitting(false);
    }
  }, [answers, attemptId, submitting, submitted, router]);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      submit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, submit]);

  const answeredCount = useMemo(() => Object.values(answers).filter((v) => !!v).length, [answers]);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const question = questions[current];
  const selected = answers[question?.id];

  if (questions.length === 0) {
    return (
      <div className="w-full text-center py-16">
        <IconTarget size={28} className="mx-auto text-[var(--student-text-faint)] mb-3" />
        <p className="text-sm text-[var(--student-text-muted)]">No questions have been published for this test yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--student-text)] truncate">{testTitle}</h2>
          <p className="text-xs text-[var(--student-text-muted)] mt-0.5">
            Question {current + 1} of {questions.length} · {answeredCount} answered
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm ${
            timeLeft <= 300 ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          <IconClock size={15} />
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <aside className="student-card p-4 h-fit lg:sticky lg:top-4">
          <p className="text-[11px] font-bold text-[var(--student-text-faint)] uppercase tracking-widest mb-3">Question Palette</p>
          <div className="grid grid-cols-6 gap-1.5">
            {questions.map((q, i) => {
              const answered = !!answers[q.id];
              const active = i === current;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrent(i)}
                  className={`h-9 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[var(--student-primary)] text-white'
                      : answered
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-[var(--student-surface)] text-[var(--student-text-secondary)] border border-[var(--student-border-light)]'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--student-border-light)] flex items-center justify-between text-[11px] text-[var(--student-text-muted)]">
            <span>{answeredCount} answered</span>
            <span>{questions.length - answeredCount} remaining</span>
          </div>
        </aside>

        <div className="student-card p-6">
          <p className="text-[11px] font-bold text-[var(--student-text-faint)] uppercase tracking-widest mb-2">
            Question {current + 1} · {question.type === 'MCQ' ? 'Single Correct' : question.type}
          </p>
          <p className="text-[15px] leading-relaxed font-semibold text-[var(--student-text)] mb-5">{question.title}</p>

          <div className="space-y-2.5">
            {question.options.map((option) => {
              const isSelected = selected === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all border ${
                    isSelected
                      ? 'bg-[var(--student-primary-light)] border-[var(--student-primary)] text-[var(--student-primary)] font-semibold'
                      : 'bg-[var(--student-surface)] border-[var(--student-border-light)] text-[var(--student-text-secondary)] hover:border-[var(--student-primary)]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-[var(--student-primary)] bg-[var(--student-primary)]' : 'border-[var(--student-border)]'
                    }`}
                  >
                    {isSelected && <IconCheckCircle size={12} className="text-white" />}
                  </span>
                  <span>{option.text}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--student-border-light)] flex items-center justify-between">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[var(--student-primary)] hover:opacity-90 transition-opacity"
              >
                Save & Next
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit Exam'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}