'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
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

/**
 * StudentProfiles.targetExam free-text hai (profile form me student
 * "SSC CGL" jaisa kuch bhi likh sakta hai) — is page ke kisi exam
 * card se asal match yahin se hota hai; koi match na mile to koi
 * card preselect nahi hota (nakli selected state nahi dikhega).
 */
function examIdForTargetExam(targetExam: string): string | null {
  const t = targetExam.toLowerCase();
  if (/\bssc\b|cgl|chsl|\bmts\b|steno/.test(t)) return 'ssc';
  if (/railway|ntpc|\brrb\b|group[\s-]?d/.test(t)) return 'railway';
  if (/bank|ibps|\bsbi\b/.test(t)) return 'banking';
  if (/defence|defense|\bnda\b|\bcds\b|afcat|agniveer/.test(t)) return 'defence';
  if (/ctet|uptet|\btet\b|teach|dsssb|\bkvs\b/.test(t)) return 'teaching';
  return null;
}

function GoalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeExam = searchParams.get('exam');
  const active = EXAMS.find((e) => e.id === activeExam);

  // ── Asal goal state (StudentProfiles.targetExam) ──────────
  // Load: GET /api/student/profile (profile page wala hi route/pattern).
  // Set:  PUT /api/student/profile { targetExam: <exam label> } —
  //       wahi API jo ProfileEditForm use karta hai.
  const [goalExamId, setGoalExamId] = useState<string | null>(null);
  const [goalRaw, setGoalRaw] = useState<string | null>(null);
  const [goalLoading, setGoalLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/student/profile');
        const json = await res.json();
        const t = json?.data?.targetExam;
        if (!cancelled && typeof t === 'string' && t.trim()) {
          setGoalRaw(t.trim());
          setGoalExamId(examIdForTargetExam(t));
        }
      } catch {
        /* goal load na ho to koi preselect nahi — selection phir bhi chalega */
      } finally {
        if (!cancelled) setGoalLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function setGoal(exam: (typeof EXAMS)[number]) {
    setSavingId(exam.id);
    setSaveError(null);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetExam: exam.label }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const detail = data?.error?.details?.[0]?.message;
        throw new Error(detail || data?.error?.message || 'Goal save nahi ho paya. Dobara try karo.');
      }
      setGoalRaw(exam.label);
      setGoalExamId(exam.id);
      // Header ki goal pill (server-rendered layout) bhi turant update ho
      router.refresh();
    } catch (err: any) {
      setSaveError(err?.message || 'Goal save nahi ho paya. Dobara try karo.');
    } finally {
      setSavingId(null);
    }
  }

  const goalExam = EXAMS.find((e) => e.id === goalExamId) || null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-5 pb-20">
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#4c1d95] text-white p-5">
        <h1 className="text-xl font-black">Choose Your Goal</h1>
        <p className="text-[13px] text-white/70 mt-1">
          Apna exam select karo — usi ke hisab se batches aur courses dikhenge.
        </p>
      </section>

      {/* Asal goal confirmation — sirf tab jab asal goal set/load ho */}
      {!goalLoading && goalRaw && (
        <section className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-violet-800">
            <IconCheck size={15} />
            Tumhara goal: {goalExam ? goalExam.label : goalRaw}
          </span>
          <span className="text-[12px] text-violet-600">
            Dashboard par is goal ke courses pehle dikhenge.
          </span>
          <Link
            href="/app"
            className="ml-auto text-[13px] font-bold text-violet-700 underline underline-offset-2 hover:text-violet-900"
          >
            Dashboard dekho →
          </Link>
        </section>
      )}
      {goalLoading && (
        <p className="text-[12px] font-medium text-gray-400">Tumhara goal load ho raha hai…</p>
      )}
      {saveError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
          {saveError}
        </p>
      )}

      {/* Exam grid — card click = batches preview (?exam=), button = asal goal set */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {EXAMS.map((e) => {
          const isActive = activeExam === e.id;
          const isGoal = goalExamId === e.id;
          const isSaving = savingId === e.id;
          return (
            <div
              key={e.id}
              className={`${e.bg} ${
                isGoal
                  ? 'ring-2 ring-offset-2 ring-violet-600 border ' + e.border
                  : isActive
                    ? 'ring-2 ring-offset-2 ring-indigo-300 border ' + e.border
                    : 'border border-transparent'
              } rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition`}
            >
              <Link
                href={`/app/goals?exam=${e.id}`}
                className="flex w-full flex-col items-center gap-2"
                aria-label={`${e.label} ke batches dekho`}
              >
                <e.Icon size={36} className={e.iconColor} />
                <span className="text-sm font-bold text-gray-800">{e.label}</span>
                <span className="text-[11px] text-gray-500 text-center leading-tight">{e.desc}</span>
              </Link>
              {isGoal && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-violet-700">
                  <IconCheck size={14} /> Mera Goal
                </span>
              )}
              {isGoal ? (
                <button
                  type="button"
                  disabled
                  className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-violet-600 px-3 py-2 text-[12px] font-bold text-white opacity-90"
                >
                  <IconCheck size={13} /> Goal set hai
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setGoal(e)}
                  disabled={savingId !== null}
                  className="mt-1 w-full rounded-full border border-violet-600 bg-white px-3 py-2 text-[12px] font-bold text-violet-700 transition hover:bg-violet-600 hover:text-white disabled:opacity-50"
                >
                  {isSaving ? 'Save ho raha hai…' : 'Ye mera goal hai'}
                </button>
              )}
            </div>
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
