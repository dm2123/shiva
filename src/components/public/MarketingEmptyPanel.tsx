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
            <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-[#c8a96e] hover:text-[#e8d5a3] transition-colors">
              {cta} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
