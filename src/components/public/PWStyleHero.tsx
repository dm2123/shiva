'use client';

import Link from 'next/link';

export default function PWStyleHero() {
  return (
    <section className="bg-gradient-to-br from-orange-50 to-amber-50 border-b-4 border-orange-400">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <span className="inline-block bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-3">
          MISSION SSC CGL 2026
        </span>
        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
          Bharat ka Affordable <span className="text-blue-800">Learning Platform</span>
        </h1>
        <ul className="space-y-1 mb-4 text-gray-700">
          <li className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-bold">✓</span> Live Classes with Expert Faculty
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-bold">✓</span> Test Series & Mock Tests
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-bold">✓</span> Doubt Solving 24x7
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-bold">✓</span> Study Material & PDFs
          </li>
        </ul>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg text-gray-400 line-through">₹999</span>
          <span className="text-2xl font-black text-blue-800">FREE</span>
        </div>
        <Link
          href="/register"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base px-8 py-3 rounded-xl transition"
        >
          Enroll Now
        </Link>
      </div>
    </section>
  );
}
