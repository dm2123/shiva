'use client';

import { useRef, useEffect } from 'react';

interface StudentEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  /** Doosra, halka (outline) CTA — sirf tab jab page ko ek se zyada rasta dena ho */
  secondaryActionText?: string;
  secondaryActionHref?: string;
  variant?: 'default' | 'compact' | 'large';
  /** @deprecated Ab illustration hamesha apni original SVG hai; prop sirf purane callers ke liye rakha hai. */
  useLottie?: boolean;
}

/**
 * THE SHIVA empty-state ka ekroop standard (andar ke student pages ke liye):
 * safed rounded-2xl card + halki shadow, apni original SVG illustration
 * (deep purple #2a1650/#6d28d9 + gold #f5b942), bold shaant heading,
 * ek-line samjhaya text, aur ek KAALA solid CTA button.
 * Koi bahari image nahi, koi nakli data/sujhav nahi — text caller hi deta hai.
 */
function EmptyIllustration({ size = 148 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Soft backdrop */}
      <circle cx="80" cy="82" r="62" fill="#6d28d9" opacity="0.07" />
      <circle cx="80" cy="82" r="62" stroke="#6d28d9" strokeOpacity="0.14" strokeDasharray="3 6" />
      <circle cx="30" cy="42" r="4" fill="#f5b942" opacity="0.55" />
      <circle cx="132" cy="52" r="3" fill="#6d28d9" opacity="0.3" />
      <circle cx="124" cy="118" r="4.5" fill="#f5b942" opacity="0.35" />

      {/* Open book */}
      <path
        d="M80 118c-9.5-7.2-21.5-10.4-36-9.6V56.6c14.5-.8 26.5 2.4 36 9.6 9.5-7.2 21.5-10.4 36-9.6v51.8c-14.5-.8-26.5 2.4-36 9.6Z"
        fill="#ede9fe"
        stroke="#6d28d9"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M80 66.2v51.8" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" />
      {/* Page lines */}
      <path d="M54 68c6-.4 11.5.4 16.5 2.4M54 79.5c6-.4 11.5.4 16.5 2.4M54 91c6-.4 11.5.4 16.5 2.4" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
      <path d="M106 68c-6-.4-11.5.4-16.5 2.4M106 79.5c-6-.4-11.5.4-16.5 2.4M106 91c-6-.4-11.5.4-16.5 2.4" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
      {/* Book base shadow */}
      <ellipse cx="80" cy="128" rx="34" ry="4" fill="#2a1650" opacity="0.1" />

      {/* Gold bookmark star */}
      <path
        d="M104 34l2.6 5.9 6.4.7-4.8 4.3 1.4 6.3L104 48l-5.6 3.2 1.4-6.3-4.8-4.3 6.4-.7L104 34Z"
        fill="#f5b942"
        stroke="#d99a17"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Small sparkles */}
      <path d="M52 30v10M47 35h10" stroke="#f5b942" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M136 88v8M132 92h8" stroke="#6d28d9" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export default function StudentEmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  secondaryActionText,
  secondaryActionHref,
  variant = 'default',
}: StudentEmptyStateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, []);

  const paddingClass =
    variant === 'compact' ? 'px-6 py-8' : variant === 'large' ? 'px-6 py-14 md:py-16' : 'px-6 py-10 md:py-12';
  const illustrationSize = variant === 'compact' ? 104 : variant === 'large' ? 168 : 148;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center ${paddingClass} text-center rounded-2xl border border-[var(--student-border)] bg-[var(--student-surface)] shadow-sm`}
    >
      <div className="relative mb-5">
        <EmptyIllustration size={illustrationSize} />
        {icon && (
          <span className="absolute -bottom-1 -right-1 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white flex items-center justify-center shadow-md shadow-[#6d28d9]/25 ring-4 ring-[var(--student-surface)]">
            {icon}
          </span>
        )}
      </div>

      <h3 className="text-lg md:text-xl font-bold text-[var(--student-text)] tracking-tight">{title}</h3>
      <p className="text-sm text-[var(--student-text-muted)] max-w-md mx-auto leading-relaxed mt-2">
        {description}
      </p>

      {(actionText && actionHref) || (secondaryActionText && secondaryActionHref) ? (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionText && actionHref && (
            <a
              href={actionHref}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-[#2a1650] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d28d9] focus:ring-offset-2"
            >
              {actionText}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          )}
          {secondaryActionText && secondaryActionHref && (
            <a
              href={secondaryActionHref}
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-[var(--student-border)] text-[var(--student-text)] text-sm font-semibold rounded-full hover:bg-[var(--student-surface-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6d28d9] focus:ring-offset-2"
            >
              {secondaryActionText}
            </a>
          )}
        </div>
      ) : null}
    </div>
  );
}
