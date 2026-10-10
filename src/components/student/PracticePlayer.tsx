'use client';

import { useState, useMemo } from 'react';
import { IconCheckCircle, IconX, IconRefresh, IconChevronRight, IconArrowLeft } from '@/components/student/StudentIcons';

export interface PracticeQuestion {
  id: string;
  title: string;
  type: string;
  explanation?: string | null;
  correctAnswer?: string | null;
  options: { id: string; text: string }[];
}

interface PracticePlayerProps {
  questions: PracticeQuestion[];
}

export default function PracticePlayer({ questions }: PracticePlayerProps) {
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<Record<string, string | undefined>>({});

  const answered = useMemo(
    () => questions.filter((q) => !!(picked[q.id] ?? undefined)).length,
    [questions, picked]
  );

  const question = questions[current];
  const isRevealed = revealed[question?.id];
  const selected = picked[question?.id];

  if (questions.length === 0) {
    return (
      <div className="w-full text-center py-16">
        <IconRefresh size={28} className="mx-auto text-[var(--student-text-faint)] mb-3" />
        <p className="text-sm text-[var(--student-text-muted)]">No practice questions are available for your courses yet.</p>
      </div>
    );
  }

  const reveal = () => {
    if (!question) return;
    setRevealed((prev) => ({ ...prev, [question.id]: true }));
  };

  const reset = () => {
    if (!question) return;
    setPicked((prev) => ({ ...prev, [question.id]: undefined }));
    setRevealed((prev) => ({ ...prev, [question.id]: false }));
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <p className="text-xs text-[var(--student-text-muted)]">
          Question {current + 1} of {questions.length} · <b className="text-[var(--student-text)]">{answered}</b> answered
        </p>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] transition-colors">
            <IconRefresh size={12} />
            Reset
          </button>
          {!!selected && !isRevealed && (
            <button onClick={reveal} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--student-primary)] text-white hover:opacity-90 transition-opacity">
              Show Answer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
        {questions.map((q, i) => {
          const isActive = i === current;
          const isPicked = !!picked[q.id];
          return (
            <button
              key={q.id}
              onClick={() => setCurrent(i)}
              className={`h-9 rounded-lg text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-[var(--student-primary)] text-white'
                  : isPicked
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-[var(--student-surface)] text-[var(--student-text-secondary)] border border-[var(--student-border-light)]'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="student-card p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[15px] leading-relaxed font-semibold text-[var(--student-text)]">{question.title}</p>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--student-text-faint)] flex-shrink-0">
            {question.type === 'MCQ' ? 'MCQ' : question.type}
          </span>
        </div>

        <div className="mt-5 space-y-2.5">
          {question.options.map((option) => {
            const isSelected = selected === option.id;
            const isAnswer = isRevealed && option.id === question.correctAnswer;
            const isWrongPick = isRevealed && isSelected && option.id !== question.correctAnswer;
            const state = isAnswer
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : isWrongPick
                ? 'border-red-300 bg-red-50 text-red-700'
                : isSelected
                  ? 'bg-[var(--student-primary-light)] border-[var(--student-primary)] text-[var(--student-primary)] font-semibold'
                  : 'bg-[var(--student-surface)] border-[var(--student-border-light)] text-[var(--student-text-secondary)]';
            return (
              <button
                key={option.id}
                onClick={() => {
                  setPicked((prev) => ({ ...prev, [question.id]: option.id }));
                  setRevealed((prev) => ({ ...prev, [question.id]: true }));
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all border ${state}`}
              >
                <span className="font-mono font-bold">{option.id.toUpperCase()}.</span>
                <span className="font-medium">{option.text}</span>
                {isAnswer && <IconCheckCircle size={15} className="ml-auto" />}
                {isWrongPick && <IconX size={15} className="ml-auto" />}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <p className="mt-5 text-sm text-[var(--student-text-muted)] leading-relaxed">
            <b className="text-[var(--student-text-secondary)] capitalize">Answer: {question.correctAnswer?.toUpperCase()}.</b>
            {question.explanation ? <span className="block mt-1">{question.explanation}</span> : null}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 transition-colors"
        >
          <IconArrowLeft size={15} />
          Previous
        </button>
        <span className="text-[11px] text-[var(--student-text-faint)]">Reveals answer on selection</span>
        <button
          onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
          disabled={current === questions.length - 1}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 transition-colors"
        >
          Next
          <IconChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}