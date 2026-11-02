import Link from 'next/link';
import type { Course } from '@/types/models';

/**
 * Hero — index.html ke .hero5 ka JSX roop (PW pattern):
 * halka gradient hero · bada extra-bold H1 (violet accent) ·
 * pill search · Popular chips · CTA + price line · daayen
 * featured-course card · neeche trust stats.
 *
 * Stats sirf asal: published courses ki ginti server se (DB)
 * aati hai; baaki teen daave site ke imaandaar sthaayi daave
 * hain (100% Free starter, Hindi+English, 24×7) — koi naya
 * bada daawa nahi joda gaya.
 */

const APTITUDE_SLUG = 'aptitude-foundation-free';
const APTITUDE_TOPICS = [
  'Number System',
  'Percentage',
  'Ratio & Proportion',
  'Average',
  'Time & Work',
  'Interest',
  'Data Interpretation',
];

const POPULAR = [
  { label: 'SSC CGL', href: '/courses' },
  { label: 'Railway NTPC', href: '/courses' },
  { label: 'Aptitude Foundation', href: '/courses/aptitude-foundation-free' },
  { label: 'Live Batches', href: '/batches' },
];

export default function Hero({
  courseCount,
  flagship,
}: {
  courseCount: number | null;
  flagship: Course | null;
}) {
  const isAptitude = flagship?.slug === APTITUDE_SLUG;
  const flagshipFree = flagship ? Number(flagship.price) <= 0 : false;
  const flagshipHref = flagship ? `/courses/${flagship.slug}` : '/courses';

  const stats: { b: string; s: string }[] = [
    ...(courseCount ? [{ b: String(courseCount), s: 'Published Courses' }] : []),
    { b: '100% Free', s: 'Starter Course' },
    { b: 'Hindi + English', s: 'Bilingual Content' },
    { b: '24×7', s: 'Kabhi Bhi Padho' },
  ];

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f4f1ff_0%,#faf9ff_62%,#ffffff_100%)]">
      <div className="relative z-[2] mx-auto grid w-full max-w-[1140px] items-center gap-9 px-5 pb-1 pt-[38px] lg:grid-cols-[1.12fr_0.88fr] lg:pt-[54px]">
        {/* Left — headline + search + CTA */}
        <div>
          <span className="mb-4 inline-block rounded-full bg-[#ede9fe] px-[15px] py-[7px] text-xs font-extrabold tracking-[1.1px] text-[#4c1d95]">
            SSC • RAILWAY • BANKING • DEFENCE • TEACHING
          </span>
          <h1 className="text-[37px] font-black leading-[1.08] tracking-[-0.8px] text-[#2a1650] lg:text-[54px]">
            Your Dream Exams,
            <br />
            <span className="text-[#6d28d9]">Our Mission.</span>
          </h1>
          <p className="mt-[14px] max-w-[540px] text-[16.5px] leading-relaxed text-[#4b5563]">
            Sarkari exams ki taiyaari — structured video lectures, practice tests aur doubt support
            ke saath. Shuruaat bilkul free Aptitude Foundation course se karo.
          </p>

          <form
            action="/batches"
            method="get"
            role="search"
            className="mb-3 mt-[22px] flex max-w-[560px] rounded-full border-2 border-[#ede9fe] bg-white p-[6px] shadow-[0_12px_30px_rgba(42,22,80,0.10)]"
          >
            <input
              type="search"
              name="q"
              placeholder="Search batches, courses, exams…"
              aria-label="Batches aur courses search karo"
              className="min-w-0 flex-1 bg-transparent px-[18px] py-[10px] text-[15.5px] text-[#1e1b2e] outline-none placeholder:text-[#9ca3af]"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-full bg-[#6d28d9] px-[26px] py-3 text-[15px] font-black text-white transition hover:bg-[#4c1d95]"
            >
              Search
            </button>
          </form>

          <div className="mb-1 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="font-bold text-[#6b7280]">Popular:</span>
            {POPULAR.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="rounded-full border-[1.5px] border-[#ede9fe] bg-white px-[15px] py-[7px] font-bold transition hover:border-[#6d28d9] hover:bg-[#f5f3ff]"
              >
                <span className="text-[#4c1d95]">{p.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-[18px] flex flex-wrap gap-[10px]">
            <Link
              href={flagshipHref}
              className="rounded-full border-2 border-[#111827] bg-[#111827] px-[30px] py-[14px] text-base font-bold shadow-[0_8px_20px_rgba(17,24,39,0.22)] transition hover:-translate-y-px hover:bg-black"
            >
              <span className="text-white">Free Course Se Shuru Karo →</span>
            </Link>
            <Link
              href="/batches"
              className="rounded-full border-2 border-[#ede9fe] bg-white px-[26px] py-[13px] text-base font-bold transition hover:border-[#6d28d9]"
            >
              <span className="text-[#6d28d9]">Batches Dekho</span>
            </Link>
          </div>

          {isAptitude && (
            <div className="mt-4 flex flex-wrap items-center gap-[10px] text-[13.5px] text-[#6b7280]">
              <b className="rounded-full bg-[#dcfce7] px-[14px] py-[2px] text-[23px] font-black text-[#059669]">
                FREE
              </b>
              <s className="text-base font-semibold text-[#9ca3af]">₹999</s>
              <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[#a7f3d0] bg-[#dcfce7] px-[11px] py-1 text-xs font-extrabold leading-[1.4] text-[#065f46]">
                100% OFF
              </span>
              <span>Aptitude Foundation Course ke liye</span>
            </div>
          )}
        </div>

        {/* Right — featured course card (asal DB course) */}
        {flagship && (
          <aside
            className="overflow-hidden rounded-[22px] border-[1.5px] border-[#ede9fe] bg-white shadow-[0_24px_50px_rgba(42,22,80,0.16)]"
            aria-label={`${flagship.title} — Featured Course`}
          >
            <div className="relative overflow-hidden bg-[linear-gradient(120deg,#059669,#10b981)] p-[22px] text-white">
              <span
                aria-hidden="true"
                className="absolute -right-[30px] -top-[30px] h-[110px] w-[110px] rounded-full bg-white/[0.14]"
              />
              <span className="relative z-[2] inline-block rounded-full bg-white px-[11px] py-1 text-[11px] font-extrabold tracking-[0.3px] text-[#059669]">
                {flagshipFree ? 'LIVE • 100% FREE' : 'FEATURED COURSE'}
              </span>
              <div className="relative z-[2] mt-3 text-[29px] font-black uppercase leading-[1.13] tracking-[-0.3px]">
                {flagship.title}
              </div>
              {flagship.targetAudience ? (
                <div className="relative z-[2] mt-1 text-[13.5px] opacity-[0.93]">
                  {flagship.targetAudience.split('\n').find(Boolean)}
                </div>
              ) : null}
            </div>
            <div className="p-5 pt-[18px]">
              {isAptitude && (
                <div className="mb-[14px] flex flex-wrap gap-[7px]">
                  {APTITUDE_TOPICS.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border-[1.5px] border-[#ede9fe] bg-[#f5f3ff] px-[11px] py-[5px] text-xs font-bold text-[#4c1d95]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-[10px]">
                {flagshipFree ? (
                  <b className="rounded-full bg-[#dcfce7] px-[14px] py-[3px] text-[26px] font-black tracking-[-0.3px] text-[#059669]">
                    FREE
                  </b>
                ) : (
                  <b className="text-[26px] font-black tracking-[-0.3px] text-[#1e1b2e]">
                    ₹{Number(flagship.price).toLocaleString('en-IN')}
                  </b>
                )}
                {isAptitude && (
                  <>
                    <s className="text-[17px] font-semibold text-[#9ca3af]">₹999</s>
                    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[#a7f3d0] bg-[#dcfce7] px-[11px] py-1 text-xs font-extrabold leading-[1.4] text-[#065f46]">
                      100% OFF
                    </span>
                  </>
                )}
              </div>
              <Link
                href={flagshipHref}
                className="mt-3 block rounded-full border-2 border-[#111827] bg-[#111827] py-3 text-center text-[15px] font-bold shadow-[0_8px_20px_rgba(17,24,39,0.22)] transition hover:-translate-y-px hover:bg-black"
              >
                <span className="text-white">Register Now →</span>
              </Link>
            </div>
          </aside>
        )}
      </div>

      {/* Trust stats — sirf asal daave */}
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <div className="mt-9 grid grid-cols-2 gap-[14px] border-t border-[#e9e5fb] py-5 pb-[30px] text-center lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.s}>
              <b className="block text-[19px] font-black text-[#2a1650]">{s.b}</b>
              <span className="text-[12.5px] text-[#6b7280]">{s.s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
