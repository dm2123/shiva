'use client';

import { useState } from 'react';
import Link from 'next/link';
import { openCallbackModal } from '@/components/public/ShivaScholarship';

/**
 * AppBand — index.html ke App CTA + Counsellor strip ka JSX roop.
 * App abhi launch nahi hua — store badges HTML ki tarah hi
 * "Jald Aa Raha Hai" hain, click par imaandaar note dikhta hai
 * (koi nakli store link nahi). Counsellor button asal callback
 * modal (openCallbackModal) kholta hai.
 * Note: HTML wala phone mockup (images/app-phone.png) Next ke
 * public/ assets me maujood nahi, isliye band ek column me hai.
 */
export default function AppBand() {
  const [appNote, setAppNote] = useState(false);

  return (
    <div className="py-[60px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        {/* App CTA */}
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#2a1650,#4c1d95)] p-[38px] px-[26px] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(245,185,66,0.20)_1.6px,transparent_1.8px)] [background-size:24px_24px]"
          />
          <div className="relative z-[2] mx-auto max-w-[640px] text-center">
            <h2 className="mb-[10px] text-[26px] font-extrabold">THE SHIVA App — Jald Aa Raha Hai!</h2>
            <ul className="mb-[18px] inline-block list-none text-left">
              {['Video lectures kabhi bhi, kahin bhi', 'Apni progress track karo', 'Practice questions on the go'].map(
                (li) => (
                  <li key={li} className="py-1 text-[14.5px]">
                    <span className="font-black text-[#f5b942]">✓ </span>
                    {li}
                  </li>
                ),
              )}
            </ul>
            <div className="flex flex-wrap justify-center gap-[10px]">
              <button
                type="button"
                onClick={() => setAppNote(true)}
                className="rounded-xl border-[1.5px] border-[#111827] bg-[#111827] px-[18px] py-[10px] text-[13.5px] font-bold text-white"
              >
                Google Play · Jald Aa Raha Hai
              </button>
              <button
                type="button"
                onClick={() => setAppNote(true)}
                className="rounded-xl border-[1.5px] border-[#111827] bg-[#111827] px-[18px] py-[10px] text-[13.5px] font-bold text-white"
              >
                App Store · Jald Aa Raha Hai
              </button>
            </div>
            {appNote && (
              <p className="mt-[10px] text-[12.5px] font-semibold text-[#f5b942]">
                📱 App jald launch ho raha hai — tab tak website par{' '}
                <Link href="/courses/aptitude-foundation-free" className="font-bold text-[#f5b942] underline">
                  free Aptitude course
                </Link>{' '}
                se padho!
              </p>
            )}
            <p className="mt-3 text-[13px] opacity-85">
              Tab tak website par hi saari padhai available hai.
            </p>
          </div>
        </div>

        {/* Counsellor strip */}
        <div className="mt-2 rounded-[20px] bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] px-[22px] py-[30px] text-center text-white">
          <span className="mb-[10px] inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/[0.16] text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-[26px] w-[26px]"
            >
              <path d="M4 13a8 8 0 0 1 16 0" />
              <rect x="2.8" y="13" width="4.2" height="6.5" rx="2" />
              <rect x="17" y="13" width="4.2" height="6.5" rx="2" />
              <path d="M19.5 19.5c0 1.7-1.6 2.5-4 2.5h-2" />
            </svg>
          </span>
          <h2 className="mb-[6px] text-[21px] font-extrabold">Abhi bhi confused ho?</h2>
          <p className="mx-auto mb-4 max-w-[640px] text-[14.5px] leading-relaxed opacity-[0.93]">
            Hamare counsellor se FREE me baat karo — sahi exam, sahi batch, sahi plan — ya{' '}
            <Link href="/contact" className="font-bold text-white underline">
              Contact page
            </Link>{' '}
            par message bhejo.
          </p>
          <div className="flex flex-wrap justify-center gap-[10px]">
            <button
              type="button"
              onClick={openCallbackModal}
              className="rounded-full border-none bg-white px-[22px] py-3 text-[15px] font-bold text-[#6d28d9]"
            >
              Counsellor se baat karo
            </button>
            <Link
              href="/courses/aptitude-foundation-free"
              className="rounded-full border-[1.5px] border-white/60 bg-white/[0.16] px-[22px] py-[11px] text-[15px] font-bold"
            >
              <span className="text-white">Free Course</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
