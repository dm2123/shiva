'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScholarshipTest from '@/components/student/ScholarshipTest';
import ScholarshipResults from '@/components/student/ScholarshipResults';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconArrowLeft, IconAward, IconFileText } from '@/components/student/StudentIcons';

function BackToTests() {
  return (
    <Link
      href="/app/scholarships"
      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--student-text-muted)] hover:text-[var(--student-primary)] transition-colors min-h-[44px]"
    >
      <IconArrowLeft size={16} />
      Back to scholarship tests
    </Link>
  );
}

export default function ScholarshipTestPage() {
  const params = useParams();
  const testId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/student/scholarships/${testId}`);
        const testData = await res.json();
        if (testData.success) {
          setData(testData.data);
          // If already attempted, fetch results
          if (testData.data.attempts.length > 0) {
            const resultRes = await fetch(`/api/student/scholarships/${testId}/results`);
            const resultData = await resultRes.json();
            if (resultData.success) setResult(resultData.data);
          }
        }
      } catch (err) {
        console.error('Fetch test error:', err);
      }
      setLoading(false);
    };
    fetchTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <BackToTests />
        <div className="animate-pulse space-y-4">
          <div className="h-28 rounded-3xl bg-[var(--student-surface)] border border-[var(--student-border)]" />
          <div className="h-40 rounded-3xl bg-[var(--student-surface)] border border-[var(--student-border)]" />
          <div className="h-40 rounded-3xl bg-[var(--student-surface)] border border-[var(--student-border)]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <BackToTests />
        <StudentEmptyState
          icon={<IconAward size={28} />}
          title="Test not found"
          description="Ye scholarship test available nahi hai ya khatm ho chuka hai. Baaki tests ki list dekho."
          actionText="Saare tests dekho"
          actionHref="/app/scholarships"
          variant="large"
        />
      </div>
    );
  }

  // Show results if already attempted
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <BackToTests />
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] p-6 sm:p-7 text-white">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5b942] px-3 py-1 text-[11px] font-black tracking-widest text-[#2a1650]">
              🏆 RESULTS
            </span>
            <h1 className="mt-3 text-xl sm:text-2xl font-black">{data.test.title} — Results</h1>
          </div>
        </div>
        <ScholarshipResults
          score={result.attempt.score}
          maxScore={result.attempt.totalMarks}
          percentage={result.attempt.percentage}
          scholarshipAmount={Math.round((data.test.scholarshipPercentage || 100) * (result.attempt.percentage / 100))}
          xpEarned={Math.round(result.attempt.score * 2)}
          leaderboard={result.leaderboard}
        />
      </div>
    );
  }

  // Show test if questions available
  if (data.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <BackToTests />
        <StudentEmptyState
          icon={<IconFileText size={28} />}
          title="Questions not available"
          description="Is test ke questions abhi available nahi hain. Thodi der baad phir try karo."
          actionText="Saare tests dekho"
          actionHref="/app/scholarships"
          variant="large"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackToTests />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] p-6 sm:p-7 text-white">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-[#f5b942]/20 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5b942] px-3 py-1 text-[11px] font-black tracking-widest text-[#2a1650]">
            🎓 SCHOLARSHIP TEST
          </span>
          <h1 className="mt-3 text-xl sm:text-2xl font-black">{data.test.title}</h1>
        </div>
      </div>
      <ScholarshipTest
        testId={testId}
        questions={data.questions}
        onComplete={(r) => setResult({ attempt: r, leaderboard: [] })}
      />
    </div>
  );
}
