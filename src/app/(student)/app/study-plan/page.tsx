'use client';

import Link from 'next/link';
import { StudentPageHeader, StudentSection } from '@/components/student/StudentShared';
import StudyPlanGenerator from '@/components/ai/StudyPlanGenerator';
import {
  IconCalendar,
  IconTarget,
  IconCheck,
  IconChevronRight,
  IconBook,
} from '@/components/student/ShivaIcons';

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: <IconTarget size={20} />,
    title: 'Lakshya chuno',
    desc: 'Apna target exam aur exam ki date select karo — SSC, Railway, Banking ya koi aur.',
  },
  {
    step: '2',
    icon: <IconCalendar size={20} />,
    title: 'Plan banao',
    desc: 'Ek click me tumhare liye din-waar study plan taiyaar — kaunsa din, kaunsa topic.',
  },
  {
    step: '3',
    icon: <IconCheck size={20} />,
    title: 'Roz follow karo',
    desc: 'Har din ke tasks complete karo aur tick lagao. Consistency hi jeet hai.',
  },
];

const TIPS = [
  {
    icon: <IconBook size={20} />,
    title: 'Revision ko jagah do',
    desc: 'Naya padhne ke saath purana dohrana mat bhoolo — plan me revision days pehle se hote hain.',
  },
  {
    icon: <IconTarget size={20} />,
    title: 'Mock test zaroori',
    desc: 'Sirf padhne se nahi hoga — hafte me 2 mock test plan me shamil rakho.',
  },
  {
    icon: <IconCheck size={20} />,
    title: 'Chhote target, badi jeet',
    desc: 'Roz ka 70% complete karna, 0% se hazaar guna behtar hai. Perfect ka peechha mat karo.',
  },
];

export default function StudyPlanPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 pb-24">
      <StudentPageHeader
        title="Study Plan"
        description="Apne target exam ke hisaab se personalised din-waar padhai ka plan banao — free, 2 minute me."
      />

      {/* Generator */}
      <StudentSection title="Apna plan banao" subtitle="AI-powered planner">
        <div className="student-card p-5 md:p-7">
          <StudyPlanGenerator />
        </div>
      </StudentSection>

      {/* How it works */}
      <StudentSection title="Kaise kaam karta hai" subtitle="Sirf 3 steps">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="student-card p-5 relative overflow-hidden">
              <span className="absolute top-3 right-4 text-5xl font-black text-[var(--student-primary-light)] select-none">
                {s.step}
              </span>
              <div className="w-11 h-11 rounded-2xl bg-[var(--student-primary-light)] text-[var(--student-primary)] flex items-center justify-center mb-3 relative">
                {s.icon}
              </div>
              <p className="font-bold text-sm text-[var(--student-text)] mb-1 relative">{s.title}</p>
              <p className="text-xs text-[var(--student-text-muted)] leading-relaxed relative">{s.desc}</p>
            </div>
          ))}
        </div>
      </StudentSection>

      {/* Tips */}
      <StudentSection title="Plan ko kaamyaab banane ke nuskhe" subtitle="Toppers ki aadatein">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIPS.map((tip) => (
            <div key={tip.title} className="student-card p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                {tip.icon}
              </div>
              <p className="font-bold text-sm text-[var(--student-text)] mb-1">{tip.title}</p>
              <p className="text-xs text-[var(--student-text-muted)] leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </StudentSection>

      {/* CTA */}
      <Link
        href="/app/streak"
        className="flex items-center justify-between student-card p-5 hover:shadow-md transition group"
      >
        <div>
          <p className="font-bold text-[var(--student-text)]">Plan bana liya? Streak shuru karo</p>
          <p className="text-xs text-[var(--student-text-muted)] mt-0.5">Roz check-in karo aur apni consistency dekho</p>
        </div>
        <IconChevronRight size={20} className="text-[var(--student-text-faint)] group-hover:text-[var(--student-primary)] group-hover:translate-x-1 transition" />
      </Link>
    </div>
  );
}
