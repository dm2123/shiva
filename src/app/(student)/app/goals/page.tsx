'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  IconSSC, IconRailway, IconBanking, IconDefence, IconTeaching, IconCheck,
} from '@/components/student/ShivaIcons';

const EXAMS = [
  {
    id: 'ssc',
    label: 'SSC',
    Icon: IconSSC,
    bg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    border: 'border-blue-200',
    desc: 'SSC CGL, CHSL, MTS, GD Constable',
    batches: [
      { title: 'MISSION SSC CGL 2026', status: 'Coming Soon', href: '/app/courses' },
      { title: 'Aptitude Foundation', status: 'Free · Enroll Now', href: '/app/courses' },
    ],
  },
  {
    id: 'railway',
    label: 'Railway',
    Icon: IconRailway,
    bg: 'bg-green-100',
    iconColor: 'text-green-600',
    border: 'border-green-200',
    desc: 'RRB NTPC, Group D, ALP',
    batches: [
      { title: 'MISSION RAILWAY 2026', status: 'Coming Soon', href: '/app/courses' },
      { title: 'Aptitude Foundation', status: 'Free · Enroll Now', href: '/app/courses' },
    ],
  },
  {
    id: 'banking',
    label: 'Banking',
    Icon: IconBanking,
    bg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    border: 'border-yellow-200',
    desc: 'IBPS PO/Clerk, SBI PO/Clerk',
    batches: [
      { title: 'Aptitude Foundation', status: 'Free · Enroll Now', href: '/app/courses' },
    ],
  },
  {
    id: 'defence',
    label: 'Defence',
    Icon: IconDefence,
    bg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    border: 'border-orange-200',
    desc: 'Agniveer, CDS, NDA',
    batches: [
      { title: 'Aptitude Foundation', status: 'Free · Enroll Now', href: '/app/courses' },
    ],
  },
  {
    id: 'teaching',
    label: 'Teaching',
    Icon: IconTeaching,
    bg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    border: 'border-purple-200',
    desc: 'CTET, UPTET, DSSSB',
    batches: [
      { title: 'Aptitude Foundation', status: 'Free · Enroll Now', href: '/app/courses' },
    ],
  },
];

function GoalsContent() {
  const searchParams = useSearchParams();
  const activeExam = searchParams.get('exam');
  const active = EXAMS.find((e) => e.id === activeExam);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-5 pb-20">
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#4c1d95] text-white p-5">
        <h1 className="text-xl font-black">Choose Your Goal</h1>
        <p className="text-[13px] text-white/70 mt-1">
          Apna exam select karo — usi ke hisab se batches aur courses dikhenge.
        </p>
      </section>

      {/* Exam grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {EXAMS.map((e) => {
          const isActive = activeExam === e.id;
          return (
            <Link
              key={e.id}
              href={`/app/goals?exam=${e.id}`}
              className={`${e.bg} ${isActive ? `ring-2 ring-offset-2 ring-indigo-500 ${e.border} border` : 'border border-transparent'} rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition`}
            >
              <e.Icon size={36} className={e.iconColor} />
              <span className="text-sm font-bold text-gray-800">{e.label}</span>
              <span className="text-[11px] text-gray-500 text-center leading-tight">{e.desc}</span>
              {isActive && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                  <IconCheck size={14} /> Selected
                </span>
              )}
            </Link>
          );
        })}
      </section>

      {/* Batches for selected exam */}
      {active && (
        <section>
          <h2 className="text-[17px] font-bold text-gray-900 mb-3">
            {active.label} ke liye batches
          </h2>
          <div className="space-y-3">
            {active.batches.map((b) => (
              <Link
                key={b.title}
                href={b.href}
                className="block bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <span className={`w-12 h-12 rounded-2xl ${active.bg} flex items-center justify-center flex-shrink-0`}>
                    <active.Icon size={28} className={active.iconColor} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-[15px]">{b.title}</h3>
                    <p className="text-[12px] text-gray-500 mt-0.5">{b.status}</p>
                  </div>
                  <span className="text-indigo-600 font-bold text-sm flex-shrink-0">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!active && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">
            Upar se apna exam chuno — uske liye available batches yahan dikhenge.
          </p>
        </section>
      )}
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
      <GoalsContent />
    </Suspense>
  );
}
