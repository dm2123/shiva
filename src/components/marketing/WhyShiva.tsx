import SectionHead from './SectionHead';

/**
 * WhyShiva — index.html ke "Why" section ka JSX roop:
 * 4 feature cards (Structured Lectures · Practice & Tests ·
 * Doubt Support · Sabke Liye Affordable), HTML wale hi icons.
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
    title: 'Structured Lectures',
    text: 'Har topic step-by-step video lectures me — basics se exam level tak.',
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Practice & Tests',
    text: 'Topic-wise practice questions aur exam-pattern mock tests.',
    icon: (
      <svg {...svgProps}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5M9 12l2 2 4-4.5" />
      </svg>
    ),
  },
  {
    title: 'Doubt Support',
    text: 'Atke hue sawalon ke liye doubt solving support sessions.',
    icon: (
      <svg {...svgProps}>
        <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12z" />
        <path d="M12 8v.2M12 11.5c0 1.5-2 1.6-2 3" strokeWidth="1.9" />
      </svg>
    ),
  },
  {
    title: 'Sabke Liye Affordable',
    text: 'Shuruaat 100% free course se — paisa kabhi padhai ki rukawat nahi.',
    icon: (
      <svg {...svgProps}>
        <path d="M12 20.5C7 16.5 3.5 13.2 3.5 9.3A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.5 2.6c0 3.9-3.5 7.2-8.5 11.2z" />
      </svg>
    ),
  },
];

export default function WhyShiva() {
  return (
    <div className="py-[60px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <SectionHead kick="Kyun THE SHIVA?" title="A Platform You Can Trust">
          <p>Honest commitment, no false promises — jo hai, wahi dikhate hain</p>
        </SectionHead>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-[20px] border-2 border-[#ede9fe] bg-white p-6 px-5 shadow-[0_4px_16px_rgba(42,22,80,0.05)] transition hover:-translate-y-[3px] hover:border-[#6d28d9] hover:shadow-[0_14px_30px_rgba(109,40,217,0.11)]"
            >
              <div className="mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#f5f3ff] text-[#4c1d95] shadow-[inset_0_0_0_2px_#ede9fe] [&>svg]:h-[26px] [&>svg]:w-[26px]">
                {c.icon}
              </div>
              <b className="mb-[5px] block text-base text-[#2a1650]">{c.title}</b>
              <p className="text-sm leading-relaxed text-[#6b7280]">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
