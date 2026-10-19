'use client';

import PWBatchCard, { PWBatch } from '@/components/student/PWBatchCard';
import Link from 'next/link';
import {
  IconSSC, IconRailway, IconBanking, IconDefence,
  IconTestSeries, IconDoubts, IconLibrary, IconLive, IconMyCourses, IconTrophy,
} from '@/components/student/ShivaIcons';

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
    bannerIcon: 'aptitude',
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
    bannerIcon: 'target',
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
    bannerIcon: 'target',
    kitIncluded: 'COMING SOON',
    ctaText: 'Notify Me',
  },
];

const GOALS = [
  { label: 'SSC', Icon: IconSSC, bg: 'bg-blue-100', iconColor: 'text-blue-600', href: '/app/goals?exam=ssc' },
  { label: 'Railway', Icon: IconRailway, bg: 'bg-green-100', iconColor: 'text-green-600', href: '/app/goals?exam=railway' },
  { label: 'Banking', Icon: IconBanking, bg: 'bg-yellow-100', iconColor: 'text-yellow-600', href: '/app/goals?exam=banking' },
  { label: 'Defence', Icon: IconDefence, bg: 'bg-orange-100', iconColor: 'text-orange-600', href: '/app/goals?exam=defence' },
];

const QUICK_ACTIONS = [
  { label: 'Test Series', Icon: IconTestSeries, href: '/app/tests' },
  { label: 'Doubts', Icon: IconDoubts, href: '/app/doubts' },
  { label: 'Library', Icon: IconLibrary, href: '/app/ebooks' },
  { label: 'Live Classes', Icon: IconLive, href: '/app/live' },
  { label: 'My Courses', Icon: IconMyCourses, href: '/app/my-courses' },
  { label: 'Leaderboard', Icon: IconTrophy, href: '/app/leaderboard' },
];

export default function PWDashboard({ userName, userEmail }: PWDashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (userName || '').split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1200px] mx-auto px-4 py-4 space-y-5 pb-20">
        {/* Greeting */}
        <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#4c1d95] text-white p-5 relative">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-8 bottom-0 w-20 h-20 rounded-full bg-amber-400/20" />
          <div className="relative z-10">
            <p className="text-[13px] text-white/70">{greeting},</p>
            <h1 className="text-xl font-black mt-0.5">{firstName}!</h1>
            <p className="text-[13px] text-white/70 mt-1">Aaj kya seekhna hai? Chalo shuru karte hain.</p>
            <Link
              href="/app/courses"
              className="inline-block mt-3 bg-amber-400 hover:bg-amber-300 text-gray-900 text-sm font-bold rounded-xl px-5 py-2.5 transition"
            >
              Explore Courses →
            </Link>
          </div>
        </section>

        {/* Festival / promo banner */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-5 text-center">
          <p className="text-lg font-bold text-orange-800">Free Learning Festival</p>
          <p className="text-sm text-orange-700 mt-1">Aptitude Foundation — 100% FREE enroll karo!</p>
          <Link
            href="/app/courses"
            className="inline-block mt-2 text-sm font-bold text-orange-600 underline underline-offset-2"
          >
            Enroll now — it's free
          </Link>
        </div>

        {/* Popular Goals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-gray-900">Popular Exams</h2>
            <Link href="/app/goals" className="text-[13px] font-semibold text-indigo-600">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {GOALS.map((g) => (
              <Link
                key={g.label}
                href={g.href}
                className={`${g.bg} rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition`}
              >
                <g.Icon size={32} className={g.iconColor} />
                <span className="text-[13px] font-semibold text-gray-800">{g.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Batches */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-gray-900">Popular Batches</h2>
            <Link href="/app/courses" className="text-[13px] font-semibold text-indigo-600">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {BATCHES.map((b) => (
              <PWBatchCard key={b.id} batch={b} />
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section>
          <h2 className="text-[17px] font-bold text-gray-900 mb-3">Quick Access</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <span className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <q.Icon size={24} className="text-indigo-600" />
                </span>
                <span className="text-[12px] font-medium text-gray-700 text-center">{q.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
