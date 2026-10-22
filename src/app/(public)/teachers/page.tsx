import Link from 'next/link';
import { listEducators } from '@/services/educator.service';
import { listActiveEducators } from '@/lib/db';
import THEShivaLogo from '@/components/brand/THEShivaLogo';

export const metadata = {
  title: 'Teachers — THE SHIVA',
  description:
    'Meet the teachers and educator partners on THE SHIVA — real profiles, real subjects, and the courses they actually teach.',
};

// Render at request time — page depends on live DB data (TeacherProfiles)
export const revalidate = 0;

/* ------------------------------------------------------------------ */
/*  Normalizers — TeacherProfiles rows aur EducatorProfile seed       */
/*  objects dono shapes aate hain; sirf asal field ho tabhi dikhao.   */
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
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

function photoOf(t: TeacherRow): string | undefined {
  return t.photoUrl || t.logoUrl || t.avatarUrl || undefined;
}

function aboutOf(t: TeacherRow): string | undefined {
  return t.bio || t.description || undefined;
}

function isActive(t: TeacherRow): boolean {
  if (!t.status) return true;
  return String(t.status).toLowerCase() === 'active';
}

async function loadTeachers(): Promise<{ teachers: TeacherRow[]; failed: boolean }> {
  const byKey = new Map<string, TeacherRow>();
  let failed = false;

  const addAll = (rows: TeacherRow[]) => {
    for (const r of rows || []) {
      if (!r || !isActive(r)) continue;
      const key = r.slug || r.id || r.userId;
      if (!key) continue;
      // Pehli (active-list) entry ko priority — duplicate merge me asal fields bhardo
      if (!byKey.has(key)) byKey.set(key, r);
    }
  };

  try {
    addAll((await listActiveEducators()) as TeacherRow[]);
  } catch {
    failed = true;
  }
  try {
    addAll((await listEducators()) as TeacherRow[]);
  } catch {
    failed = true;
  }

  const teachers = Array.from(byKey.values()).filter((t) => t.displayName || t.name);
  return { teachers, failed: failed && teachers.length === 0 };
}

function TeacherCard({ teacher }: { teacher: TeacherRow }) {
  const name = teacher.displayName || teacher.name || 'Teacher';
  const photo = photoOf(teacher);
  const about = aboutOf(teacher);
  const subjects = parseSubjects(teacher.subjects);
  const specialties: string[] = Array.isArray(teacher.specialties) ? teacher.specialties : [];
  const chips = [...subjects, ...specialties.filter((s) => !subjects.includes(s))];
  const exp = Number(teacher.experienceYears) || 0;
  const href = teacher.slug ? `/teachers/${teacher.slug}` : undefined;

  const card = (
    <article className="shiva-feature-card h-full flex flex-col p-6 sm:p-7 group">
      {/* Avatar + verified */}
      <div className="flex items-start justify-between mb-5">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#f5b942]/30"
            loading="lazy"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl ring-2 ring-[#f5b942]/30"
            style={{
              background: 'linear-gradient(135deg,#2a1650 0%,#6d28d9 100%)',
              color: '#f5b942',
            }}
            aria-hidden="true"
          >
            {initialsOf(name) || 'S'}
          </div>
        )}
        {teacher.verified ? (
          <span className="shiva-capsule shiva-capsule-violet">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </span>
        ) : null}
      </div>

      {/* Name + qualification / tagline (sirf asal data) */}
      <h3 className="text-xl font-bold text-white leading-snug">{name}</h3>
      {teacher.tagline ? (
        <p className="text-sm font-semibold mt-1.5" style={{ color: '#f5b942' }}>
          {teacher.tagline}
        </p>
      ) : teacher.qualification ? (
        <p className="text-sm font-semibold mt-1.5" style={{ color: '#f5b942' }}>
          {teacher.qualification}
        </p>
      ) : null}

      {/* Experience — sirf jab asal saal दर्ज ho */}
      {exp > 0 && (
        <p className="text-xs text-slate-400 font-semibold mt-2 flex items-center gap-1.5">
          <span aria-hidden="true">🎓</span> {exp} {exp === 1 ? 'year' : 'years'} teaching experience
        </p>
      )}

      {/* About excerpt */}
      {about && <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mt-3">{about}</p>}

      {/* Subjects / specialties */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {chips.slice(0, 3).map((chip) => (
            <span
              key={chip}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
              style={{
                background: 'rgba(109,40,217,0.16)',
                color: '#c4b5fd',
                borderColor: 'rgba(109,40,217,0.4)',
              }}
            >
              {chip}
            </span>
          ))}
          {chips.length > 3 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-slate-400 border border-white/10">
              +{chips.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer link */}
      <div className="mt-auto pt-5">
        {href ? (
          <span className="text-sm font-bold inline-flex items-center gap-1.5" style={{ color: '#f5b942' }}>
            View Profile
            <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">
              →
            </span>
          </span>
        ) : (
          <span className="text-sm font-semibold text-slate-500">Profile on THE SHIVA</span>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full" aria-label={`${name} — teacher profile`}>
      {card}
    </Link>
  ) : (
    card
  );
}

export default async function TeachersPage() {
  const { teachers, failed } = await loadTeachers();

  return (
    <div
      className="min-h-screen relative py-20 sm:py-24 px-6 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 55% at 20% 0%, rgba(109,40,217,0.22) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 85% 20%, rgba(245,185,66,0.08) 0%, transparent 60%), linear-gradient(180deg,#2a1650 0%,#170b33 340px,#0a0a12 720px)',
      }}
    >
      <div className="shiva-blob w-[520px] h-[520px] top-[-120px] right-[-140px]" style={{ background: '#6d28d9' }} aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[420px] h-[420px] bottom-[-100px] left-[-100px]" style={{ background: '#f5b942' }} aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">THE SHIVA Faculty</span>
          <h1 className="text-shiva-section text-white">
            Meet Your <span className="text-shiva-gold">Teachers</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Real teachers and educator partners teaching on THE SHIVA. Har profile wahi dikhata hai jo
            teacher ne khud joda hai — subjects, qualification aur unke asal courses.
          </p>
          {teachers.length > 0 && (
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c4b5fd' }}>
              {teachers.length} {teachers.length === 1 ? 'educator' : 'educators'} on the platform
            </p>
          )}
        </div>

        {/* Grid / states */}
        {failed ? (
          <div className="max-w-xl mx-auto text-center shiva-glass rounded-3xl px-8 py-12">
            <THEShivaLogo size={52} variant="icon" />
            <h2 className="text-lg font-bold text-white mt-5 mb-2">Teacher profiles load nahi ho paye</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Kuch takneeki dikkat aayi hai. Thodi der baad page dobara kholo — profiles yahin milengi.
            </p>
            <Link
              href="/teachers"
              className="inline-block px-6 py-3 rounded-full text-sm font-bold text-[#2a1650] transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#f5b942,#e8d5a3)' }}
            >
              Dobara Try Karo
            </Link>
          </div>
        ) : teachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.slug || teacher.id || teacher.userId} teacher={teacher} />
            ))}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center shiva-glass rounded-3xl px-8 py-12">
            <THEShivaLogo size={52} variant="icon" />
            <h2 className="text-lg font-bold text-white mt-5 mb-2">Abhi koi teacher profile publish nahi hai</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              THE SHIVA par educator profiles jald hi yahan dikhengi. Tab tak hamare published courses
              dekho aur apni taiyaari shuru karo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/courses"
                className="inline-block px-6 py-3 rounded-full text-sm font-bold text-[#2a1650] transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#f5b942,#e8d5a3)' }}
              >
                Courses Dekho
              </Link>
              <Link
                href="/register"
                className="inline-block px-6 py-3 rounded-full text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-all"
              >
                Free Register Karo
              </Link>
            </div>
          </div>
        )}

        {/* Platform strip + CTA */}
        {teachers.length > 0 && (
          <div className="mt-20 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl border border-[#f5b942]/20 bg-gradient-to-r from-[#2a1650]/80 to-transparent">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <THEShivaLogo size={52} variant="icon" />
              <div className="flex-1">
                <h2 className="text-base font-bold text-white mb-1">Padhai shuru karne ke liye taiyaar ho?</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Inhi teachers ke courses, batches aur live classes THE SHIVA par milte hain — ek hi
                  account se sab kuch.
                </p>
              </div>
              <Link
                href="/register"
                className="shrink-0 inline-block px-7 py-3.5 rounded-full text-sm font-bold text-[#2a1650] shadow-lg transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#f5b942,#e8d5a3)' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
