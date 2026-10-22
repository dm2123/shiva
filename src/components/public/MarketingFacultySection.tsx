import Link from 'next/link';
import { listActiveEducators } from '@/services/educator.service';

/* ------------------------------------------------------------------ */
/*  Marketing "Expert Faculty" section — pehle 4 asal active teacher  */
/*  profiles (DB se). Koi hardcoded naam/qualification nahi: jo field */
/*  profile me hai wahi dikhta hai, warna woh line gayab.             */
/* ------------------------------------------------------------------ */

type TeacherRow = Record<string, any>;

function parseSubjects(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) return parsed.map(String).map((s) => s.trim()).filter(Boolean);
    } catch {
      /* plain comma string */
    }
    return t.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || 'S'
  );
}

export default async function MarketingFacultySection() {
  let teachers: TeacherRow[] = [];
  try {
    teachers = ((await listActiveEducators()) as TeacherRow[]).filter((t) => t && (t.displayName || t.name));
  } catch {
    teachers = [];
  }
  const shown = teachers.slice(0, 4);

  return (
    <section className="py-24 relative overflow-hidden shiva-grid">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0a0a12 0%,#170b33 55%,#0a0a12 100%)' }} aria-hidden="true" />
      <div className="shiva-blob w-[500px] h-[500px] top-[-100px] right-[-100px] opacity-15" style={{ background: '#6d28d9' }} aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[380px] h-[380px] bottom-[-120px] left-[-80px] opacity-10" style={{ background: '#f5b942' }} aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14 space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">Expert Faculty</span>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Learn from the <span className="text-shiva-gold">Best</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            THE SHIVA ke asal teachers — jinki profile, subjects aur courses tum platform par khud dekh sakte ho.
          </p>
        </div>

        {shown.length === 0 ? (
          <div className="shiva-glass rounded-3xl px-8 py-12 max-w-2xl mx-auto text-center">
            <p className="text-white font-bold text-lg mb-2">Faculty profiles jald aa rahi hain</p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Verified teachers THE SHIVA se jud rahe hain. Profiles publish hote hi yahan dikhengi —
              tab tak published courses se shuruaat karo.
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
          <>
            <div className={`grid gap-6 lg:gap-8 max-w-5xl mx-auto ${shown.length === 1 ? 'md:grid-cols-1 max-w-xl' : 'md:grid-cols-2'}`}>
              {shown.map((t) => {
                const name = t.displayName || t.name;
                const photo = t.photoUrl || t.logoUrl || undefined;
                const subjects = parseSubjects(t.subjects);
                const specialties: string[] = Array.isArray(t.specialties) ? t.specialties : [];
                const subjectLine = subjects.length > 0 ? subjects.join(' • ') : specialties[0] || undefined;
                const exp = Number(t.experienceYears) || 0;
                const about = t.bio || t.description || undefined;
                const headline = t.tagline || t.qualification || undefined;

                return (
                  <article
                    key={t.slug || t.id || name}
                    className="shiva-glass rounded-3xl p-7 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-[#6d28d9]/20"
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt={name}
                        loading="lazy"
                        className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl object-cover ring-2 ring-[#f5b942]/30 group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl flex items-center justify-center font-black text-4xl ring-2 ring-[#f5b942]/30"
                        style={{ background: 'linear-gradient(135deg,#2a1650,#6d28d9)', color: '#f5b942' }}
                        aria-hidden="true"
                      >
                        {initialsOf(name)}
                      </div>
                    )}

                    <div className="text-center sm:text-left space-y-2.5 min-w-0">
                      <div>
                        <h3 className="text-2xl font-bold text-white leading-snug">{name}</h3>
                        {t.verified ? (
                          <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: '#c4b5fd' }}>
                            ✓ Verified Educator
                          </p>
                        ) : null}
                      </div>

                      {headline && (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
                          style={{ background: 'rgba(245,185,66,0.10)', color: '#f5b942', borderColor: 'rgba(245,185,66,0.35)' }}
                        >
                          {headline}
                        </span>
                      )}

                      {subjectLine && (
                        <p className="text-sm text-slate-300">
                          <span className="text-slate-500 font-semibold">Subjects: </span>
                          <span className="font-medium">{subjectLine}</span>
                        </p>
                      )}

                      {exp > 0 && (
                        <p className="text-sm text-slate-400">
                          🎓 {exp} {exp === 1 ? 'year' : 'years'} teaching experience
                        </p>
                      )}

                      {about && <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{about}</p>}

                      {t.slug && (
                        <Link
                          href={`/teachers/${t.slug}`}
                          className="inline-block pt-1 text-sm font-bold transition-colors"
                          style={{ color: '#f5b942' }}
                        >
                          View Profile →
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Link href="/teachers" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                Sabhi teachers dekho →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
