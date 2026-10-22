'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface PyqBrowserProps {
  exams: PyqExam[];
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

export default function PyqBrowser({ exams }: PyqBrowserProps) {
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
  const [loadingExam, setLoadingExam] = useState(false);

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
    setLoadingExam(true);
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
    } catch {
    } finally {
      setLoadingExam(false);
    }
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

  const handleAnswer = useCallback(
    (questionId: string, value: { selectedOptionId?: string; answerText?: string }) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

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
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && result && activeExam) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
          className="w-full py-3 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] font-semibold hover:bg-white/5 transition-colors"
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between student-card p-4">
          <div>
            <h2 className="font-bold text-[var(--student-text)]">{activeExam.title}</h2>
            <p className="text-xs text-[var(--student-text-muted)]">{activeExam.subject} {activeExam.year}</p>
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
                className="w-full px-4 py-3 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:border-blue-500 transition-colors"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="student-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] text-sm focus:outline-none focus:border-[var(--student-primary)]"
          >
            <option value="">All Exams</option>
            {uniqueExams.map((name) => (
              <option key={name} value={name!}>{name}</option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] text-sm focus:outline-none focus:border-[var(--student-primary)]"
          >
            <option value="">All Years</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--student-border)] bg-white/5 text-[var(--student-text)] text-sm focus:outline-none focus:border-[var(--student-primary)]"
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map((s) => (
              <option key={s} value={s!}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <div className="student-card p-12 text-center">
          <p className="text-[var(--student-text-muted)]">No PYQ exams found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredExams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => startExam(exam)}
              disabled={loadingExam}
              className="student-card p-6 flex flex-col gap-4 text-left hover:border-blue-400 hover:shadow-indigo transition-all duration-300 disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)] leading-snug">{exam.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--student-text-muted)]">
                  {exam.examName && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{exam.examName}</span>}
                  {exam.year && <span>{exam.year}</span>}
                  {exam.subject && <span>| {exam.subject}</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--student-text-muted)] border-t border-[var(--student-border-light)] pt-4">
                <span>{exam.totalQuestions} Qs</span>
                <span>{exam.totalMarks} marks</span>
                <span>{exam.timeLimitMinutes} min</span>
              </div>
              <div className="text-xs font-bold text-blue-600">Start Exam</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
