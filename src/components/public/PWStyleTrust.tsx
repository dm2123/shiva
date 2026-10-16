'use client';

import Link from 'next/link';

export default function PWStyleTrust() {
  return (
    <section className="py-10 px-4 text-center bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
          Bharat ka Trusted <span className="text-purple-700">Learning Platform</span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base mb-6 max-w-2xl mx-auto">
          Lakho students ka bharosa — affordable fees, quality content, aur dedicated support ke saath.
        </p>
        <Link
          href="/register"
          className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-bold text-base px-8 py-4 rounded-xl w-full md:w-auto transition"
        >
          Get Started — It's Free
        </Link>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg mt-8 grid grid-cols-2 gap-0 overflow-hidden">
          <div className="p-6 text-center border-r border-b border-gray-100">
            <div className="text-3xl mb-2">🎯</div>
            <b className="block text-base">100% Free</b>
            <span className="text-xs text-gray-500">Starter Courses</span>
          </div>
          <div className="p-6 text-center border-b border-gray-100">
            <div className="text-3xl mb-2">📚</div>
            <b className="block text-base">5 Exams</b>
            <span className="text-xs text-gray-500">Categories Covered</span>
          </div>
          <div className="p-6 text-center border-r border-gray-100">
            <div className="text-3xl mb-2">🌐</div>
            <b className="block text-base">Hindi + English</b>
            <span className="text-xs text-gray-500">Bilingual Content</span>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">📱</div>
            <b className="block text-base">Mobile App</b>
            <span className="text-xs text-gray-500">Coming Soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}
