import Link from 'next/link';

/**
 * ScholarshipStrip — index.html ki scholarship patti ka JSX roop.
 * Imaandaar content hi hai: program design ho raha hai, koi rakam
 * ya date ka daawa nahi. Button asal /scholarship route par.
 */
export default function ScholarshipStrip() {
  return (
    <div className="pb-0 pt-[44px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <div className="grid grid-cols-1 items-center gap-5 rounded-[20px] border-2 border-[#f5b942] bg-[linear-gradient(120deg,#fff7e0,#ffedb8)] p-7 text-center shadow-[0_10px_30px_rgba(245,185,66,0.25)] sm:text-left lg:grid-cols-[auto_1fr_auto]">
          <div aria-hidden="true" className="flex justify-center text-[#b45309]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[46px] w-[46px]"
            >
              <path d="M12 4L2.5 8.5 12 13l9.5-4.5z" />
              <path d="M6 10.8V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.2M21.5 8.5V14" />
            </svg>
          </div>
          <div>
            <h3 className="mb-1 text-[21px] font-extrabold text-[#2a1650]">
              Scholarship Program — Jald Aa Raha Hai
            </h3>
            <p className="text-[14.5px] leading-relaxed text-[#6b5a1e]">
              Deserving students ke liye aarthik madad ka program design ho raha hai — koi jhoothi
              rakam ya date nahi, details pakki hote hi yahin milegi. Tab tak 100% free course sabke
              liye live hai.
            </p>
          </div>
          <Link
            href="/scholarship"
            className="justify-self-center rounded-full border-2 border-[#111827] bg-[#111827] px-6 py-3 text-[15px] font-bold shadow-[0_8px_20px_rgba(17,24,39,0.22)] transition hover:-translate-y-px hover:bg-black lg:justify-self-auto"
          >
            <span className="text-white">Scholarship Jaano →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
