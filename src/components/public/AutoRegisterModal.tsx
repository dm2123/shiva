'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            ⚡
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Accelerate Your Learning
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Join thousands of competitive aspirants on THE SHIVA. Register now to access Daily Practice Problems, live classes, and structured courses.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={handleDismiss}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all text-center shadow-lg shadow-indigo-500/30"
            >
              Register with Mobile OTP
            </Link>
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
