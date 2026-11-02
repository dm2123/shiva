import Link from 'next/link';
import SectionHead from './SectionHead';

/**
 * StudyResources — index.html ke "Study Resources" section ka
 * JSX roop. Wave-C me nakli "jald aa raha hai" buttons asal links
 * bane the — yahan wahi asal routes: PYQ (/app/pyq), Formula
 * Sheets (/app/formula-sheets), Mock Tests (/test-series).
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

const CARDS = [
  {
    title: 'Previous Year Papers',
    text: 'SSC, Railway, Banking ke pichle saalon ke papers with solutions',
    href: '/app/pyq',
    bg: '#ede9fe',
    color: '#4c1d95',
    icon: (
      <svg {...svgProps}>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v4h4M10 12h5M10 16h5" />
      </svg>
    ),
  },
  {
    title: 'Formula Sheets',
    text: 'Quick revision ke liye important formulas ek jagah',
    href: '/app/formula-sheets',
    bg: '#fef3c7',
    color: '#b45309',
    icon: (
      <svg {...svgProps}>
        <path d="M17.5 5H7l6.5 7L7 19h10.5" />
      </svg>
    ),
  },
  {
    title: 'Mock Tests',
    text: 'Exam pattern par based practice mock tests',
    href: '/test-series',
    bg: '#f5f3ff',
    color: '#6d28d9',
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
  },
];

export default function StudyResources() {
  return (
    <div id="resources" className="py-[60px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <SectionHead kick="Resources" title="Study Resources">
          <p>Free learning material — dheere-dheere aur jud raha hai</p>
        </SectionHead>
        <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-3">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-[20px] border-[1.5px] border-[#ede9fe] bg-white p-[22px] shadow-[0_6px_24px_rgba(42,22,80,0.06)]"
            >
              <div
                className="mb-3 flex h-[50px] w-[50px] items-center justify-center rounded-[14px] [&>svg]:h-[25px] [&>svg]:w-[25px]"
                style={{ background: c.bg, color: c.color }}
              >
                {c.icon}
              </div>
              <h3 className="mb-[6px] text-[16.5px] font-bold text-[#2a1650]">{c.title}</h3>
              <p className="mb-[14px] text-[13.5px] leading-relaxed text-[#6b7280]">{c.text}</p>
              <Link
                href={c.href}
                className="inline-block rounded-full border-2 border-[#ede9fe] bg-white px-5 py-[9px] text-[13.5px] font-bold transition hover:border-[#6d28d9]"
              >
                <span className="text-[#6d28d9]">Explore</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
