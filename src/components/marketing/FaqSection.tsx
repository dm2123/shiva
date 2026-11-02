'use client';

import { useState } from 'react';
import Link from 'next/link';
import SectionHead from './SectionHead';

/**
 * FaqSection — index.html ke FAQ ka JSX roop: safed accordion
 * rows, ek samay me ek khula (HTML ke toggleFaq jaisa vyavhaar).
 * Sawal/jawab HTML wale hi asal hain.
 */

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'THE SHIVA par kaun se exams ki taiyaari hoti hai?',
    a: 'SSC (CGL, CHSL, MTS), Railway (NTPC, Group D, ALP), Banking (PO, Clerk), Defence aur Teaching exams ke liye courses aur batches bante hain. Live course abhi Aptitude Foundation hai, jo sabhi exams ke kaam aata hai.',
  },
  {
    q: 'Kya sach me koi course free hai?',
    a: 'Haan — Aptitude Foundation course 100% free hai. Login karke seedha enroll karo, koi hidden charge nahi hai.',
  },
  {
    q: 'Padhai kaise shuru karun?',
    a: 'Upar diye Free Course button se course page par jao, account banao (Login / Register) aur pehla lecture aaj hi dekho. Confusion ho to counsellor se free me baat karo.',
  },
  {
    q: 'Naye batches kab launch honge?',
    a: 'SSC Ranker Batch jald launch ho raha hai. Batches page par "Notify Me" dabao — launch ki khabar sabse pehle milegi.',
  },
  {
    q: 'Scholarship bhi milti hai kya?',
    a: (
      <>
        Scholarship program abhi design ho raha hai. Tab tak free course hi sabse badi madad hai —
        details ke liye{' '}
        <Link href="/scholarship" className="font-bold text-[#6d28d9]">
          Scholarship page
        </Link>{' '}
        dekho.
      </>
    ),
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="border-t border-[#f3f0ff] bg-white py-[60px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <SectionHead kick="FAQ" title="Aksar Poochhe Jane Wale Sawal" />
        <div className="mx-auto max-w-[780px]">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="mb-[9px] overflow-hidden rounded-[14px] border-2 border-[#ede9fe] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-[52px] w-full items-center justify-between gap-[10px] px-[18px] py-[13px] text-left text-[15px] font-bold text-[#1e1b2e]"
                >
                  {f.q}
                  <span aria-hidden="true" className="shrink-0 text-[24px] font-extrabold leading-none text-[#6d28d9]">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="px-[18px] pb-[13px] text-[14.5px] leading-relaxed text-[#6b7280]">
                      {f.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
