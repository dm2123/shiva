'use client';

import { useState } from 'react';
import Reveal from './Reveal';

const CARDS = [
  { ico: '📄', t: 'Previous Year Papers', d: 'SSC, Railway aur Banking ke previous year papers — asli exam pattern samajhne ke liye.', note: '📥 Free PDFs jald aa rahe hain!', cta: 'Download Free' },
  { ico: '📓', t: 'Handwritten Notes', d: 'Faculty ke taiyaar notes — Maths, Reasoning, GK sab subjects.', note: '📥 Free PDFs jald aa rahe hain!', cta: 'Download Free' },
  { ico: '📰', t: 'Daily Current Affairs', d: 'Exam-oriented current affairs — roz ki taiyaari ke liye chhoti, kaam ki updates.', note: '📥 Jald aa raha hai!', cta: 'Read Free' },
  { ico: '🧪', t: 'Free Mock Tests', d: 'Register karke free mock test do aur apni taiyaari khud aanko.', note: '', cta: 'Attempt Free', href: '/login' },
];

// .btn-ghost in shiva-landing.css is styled for dark backgrounds (white text),
// so on these white cards it needs an explicit dark variant.
const GHOST_ON_LIGHT = { color: '#4c1d95', borderColor: '#6d28d9' } as const;

export default function ShivaFreeMaterial() {
  const [shown, setShown] = useState<boolean[]>(CARDS.map(() => false));

  return (
    <section id="material" style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">100% Free</span>
          <h2>Free Study Material</h2>
          <p>Bina ek rupaya kharch kiye padhai shuru karo — notes, papers aur quizzes free me.</p>
        </Reveal>
        <div className="grid4">
          {CARDS.map((c, i) => (
            <Reveal key={c.t} delay={i % 4}>
              <div className="mat-card">
                <div className="ico">{c.ico}</div>
                <b>{c.t}</b>
                <p>{c.d}</p>
                {c.href ? (
                  <a className="btn btn-ghost" style={GHOST_ON_LIGHT} href={c.href}>
                    {c.cta}
                  </a>
                ) : (
                  <>
                    {!shown[i] && (
                      <button
                        className="btn btn-ghost"
                        style={GHOST_ON_LIGHT}
                        onClick={() => setShown((s) => s.map((v, j) => (j === i ? true : v)))}
                      >
                        {c.cta}
                      </button>
                    )}
                    <span className={`mat-note${shown[i] ? ' show' : ''}`}>{c.note}</span>
                  </>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
