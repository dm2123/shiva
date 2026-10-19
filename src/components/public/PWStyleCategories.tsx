'use client';

import Link from 'next/link';

/** Original minimal line icons for exam categories. */
function IconBank({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 9.5L12 4l9 5.5M4.5 9.5V18M9.5 9.5V18M14.5 9.5V18M19.5 9.5V18M2.5 20.5h19" />
    </svg>
  );
}
function IconTrain({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="5" y="3.5" width="14" height="13" rx="2.5" />
      <path d="M5 10.5h14M9 20.5l-1.5-4M15 20.5l1.5-4" />
      <circle cx="9" cy="13.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconCoin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <ellipse cx="12" cy="6.5" rx="7.5" ry="3" />
      <path d="M4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </svg>
  );
}
function IconShield({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3l7.5 3v5.5c0 4.5-3.2 7.7-7.5 9.5-4.3-1.8-7.5-5-7.5-9.5V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  );
}

const CATEGORIES = [
  {
    title: 'SSC',
    desc: 'CGL, CHSL, MTS, GD Constable',
    exams: ['CGL', 'CHSL', 'MTS', 'GD'],
    icon: <IconBank className="h-9 w-9" />,
    tint: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Railway',
    desc: 'NTPC, Group D, ALP',
    exams: ['NTPC', 'Group D', 'ALP'],
    icon: <IconTrain className="h-9 w-9" />,
    tint: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Banking',
    desc: 'IBPS PO, SBI Clerk, RBI',
    exams: ['IBPS PO', 'SBI Clerk', 'RBI'],
    icon: <IconCoin className="h-9 w-9" />,
    tint: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Defence',
    desc: 'Agniveer, NDA, CDS',
    exams: ['Agniveer', 'NDA', 'CDS'],
    icon: <IconShield className="h-9 w-9" />,
    tint: 'bg-orange-100 text-orange-700',
  },
];

/**
 * Exam category cards. Links go to /courses (the courses page does not
 * support exam filtering, so no query param is attached).
 */
export default function PWStyleCategories() {
  return (
    <section className="py-10 md:py-14 px-4">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
          Apna Exam Chuno
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8 max-w-xl mx-auto">
          Har exam category ke liye courses aur study material — free se shuru karo
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href="/courses"
              className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition p-5"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${cat.tint} mb-3`}>
                    {cat.icon}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{cat.desc}</p>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {cat.exams.map((exam) => (
                      <span
                        key={exam}
                        className="text-xs border border-gray-200 px-3 py-1 rounded-full text-gray-600"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-violet-700 group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                    Explore <span aria-hidden>→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
