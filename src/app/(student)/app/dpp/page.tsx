'use client';

import { useState, useEffect, useCallback } from 'react';
import StudentEmptyState from '@/components/student/StudentEmptyState';

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

interface PreviousAttempt {
  id: string;
  score: number;
  status: string;
  completedAt: string;
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
  const [previousAttempts, setPreviousAttempts] = useState<PreviousAttempt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; answerText?: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchSets = useCallback(() => {
    return fetch('/api/student/dpp')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDppSets(data.data.dppSets || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSets().finally(() => setLoading(false));
  }, [fetchSets]);

  const startDpp = async (dppId: string) => {
    try {
      const res = await fetch(`/api/student/dpp/${dppId}`);
      const data = await res.json();
      if (data.success) {
        setActiveDpp(data.data.dppSet);
        setQuestions(data.data.questions || []);
        setPreviousAttempts(data.data.previousAttempts || []);
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
        // List ke attemptsTaken counts turant refresh — asal API se hi
        fetchSets();
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  const backToList = () => {
    setActiveDpp(null);
    setQuestions([]);
    setPreviousAttempts([]);
    setResult(null);
    setSubmitted(false);
  };

  if (activeDpp && !submitted) {
    const currentQuestion = questions[currentIndex];
    const options = currentQuestion ? parseOptions(currentQuestion.options) : [];
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
    const answeredCount = Object.keys(answers).length;
    const bestPrevious = previousAttempts.length > 0
      ? Math.max(...previousAttempts.map((a) => Number(a.score || 0)))
      : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between student-card p-4">
          <div>
            <h2 className="font-bold text-[var(--student-text)]">{activeDpp.title}</h2>
            <p className="text-xs text-[var(--student-text-muted)]">{activeDpp.courseTitle}</p>
            {previousAttempts.length > 0 && (
              <p className="text-[11px] text-[var(--student-text-faint)] mt-1">
                Previous attempts: {previousAttempts.length}
                {bestPrevious != null ? ` · Best score: ${bestPrevious}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-[var(--student-text)]'}`}>
              {formatTimer(timeLeft)}
            </div>
            <button
              onClick={backToList}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--student-border)] text-[var(--student-text-muted)] hover:bg-white/5"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--student-text-muted)]">
            <span>{answeredCount}/{questions.length} answered</span>
            <span>{questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--student-surface-hover)] mt-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#f5b942] transition-all"
              style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0 transition-all ${
                i === currentIndex
                  ? 'bg-[#6d28d9] text-white scale-110'
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
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#6d28d9]/10 text-[#6d28d9] flex items-center justify-center text-sm font-bold">
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
                className="w-full px-4 py-3 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:border-[#6d28d9]"
              />
            ) : (
              <div className="space-y-3">
                {options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      currentAnswer?.selectedOptionId === opt.id
                        ? 'border-[#6d28d9] bg-[#6d28d9]/5'
                        : 'border-[var(--student-border)] hover:border-[#6d28d9]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={currentAnswer?.selectedOptionId === opt.id}
                      onChange={() => handleAnswer(currentQuestion.id, { selectedOptionId: opt.id })}
                      className="accent-[#6d28d9]"
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
              className="px-5 py-2.5 rounded-xl bg-[#6d28d9] text-white font-medium hover:opacity-90"
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
    const total = Number(result.totalQuestions || 0);
    const correct = Number(result.correctCount || 0);
    const answered = Number(result.answeredCount ?? correct);
    const wrong = Math.max(0, answered - correct);
    const skipped = Math.max(0, total - answered);
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="student-card overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#f5b942]" />
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#6d28d9]/25">
              {pct}%
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--student-text)]">DPP Completed!</h2>
              <p className="text-sm text-[var(--student-text-muted)] mt-1">
                Accuracy {accuracy}% · {correct}/{total} sahi jawab
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20">
                <div className="text-2xl font-bold text-[#6d28d9]">{result.score}<span className="text-sm text-[var(--student-text-faint)]">/{result.maxScore}</span></div>
                <div className="text-xs text-[var(--student-text-muted)]">Score</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <div className="text-2xl font-bold text-emerald-600">{correct}</div>
                <div className="text-xs text-[var(--student-text-muted)]">Correct</div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <div className="text-2xl font-bold text-red-500">{wrong}</div>
                <div className="text-xs text-[var(--student-text-muted)]">Wrong</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div className="text-2xl font-bold text-[var(--student-text)]">{skipped}</div>
                <div className="text-xs text-[var(--student-text-muted)]">Skipped</div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={backToList}
          className="w-full py-3 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] font-semibold hover:bg-white/5"
        >
          Back to DPP List
        </button>
      </div>
    );
  }

  // Course-wise grouping (asal courseTitle par)
  const byCourse = new Map<string, DppSet[]>();
  for (const dpp of dppSets) {
    const list = byCourse.get(dpp.courseTitle) || [];
    list.push(dpp);
    byCourse.set(dpp.courseTitle, list);
  }
  const courseGroups = Array.from(byCourse.entries());
  const totalQuestionsAll = dppSets.reduce((s, d) => s + Number(d.questionCount || 0), 0);
  const completedSets = dppSets.filter((d) => d.attemptsTaken > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--student-text)] tracking-tight">Daily Practice Problems</h1>
          <p className="text-sm text-[var(--student-text-muted)] mt-1">
            Course-wise DPP sets — thodi-thodi roz practice, yahi toppers ka secret hai.
          </p>
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center shadow-lg shadow-[#6d28d9]/25">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      {!loading && dppSets.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          <div className="student-card p-4 md:p-5">
            <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">DPP Sets</p>
            <p className="text-2xl font-black text-[var(--student-text)] mt-1">{dppSets.length}</p>
          </div>
          <div className="student-card p-4 md:p-5">
            <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Questions</p>
            <p className="text-2xl font-black text-[var(--student-text)] mt-1">{totalQuestionsAll}</p>
          </div>
          <div className="student-card p-4 md:p-5">
            <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedSets}</p>
          </div>
        </div>
      )}

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
        <StudentEmptyState
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="Abhi koi DPP set nahi hai"
          description="Tumhare enrolled courses ke practice sets yahan dikhenge. Course me enroll karke roz ki practice shuru karo."
          actionText="Browse Courses"
          actionHref="/app/courses"
        />
      ) : (
        <div className="space-y-10">
          {courseGroups.map(([courseTitle, sets]) => (
            <section key={courseTitle} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--student-text)] tracking-tight">{courseTitle}</h2>
                <p className="text-xs text-[var(--student-text-faint)] mt-1 font-medium">
                  {sets.length} DPP set{sets.length !== 1 ? 's' : ''} · {sets.reduce((s, d) => s + Number(d.questionCount || 0), 0)} questions
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sets.map((dpp) => {
                  const done = dpp.attemptsTaken > 0;
                  return (
                    <button
                      key={dpp.id}
                      onClick={() => startDpp(dpp.id)}
                      className="student-card overflow-hidden flex flex-col text-left hover:border-[#6d28d9] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      <div className="h-1.5 bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#f5b942]" />
                      <div className="p-6 flex flex-col gap-4 flex-1 w-full">
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#6d28d9]/10 border border-[#6d28d9]/15 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#6d28d9]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            done
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                              : 'bg-[var(--student-surface-hover)] text-[var(--student-text-muted)]'
                          }`}>
                            {done ? `Completed · ${dpp.attemptsTaken} attempt${dpp.attemptsTaken !== 1 ? 's' : ''}` : 'Not Attempted'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-[var(--student-text)] leading-snug group-hover:text-[#6d28d9] transition-colors">{dpp.title}</h3>
                          <p className="text-[11px] text-[var(--student-text-faint)] mt-1">
                            {new Date(dpp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-[var(--student-text-muted)] border-t border-[var(--student-border-light)] pt-4">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {dpp.questionCount} Questions
                          </span>
                          <span>~{Number(dpp.questionCount || 0) * 2} min</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#6d28d9]">
                          {done ? 'Practice Again' : 'Start Practice'}
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
