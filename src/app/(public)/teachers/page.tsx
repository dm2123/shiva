import Link from 'next/link';
import { listEducators } from '@/services/educator.service';
import { listActiveEducators } from '@/lib/db';
import EducatorCard from '@/components/brand/EducatorCard';
import THEShivaLogo from '@/components/brand/THEShivaLogo';

export const metadata = {
  title: 'Educators — THE SHIVA',
  description: 'Meet our verified educator partners — expert coaching institutes providing quality competitive exam preparation on THE SHIVA platform.',
};

// Render at request time — page depends on live DB data (educators/faculty)
export const revalidate = 0;

export default async function TeachersPage() {
  const educators = await listEducators();
  const activeEducators = educators.filter((e) => e.status === 'ACTIVE');
  const faculty = await listActiveEducators();

  return (
    <div className="min-h-screen relative py-24 px-6 overflow-hidden shiva-liquid-hero">
      <div className="shiva-blob w-[600px] h-[600px] bg-teal-600 top-[-100px] right-[-150px]" aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[500px] h-[500px] bg-blue-500 bottom-[-100px] left-[-100px]" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">Verified Educators</span>
          <h1 className="text-shiva-section text-white">
            Expert Educators<br />
            <span className="text-shiva-gold">on THE SHIVA</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Learn from verified coaching institutes and expert educators partnered with THE SHIVA for competitive exam preparation excellence.
          </p>
        </div>

        {/* Platform Notice */}
        <div className="max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-gradient-to-r from-[#c8a96e]/10 to-transparent border border-[#c8a96e]/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <THEShivaLogo size={48} variant="icon" />
            <div>
              <h2 className="text-sm font-bold text-white mb-1">Powered by THE SHIVA Platform</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                All educators are verified partners delivering courses through THE SHIVA&apos;s premium learning infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Educators Grid */}
        {activeEducators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activeEducators.map((educator) => (
              <EducatorCard
                key={educator.id}
                educator={educator}
                showSocials={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg mb-4">No educators available at this time.</p>
            <p className="text-sm text-slate-500">Check back soon for verified educator partners.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-6">Ready to start learning on THE SHIVA?</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-[#c8a96e] hover:bg-[#e8d5a3] text-[#0a0a12] font-bold text-sm rounded-full shadow-xl shadow-[#c8a96e]/20 hover:shadow-[#c8a96e]/40 transition-all hover:-translate-y-1"
          >
            Get Started
          </Link>
        </div>

        {/* Real Platform Faculty */}
        {faculty.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12 space-y-3">
              <span className="shiva-capsule shiva-capsule-teal">Teaching Faculty</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Your <span className="text-shiva-gold">Educators</span> on THE SHIVA
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Active faculty members currently delivering courses through the platform.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.map((f: any) => (
                <div key={f.id} className="shiva-feature-card">
                  <div className="flex items-center gap-4 p-6">
                    {f.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.photoUrl} alt={f.displayName} className="w-16 h-16 rounded-full object-cover ring-2 ring-[#c8a96e]/20" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c8a96e] to-[#a07840] flex items-center justify-center text-white font-bold text-2xl">
                        {f.displayName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-base">{f.displayName}</h3>
                      <p className="text-xs text-[#c8a96e] font-semibold mt-0.5">{f.qualification || f.slug}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {f.experienceYears ? `${f.experienceYears} years experience` : 'Verified Educator'}
                      </p>
                    </div>
                  </div>
                  {f.bio && <p className="px-6 pb-6 text-sm text-slate-400 leading-relaxed line-clamp-3">{f.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
