'use client';

/**
 * THE SHIVA — Public Test Series (presentation + interaction layer)
 * ---------------------------------------------------------------
 * Data page.tsx (server) se aata hai — sirf PUBLISHED tests aur
 * published courses ke asal fields:
 *   Tests:   title, description, durationMinutes, totalMarks,
 *            passingMarks, type (mock/pyq/practice), category
 *   Courses: title, slug (exam tag title/slug se derive hota hai)
 *
 * HONEST-DATA RULE: Is page par koi Test Pass, price, MRP, coupon,
 * discount, rating ya student-count NAHI hai — kyunki platform ke
 * paas public test-pass jaisa koi asal product/field hi nahi hai.
 * Tests asal me enrolled courses ke saath student app (/app/tests)
 * me milte hain — CTA aur FAQ me yahi sach saaf likha hai.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/* Data shapes — page.tsx (server) se serialized hokar aate hain       */
/* ------------------------------------------------------------------ */

export type PublicTestKind = 'mock' | 'pyq' | 'practice' | 'general';

export interface PublicTestItem {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number | null;
  kind: PublicTestKind;
  kindLabel: string;
  /** Asal Tests.category text (jab admin ne diya ho), warna null */
  categoryLabel: string | null;
  examId: string | null;
  examLabel: string | null;
  examIcon: string | null;
  courseTitle: string | null;
  courseSlug: string | null;
}

export interface PublicExamCategory {
  id: string;
  label: string;
  icon: string;
  testCount: number;
  courseCount: number;
}

/* ------------------------------------------------------------------ */
/* 1) Quick-link cards — 4 pastel cards (design-map wala pattern,       */
/*    THE SHIVA ke asal routes ke saath)                               */
/* ------------------------------------------------------------------ */

const QUICK_LINKS: Array<{
  icon: string;
  tint: string;
  title: string;
  sub: string;
  href: string;
}> = [
  {
    icon: '🧪',
    tint: '#ede9fe',
    title: 'Saare Tests Do',
    sub: 'Login karke apne enrolled courses ke mock, PYQ aur practice tests attempt karo.',
    href: '/app/tests',
  },
  {
    icon: '📚',
    tint: '#dbeafe',
    title: 'Courses Dekho',
    sub: 'Har test kisi asal course se juda hai — pehle padho, phir test se aanko.',
    href: '/courses',
  },
  {
    icon: '🗓️',
    tint: '#fef3c7',
    title: 'Batches Join Karo',
    sub: 'Structured batches me scheduled padhai ke saath regular testing ka rhythm banao.',
    href: '/batches',
  },
  {
    icon: '▶️',
    tint: '#dcfce7',
    title: 'Free Lectures',
    sub: 'Course pages par free preview lectures bina enroll kiye dekho aur phir test do.',
    href: '/courses',
  },
];

function QuickLinks() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {QUICK_LINKS.map((q) => (
        <Link
          key={q.title}
          href={q.href}
          className="group flex items-start gap-4 rounded-2xl border border-[#ede9fe] bg-white p-5 shadow-[0_6px_24px_rgba(42,22,80,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#6d28d9]/40 hover:shadow-[0_16px_40px_rgba(42,22,80,0.16)]"
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[22px]"
            style={{ background: q.tint }}
            aria-hidden="true"
          >
            {q.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15.5px] font-extrabold text-[#2a1650]">{q.title}</span>
            <span className="mt-1 block text-[13px] leading-relaxed text-slate-500">{q.sub}</span>
          </span>
          <span
            className="mt-1 shrink-0 text-xl font-black leading-none text-[#6d28d9] transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            ›
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2) Exam categories — sirf wohi jo asal published data me hain.      */
/*    Card par click = neeche wale tests grid ka exam filter.          */
/* ------------------------------------------------------------------ */

function ExamCategories({
  categories,
  activeExam,
  onSelect,
}: {
  categories: PublicExamCategory[];
  activeExam: string | null;
  onSelect: (examId: string | null) => void;
}) {
  if (categories.length === 0) return null;

  const jumpToTests = () => {
    document.getElementById('published-tests')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section aria-label="Exam categories" className="mt-16">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-[#ede9fe] px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-[#6d28d9]">
          Exam Categories
        </span>
        <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-[#2a1650]">
          Apne Exam ke Tests Chuno
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
          Ye categories asal published courses aur tests se bani hain — jis exam ki taiyaari
          kar rahe ho, usi ke tests pehle dekho.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const isActive = activeExam === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                onSelect(isActive ? null : cat.id);
                jumpToTests();
              }}
              className={`rounded-2xl border-2 bg-white p-5 text-left shadow-[0_6px_24px_rgba(42,22,80,0.07)] transition-all duration-300 hover:-translate-y-1 ${
                isActive
                  ? 'border-[#6d28d9] shadow-[0_16px_40px_rgba(109,40,217,0.22)]'
                  : 'border-[#ede9fe] hover:border-[#6d28d9]/40'
              }`}
            >
              <span className="text-3xl" aria-hidden="true">
                {cat.icon}
              </span>
              <span className="mt-3 block text-base font-extrabold text-[#2a1650]">{cat.label}</span>
              <span className="mt-1 block text-[12.5px] font-medium leading-relaxed text-slate-500">
                {cat.testCount > 0 &&
                  `${cat.testCount} published test${cat.testCount === 1 ? '' : 's'}`}
                {cat.testCount > 0 && cat.courseCount > 0 && ' · '}
                {cat.courseCount > 0 &&
                  `${cat.courseCount} course${cat.courseCount === 1 ? '' : 's'}`}
              </span>
              <span className="mt-3 inline-block text-[13px] font-bold text-[#6d28d9]">
                {isActive ? 'Filter laga hai ✓' : 'Tests dekho →'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3) Published test card — sirf asal fields: naam, exam/kind tag,     */
/*    duration, total marks, passing marks, linked course.             */
/*    Koi price/pass/coupon nahi — aisa koi asal field hai hi nahi.    */
/* ------------------------------------------------------------------ */

const KIND_STYLES: Record<PublicTestKind, string> = {
  mock: 'bg-violet-50 text-[#6d28d9] border border-violet-200',
  pyq: 'bg-sky-50 text-sky-700 border border-sky-200',
  practice: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  general: 'bg-slate-100 text-slate-600 border border-slate-200',
};

function TestCard({ test }: { test: PublicTestItem }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ede9fe] bg-white shadow-[0_6px_24px_rgba(42,22,80,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#6d28d9]/40 hover:shadow-[0_18px_44px_rgba(42,22,80,0.18)]">
      {/* Top strip — deep purple → violet, gold edge (brand gradient) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#f5b942]" aria-hidden="true" />

      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Tags: narangi exam tag + kind chip + asal category text */}
        <div className="flex flex-wrap items-center gap-2">
          {test.examLabel && (
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-orange-700">
              {test.examIcon} {test.examLabel}
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${KIND_STYLES[test.kind]}`}
          >
            {test.kindLabel}
          </span>
          {test.categoryLabel && test.categoryLabel !== test.kindLabel && (
            <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200">
              {test.categoryLabel}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold leading-snug text-[#2a1650]">{test.title}</h3>
          {test.description && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500">
              {test.description}
            </p>
          )}
          {test.courseTitle && (
            <p className="text-[13px] font-medium text-slate-600">
              Course:{' '}
              {test.courseSlug ? (
                <Link href={`/courses/${test.courseSlug}`} className="font-semibold text-[#6d28d9] hover:underline">
                  {test.courseTitle}
                </Link>
              ) : (
                <span className="font-semibold text-[#6d28d9]">{test.courseTitle}</span>
              )}
            </p>
          )}
        </div>

        {/* Meta — sirf asal test fields */}
        <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-[#ede9fe] pt-4 text-[13px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Samay</dt>
            <dd>
              ⏱️ <span className="font-semibold text-slate-800">{test.durationMinutes} min</span>
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Kul ank</dt>
            <dd>
              🏆 <span className="font-semibold text-slate-800">{test.totalMarks} marks</span>
            </dd>
          </div>
          {typeof test.passingMarks === 'number' && test.passingMarks > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Passing marks</dt>
              <dd>
                🎯 Passing: <span className="font-semibold text-slate-800">{test.passingMarks}</span>
              </dd>
            </div>
          )}
        </dl>

        {/* CTA — tests student app me milte hain (login ke baad) */}
        <div className="mt-1 flex items-stretch gap-2.5">
          <Link
            href="/app/tests"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition-all hover:bg-black"
            aria-label={`${test.title} — attempt karo (login ke baad)`}
          >
            Attempt Karo
          </Link>
          {test.courseSlug && (
            <Link
              href={`/courses/${test.courseSlug}`}
              aria-label={`${test.courseTitle ?? 'Course'} — course details dekho`}
              className="inline-flex w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#6d28d9] bg-white text-lg font-black leading-none text-[#6d28d9] transition-colors hover:bg-[#f5f3ff]"
            >
              ›
            </Link>
          )}
        </div>
        <p className="-mt-1 text-[11.5px] leading-relaxed text-slate-400">
          Test dene ke liye login/register aur us course me enrollment chahiye — bilkul
          asal exam ki tarah, bina taiyaari ke number nahi milte.
        </p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 4) Published tests — kind + exam filters ke saath                   */
/* ------------------------------------------------------------------ */

const KIND_FILTERS: Array<{ key: PublicTestKind | 'all'; label: string }> = [
  { key: 'all', label: 'Saare Tests' },
  { key: 'mock', label: 'Mock Tests' },
  { key: 'pyq', label: 'PYQ Tests' },
  { key: 'practice', label: 'Practice Tests' },
  { key: 'general', label: 'General Tests' },
];

function PublishedTests({
  tests,
  activeExam,
  onExamChange,
}: {
  tests: PublicTestItem[];
  activeExam: string | null;
  onExamChange: (examId: string | null) => void;
}) {
  const [kind, setKind] = useState<PublicTestKind | 'all'>('all');

  const kindsPresent = useMemo(
    () => KIND_FILTERS.filter((f) => f.key === 'all' || tests.some((t) => t.kind === f.key)),
    [tests],
  );

  const filtered = useMemo(
    () =>
      tests.filter((t) => {
        if (kind !== 'all' && t.kind !== kind) return false;
        if (activeExam && t.examId !== activeExam) return false;
        return true;
      }),
    [tests, kind, activeExam],
  );

  return (
    <section id="published-tests" aria-label="Published tests" className="mt-16 scroll-mt-24">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-[#ede9fe] px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-[#6d28d9]">
          Published Tests
        </span>
        <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-[#2a1650]">
          Abhi Available <span className="text-[#6d28d9]">Tests</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
          Ye saare tests asal me publish ho chuke hain — naam, samay aur marks bilkul wahi
          jo tumhe test dete waqt milenge.
        </p>
      </div>

      {/* Kind filter chips — sirf jo kinds asal data me maujood hain */}
      {kindsPresent.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Test type se filter karo">
          {kindsPresent.map((f) => {
            const isActive = kind === f.key;
            const count = f.key === 'all' ? tests.length : tests.filter((t) => t.kind === f.key).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setKind(f.key)}
                aria-pressed={isActive}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                  isActive
                    ? 'bg-[#6d28d9] text-white shadow-lg shadow-[#6d28d9]/30'
                    : 'border border-[#ede9fe] bg-white text-slate-600 hover:border-[#6d28d9]/50 hover:text-[#2a1650]'
                }`}
              >
                {f.label} · {count}
              </button>
            );
          })}
          {activeExam && (
            <button
              type="button"
              onClick={() => onExamChange(null)}
              className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[13px] font-bold text-orange-700 transition-all hover:bg-orange-100"
            >
              Exam filter hatao ×
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-[#ede9fe] bg-white p-10 text-center shadow-[0_6px_24px_rgba(42,22,80,0.07)]" role="status">
          <div className="mb-3 text-5xl opacity-40" aria-hidden="true">
            🔍
          </div>
          <h3 className="mb-2 text-lg font-extrabold text-[#2a1650]">
            Is filter me abhi koi test nahi hai
          </h3>
          <p className="text-sm leading-relaxed text-slate-500">
            Dusra type ya exam chuno — ya saare published tests ek saath dekho.
          </p>
          <button
            type="button"
            onClick={() => {
              setKind('all');
              onExamChange(null);
            }}
            className="mt-5 inline-block rounded-full bg-[#6d28d9] px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5b21b6]"
          >
            Saare Tests Dekho
          </button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-center text-sm font-semibold text-slate-500" aria-live="polite">
            {filtered.length} test{filtered.length === 1 ? '' : 's'} dikh rahe hain
            {tests.length !== filtered.length ? ` · kul ${tests.length} published` : ''}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5) Why Test Series? — 6 icon cards. Har feature platform par        */
/*    asal me maujood hai (neeche comment me saboot ke saath):         */
/*    1. type buckets (mock/pyq/practice) — Tests.type asal field      */
/*    2. timer — Tests.durationMinutes asal field                      */
/*    3. detailed analysis — /app/results: score, accuracy, time,      */
/*       topic-wise strong/weak areas                                  */
/*    4. rank — /app/leaderboard asal page                             */
/*    5. sawal ke hal — Questions.explanation asal field               */
/*    6. negative marking — Questions.negativeMarks asal field         */
/* ------------------------------------------------------------------ */

const WHY_CARDS = [
  {
    icon: '🎯',
    tint: '#ede9fe',
    title: 'Asal Exam Pattern',
    text: 'Mock, PYQ aur Practice — teen prakar ke tests asal courses se jude hote hain, taaki tum waisa hi abhyaas karo jaisa asal paper me aata hai.',
  },
  {
    icon: '⏱️',
    tint: '#dbeafe',
    title: 'Timer ke Saath Asal Mahaul',
    text: 'Har test ka apna nishchit samay hota hai. Ghadi ke dabav me dena seekhna hi asal exam ki aadhi taiyaari hai.',
  },
  {
    icon: '📊',
    tint: '#dcfce7',
    title: 'Detailed Analysis',
    text: 'Submit karte hi score, accuracy, laga samay aur topic-wise strong/weak areas — taaki agli taiyaari andhere me nahi, data par ho.',
  },
  {
    icon: '🏆',
    tint: '#fef3c7',
    title: 'Rank aur Leaderboard',
    text: 'Leaderboard par dekho tum saathi students ke beech kahan khade ho — sehatmand muqabla taiyaari ko tez karta hai.',
  },
  {
    icon: '📝',
    tint: '#fee2e2',
    title: 'Har Sawal ka Hal',
    text: 'Tests ke sawalo ke saath vyakhya (explanation) milti hai — galti sirf ginai nahi jaati, samjhai bhi jaati hai.',
  },
  {
    icon: '➖',
    tint: '#ffedd5',
    title: 'Negative Marking ki Practice',
    text: 'Sawalo par asal negative marking lagu hoti hai — andaze se tick karne ki aadat yahi chhootegi, asal exam me nahi.',
  },
];

const PREP_STEPS = [
  { n: '01', t: 'Pehle Padho', d: 'Course ke lectures aur notes se topic pakka karo.' },
  { n: '02', t: 'Practice Do', d: 'Chapter-level practice tests se kamzor hisse pakdo.' },
  { n: '03', t: 'Mock se Aanko', d: 'Full mock asal samay me do — mahaul aur speed dono parakho.' },
  { n: '04', t: 'Analysis Sudharo', d: 'Topic-wise report dekho, galtiyan sudharo, phir dobara test do.' },
];

function WhyTestSeries() {
  return (
    <section aria-label="Test series kyun" className="mt-20">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-[#ede9fe] px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-[#6d28d9]">
          Why Test Series?
        </span>
        <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-[#2a1650]">
          Sirf Padhna Kaafi Nahi — <span className="text-[#6d28d9]">Khud ko Aankna bhi Zaroori Hai</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
          THE SHIVA ki test series padhai ko number me badalti hai — taaki tumhe hamesha pata
          rahe ki taiyaari asal me kahan tak pahunchi hai.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {WHY_CARDS.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-[#ede9fe] bg-white p-6 shadow-[0_6px_24px_rgba(42,22,80,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(42,22,80,0.14)]"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-[22px]"
              style={{ background: c.tint }}
              aria-hidden="true"
            >
              {c.icon}
            </span>
            <h3 className="mt-4 text-base font-extrabold text-[#2a1650]">{c.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Taiyaari ka sahi kram — numbered list */}
      <div className="mt-10 rounded-2xl border border-[#ede9fe] bg-[#faf9ff] p-6 md:p-8">
        <h3 className="text-center text-lg font-extrabold text-[#2a1650]">
          Taiyaari ka Sahi Kram
        </h3>
        <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PREP_STEPS.map((s) => (
            <li key={s.n} className="flex gap-3.5">
              <span className="text-2xl font-black leading-none text-[#6d28d9]/30" aria-hidden="true">
                {s.n}
              </span>
              <span>
                <span className="block text-[15px] font-extrabold text-[#2a1650]">{s.t}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-slate-500">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6) FAQ — honest sawal-jawaab (platform asal me jo deta hai, wahi)   */
/* ------------------------------------------------------------------ */

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: 'Test Series kya hoti hai aur isse fayda kya hai?',
    a: 'Test Series ka matlab hai taiyaari ko asal tests se aankna. THE SHIVA par teen prakar ke tests hote hain — full Mock Tests (asal exam jaisa mahaul), PYQ Tests (pichhle saalon ke paper-pattern par) aur Practice Tests (topic/chapter level). Sirf padhne se samajh aata hai, test dene se number aate hain.',
  },
  {
    q: 'Tests dene ke liye kya karna hoga?',
    a: 'Pehle free register/login karo, phir jis course ki taiyaari kar rahe ho usme enroll karo. Us course ke saare published tests tumhe student app ke Tests section (/app/tests) me mil jayenge — wahi se attempt shuru hota hai.',
  },
  {
    q: 'Kya tests bilkul asal exam jaise hote hain?',
    a: 'Har test ka apna timer (duration), kul marks aur passing marks pehle se tay hote hain — ye saari jaankari is page ke har test card par aur test shuru karne se pehle dikhti hai. Sawalo par negative marking bhi lagu hoti hai, isliye mahaul asal exam ke bahut kareeb hota hai.',
  },
  {
    q: 'Test ke baad result aur analysis kab milta hai?',
    a: 'Test submit karte hi tumhara result taiyaar ho jata hai. Results section me score, accuracy, laga hua samay aur topic-wise strong/weak areas ki detailed report milti hai — taaki tumhe pata chale agla dhyaan kahan dena hai.',
  },
  {
    q: 'Apni rank dusre students ke beech kaise pata chalegi?',
    a: 'Student app me Leaderboard hai — wahan tum apni sthiti saathi students ke beech dekh sakte ho. Rank asal attempts par banti hai, isliye jitne zyada sahi tests, utni behtar sthiti.',
  },
  {
    q: 'Mere exam ke tests yahan nahi dikh rahe — kya karoon?',
    a: 'Is page par sirf wahi tests dikhte hain jo abhi publish ho chuke hain. Naye courses aur tests lagatar judte rehte hain — tab tak Courses page par apne exam ka course dekho aur free register karke rakho, taaki naye tests aate hi tumhe khabar mile.',
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section aria-label="Aksar poochhe jaane wale sawaal" className="mt-20">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-[#ede9fe] px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-[#6d28d9]">
          FAQ
        </span>
        <h2 className="mt-3 text-[32px] font-extrabold leading-tight text-[#2a1650]">
          Aksar Poochhe Jaane Wale Sawaal
        </h2>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className={`overflow-hidden rounded-2xl border-2 bg-white transition-colors ${
                isOpen ? 'border-[#6d28d9]/40' : 'border-[#ede9fe]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`ts-faq-a-${i}`}
                className="flex w-full items-center justify-between gap-4 px-6 text-left"
                style={{ paddingTop: 18, paddingBottom: 18 }}
              >
                <span className="text-[15.5px] font-bold text-[#2a1650]">{f.q}</span>
                <span className="shrink-0 text-2xl font-extrabold leading-none text-[#6d28d9]" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div id={`ts-faq-a-${i}`} className="px-6 pb-5 text-[14.5px] leading-relaxed text-slate-500">
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Root component — page.tsx se asal data props me aata hai            */
/* ------------------------------------------------------------------ */

export default function TestSeriesPublic({
  tests,
  categories,
}: {
  tests: PublicTestItem[];
  categories: PublicExamCategory[];
}) {
  const [activeExam, setActiveExam] = useState<string | null>(null);

  return (
    <>
      <QuickLinks />

      <ExamCategories categories={categories} activeExam={activeExam} onSelect={setActiveExam} />

      {tests.length > 0 ? (
        <PublishedTests tests={tests} activeExam={activeExam} onExamChange={setActiveExam} />
      ) : (
        /* Honest empty state — abhi ek bhi test publish nahi hai.
           Nakli test card ki jagah sach + asal agla kadam. */
        <section id="published-tests" aria-label="Published tests" className="mt-16 scroll-mt-24">
          <div className="mx-auto max-w-xl rounded-2xl border border-[#ede9fe] bg-white p-10 text-center shadow-[0_6px_24px_rgba(42,22,80,0.07)]" role="status">
            <div className="mb-3 text-5xl opacity-40" aria-hidden="true">
              🧪
            </div>
            <h2 className="mb-2 text-xl font-extrabold text-[#2a1650]">
              Naye tests jald aa rahe hain
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Hum asal exam pattern par tests taiyaar kar rahe hain. Tab tak courses se
              padhai shuru karo — free register karne par naye tests ki khabar sabse
              pehle milegi.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/courses"
                className="inline-block rounded-full bg-[#6d28d9] px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5b21b6]"
              >
                Courses Dekho
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-full bg-[#111111] px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                Register Free
              </Link>
            </div>
          </div>
        </section>
      )}

      <WhyTestSeries />
      <FaqAccordion />
    </>
  );
}
