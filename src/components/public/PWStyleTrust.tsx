'use client';

import Link from 'next/link';

/** Simple original line icons for the trust stats. */
function IconSpark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}
function IconGrid({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconLang({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 5h9M8.5 3v2c0 4-2.5 7.5-6 9.5M6 9c1.5 3 4 5.5 7 6.5" />
      <path d="M13 21l4.5-10L22 21M14.8 17h5.4" />
    </svg>
  );
}
function IconRocket({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 15c5-4 7-8.5 7-12-3.5 0-8 2-12 7l-2 5 5-2" />
      <circle cx="15" cy="9" r="1.6" />
      <path d="M9 12l-4 4M5 19c.5-2 1.5-3.5 3-4.5" />
    </svg>
  );
}

/**
 * Honest trust section — no fake student counts, no fabricated claims.
 * Only states what is verifiably true about the platform today.
 */
export default function PWStyleTrust() {
  const stats = [
    { icon: <IconSpark className="h-7 w-7" />, title: '100% Free', sub: 'Starter course', tint: 'bg-emerald-100 text-emerald-700' },
    { icon: <IconGrid className="h-7 w-7" />, title: '5 Exams', sub: 'Categories covered', tint: 'bg-violet-100 text-violet-700' },
    { icon: <IconLang className="h-7 w-7" />, title: 'Hindi + English', sub: 'Bilingual content', tint: 'bg-amber-100 text-amber-700' },
    { icon: <IconRocket className="h-7 w-7" />, title: 'Growing', sub: 'New batches soon', tint: 'bg-sky-100 text-sky-700' },
  ];

  return (
    <section className="py-10 md:py-14 px-4 bg-gradient-to-b from-violet-50/60 to-white">
      <div className="max-w-[1200px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Padhai ka sahi start,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-purple-500">
            bina bhaari fees
          </span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base mb-7 max-w-2xl mx-auto">
          Free course se shuru karo, concepts mazboot karo — phir apne exam ki
          taiyaari ko next level par le jao.
        </p>
        <Link
          href="/register"
          className="inline-block bg-violet-700 hover:bg-violet-800 text-white font-bold text-base px-8 py-4 rounded-xl w-full md:w-auto transition shadow-lg shadow-violet-200"
        >
          Get Started — It&apos;s Free
        </Link>

        <div className="bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 mt-8 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden">
          {stats.map((s) => (
            <div key={s.title} className="p-6 text-center bg-white">
              <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${s.tint} mb-3`}>
                {s.icon}
              </span>
              <b className="block text-base text-gray-900">{s.title}</b>
              <span className="text-xs text-gray-500">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
