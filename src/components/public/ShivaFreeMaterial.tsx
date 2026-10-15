'use client';

import { useState } from 'react';
import Reveal from './Reveal';

const CARDS = [
  { ico: '📄', t: 'Previous Year Papers', d: 'SSC, Railway, Banking ke pichhle 10 saal ke papers with solutions.', note: '📥 Free PDFs jald aa rahe hain!', cta: 'Download Free' },
  { ico: '📓', t: 'Handwritten Notes', d: 'Expert faculty ke notes — Maths, Reasoning, GK sab subjects.', note: '📥 Free PDFs jald aa rahe hain!', cta: 'Download Free' },
  { ico: '📰', t: 'Daily Current Affairs', d: 'Roz subah 7 baje — exam-oriented current affairs quiz.', note: '📥 Jald aa raha hai!', cta: 'Read Free' },
  { ico: '🧪', t: 'Free Mock Tests', d: 'Har exam ka 1 free full mock test with All-India rank.', note: '', cta: 'Attempt Free', href: '/login' },
];

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
                  <a className="btn btn-ghost" href={c.href}>
                    {c.cta}
                  </a>
                ) : (
                  <>
                    {!shown[i] && (
                      <button
                        className="btn btn-ghost"
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
