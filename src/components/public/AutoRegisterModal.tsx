'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BENEFITS = [
  'Structured courses aur batches',
  'Live classes, tests aur practice',
  'Doubts aur progress — ek hi jagah',
];

export default function AutoRegisterModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or logged in
    const dismissed = sessionStorage.getItem('shiva_auto_reg_dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 20000); // 20 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('shiva_auto_reg_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a1650]/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-[#ede9fe] dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Brand header */}
        <div className="bg-gradient-to-r from-[#2a1650] to-[#6d28d9] px-6 md:px-8 py-5 text-white">
          <p className="text-[11px] font-extrabold tracking-[0.18em] text-[#f5b942] uppercase">THE SHIVA</p>
          <h3 className="text-xl font-extrabold mt-1">Apni padhai ek jagah lao</h3>
          <p className="text-xs text-violet-200 mt-1">Learn • Practice • Grow</p>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white text-sm font-bold w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="p-6 md:p-8 pt-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Free student account banao aur apne courses, live classes aur tests ek hi dashboard se use karo.
          </p>

          <ul className="mt-4 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5b942]/20 text-[11px] font-black text-[#b45309]">
                  ✓
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="pt-5 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={handleDismiss}
              className="w-full py-3 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-xl text-sm font-bold transition-all text-center shadow-lg shadow-violet-600/30"
            >
              Free Register Karo →
            </Link>
            <Link
              href="/login"
              onClick={handleDismiss}
              className="w-full py-2.5 text-sm text-[#6d28d9] hover:text-[#2a1650] dark:text-violet-300 font-bold text-center"
            >
              Pehle se account hai? Login karo
            </Link>
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
