import Link from 'next/link';
import SectionHead from './SectionHead';

/**
 * Categories — index.html ke teen hisso ka JSX roop:
 * 1) gold exam strip (hero ke theek neeche),
 * 2) circular category shortcuts (PW pattern),
 * 3) "Exam Categories" section — pastel cat5 cards + wide
 *    Foundation card. Saare links asal /courses routes par.
 */

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const ICONS: Record<string, React.ReactNode> = {
  ssc: (
    <svg {...svgProps}>
      <path d="M3 9.5L12 4l9 5.5M4.5 9.5V18M9.5 9.5V18M14.5 9.5V18M19.5 9.5V18M2.5 20.5h19" />
    </svg>
  ),
  railway: (
    <svg {...svgProps}>
      <rect x="5" y="3.5" width="14" height="13" rx="2.5" />
      <path d="M5 10.5h14M9 20.5l-1.5-4M15 20.5l1.5-4" />
      <circle cx="9" cy="13.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  banking: (
    <svg {...svgProps}>
      <ellipse cx="12" cy="6.5" rx="7.5" ry="3" />
      <path d="M4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </svg>
  ),
  defence: (
    <svg {...svgProps}>
      <path d="M12 3l7.5 3v5.5c0 4.5-3.2 7.7-7.5 9.5-4.3-1.8-7.5-5-7.5-9.5V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  ),
  teaching: (
    <svg {...svgProps}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </svg>
  ),
  state: (
    <svg {...svgProps}>
      <path d="M12 21s-6.5-5.4-6.5-10.4A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.6C18.5 15.6 12 21 12 21z" />
      <circle cx="12" cy="10.4" r="2.3" />
    </svg>
  ),
  foundation: (
    <svg {...svgProps}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  ),
};

const STRIP_TILES = [
  { icon: 'ssc', name: 'SSC', sub: 'CGL · CHSL · MTS' },
  { icon: 'railway', name: 'Railway', sub: 'NTPC · Group D' },
  { icon: 'banking', name: 'Banking', sub: 'PO · Clerk · SO' },
  { icon: 'defence', name: 'Defence', sub: 'NDA · CDS · Agniveer' },
  { icon: 'teaching', name: 'Teaching', sub: 'CTET · UPTET · STET' },
  { icon: 'state', name: 'State Exams', sub: 'UPSSSC · Lekhpal' },
];

const CARDS = [
  { icon: 'ssc', tint: '#fef3c7', color: '#b45309', name: 'SSC', sub: 'CGL · CHSL · MTS · GD' },
  { icon: 'railway', tint: '#ede9fe', color: '#6d28d9', name: 'Railway', sub: 'NTPC · Group D · ALP' },
  { icon: 'banking', tint: '#dbeafe', color: '#1d4ed8', name: 'Banking', sub: 'PO · Clerk · SO' },
  { icon: 'defence', tint: '#dcfce7', color: '#15803d', name: 'Defence', sub: 'NDA · CDS · AFCAT' },
  { icon: 'teaching', tint: '#fce7f3', color: '#be185d', name: 'Teaching', sub: 'CTET · STET · UPTET' },
  { icon: 'state', tint: '#e0f2fe', color: '#0369a1', name: 'State Exams', sub: 'UPSSSC · Lekhpal · Police' },
];

export default function Categories() {
  return (
    <>
      {/* Gold exam strip */}
      <div
        aria-hidden="true"
        className="bg-[linear-gradient(90deg,#f5b942,#ffd97a,#f5b942)] text-[#2a1650] shadow-[0_4px_16px_rgba(42,22,80,0.10)]"
      >
        <div className="flex items-center overflow-x-auto whitespace-nowrap px-4 py-[11px] lg:justify-center">
          {['SSC', 'RAILWAY', 'BANKING', 'DEFENCE', 'TEACHING', 'FOUNDATION'].map((x, i, arr) => (
            <span key={x} className="flex items-center">
              <span className="px-[13px] text-[13px] font-extrabold tracking-[1.6px]">{x}</span>
              {i < arr.length - 1 && <i className="text-[11px] not-italic text-[#6d28d9]">✦</i>}
            </span>
          ))}
        </div>
      </div>

      {/* Circular category shortcuts */}
      <div className="border-b border-[#f3f0ff] bg-white pb-2 pt-5">
        <nav
          aria-label="Exam categories"
          className="mkt-noscroll mx-auto flex max-w-[1140px] flex-nowrap justify-start gap-[14px] overflow-x-auto px-4 pb-3 min-[1180px]:justify-center"
        >
          {STRIP_TILES.map((t) => (
            <Link
              key={t.name}
              href="/courses"
              className="flex w-[84px] shrink-0 flex-col items-center gap-[7px] rounded-2xl px-[2px] py-[6px] text-center transition hover:-translate-y-[3px] sm:w-[96px]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ede9fe] bg-[#f5f3ff] text-[#6d28d9] transition hover:border-[#6d28d9] hover:shadow-[0_10px_22px_rgba(109,40,217,0.16)] [&>svg]:h-[30px] [&>svg]:w-[30px]">
                {ICONS[t.icon]}
              </span>
              <b className="text-[13.5px] leading-[1.25] text-[#2a1650]">{t.name}</b>
              <span className="text-[11px] leading-[1.3] text-[#6b7280]">{t.sub}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Exam Categories section */}
      <div className="py-[60px]">
        <div className="mx-auto w-full max-w-[1140px] px-5">
          <SectionHead kick="Explore" title="Exam Categories">
            <p>Apna exam chuno aur taiyaari shuru karo</p>
          </SectionHead>
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c) => (
              <Link
                key={c.name}
                href="/courses"
                className="flex items-center gap-[14px] rounded-[18px] border-[1.5px] border-transparent p-4 px-[18px] transition hover:-translate-y-[3px] hover:shadow-[0_14px_30px_rgba(42,22,80,0.10)]"
                style={{ background: c.tint }}
              >
                <span
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(42,22,80,0.08)] [&>svg]:h-[27px] [&>svg]:w-[27px]"
                  style={{ color: c.color }}
                >
                  {ICONS[c.icon]}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block text-[17px] leading-[1.25] text-[#2a1650]">{c.name}</b>
                  <span className="text-[12.5px] font-semibold text-[#6b7280]">{c.sub}</span>
                </span>
                <span className="whitespace-nowrap text-[13.5px] font-extrabold text-[#6d28d9]">
                  Explore →
                </span>
              </Link>
            ))}
            {/* Wide Foundation card */}
            <Link
              href="/courses/aptitude-foundation-free"
              className="flex items-center gap-[14px] rounded-[18px] border-[1.5px] border-transparent bg-[#fef9c3] p-4 px-[18px] transition hover:-translate-y-[3px] hover:shadow-[0_14px_30px_rgba(42,22,80,0.10)] sm:col-span-2 lg:col-span-3"
            >
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white text-[#a16207] shadow-[0_4px_12px_rgba(42,22,80,0.08)] [&>svg]:h-[27px] [&>svg]:w-[27px]">
                {ICONS.foundation}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[17px] leading-[1.25] text-[#2a1650]">
                  Foundation — Aptitude Ki Neev
                </b>
                <span className="text-[12.5px] font-semibold text-[#6b7280]">
                  Maths · Reasoning · Har exam ki shuruaat yahin se
                </span>
              </span>
              <span className="hidden items-center whitespace-nowrap rounded-full border border-[#a7f3d0] bg-[#dcfce7] px-[11px] py-1 text-xs font-extrabold leading-[1.4] text-[#065f46] sm:inline-flex">
                100% FREE
              </span>
              <span className="whitespace-nowrap text-[13.5px] font-extrabold text-[#6d28d9]">
                Free Course →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
