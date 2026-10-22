import Link from 'next/link';

interface MarketingEmptyPanelProps {
  capsule: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}

export default function MarketingEmptyPanel({
  capsule,
  title,
  description,
  href,
  cta,
}: MarketingEmptyPanelProps) {
  return (
    <section className="marketing-section-xs relative">
      <div className="marketing-container-narrow">
        <div className="shiva-glass rounded-2xl px-6 py-8 md:px-10 md:py-10 text-center space-y-4 border border-white/10">
          <span className="section-eyebrow inline-block">{capsule}</span>
          <h2 className="text-xl md:text-2xl lg:text-2xl font-bold text-white">{title}</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">{description}</p>
          {href && cta && (
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-[#f5b942]/50 px-6 py-2.5 text-sm font-bold text-[#f5b942] transition-colors hover:bg-[#f5b942] hover:text-[#2a1650]"
            >
              {cta} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
