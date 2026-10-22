'use client';

import { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  {
    tag: '🎯 100% FREE COURSE',
    tagBg: '#f59e0b',
    tagColor: '#1e1b2e',
    title: 'Aptitude Foundation',
    hl: 'Free me Shuru Karo!',
    desc: 'Number System, Percentage, Time-Speed-Distance, Time-Work — SSC, Railway, Banking ke liye complete free course.',
    cta: 'Enroll Now →',
    ctaHref: '/courses/aptitude-foundation-free',
    ctaClass: 'btn btn-accent',
    ctaStyle: undefined as React.CSSProperties | undefined,
    bg: 'linear-gradient(120deg,#0d3b2e,#059669)',
    emoji: '📊',
  },
  {
    tag: '🚀 COMING SOON',
    tagBg: 'rgba(255,255,255,.2)',
    tagColor: '#fff',
    title: 'SSC • Railway • Banking',
    hl: 'Batches Jald Aa Rahe!',
    desc: 'Live classes, mock tests, doubt solving — sab kuch ek hi batch me. Notify pane ke liye jude raho.',
    cta: 'Explore Courses →',
    ctaHref: '/courses',
    ctaClass: 'btn btn-accent',
    ctaStyle: undefined as React.CSSProperties | undefined,
    bg: 'linear-gradient(120deg,#2e1065,#6d28d9)',
    emoji: '📚',
  },
  {
    tag: '🎁 SCHOLARSHIP TEST',
    tagBg: '#fff',
    tagColor: '#7c2d12',
    title: 'Apni Talent Par',
    hl: 'Fee Discount Pao!',
    desc: 'Scholarship test do aur selected courses par fee discount pao. Tumhari mehnat, hamara saath.',
    cta: 'Learn More →',
    ctaHref: '/#scholarship',
    ctaStyle: { background: '#fff', color: '#7c2d12' } as React.CSSProperties,
    bg: 'linear-gradient(120deg,#7c2d12,#d97706)',
    emoji: '🎓',
  },
];

export default function ShivaPromoCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = SLIDES.length;

  const go = useCallback(
    (i: number) => setIdx(((i % total) + total) % total),
    [total]
  );

  useEffect(() => {
    // Autoplay band rakho jab user hover/focus kare ya reduced-motion pasand ho
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => go(idx + 1), 5000);
    return () => clearInterval(t);
  }, [idx, go, paused]);

  return (
    <>
      <div
        className="promo-carousel"
        aria-label="Promotions"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className="promo-track"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {SLIDES.map((s) => (
            <div className="promo-slide" key={s.title} style={{ background: s.bg }}>
              <div className="promo-slide-inner">
                <div>
                  <span
                    className="promo-tag"
                    style={{ background: s.tagBg, color: s.tagColor }}
                  >
                    {s.tag}
                  </span>
                  <h2>
                    {s.title}
                    <br />
                    <span className="hl">{s.hl}</span>
                  </h2>
                  <p>{s.desc}</p>
                  <a
                    href={s.ctaHref}
                    className={s.ctaClass || 'btn'}
                    style={s.ctaStyle}
                  >
                    {s.cta}
                  </a>
                </div>
                <div className="promo-pimg">
                  <span className="emoji" aria-hidden>
                    {s.emoji}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="promo-arrow prev"
          onClick={() => go(idx - 1)}
          aria-label="Previous promotion"
        >
          ‹
        </button>
        <button
          className="promo-arrow next"
          onClick={() => go(idx + 1)}
          aria-label="Next promotion"
        >
          ›
        </button>
      </div>
      <div className="promo-dots" role="tablist" aria-label="Promotion selector">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            className={i === idx ? 'active' : ''}
            onClick={() => go(i)}
            aria-label={`Go to promotion ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}
