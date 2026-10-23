import Link from 'next/link';

/* ------------------------------------------------------------------ */
/* ShivaCategoryStrip — gol (circular) category icons strip.          */
/* pw-pattern: header ke theek neeche chhote circular tiles, har     */
/* asal exam category ke liye. Icons apne original inline SVG hain.  */
/* ------------------------------------------------------------------ */

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const CATS = [
  {
    name: 'SSC',
    sub: 'CGL · CHSL · MTS',
    icon: (
      <svg {...svgProps}>
        <path d="M3 9.5L12 4l9 5.5M4.5 9.5V18M9.5 9.5V18M14.5 9.5V18M19.5 9.5V18M2.5 20.5h19" />
      </svg>
    ),
  },
  {
    name: 'Railway',
    sub: 'NTPC · Group D',
    icon: (
      <svg {...svgProps}>
        <rect x="5" y="3.5" width="14" height="13" rx="2.5" />
        <path d="M5 10.5h14M9 20.5l-1.5-4M15 20.5l1.5-4" />
        <circle cx="9" cy="13.8" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Banking',
    sub: 'PO · Clerk · SO',
    icon: (
      <svg {...svgProps}>
        <ellipse cx="12" cy="6.5" rx="7.5" ry="3" />
        <path d="M4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
      </svg>
    ),
  },
  {
    name: 'Defence',
    sub: 'NDA · CDS · Agniveer',
    icon: (
      <svg {...svgProps}>
        <path d="M12 3l7.5 3v5.5c0 4.5-3.2 7.7-7.5 9.5-4.3-1.8-7.5-5-7.5-9.5V6z" />
        <path d="M9 12l2.2 2.2L15.5 10" />
      </svg>
    ),
  },
  {
    name: 'Teaching',
    sub: 'CTET · UPTET · STET',
    icon: (
      <svg {...svgProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
      </svg>
    ),
  },
  {
    name: 'State Exams',
    sub: 'UPSSSC · Lekhpal',
    icon: (
      <svg {...svgProps}>
        <path d="M12 21s-6.5-5.4-6.5-10.4A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.6C18.5 15.6 12 21 12 21z" />
        <circle cx="12" cy="10.4" r="2.3" />
      </svg>
    ),
  },
];

export default function ShivaCategoryStrip() {
  return (
    <div className="circ-strip-wrap">
      <nav className="circ-strip" aria-label="Exam categories">
        {CATS.map((c) => (
          <Link key={c.name} href="/courses" className="circ-tile">
            <span className="circ">{c.icon}</span>
            <b>{c.name}</b>
            <span>{c.sub}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
