'use client';

import { useState } from 'react';
import Reveal from './Reveal';

const FAQS = [
  {
    q: 'THE SHIVA par kaun-kaun se exams ki taiyaari hoti hai?',
    a: 'SSC (CGL/CHSL/MTS/GD), Railway (RRB NTPC/Group D), Banking (IBPS/SBI), Defence (Agniveer/NDA/CDS) aur Teaching (CTET/UPTET/STET) — sabhi major government exams.',
  },
  {
    q: 'Fees kitni hai?',
    a: 'Har course ki asal fees uske course page par dikhti hai — Aptitude Foundation course bilkul free hai. Payment ke available options checkout par dikhte hain, aur scholarship test se selected courses par fee discount mil sakta hai.',
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
    a: 'Enrolled students app me apna doubt bhej sakte hain aur live class me teacher se seedha poochh sakte hain. Doubt support ka exact samay batch ke hisaab se hota hai.',
  },
  {
    q: 'Kya mobile app hai?',
    a: 'Haan, THE SHIVA ka Android app hai — courses, tests aur apni progress ek hi jagah. App na ho to website par bhi courses explore karke register kar sakte ho.',
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
                <button
                  className="faq-q"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`shiva-faq-a-${i}`}
                >
                  {f.q}
                </button>
                <div
                  className="faq-a"
                  id={`shiva-faq-a-${i}`}
                  style={open === i ? { maxHeight: 300 } : undefined}
                >
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
