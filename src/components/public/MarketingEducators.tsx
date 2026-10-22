import Link from 'next/link';
import { listActiveEducators } from '@/services/educator.service';
import EducatorCard from '@/components/brand/EducatorCard';

/* ------------------------------------------------------------------ */
/*  Marketing "Educator Partners" section.                            */
/*  Data asal TeacherProfiles se aata hai — EducatorCard purane       */
/*  EducatorProfile fields (logoUrl/description/tagline) padhta hai,  */
/*  isliye asal row fields (photoUrl/bio/qualification) ko yahin      */
/*  map karke dete hain taaki card par asal photo/bio dikhe.          */
/* ------------------------------------------------------------------ */

type TeacherRow = Record<string, any>;

function toCardEducator(t: TeacherRow) {
  return {
    ...t,
    displayName: t.displayName || t.name,
    logoUrl: t.logoUrl || t.photoUrl || undefined,
    description: t.description || t.bio || undefined,
    tagline: t.tagline || t.qualification || undefined,
  };
}

export default async function MarketingEducators() {
  let educators: TeacherRow[] = [];
  try {
    educators = ((await listActiveEducators()) as TeacherRow[]).filter((t) => t && (t.displayName || t.name));
  } catch {
    educators = [];
  }

  return (
    <section className="marketing-section relative overflow-hidden" aria-labelledby="educators-heading">
      <div
        className="shiva-blob w-[420px] h-[420px] absolute right-[-120px] top-[10%] opacity-10"
        style={{ background: '#6d28d9' }}
        aria-hidden="true"
      />
      <div className="marketing-container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="section-header text-left" style={{ marginBottom: 0 }}>
            <span className="section-eyebrow" style={{ color: '#f5b942' }}>
              Educator Partners
            </span>
            <h2 id="educators-heading" className="section-title" style={{ color: '#fff' }}>
              Learn from verified institutes on THE SHIVA.
            </h2>
            <p className="section-description" style={{ marginLeft: 0 }}>
              Educators teach on THE SHIVA. They are partners — not the platform brand. Har card asal
              profile data dikhata hai.
            </p>
            {educators.length > 0 && (
              <p className="text-xs font-bold uppercase tracking-widest mt-3" style={{ color: '#c4b5fd' }}>
                {educators.length} active {educators.length === 1 ? 'educator' : 'educators'}
              </p>
            )}
          </div>
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 text-sm font-bold transition-colors self-start md:self-end shrink-0 hover:underline"
            style={{ color: '#f5b942' }}
          >
            All educators →
          </Link>
        </div>

        {educators.length === 0 ? (
          <div className="shiva-glass rounded-2xl px-6 py-10 md:px-10 md:py-12 text-center">
            <p className="text-white font-semibold mb-2">No educator partners listed yet.</p>
            <p className="text-sm text-slate-400 mb-6">
              Verified institutes will appear here when published. Tab tak courses dekhkar taiyaari shuru karo.
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 rounded-full text-sm font-bold text-[#2a1650] transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#f5b942,#e8d5a3)' }}
            >
              Courses Dekho
            </Link>
          </div>
        ) : (
          <div className="marketing-grid-3">
            {educators.map((educator) => (
              <EducatorCard key={educator.id || educator.slug} educator={toCardEducator(educator) as any} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
