'use client';

import Link from 'next/link';

/**
 * Premium homepage hero — honest, original THE SHIVA branding.
 * No fake prices, no unverified faculty/live-class/24x7 claims.
 * The only live offering highlighted is the real free Aptitude Foundation course.
 */
export default function PWStyleHero() {
  const features = [
    'Aptitude Foundation course — 100% free',
    'Structured chapters with practice questions',
    'Hindi + English bilingual content',
    'Doubt support for enrolled students',
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50">
      {/* soft decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl"
      />

      <div className="relative max-w-[1200px] mx-auto px-4 py-10 md:py-16 grid gap-8 md:grid-cols-2 md:items-center">
        {/* Copy */}
        <div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Free course available now
          </span>
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-gray-900 mb-4">
            Bharat ka Affordable{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-purple-500">
              Learning Platform
            </span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base mb-5 max-w-md">
            SSC, Railway, Banking, Defence aur Teaching exams ki taiyaari — free
            courses se shuru karo, apne pace par aage badho.
          </p>

          <ul className="space-y-2.5 mb-7">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-[#6d28d9] hover:bg-[#2a1650] text-white font-extrabold text-base px-8 py-3.5 rounded-xl transition shadow-lg shadow-violet-200"
            >
              Start Learning Free →
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-violet-800 font-bold text-base px-8 py-3.5 rounded-xl border-2 border-violet-200 transition"
            >
              Explore Courses
            </Link>
          </div>

          {/* Exam-goal chips — apna goal chuno, courses wahi se shuru hote hain */}
          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
              Mera exam goal hai:
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Exam goals">
              {['SSC', 'Railway', 'Banking', 'Defence', 'Teaching'].map((goal) => (
                <Link
                  key={goal}
                  href="/courses"
                  className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800 transition hover:border-[#f5b942] hover:bg-amber-50"
                >
                  {goal}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Visual card */}
        <div className="relative">
          <div className="rounded-3xl bg-gradient-to-br from-violet-700 to-purple-600 p-6 md:p-8 text-white shadow-2xl shadow-violet-200 overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <p className="text-xs font-bold uppercase tracking-widest text-violet-200 mb-2">
              Featured Course
            </p>
            <h3 className="text-2xl md:text-3xl font-black mb-2">Aptitude Foundation</h3>
            <p className="text-violet-100 text-sm mb-5">
              SSC / Railway / Banking — Quantitative Aptitude ki mazboot neev
            </p>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-emerald-400 text-emerald-950 text-xs font-black px-3 py-1.5 rounded-full">
                100% FREE
              </span>
              <span className="text-violet-100 text-xs">Enroll anytime</span>
            </div>
            <Link
              href="/courses/aptitude-foundation-free"
              className="inline-block bg-white text-violet-800 font-extrabold text-sm px-6 py-3 rounded-xl hover:bg-violet-50 transition"
            >
              View Course →
            </Link>
          </div>

          {/* floating mini-cards */}
          <div className="absolute -bottom-4 -left-2 md:-left-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-black">
              ?
            </span>
            <div>
              <p className="text-xs font-bold text-gray-900">Doubt Support</p>
              <p className="text-[11px] text-gray-500">Enrolled students ke liye</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
