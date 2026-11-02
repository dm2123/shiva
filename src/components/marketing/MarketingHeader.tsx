'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * MarketingHeader — index.html ke <header> ka JSX roop.
 * Safed sticky header: logo · 'All Courses' mega-dropdown · nav ·
 * Login (ghost) + Register (violet pill). Mobile par hamburger se
 * full-screen menu. Nav links asal app routes par hain.
 *
 * Note: (public) layout ka ShivaNav abhi global shell hai — ye
 * component usi design ka standalone marketing roop hai; layout me
 * swap karne par header yahi dikhega (marketing.css me .mkt-header
 * ke shell-override rules isiliye rakhe hain).
 */

const NAV_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/batches', label: 'Batches' },
  { href: '/test-series', label: 'Test Series' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/scholarship', label: 'Scholarship' },
  { href: '/results', label: 'Results' },
];

const MEGA_CATS = [
  { name: 'SSC Exams', desc: 'CGL · CHSL · MTS · GD' },
  { name: 'Railway Exams', desc: 'NTPC · Group D · ALP' },
  { name: 'Banking Exams', desc: 'IBPS · SBI PO / Clerk' },
  { name: 'Defence Exams', desc: 'Agniveer · NDA · CDS' },
  { name: 'Teaching Exams', desc: 'CTET · UPTET · STET' },
  { name: 'State Exams', desc: 'UPSSSC · Lekhpal · Police' },
];

const MEGA_TILES = [
  'SSC CGL',
  'SSC CHSL',
  'RRB NTPC',
  'Railway Group D',
  'IBPS PO',
  'SBI Clerk',
  'Agniveer',
  'NDA',
  'CTET',
];

export default function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="mkt-header sticky top-0 z-[100] bg-white">
        <div className="mx-auto flex min-h-[68px] max-w-[1200px] items-center justify-between gap-3 px-4 py-[10px]">
          {/* Left — hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-[26px] leading-none text-[#2a1650] lg:hidden"
              aria-label="Menu kholo"
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </button>
            <Link href="/" className="flex items-center gap-[10px]" aria-label="THE SHIVA — Home">
              <Image
                src="/assets/logo.jpeg"
                alt="THE SHIVA logo"
                width={40}
                height={40}
                className="block h-10 w-10 shrink-0 rounded-[11px] object-cover shadow-[0_0_0_2px_#ede9fe]"
              />
              <span className="text-[19px] font-black text-[#2a1650]">THE SHIVA</span>
            </Link>
          </div>

          {/* Mega dropdown — All Courses (desktop) */}
          <div className="group relative hidden min-[1101px]:block">
            <button
              type="button"
              className="whitespace-nowrap rounded-full border-2 border-[#6d28d9] bg-white px-[18px] py-[9px] text-[14.5px] font-extrabold text-[#4c1d95] transition group-hover:bg-[#f5f3ff]"
              aria-haspopup="true"
            >
              All Courses <span className="ml-[2px] text-[11px]">▾</span>
            </button>
            <div className="absolute left-1/2 top-[calc(100%+12px)] z-[130] hidden w-[min(700px,94vw)] -translate-x-1/2 grid-cols-[210px_1fr] gap-[22px] rounded-[20px] border border-[#ede9fe] bg-white p-5 text-left shadow-[0_24px_60px_rgba(42,22,80,0.18)] group-hover:grid group-focus-within:grid">
              <div>
                <p className="mb-2 text-[11.5px] font-extrabold uppercase tracking-[1.2px] text-[#6b7280]">
                  Exam Categories
                </p>
                {MEGA_CATS.map((c) => (
                  <Link key={c.name} href="/courses" className="block rounded-xl px-[11px] py-[9px] hover:bg-[#f5f3ff]">
                    <span className="block text-[14.5px] font-extrabold text-[#2a1650]">{c.name}</span>
                    <span className="block text-xs text-[#6b7280]">{c.desc}</span>
                  </Link>
                ))}
              </div>
              <div>
                <p className="mb-2 text-[11.5px] font-extrabold uppercase tracking-[1.2px] text-[#6b7280]">
                  Popular Exams
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {MEGA_TILES.map((t) => (
                    <Link
                      key={t}
                      href="/courses"
                      className="rounded-[14px] border-[1.5px] border-[#f0eefc] px-[10px] py-[10px] text-[13px] font-bold text-[#1e1b2e] hover:border-[#6d28d9] hover:bg-[#faf9ff]"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
                <div className="mt-[14px] flex flex-wrap gap-4 border-t border-[#f3f0ff] pt-3">
                  <Link href="/batches" className="text-[13px] font-extrabold text-[#6d28d9]">
                    All Batches →
                  </Link>
                  <Link href="/teachers" className="text-[13px] font-extrabold text-[#6d28d9]">
                    Our Faculty →
                  </Link>
                  <Link href="/courses" className="text-[13px] font-extrabold text-[#6d28d9]">
                    View All Courses →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Nav links (desktop) */}
          <nav className="hidden items-center gap-6 text-[15px] font-semibold lg:flex" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="group py-[6px]">
                <span className="border-b-2 border-transparent pb-[2px] text-[#374151] transition group-hover:border-[#f5b942] group-hover:text-[#6d28d9]">
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-[14px] py-[11px] text-[15px] font-bold transition hover:bg-[#f5f3ff]"
            >
              <span className="text-[#4c1d95]">Login</span>
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-full bg-[#6d28d9] px-5 py-[11px] text-[15px] font-bold shadow-[0_6px_18px_rgba(109,40,217,0.28)] transition hover:-translate-y-px hover:bg-[#4c1d95]"
            >
              <span className="text-white">Register</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] overflow-auto bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[20px] font-black text-[#2a1650]">
              <Image src="/assets/logo.jpeg" alt="" width={32} height={32} className="h-8 w-8 rounded-[9px] object-cover" />
              THE SHIVA
            </span>
            <button
              type="button"
              aria-label="Menu band karo"
              className="text-[24px] leading-none text-[#1e1b2e]"
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <Link href="/" onClick={() => setMenuOpen(false)} className="block border-b border-[#f0f0f0] py-[14px] text-[17px] font-semibold text-[#1e1b2e]">
            Home
          </Link>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-[#f0f0f0] py-[14px] text-[17px] font-semibold text-[#1e1b2e]"
            >
              {l.label}
            </Link>
          ))}
          <p className="mb-1 mt-[18px] text-xs font-extrabold uppercase tracking-[1.2px] text-[#6b7280]">
            Exam Categories
          </p>
          {MEGA_CATS.map((c) => (
            <Link
              key={c.name}
              href="/courses"
              onClick={() => setMenuOpen(false)}
              className="block border-b border-[#f0f0f0] py-[14px] text-[17px] font-semibold text-[#1e1b2e]"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="block border-b border-[#f0f0f0] py-[14px] text-[17px] font-semibold text-[#1e1b2e]">
            Contact
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-6 block rounded-xl bg-[#2a1650] py-4 text-center text-[15px] font-bold"
          >
            <span className="text-white">Login</span>
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="mt-[10px] block rounded-xl bg-[#6d28d9] py-4 text-center text-[15px] font-bold"
          >
            <span className="text-white">Register — Join Free</span>
          </Link>
        </div>
      )}
    </>
  );
}
