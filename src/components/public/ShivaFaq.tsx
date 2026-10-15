'use client';

import { useState } from 'react';
import Reveal from './Reveal';

const FAQS = [
  {
    q: 'THE SHIVA par kaun-kaun se exams ki taiyaari hoti hai?',
    a: 'SSC (CGL/CHSL/MTS/GD), Railway (RRB NTPC/Group D), Banking (IBPS/SBI), Defence (Agniveer/NDA/CDS) aur Teaching (CTET/UPTET/STET) — sabhi major government exams.',
  },
  {
    q: 'Fees kitni hai? Kya EMI available hai?',
    a: 'Batches ki fees launch par ghoshit hogi — affordable rakhne ka wada hai. EMI available hogi, aur scholarship test me 100% tak chhoot mil sakti hai.',
  },
  {
    q: 'Kya free demo class milti hai?',
    a: 'Haan! Upar form bharo — hamari team call karke free demo book karegi. Pehli class bilkul free.',
  },
  {
    q: 'Live class miss ho jaye to kya hoga?',
    a: 'Koi tension nahi — har live class ki recording turant app me mil jati hai, download karke offline bhi dekh sakte ho.',
  },
  {
    q: 'Doubt kaise poochhen?',
    a: 'App me question ki photo kheecho — expert 24x7 me answer dete hain. Live class me turant poochh sakte ho.',
  },
  {
    q: 'Kya mobile app hai?',
    a: 'Haan! Android app jald aa raha hai — live classes, DPP, test series aur streaks sab app me. Website par bane raho.',
  },
];

export default function ShivaFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">FAQ</span>
          <h2>Aksar Poochhe Jaane Wale Sawaal</h2>
        </Reveal>
        <div className="faq">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i % 3}>
              <div className={`faq-item${open === i ? ' open' : ''}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                  {f.q}
                </button>
                <div className="faq-a" style={open === i ? { maxHeight: 300 } : undefined}>
                  <div>{f.a}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
