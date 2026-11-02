'use client';

/**
 * Test Series route ka error boundary — bhavishya me agar asal
 * data ke kisi naye shape par render phir kabhi gire, to safed
 * 500 ki jagah student ko imaandaar fallback + dobara koshish
 * ka raasta dikhe. (Asli 500 ki jad — client module se server
 * par function call — @/lib/exam-category shift se fix ho
 * chuki hai; ye boundary sirf suraksha-jaali hai.)
 */

import Link from 'next/link';

export default function TestSeriesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={{ background: '#0d0d13' }}>
      <div className="mx-auto max-w-xl rounded-2xl border border-[#26224a] bg-[#12121a] p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.45)]" role="alert">
        <div className="mb-3 text-5xl opacity-40" aria-hidden="true">
          🧪
        </div>
        <h1 className="mb-2 text-xl font-extrabold text-white">
          Test Series abhi khul nahi payi
        </h1>
        <p className="text-sm leading-relaxed text-[#a5a0d0]">
          Kuch takneeki dikkat aa gayi hai. Dobara koshish karo — ya tab tak courses se
          padhai jaari rakho, tests wahi se bhi milte hain.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-block rounded-full bg-[#6d28d9] px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5b21b6]"
          >
            Dobara Koshish Karo
          </button>
          <Link
            href="/courses"
            className="inline-block rounded-full bg-[#f5b942] px-7 py-3 text-sm font-bold text-[#2a1650] transition-all hover:-translate-y-0.5 hover:bg-[#e5a91f]"
          >
            Courses Dekho
          </Link>
        </div>
      </div>
    </div>
  );
}
