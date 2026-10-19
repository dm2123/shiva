'use client';

import Link from 'next/link';
import { StudentPageHeader, StudentSection } from '@/components/student/StudentShared';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import SubjectWiseChart from '@/components/analytics/SubjectWiseChart';
import WeaknessAnalysis from '@/components/analytics/WeaknessAnalysis';
import PerformanceTrends from '@/components/analytics/PerformanceTrends';
import {
  IconChart,
  IconTestSeries,
  IconChevronRight,
  IconTarget,
} from '@/components/student/ShivaIcons';

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 pb-24">
      <StudentPageHeader
        title="Performance Analytics"
        description="Tumhari taiyaari ka poora hisaab — test scores, strong aur weak topics, sab ek jagah."
      />

      {/* Overview stats (real data from API) */}
      <StudentSection title="Overall performance" subtitle="Live data">
        <AnalyticsOverview />
      </StudentSection>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StudentSection title="Subject-wise score" subtitle="Har subject me kitne paani me ho">
          <div className="student-card p-5">
            <SubjectWiseChart />
          </div>
        </StudentSection>
        <StudentSection title="Weak areas" subtitle="In par dhyaan do, marks yahin badhenge">
          <div className="student-card p-5">
            <WeaknessAnalysis />
          </div>
        </StudentSection>
      </div>

      {/* Trends */}
      <StudentSection title="Score trend" subtitle="Samay ke saath progress">
        <div className="student-card p-5">
          <PerformanceTrends />
        </div>
      </StudentSection>

      {/* Honest guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="student-card p-5 flex gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[var(--student-primary-light)] text-[var(--student-primary)] flex items-center justify-center flex-shrink-0">
            <IconTarget size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--student-text)]">Weak topics par kaam karo</p>
            <p className="text-xs text-[var(--student-text-muted)] mt-1 leading-relaxed">
              Upar weak areas me jo topics dikh rahe hain, unke practice sets lagao. Ek hafte me farak dikhega.
            </p>
          </div>
        </div>
        <div className="student-card p-5 flex gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <IconChart size={20} />
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--student-text)]">Regular test do</p>
            <p className="text-xs text-[var(--student-text-muted)] mt-1 leading-relaxed">
              Analytics tabhi kaam karega jab data hoga — hafte me kam se kam 2 mock test zaroor do.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/app/tests"
        className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-600/20 hover:shadow-xl transition group"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            <IconTestSeries size={20} />
          </div>
          <div>
            <p className="font-bold">Naya test do</p>
            <p className="text-xs text-white/75 mt-0.5">Score badhao, analytics me progress dekho</p>
          </div>
        </div>
        <IconChevronRight size={20} className="text-white/70 group-hover:translate-x-1 transition" />
      </Link>
    </div>
  );
}
