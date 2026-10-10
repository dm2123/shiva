import Link from 'next/link';
import { listActiveEducators } from '@/services/educator.service';
import EducatorCard from '@/components/brand/EducatorCard';

export default async function MarketingEducators() {
  const educators = await listActiveEducators();

  return (
    <section className="marketing-section relative overflow-hidden" aria-labelledby="educators-heading">
      <div className="shiva-blob w-[420px] h-[420px] bg-teal-700 absolute right-[-120px] top-[10%] opacity-10" aria-hidden="true" />
      <div className="marketing-container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="section-header text-left">
            <span className="section-eyebrow" style={{ color: '#5eead4' }}>Educator Partners</span>
            <h2 id="educators-heading" className="section-title">
              Learn from verified institutes on THE SHIVA.
            </h2>
            <p className="section-description">
              Educators teach on THE SHIVA. They are partners — not the platform brand.
            </p>
          </div>
          <Link href="/teachers" className="inline-flex items-center gap-2 text-sm font-semibold text-[#c8a96e] hover:text-[#e8d5a3] transition-colors self-start md:self-end">
            All educators →
          </Link>
        </div>

        {educators.length === 0 ? (
          <div className="shiva-glass rounded-2xl px-6 py-10 md:px-10 md:py-12 text-center">
            <p className="text-white font-semibold mb-2">No educator partners listed yet.</p>
            <p className="text-sm text-slate-400">Verified institutes will appear here when published.</p>
          </div>
        ) : (
          <div className="marketing-grid-3">
            {educators.map((educator) => (
              <EducatorCard key={educator.id} educator={educator} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
