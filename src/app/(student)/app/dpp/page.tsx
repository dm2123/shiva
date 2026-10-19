'use client';

import { useState, useEffect } from 'react';

interface DppSet {
  id: string;
  courseId: string;
  title: string;
  courseTitle: string;
  questionCount: number;
  attemptsTaken: number;
  createdAt: string;
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: { id: string; text: string }[] | string;
  marks: number;
  sortOrder: number;
}

interface DppSetDetail {
  id: string;
  title: string;
  courseTitle: string;
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

export default function DppPage() {
  const [dppSets, setDppSets] = useState<DppSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDpp, setActiveDpp] = useState<DppSetDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; answerText?: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetch('/api/student/dpp')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDppSets(data.data.dppSets || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startDpp = async (dppId: string) => {
    try {
      const res = await fetch(`/api/student/dpp/${dppId}`);
      const data = await res.json();
      if (data.success) {
        setActiveDpp(data.data.dppSet);
        setQuestions(data.data.questions || []);
        setTimeLeft((data.data.questions?.length || 10) * 120);
        setCurrentIndex(0);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
      }
    } catch {}
  };

  useEffect(() => {
    if (submitted || !activeDpp) return;
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
  }, [submitted, activeDpp]);

  const handleAnswer = (questionId: string, value: { selectedOptionId?: string; answerText?: string }) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitting || submitted || !activeDpp) return;
    setSubmitting(true);
    try {
      const responseArray = Object.entries(answers).map(([questionId, a]) => ({
        questionId,
        selectedOptionId: a.selectedOptionId || undefined,
        answerText: a.answerText || undefined,
      }));
      const res = await fetch(`/api/student/dpp/${activeDpp.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: responseArray }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setSubmitted(true);
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  if (activeDpp && !submitted) {
    const currentQuestion = questions[currentIndex];
    const options = currentQuestion ? parseOptions(currentQuestion.options) : [];
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between student-card p-4">
          <div>
            <h2 className="font-bold text-[var(--student-text)]">{activeDpp.title}</h2>
            <p className="text-xs text-[var(--student-text-muted)]">{activeDpp.courseTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-[var(--student-text)]'}`}>
              {formatTimer(timeLeft)}
            </div>
            <button
              onClick={() => { setActiveDpp(null); setQuestions([]); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--student-border)] text-[var(--student-text-muted)] hover:bg-white/5"
            >
              Exit
            </button>
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
                className="w-full px-4 py-3 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:border-[var(--student-primary)]"
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
            className="px-5 py-2.5 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] font-medium hover:bg-white/5 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-[var(--student-text-muted)]">{answeredCount}/{questions.length} answered</span>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white font-medium hover:opacity-90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit DPP'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted && result) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    return (
      <div className="space-y-6">
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
          onClick={() => { setActiveDpp(null); setResult(null); setSubmitted(false); }}
          className="w-full py-3 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] font-semibold hover:bg-white/5"
        >
          Back to DPP List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--student-text)] tracking-tight">Daily Practice Problems</h1>
          <p className="text-sm text-[var(--student-text-muted)] mt-1">
            Thodi-thodi roz practice — yahi toppers ka secret hai.
          </p>
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="student-card p-6 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[var(--student-surface)]" />
              <div className="h-4 w-3/4 rounded bg-[var(--student-surface)] mt-4" />
              <div className="h-3 w-1/2 rounded bg-[var(--student-surface)] mt-2" />
            </div>
          ))}
        </div>
      ) : dppSets.length === 0 ? (
        <div className="student-card p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[var(--student-text)] mt-4">No practice sets yet</p>
          <p className="text-xs text-[var(--student-text-muted)] mt-1 max-w-xs mx-auto">
            Practice sets for your enrolled courses will appear here. Enroll in a course to get started.
          </p>
          <a
            href="/app/courses"
            className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-semibold hover:opacity-90"
          >
            Browse Courses
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {dppSets.map((dpp) => (
            <button
              key={dpp.id}
              onClick={() => startDpp(dpp.id)}
              className="student-card p-6 flex flex-col gap-4 text-left hover:border-[var(--student-primary)] hover:shadow-indigo transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)] leading-snug">{dpp.title}</h3>
                <p className="text-[11px] text-[var(--student-text-faint)] mt-1 uppercase tracking-wider">{dpp.courseTitle}</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--student-text-muted)] border-t border-[var(--student-border-light)] pt-4">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {dpp.questionCount} Questions
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  dpp.attemptsTaken > 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
                }`}>
                  {dpp.attemptsTaken > 0 ? `${dpp.attemptsTaken} attempt${dpp.attemptsTaken !== 1 ? 's' : ''} done` : 'New'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[var(--student-primary)]">
                Start Practice
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
