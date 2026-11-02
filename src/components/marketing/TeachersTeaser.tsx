import Link from 'next/link';
import SectionHead from './SectionHead';

/**
 * TeachersTeaser — index.html ke Faculty teaser ka JSX roop.
 * Imaandaar: koi nakli teacher naam/photo nahi — sirf woh subjects
 * jo asal me padhaye jate hain; asal profiles /teachers par hain.
 *
 * ResultsHonest — index.html ka "Results — Sach Ke Saath" section
 * (Teachers ke theek baad aata hai): pehla batch chal raha hai,
 * nakli toppers nahi. Homepage par wahi kram barkarar.
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

const SUBJECTS = [
  {
    name: 'Quantitative Aptitude',
    text: 'Maths ki neev — basics se exam-level shortcuts tak',
    icon: (
      <svg {...svgProps}>
        <path d="M17.5 5H7l6.5 7L7 19h10.5" />
      </svg>
    ),
  },
  {
    name: 'Reasoning',
    text: 'Pattern-based solving — analogy, series, puzzles',
    icon: (
      <svg {...svgProps}>
        <circle cx="8" cy="8" r="3.4" />
        <circle cx="16" cy="16" r="3.4" />
        <path d="M10.4 10.4l3.2 3.2" />
      </svg>
    ),
  },
  {
    name: 'English',
    text: 'Grammar, vocabulary aur comprehension practice',
    icon: (
      <svg {...svgProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
      </svg>
    ),
  },
  {
    name: 'General Awareness',
    text: 'History, Polity, Geography, Science, Current Affairs',
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5S9.5 5.8 12 3.5z" />
      </svg>
    ),
  },
];

export default function TeachersTeaser() {
  return (
    <div className="border-t border-[#f3f0ff] bg-white py-[60px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <SectionHead kick="Faculty" title="Subject Experts Ke Saath Padho">
          <p>
            THE SHIVA ka faculty panel verified profiles ke saath ban raha hai — har teacher ki asli
            profile{' '}
            <Link href="/teachers" className="font-bold text-[#6d28d9]">
              Faculty page
            </Link>{' '}
            par milegi. Abhi ye subjects padhaye jate hain:
          </p>
        </SectionHead>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((s) => (
            <div
              key={s.name}
              className="rounded-[20px] border-2 border-[#ede9fe] bg-white p-6 px-5 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)] transition hover:-translate-y-[3px] hover:border-[#6d28d9]"
            >
              <div className="mx-auto mb-3 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f5f3ff,#ede9fe)] text-[#4c1d95] shadow-[inset_0_0_0_2px_#ede9fe] [&>svg]:h-7 [&>svg]:w-7">
                {s.icon}
              </div>
              <b className="mb-1 block text-base text-[#2a1650]">{s.name}</b>
              <p className="text-[13.5px] leading-relaxed text-[#6b7280]">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-[22px] text-center">
          <Link
            href="/teachers"
            className="inline-block rounded-full border-2 border-[#6d28d9] bg-[#6d28d9] px-6 py-3 text-[15px] font-bold shadow-[0_6px_18px_rgba(109,40,217,0.28)] transition hover:-translate-y-px hover:bg-[#4c1d95]"
          >
            <span className="text-white">Platform Par Teachers Dekho →</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ResultsHonest() {
  return (
    <div className="border-t border-[#f3f0ff] bg-white py-[60px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <SectionHead kick="Results" title="Results — Sach Ke Saath">
          <p>Hum nakli toppers ya bade-bade daave nahi dikhate</p>
        </SectionHead>
        <div className="mx-auto max-w-[680px] rounded-[20px] border-[1.5px] border-[#ede9fe] bg-white px-[26px] py-7 text-center shadow-[0_8px_28px_rgba(42,22,80,0.06)]">
          <span className="mb-2 inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#f5f3ff] text-[#6d28d9]">
            <svg {...svgProps} className="h-[26px] w-[26px]">
              <path d="M7.5 4h9v4.5a4.5 4.5 0 0 1-9 0z" />
              <path d="M7.5 5.5H4.8a2.7 2.7 0 0 0 2.9 3.7M16.5 5.5h2.7a2.7 2.7 0 0 1-2.9 3.7M12 13v3.5M8.5 20h7M12 16.5V20" />
            </svg>
          </span>
          <h3 className="mb-2 text-[20px] font-extrabold text-[#2a1650]">Pehla Batch Chal Raha Hai</h3>
          <p className="text-[14.5px] leading-relaxed text-[#6b7280]">
            Hamara pehla batch chal raha hai — students ki <b className="text-[#2a1650]">asli</b>{' '}
            success stories yahin publish hongi, results aate hi.
            <br />
            <b className="text-[#2a1650]">Your name could be next — mehnat se.</b>
          </p>
          <Link href="/results" className="mt-3 inline-block text-[14.5px] font-bold text-[#6d28d9]">
            Results page dekho →
          </Link>
        </div>
      </div>
    </div>
  );
}
