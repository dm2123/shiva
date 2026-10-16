'use client';

import PWStudentHeader from '@/components/student/PWStudentHeader';
import PWBatchCard, { PWBatch } from '@/components/student/PWBatchCard';
import Link from 'next/link';

interface PWDashboardProps {
  userName: string;
  userEmail: string;
}

// Real data: free course + honest coming-soon batches
const BATCHES: PWBatch[] = [
  {
    id: 'aptitude-foundation',
    slug: 'aptitude-foundation-free',
    targetLabel: 'SSC / Railway / Banking',
    title: 'Aptitude Foundation',
    language: 'HINGLISH',
    examTarget: 'Quantitative Aptitude',
    startDate: 'Started — enroll anytime',
    status: 'ongoing',
    price: 0,
    bannerGradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    bannerEmoji: '📊',
    kitIncluded: 'FREE COURSE',
    ctaText: 'Enroll Now',
  },
  {
    id: 'ssc-cgl-2026',
    slug: 'ssc-cgl-2026',
    targetLabel: 'SSC',
    title: 'MISSION SSC CGL 2026',
    language: 'HINGLISH',
    examTarget: 'SSC CGL 2026',
    startDate: 'Starts soon',
    status: 'upcoming',
    price: 0,
    bannerGradient: 'linear-gradient(135deg, #ede9fe, #c4b5fd)',
    bannerEmoji: '🎯',
    kitIncluded: 'COMING SOON',
    ctaText: 'Notify Me',
  },
  {
    id: 'railway-2026',
    slug: 'railway-2026',
    targetLabel: 'Railway',
    title: 'MISSION RAILWAY 2026',
    language: 'HINGLISH',
    examTarget: 'RRB NTPC / Group D',
    startDate: 'Starts soon',
    status: 'upcoming',
    price: 0,
    bannerGradient: 'linear-gradient(135deg, #dbeafe, #93c5fd)',
    bannerEmoji: '🚂',
    kitIncluded: 'COMING SOON',
    ctaText: 'Notify Me',
  },
];

const GOALS = [
  { label: 'SSC', icon: '🏛️', bg: 'bg-blue-100', href: '/app/goals?exam=ssc' },
  { label: 'Railway', icon: '🚂', bg: 'bg-green-100', href: '/app/goals?exam=railway' },
  { label: 'Banking', icon: '🏦', bg: 'bg-yellow-100', href: '/app/goals?exam=banking' },
  { label: 'Defence', icon: '🎖️', bg: 'bg-orange-100', href: '/app/goals?exam=defence' },
];

export default function PWDashboard({ userName, userEmail }: PWDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PWStudentHeader userName={userName} userEmail={userEmail} goal="SSC CGL" />

      <main className="max-w-[1200px] mx-auto px-4 py-4 space-y-5 pb-20">
        {/* Festival / promo banner */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-5 text-center">
          <p className="text-lg font-bold text-orange-800">🎉 Free Learning Festival 🎉</p>
          <p className="text-sm text-orange-700 mt-1">Aptitude Foundation — 100% FREE enroll karo!</p>
        </div>

        {/* Popular Goals */}
        <section>
          <h2 className="text-[17px] font-bold text-gray-900 mb-3">Popular Exams</h2>
          <div className="grid grid-cols-4 gap-3">
            {GOALS.map((g) => (
              <Link
                key={g.label}
                href={g.href}
                className={`${g.bg} rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition`}
              >
                <span className="text-3xl">{g.icon}</span>
                <span className="text-[13px] font-semibold text-gray-800">{g.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Batches */}
        <section>
          <h2 className="text-[17px] font-bold text-gray-900 mb-3">Popular Batches</h2>
          <div className="space-y-4">
            {BATCHES.map((b) => (
              <PWBatchCard key={b.id} batch={b} />
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: 'Test Series', icon: '📋', href: '/app/test-series' },
            { label: 'Doubts', icon: '❓', href: '/app/doubts' },
            { label: 'Library', icon: '📚', href: '/app/ebooks' },
          ].map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition"
            >
              <span className="text-2xl">{q.icon}</span>
              <span className="text-[12px] font-medium text-gray-700">{q.label}</span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
