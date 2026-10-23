'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';

/**
 * ListingInfo — listing pages (/courses, /batches) ke neeche ka
 * shared 'Why THE SHIVA?' + FAQ block.
 *
 * Imaandaari ke niyam:
 *  - Fayde sirf asal platform features par hain — koi sankhya,
 *    selection-rate ya dusra apramanit daava nahi.
 *  - FAQ ke jawab asal behaviour par hain aur jahan route maujood
 *    hai wahan asal link hai (/register, /app/live, /app/tests,
 *    /terms, /contact).
 *
 * Accordion pattern ShivaFaq.tsx wala hi hai — wahi CSS classes
 * (.faq / .faq-item / .faq-q / .faq-a, shiva-landing.css) taaki
 * poori site par FAQ ek jaisa dikhe aur behave kare.
 */

const WHY_POINTS: Array<{ icon: string; title: string; desc: string; bg: string }> = [
  {
    icon: '🎯',
    title: 'Free course se shuruaat',
    desc: 'Aptitude Foundation course bilkul free hai — bina fee diye pehle seekhna shuru karo, phir aage ka faisla khud lo.',
    bg: '#dcfce7',
  },
  {
    icon: '📺',
    title: 'Live + recorded classes',
    desc: 'Live class me teacher se seedha seekho; class ki recording baad me revision ke liye bhi milti hai.',
    bg: '#ede9fe',
  },
  {
    icon: '📝',
    title: 'Mock tests aur detailed analysis',
    desc: 'Timer ke saath asal-pattern tests do aur detailed analysis se apni kamzor jagah pehchankar usi par kaam karo.',
    bg: '#e0f2fe',
  },
  {
    icon: '💬',
    title: 'Doubt support',
    desc: 'Padhai me atko to doubt poochho — live class me aur apne dashboard se doubt support milta hai.',
    bg: '#fef3c7',
  },
  {
    icon: '📚',
    title: 'Notes, PYQ aur Library — free material',
    desc: 'Notes, pichhle saalo ke papers (PYQ) aur Library ka free study material ek hi jagah milta hai.',
    bg: '#fce7f3',
  },
  {
    icon: '🗣️',
    title: 'Hindi-Hinglish medium',
    desc: 'Concepts aasan Hindi-Hinglish me samjhaye jate hain, taaki bhasha padhai ke beech kabhi rukawat na bane.',
    bg: '#ffedd5',
  },
];

const linkClass = 'font-bold text-[#6d28d9] underline underline-offset-2 hover:text-[#4c1d95]';

const FAQS: Array<{ q: string; a: ReactNode }> = [
  {
    q: 'THE SHIVA par shuruaat kaise karun?',
    a: (
      <>
        Sabse pehle{' '}
        <Link href="/register" className={linkClass}>
          free register
        </Link>{' '}
        karo, phir apne exam ke hisaab se course chuno — uske baad apne dashboard se
        classes, tests aur material ke saath seekhna shuru karo.
      </>
    ),
  },
  {
    q: 'Kya free course asal me bilkul free hai?',
    a: (
      <>
        Haan —{' '}
        <Link href="/courses/aptitude-foundation-free" className={linkClass}>
          Aptitude Foundation
        </Link>{' '}
        course bilkul free hai. Poora access milta hai, iske liye koi fee nahi leni
        padti.
      </>
    ),
  },
  {
    q: 'Live class kaise join karun?',
    a: (
      <>
        Login karne ke baad apne dashboard ke{' '}
        <Link href="/app/live" className={linkClass}>
          Live section
        </Link>{' '}
        me apne batch ki live class dikhti hai — class ke samay par wahi se join kar
        sakte ho.
      </>
    ),
  },
  {
    q: 'Test series kaise milegi?',
    a: (
      <>
        Public{' '}
        <Link href="/test-series" className={linkClass}>
          Test Series page
        </Link>{' '}
        par tests dekh sakte ho; test dene ke liye pehle register/login karo, phir{' '}
        <Link href="/app/tests" className={linkClass}>
          Tests section
        </Link>{' '}
        se apna test shuru karo.
      </>
    ),
  },
  {
    q: 'Payment ya refund ko lekar sawaal ho to kya karun?',
    a: (
      <>
        Payment aur refund ke niyam hamare{' '}
        <Link href="/terms" className={linkClass}>
          Terms page
        </Link>{' '}
        par diye gaye hain — koi bhi faisla lene se pehle unhe dhyaan se padh lo.
      </>
    ),
  },
  {
    q: 'Kuchh galat lage ya madad chahiye to kisse kahun?',
    a: (
      <>
        Hamare{' '}
        <Link href="/contact" className={linkClass}>
          Contact page
        </Link>{' '}
        se team ko message bhejo — course, batch ya account se juda koi bhi sawaal ho,
        wahi se madad milegi.
      </>
    ),
  },
];

export default function ListingInfo() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div
      style={{
        marginTop: 56,
        // Halka panel — /courses (light bg) aur /batches (dark bg) dono par
        // headings/cards ki contrast pakki rahe, isliye poora block ek
        // safed-hale panel ke andar hai.
        background: 'linear-gradient(180deg,#f5f3ff 0%,#ffffff 100%)',
        border: '1px solid #ede9fe',
        borderRadius: 24,
        padding: '32px 28px',
      }}
    >
      {/* ── Why THE SHIVA? — safed rounded-2xl cards, purple headings ── */}
      <div className="sec-head" style={{ textAlign: 'left', marginBottom: 24 }}>
        <span className="kicker">Why THE SHIVA?</span>
        <h2
          style={{
            fontSize: 'clamp(26px, 3.4vw, 34px)',
            fontWeight: 900,
            lineHeight: 1.2,
            color: '#2a1650',
            margin: '10px 0 0',
          }}
        >
          THE SHIVA hi <span style={{ color: '#6d28d9' }}>kyun?</span>
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          gap: 14,
          marginBottom: 48,
        }}
      >
        {WHY_POINTS.map((w) => (
          <div
            key={w.title}
            className="rounded-2xl border border-[#ede9fe] bg-white p-6 shadow-[0_4px_16px_rgba(42,22,80,0.06)]"
          >
            <span
              aria-hidden="true"
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: w.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                marginBottom: 12,
              }}
            >
              {w.icon}
            </span>
            <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#6d28d9', marginBottom: 6 }}>
              {w.title}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#6b7280', margin: 0 }}>{w.desc}</p>
          </div>
        ))}
      </div>

      {/* ── FAQ — ShivaFaq wala accordion pattern ── */}
      <div className="sec-head" style={{ marginBottom: 24 }}>
        <span className="kicker">FAQ</span>
        <h2
          style={{
            fontSize: 'clamp(26px, 3.4vw, 34px)',
            fontWeight: 900,
            lineHeight: 1.2,
            color: '#2a1650',
            margin: '10px 0 0',
          }}
        >
          Aksar Poochhe Jaane Wale Sawaal
        </h2>
      </div>
      <div className="faq">
        {FAQS.map((f, i) => (
          <div key={f.q} className={`faq-item${open === i ? ' open' : ''}`}>
            <button
              className="faq-q"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`listing-faq-a-${i}`}
            >
              {f.q}
            </button>
            <div
              className="faq-a"
              id={`listing-faq-a-${i}`}
              style={open === i ? { maxHeight: 300 } : undefined}
            >
              <div>{f.a}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
