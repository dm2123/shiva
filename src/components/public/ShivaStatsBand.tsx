'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/* ShivaStatsBand — bharosa/stats band (pw-pattern: categories ke     */
/* baad bada band, animated counters + Get Started CTA).              */
/* IMAANDAARI: sirf chhoti ASAL sankhyaen jo platform par sach hain — */
/* koi lakh-crore students wala nakli counter nahi.                   */
/* ------------------------------------------------------------------ */

type Stat = {
  target: number | null; // null = static display (24×7)
  display: string;
  suffix: string;
  label: string;
};

const STATS: Stat[] = [
  { target: 6, display: '6', suffix: '', label: 'Exam Categories' },
  { target: 100, display: '100', suffix: '%', label: 'Free Starter Course' },
  { target: 8, display: '8', suffix: '', label: 'Weeks Foundation Course' },
  { target: null, display: '24×7', suffix: '', label: 'Learn Anytime' },
];

function Counter({ stat, start }: { stat: Stat; start: boolean }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!start || stat.target === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(stat.target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setVal(Math.round(stat.target! * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, stat.target]);

  return (
    <b className="stats-num">
      {stat.target === null ? stat.display : val}
      {stat.suffix}
    </b>
  );
}

export default function ShivaStatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setStart(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="wrap">
        <div className="stats-band" ref={ref}>
          <div className="stats-grid">
            {STATS.map((s) => (
              <div className="stats-cell" key={s.label}>
                <Counter stat={s} start={start} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="stats-cta">
            <p>Shuruaat bilkul free hai — pehla kadam aaj hi lo.</p>
            <Link href="/register" className="btn btn-accent btn-pill">
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
