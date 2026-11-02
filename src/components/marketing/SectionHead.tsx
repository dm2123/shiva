import type { ReactNode } from 'react';

/**
 * SectionHead — index.html ke .sec-head ka JSX roop:
 * centered kick pill + 32px extra-bold heading (neeche gradient
 * underline bar) + grey subtitle. Saare marketing sections yahi
 * pattern use karte hain taaki design ekroop rahe.
 */
export default function SectionHead({
  kick,
  title,
  children,
}: {
  kick: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-[34px] text-center">
      <span className="mb-[10px] inline-block rounded-full bg-[#ede9fe] px-4 py-[6px] text-[12.5px] font-bold uppercase tracking-[1.2px] text-[#4c1d95]">
        {kick}
      </span>
      <h2 className="text-[26px] font-black leading-tight tracking-[-0.3px] text-[#2a1650] sm:text-[32px]">
        {title}
      </h2>
      <span
        aria-hidden="true"
        className="mx-auto mt-3 block h-1 w-[58px] rounded-full bg-[linear-gradient(90deg,#6d28d9,#f5b942)]"
      />
      {children ? (
        <div className="mx-auto mt-2 max-w-[620px] text-[15.5px] leading-relaxed text-[#6b7280]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
