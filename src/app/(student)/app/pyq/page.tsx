'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PyqExam {
  id: string;
  title: string;
  examName: string | null;
  year: number | null;
  subject: string | null;
  totalQuestions: number;
  totalMarks: number;
  timeLimitMinutes: number;
  courseTitle: string;
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: { id: string; text: string }[] | string;
  marks: number;
  sortOrder: number;
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

export default function PyqPage() {
  const [exams, setExams] = useState<PyqExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [activeExam, setActiveExam] = useState<PyqExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; answerText?: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetch('/api/student/pyq')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setExams(data.data.pyqExams || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredExams = exams.filter((e) => {
    if (examFilter && e.examName !== examFilter) return false;
    if (yearFilter && String(e.year) !== yearFilter) return false;
    if (subjectFilter && e.subject !== subjectFilter) return false;
    return true;
  });

  const uniqueExams = [...new Set(exams.map((e) => e.examName).filter(Boolean))];
  const uniqueYears = [...new Set(exams.map((e) => String(e.year)).filter(Boolean))].sort().reverse();
  const uniqueSubjects = [...new Set(exams.map((e) => e.subject).filter(Boolean))];

  const startExam = async (exam: PyqExam) => {
    try {
      const res = await fetch(`/api/student/pyq/${exam.id}`);
      const data = await res.json();
      if (data.success) {
        setActiveExam(exam);
        setQuestions(data.data.questions || []);
        setTimeLeft((exam.timeLimitMinutes || 30) * 60);
        setCurrentIndex(0);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
      }
    } catch {}
  };

  useEffect(() => {
    if (submitted || !activeExam) return;
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
  }, [submitted, activeExam]);

  const handleAnswer = (questionId: string, value: { selectedOptionId?: string; answerText?: string }) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (submitting || submitted || !activeExam) return;
    setSubmitting(true);
    try {
      const responseArray = Object.entries(answers).map(([questionId, a]) => ({
        questionId,
        selectedOptionId: a.selectedOptionId || undefined,
        answerText: a.answerText || undefined,
      }));
      const res = await fetch(`/api/student/pyq/${activeExam.id}`, {
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

  if (submitted && result && activeExam) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="student-card p-8 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
            {pct}%
          </div>
          <h2 className="text-xl font-bold text-[var(--student-text)]">{activeExam.title}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{result.score}</div>
              <div className="text-xs text-[var(--student-text-muted)]">Score</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <div className="text-2xl font-bold text-emerald-600">{result.correctCount}/{result.totalQuestions}</div>
              <div className="text-xs text-[var(--student-text-muted)]">Correct</div>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20">
              <div className="text-2xl font-bold text-violet-600">{result.maxScore}</div>
              <div className="text-xs text-[var(--student-text-muted)]">Max Score</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setActiveExam(null); setResult(null); setSubmitted(false); }}
          className="w-full py-3 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] font-semibold hover:bg-white/5"
        >
          Back to PYQ List
        </button>
      </div>
    );
  }

  if (activeExam) {
    const currentQuestion = questions[currentIndex];
    const options = currentQuestion ? parseOptions(currentQuestion.options) : [];
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between student-card p-4">
          <div>
            <h2 className="font-bold text-[var(--student-text)]">{activeExam.title}</h2>
            <p className="text-xs text-[var(--student-text-muted)]">{activeExam.subject} {activeExam.year}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-[var(--student-text)]'}`}>
              {formatTimer(timeLeft)}
            </div>
            <button
              onClick={() => { setActiveExam(null); setQuestions([]); }}
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
                  ? 'bg-blue-500 text-white scale-110'
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
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-sm font-bold">
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
                className="w-full px-4 py-3 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="space-y-3">
                {options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      currentAnswer?.selectedOptionId === opt.id
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-[var(--student-border)] hover:border-blue-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={currentAnswer?.selectedOptionId === opt.id}
                      onChange={() => handleAnswer(currentQuestion.id, { selectedOptionId: opt.id })}
                      className="accent-blue-500"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--student-text)] tracking-tight">
            Previous Year Questions
          </h1>
          <p className="text-sm text-[var(--student-text-muted)] mt-1.5 max-w-xl leading-relaxed">
            Asli exam papers solve karo, timer ke saath. PYQ = exam pattern samajhne ka sabse tez tarika.
          </p>
        </div>
        {exams.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--student-text-muted)] bg-[var(--student-surface)] border border-[var(--student-border-light)] rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-[var(--student-primary)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {filteredExams.length} papers available
          </div>
        )}
      </div>

      {exams.length > 0 && (
        <div className="student-card p-4 md:p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--student-text-faint)] mb-3">Filter papers</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] text-[var(--student-text)] text-sm focus:outline-none focus:border-[var(--student-primary)]"
            >
              <option value="">All Exams</option>
              {uniqueExams.map((name) => (
                <option key={name} value={name!}>{name}</option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] text-[var(--student-text)] text-sm focus:outline-none focus:border-[var(--student-primary)]"
            >
              <option value="">All Years</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] text-[var(--student-text)] text-sm focus:outline-none focus:border-[var(--student-primary)]"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s!}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="student-card p-6 space-y-3">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="space-y-6">
          <div className="relative flex flex-col items-center justify-center p-12 md:p-16 text-center rounded-3xl border border-dashed border-[var(--student-border)] bg-gradient-to-b from-[var(--student-surface)] to-transparent overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--student-text)] tracking-tight mb-2">PYQ papers jald aa rahe hain</h3>
            <p className="text-sm text-[var(--student-text-muted)] max-w-sm mx-auto leading-relaxed">
              Hum previous year ke asli exam papers jod rahe hain — year-wise aur subject-wise.
              Tab tak Practice Zone me apni taiyaari tez rakho.
            </p>
          </div>
          <div className="student-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)]">PYQ kyun zaroori hai?</h3>
                <p className="text-sm text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  Toppers ka sabse bada secret: PYQ se exam ka pattern, repeating topics aur
                  difficulty level — teeno ek saath samajh aate hain.
                </p>
              </div>
              <Link
                href="/app/practice"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0"
              >
                Practice Zone
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="student-card p-12 text-center">
          <p className="text-[var(--student-text-muted)]">Koi PYQ paper is filter se match nahi hua. Filter badal kar dekho.</p>
          <button
            onClick={() => { setExamFilter(''); setYearFilter(''); setSubjectFilter(''); }}
            className="mt-4 px-5 py-2 rounded-xl border border-[var(--student-border)] text-sm font-semibold text-[var(--student-text)] hover:bg-[var(--student-surface-hover)]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredExams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => startExam(exam)}
              className="student-card overflow-hidden flex flex-col text-left hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              <div className="p-5 md:p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  {exam.year && (
                    <span className="text-[11px] font-black px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 tracking-wide">
                      {exam.year}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--student-text)] leading-snug group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {exam.examName && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wider">
                        {exam.examName}
                      </span>
                    )}
                    {exam.subject && <span className="text-xs text-[var(--student-text-muted)]">{exam.subject}</span>}
                  </div>
                  <p className="text-[11px] text-[var(--student-text-faint)] mt-1">{exam.courseTitle}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2 px-1">
                    <p className="text-xs font-bold text-[var(--student-text)]">{exam.totalQuestions}</p>
                    <p className="text-[10px] text-[var(--student-text-faint)]">Questions</p>
                  </div>
                  <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2 px-1">
                    <p className="text-xs font-bold text-[var(--student-text)]">{exam.totalMarks}</p>
                    <p className="text-[10px] text-[var(--student-text-faint)]">Marks</p>
                  </div>
                  <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2 px-1">
                    <p className="text-xs font-bold text-[var(--student-text)]">{exam.timeLimitMinutes}m</p>
                    <p className="text-[10px] text-[var(--student-text-faint)]">Time</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600">
                  Start Paper
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
