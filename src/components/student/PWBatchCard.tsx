'use client';

import Link from 'next/link';

export interface PWBatch {
  id: string;
  slug: string;
  targetLabel: string;      // e.g. "SSC CGL" (orange label)
  title: string;            // e.g. "MISSION SSC CGL 2026"
  language: string;         // e.g. "HINGLISH"
  examTarget?: string;      // e.g. "SSC CGL 2026"
  startDate?: string;        // e.g. "Starts on 1st Nov'26"
  status?: 'ongoing' | 'upcoming' | null;
  price: number;            // 0 = Free
  mrp?: number;             // struck-through price
  bannerGradient: string;   // CSS gradient for banner
  bannerEmoji: string;      // emoji art for banner
  kitIncluded?: string;     // e.g. "MISSION KIT INCLUDED"
  ctaText: string;          // "Enroll Now" / "Buy Now"
}

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export default function PWBatchCard({ batch }: { batch: PWBatch }) {
  const isFree = batch.price === 0;
  const discount = batch.mrp && batch.mrp > batch.price
    ? Math.round(((batch.mrp - batch.price) / batch.mrp) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Banner */}
      <div
        className="relative h-36 flex items-center overflow-hidden"
        style={{ background: batch.bannerGradient }}
      >
        <div className="px-5 z-10">
          <p className="text-2xl font-black leading-tight text-gray-900">{batch.title}</p>
          {batch.kitIncluded && (
            <span className="inline-block mt-2 text-[10px] font-bold border border-gray-700 rounded-full px-2.5 py-1 text-gray-800">
              {batch.kitIncluded}
            </span>
          )}
        </div>
        <span className="absolute right-4 text-7xl opacity-90">{batch.bannerEmoji}</span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-orange-500">{batch.targetLabel}</span>
          <span className="text-[11px] font-medium border border-gray-300 rounded-md px-2 py-1 text-gray-600">
            {batch.language}
          </span>
        </div>

        <h3 className="text-[17px] font-bold text-gray-900 mb-2">{batch.title}</h3>

        <div className="space-y-1.5 mb-3">
          {batch.examTarget && (
            <p className="flex items-center gap-2 text-[13px] text-gray-600">
              <span>📖</span> {batch.examTarget}
            </p>
          )}
          {batch.status === 'ongoing' && batch.startDate && (
            <p className="flex items-center gap-2 text-[13px] text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="font-medium text-gray-800">Ongoing</span>
              <span className="text-gray-400">|</span> {batch.startDate}
            </p>
          )}
          {batch.status === 'upcoming' && batch.startDate && (
            <p className="flex items-center gap-2 text-[13px] text-gray-600">
              <span>📅</span> {batch.startDate}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {isFree ? (
              <span className="text-[17px] font-bold text-gray-900">Free</span>
            ) : (
              <>
                <p className="text-[17px] font-bold text-gray-900">
                  {formatINR(batch.price)}{' '}
                  {batch.mrp && (
                    <span className="text-[13px] font-normal text-gray-400 line-through">
                      {formatINR(batch.mrp)}
                    </span>
                  )}
                </p>
                {discount > 0 && (
                  <p className="text-[13px] font-semibold text-green-600">{discount}% OFF</p>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/courses/${batch.slug}`}
              className="bg-[#1a1a2e] text-white text-[14px] font-semibold rounded-xl px-6 py-3 hover:bg-black transition"
            >
              {batch.ctaText}
            </Link>
            <Link
              href={`/courses/${batch.slug}`}
              aria-label="View details"
              className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
