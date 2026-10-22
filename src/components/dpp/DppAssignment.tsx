'use client';

import { useState, useEffect, useCallback } from 'react';

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: { id: string; text: string }[] | string;
  marks: number;
  sortOrder: number;
}

interface DppSet {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  questionCount: number;
}

interface DppAssignmentProps {
  dppSet: DppSet;
  questions: Question[];
}

function parseOptions(raw: Question['options']): { id: string; text: string }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed?.options) return parsed.options;
    } catch {}
  }
  return [];
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DppAssignment({ dppSet, questions }: DppAssignmentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; answerText?: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions.length * 120);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const handleAnswer = useCallback(
    (questionId: string, value: { selectedOptionId?: string; answerText?: string }) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const responseArray = Object.entries(answers).map(([questionId, a]) => ({
        questionId,
        selectedOptionId: a.selectedOptionId || undefined,
        answerText: a.answerText || undefined,
      }));

      const res = await fetch(`/api/student/dpp/${dppSet.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: responseArray }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setSubmitted(true);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && result) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="student-card p-8 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
            {pct}%
          </div>
          <h2 className="text-xl font-bold text-[var(--student-text)]">DPP Completed!</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <div className="text-2xl font-bold text-emerald-600">{result.score}</div>
              <div className="text-xs text-[var(--student-text-muted)]">Score</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{result.correctCount}/{result.totalQuestions}</div>
              <div className="text-xs text-[var(--student-text-muted)]">Correct</div>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20">
              <div className="text-2xl font-bold text-violet-600">{result.maxScore}</div>
              <div className="text-xs text-[var(--student-text-muted)]">Max Score</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 rounded-xl bg-[var(--student-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Attempt Again
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion ? parseOptions(currentQuestion.options) : [];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between student-card p-4">
        <div>
          <h2 className="font-bold text-[var(--student-text)]">{dppSet.title}</h2>
          <p className="text-xs text-[var(--student-text-muted)]">{dppSet.courseTitle}</p>
        </div>
        <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-[var(--student-text)]'}`}>
          {formatTimer(timeLeft)}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0 transition-all ${
              i === currentIndex
                ? 'bg-[var(--student-primary)] text-white scale-110'
                : answers[q.id]
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-white/10 text-[var(--student-text-muted)] hover:bg-white/20'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {currentQuestion && (
        <div className="student-card p-6 space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--student-primary)]/10 text-[var(--student-primary)] flex items-center justify-center text-sm font-bold">
              {currentIndex + 1}
            </span>
            <div className="flex-1">
              <p className="text-[var(--student-text)] font-medium leading-relaxed">{currentQuestion.questionText}</p>
              <span className="text-xs text-[var(--student-text-muted)] mt-1 inline-block">{currentQuestion.marks} marks</span>
            </div>
          </div>

          {currentQuestion.questionType === 'NUMERIC' ? (
            <input
              type="number"
              value={currentAnswer?.answerText || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, { answerText: e.target.value })}
              placeholder="Enter your answer"
              className="w-full px-4 py-3 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:border-[var(--student-primary)] transition-colors"
            />
          ) : (
            <div className="space-y-3">
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    currentAnswer?.selectedOptionId === opt.id
                      ? 'border-[var(--student-primary)] bg-[var(--student-primary)]/5'
                      : 'border-[var(--student-border)] hover:border-[var(--student-primary)]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    checked={currentAnswer?.selectedOptionId === opt.id}
                    onChange={() => handleAnswer(currentQuestion.id, { selectedOptionId: opt.id })}
                    className="accent-[var(--student-primary)]"
                  />
                  <span className="text-sm text-[var(--student-text)]">{opt.text}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] font-medium hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          Previous
        </button>
        <span className="text-xs text-[var(--student-text-muted)]">
          {answeredCount}/{questions.length} answered
        </span>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit DPP'}
          </button>
        )}
      </div>
    </div>
  );
}
