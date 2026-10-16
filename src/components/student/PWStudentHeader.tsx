'use client';

import { useState } from 'react';
import Link from 'next/link';
import PWStudentMenu from './PWStudentMenu';

interface PWStudentHeaderProps {
  userName: string;
  userEmail: string;
  goal?: string;
}

export default function PWStudentHeader({ userName, userEmail, goal = 'SSC CGL' }: PWStudentHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initial = (userName || userEmail || 'S').charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1a1a2e] text-white">
        <div className="flex items-center gap-3 px-4 py-3 max-w-[1200px] mx-auto">
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="p-1 -ml-1 hover:bg-white/10 rounded-lg transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Goal selector pill */}
          <Link
            href="/app/goals"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 text-sm font-medium transition"
          >
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
              🎯
            </span>
            <span className="max-w-[120px] truncate">{goal}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>

          <div className="flex-1" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1 hover:bg-white/10 rounded-full p-0.5 transition"
              aria-label="Profile menu"
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-sm">
                {initial}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden sm:block">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-12 z-50 bg-white text-gray-800 rounded-2xl shadow-2xl w-56 overflow-hidden">
                  <Link href="/app/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <span className="text-sm font-medium">My Profile</span>
                  </Link>
                  <Link href="/app/my-courses" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    <span className="text-sm font-medium">My Purchases</span>
                  </Link>
                  <div className="border-t border-gray-100" />
                  <form action="/api/public/auth/logout" method="POST">
                    <button type="submit" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition w-full text-left">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sub-header: Batches + search + wallet */}
        <div className="bg-white text-gray-900 border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2.5 max-w-[1200px] mx-auto">
            <h1 className="text-[15px] font-semibold">Batches</h1>
            <div className="flex-1" />
            <Link href="/app/search" aria-label="Search" className="p-1.5 hover:bg-gray-100 rounded-full transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>
            <Link href="/app/wallet" className="flex items-center gap-1.5 border border-amber-300 bg-amber-50 rounded-full px-3 py-1.5 text-sm font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-xs">₹</span>
              <span>0</span>
            </Link>
          </div>
        </div>
      </header>

      <PWStudentMenu open={menuOpen} onClose={() => setMenuOpen(false)} userName={userName} />
    </>
  );
}
