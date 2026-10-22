'use client';

import { useState } from 'react';

interface Question {
  id: string;
  questionText: string;
  options: string;
  marks: number;
}

interface ScholarshipTestProps {
  testId: string;
  questions: Question[];
  onComplete: (result: any) => void;
}

export default function ScholarshipTest({ testId, questions, onComplete }: ScholarshipTestProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const question = questions[currentQ];
  const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const next = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const prev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }));

      const res = await fetch(`/api/student/scholarships/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray }),
      });

      const data = await res.json();
      if (data.success) {
        onComplete(data.data);
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
    setSubmitting(false);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          Question {currentQ + 1} of {questions.length}
        </span>
        <span className="text-sm text-slate-500">
          {answeredCount} answered
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          {question.questionText}
        </h3>
        <div className="space-y-3">
          {options?.map((opt: any) => (
            <button
              key={opt.id}
              onClick={() => selectOption(question.id, opt.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                answers[question.id] === opt.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="font-medium text-slate-900 dark:text-white">
                {opt.id}. {opt.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prev}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {currentQ < questions.length - 1 ? (
            <button
              onClick={next}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || answeredCount === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>
      </div>

      {/* Question Map */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentQ(i)}
            className={`w-8 h-8 rounded-lg text-sm font-medium ${
              i === currentQ
                ? 'bg-indigo-600 text-white'
                : answers[q.id]
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
