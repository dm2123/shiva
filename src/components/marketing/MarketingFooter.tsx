'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { openCallbackModal } from '@/components/public/ShivaScholarship';

/**
 * MarketingFooter — index.html ke <footer class="ft5"> ka JSX roop.
 * PW-style SAFED footer: brand row (logo + desc + socials + help) ·
 * 5 link columns · bottom bar. Saare links asal app routes par hain;
 * jo route maujood nahi uska link nahi banaya.
 *
 * Social buttons asal profiles se jude NAHI hain (HTML wali hi
 * imaandaari): click par note dikhta hai, koi nakli link nahi.
 */

const SOCIALS: { label: string; path: React.ReactNode }[] = [
  {
    label: 'Facebook',
    path: <path d="M14 8.2V6.8c0-.8.5-1 .9-1H17V2.5h-2.9C11.2 2.5 10 4.4 10 6.5v1.7H7.5V12H10v9.5h4V12h2.7l.4-3.8z" />,
  },
  {
    label: 'Instagram',
    path: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="17.2" cy="6.8" r="1.1" />
      </>
    ),
  },
  {
    label: 'X',
    path: <path d="M4 3.5h3.4l4.3 5.9 5-5.9h3.8l-6.9 8.1 7.2 8.9h-3.4l-4.7-6.4-5.5 6.4H3.4l7.4-8.6z" />,
  },
  {
    label: 'YouTube',
    path: <path d="M21 8.2c-.2-1.4-1-2.2-2.4-2.4C16.5 5.5 12 5.5 12 5.5s-4.5 0-6.6.3C4 6 3.2 6.8 3 8.2 2.7 10.3 2.7 13.8 3 15.8c.2 1.4 1 2.2 2.4 2.4 2.1.3 6.6.3 6.6.3s4.5 0 6.6-.3c1.4-.2 2.2-1 2.4-2.4.3-2 .3-5.5 0-7.6zM10 15.3V8.7l5.2 3.3z" />,
  },
];

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Our Faculty', href: '/teachers' },
      { label: 'Student Login', href: '/login' },
    ],
  },
  {
    heading: 'Popular Exams',
    links: [
      { label: 'SSC Exams', href: '/courses' },
      { label: 'Railway Exams', href: '/courses' },
      { label: 'Banking Exams', href: '/courses' },
      { label: 'Defence Exams', href: '/courses' },
      { label: 'Teaching Exams', href: '/courses' },
      { label: 'State Exams', href: '/courses' },
    ],
  },
  {
    heading: 'Products',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'Batches', href: '/batches' },
      { label: 'Test Series', href: '/test-series' },
      { label: 'Free Aptitude Course', href: '/courses/aptitude-foundation-free' },
    ],
  },
  {
    heading: 'Free Resources',
    links: [
      { label: 'Free Course', href: '/courses/aptitude-foundation-free' },
      { label: 'Study Resources', href: '/#resources' },
      { label: 'Results', href: '/results' },
      { label: 'Scholarship', href: '/scholarship' },
      { label: 'Saare Courses', href: '/courses' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact', href: '/contact' },
      { label: 'Register', href: '/register' },
    ],
  },
];

export default function MarketingFooter() {
  const [socialNote, setSocialNote] = useState(false);

  return (
    <footer className="mkt-footer bg-white pb-[26px] pt-[50px] text-[#4b5563]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        {/* Brand row */}
        <div className="mb-6 flex flex-wrap justify-between gap-7 border-b border-[#f0eefc] pb-6">
          <div>
            <Image
              src="/assets/logo.jpeg"
              alt="THE SHIVA — Learning Platform"
              width={88}
              height={88}
              className="block h-[88px] w-[88px] rounded-2xl border border-[#f0eefc] object-cover"
            />
            <p className="mt-3 max-w-[400px] text-[13.5px] leading-[1.65] text-[#6b7280]">
              Dream • Prepare • Achieve
              <br />
              Bharat ka affordable learning platform — SSC, Railway, Banking, Defence, Teaching aur
              State exams ke liye.
            </p>
            <div className="mt-4 flex gap-[10px]">
              {SOCIALS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  aria-label={s.label}
                  onClick={() => setSocialNote(true)}
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-[1.5px] border-[#ede9fe] bg-[#faf9ff] text-[#6d28d9] transition hover:-translate-y-[2px] hover:border-[#6d28d9] hover:bg-[#f5f3ff]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
                    {s.path}
                  </svg>
                </button>
              ))}
            </div>
            {socialNote ? (
              <p className="mt-[10px] text-[12.5px] font-semibold text-[#6b7280]">
                Social pages jald launch honge — tab tak{' '}
                <Link href="/courses/aptitude-foundation-free" className="font-bold text-[#6d28d9]">
                  free Aptitude course
                </Link>{' '}
                se jud jao!
              </p>
            ) : (
              <p className="mt-[10px] text-xs text-[#9ca3af]">
                Social pages jald launch honge — koi nakli link nahi.
              </p>
            )}
          </div>
          <div className="text-sm text-[#374151]">
            <b className="mb-[6px] block text-[15px] text-[#2a1650]">Sawaal hai?</b>
            <Link href="/contact" className="font-bold text-[#6d28d9]">
              Contact page par message bhejo →
            </Link>
            <br />
            <button
              type="button"
              onClick={openCallbackModal}
              className="mt-[10px] inline-block rounded-full border-none bg-[#ede9fe] px-4 py-[9px] text-[13.5px] font-bold text-[#4c1d95]"
            >
              Talk to a Counsellor
            </button>
          </div>
        </div>

        {/* Link columns */}
        <div className="mb-6 grid grid-cols-2 gap-[26px] lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3 text-[14.5px] font-bold text-[#2a1650]">{col.heading}</h4>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="block py-1 text-[13.5px] text-[#4b5563] transition hover:translate-x-[3px] hover:text-[#6d28d9]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap justify-between gap-2 border-t border-[#f0eefc] pt-4 text-[12.5px] text-[#9ca3af]">
          <span>© 2026 THE SHIVA. All rights reserved.</span>
          <span>Dream • Prepare • Achieve</span>
        </div>
      </div>
    </footer>
  );
}
