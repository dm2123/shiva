'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ScholarshipTest from '@/components/student/ScholarshipTest';
import ScholarshipResults from '@/components/student/ScholarshipResults';

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
    return <div className="text-center py-12 text-slate-500">Loading test...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">Test not found</div>;
  }

  // Show results if already attempted
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{data.test.title} — Results</h1>
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
      <div className="text-center py-12">
        <p className="text-slate-500">Questions not available for this test</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{data.test.title}</h1>
      <ScholarshipTest
        testId={testId}
        questions={data.questions}
        onComplete={(r) => setResult({ attempt: r, leaderboard: [] })}
      />
    </div>
  );
}
