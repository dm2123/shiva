import Link from 'next/link';
import { listEducators } from '@/services/educator.service';
import { listActiveEducators } from '@/lib/db';
import THEShivaLogo from '@/components/brand/THEShivaLogo';
import TeachersExplorer, { type TeacherCardData } from './TeachersExplorer';

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

/** Server row → client explorer ke liye serializable, sirf asal fields. */
function toCardData(t: TeacherRow): TeacherCardData {
  return {
    key: String(t.slug || t.id || t.userId || t.displayName || t.name),
    name: t.displayName || t.name || 'Teacher',
    slug: t.slug || undefined,
    photo: photoOf(t),
    subjects: parseSubjects(t.subjects),
    specialties: Array.isArray(t.specialties) ? t.specialties.map(String) : [],
    exp: Number(t.experienceYears) || 0,
    qualification: t.qualification || undefined,
    tagline: t.tagline || undefined,
    about: aboutOf(t),
    verified: Boolean(t.verified),
  };
}

const emptyPanelStyle: React.CSSProperties = {
  maxWidth: 620,
  margin: '0 auto',
  textAlign: 'center',
  background: '#12121a',
  border: '2px dashed #37316b',
  borderRadius: 20,
  padding: '40px 30px',
  boxShadow: '0 10px 30px rgba(0,0,0,.45)',
};

export default async function TeachersPage() {
  const { teachers, failed } = await loadTeachers();
  const cards = teachers.map(toCardData);

  return (
    <div className="shiva-landing">
      <section
        style={{
          paddingTop: 48,
          paddingBottom: 72,
          background: 'linear-gradient(180deg,#171233 0%,#0d0d13 55%)',
        }}
      >
        <div className="wrap">
          {/* Header — design language: ~32px extra-bold safed + lavender-grey
              subtitle (dark theme; .sec-head ke light rang inline override) */}
          <div className="sec-head">
            <span
              className="kicker"
              style={{
                background: 'rgba(109,40,217,.18)',
                color: '#c4b5fd',
                border: '1px solid rgba(109,40,217,.45)',
              }}
            >
              THE SHIVA Faculty
            </span>
            <h2 style={{ color: '#ffffff' }}>
              Meet Your{' '}
              <span className="hl" style={{ color: '#a78bfa' }}>
                Teachers
              </span>
            </h2>
            <p style={{ color: '#a5a0d0' }}>
              Real teachers and educator partners teaching on THE SHIVA. Har profile wahi dikhata
              hai jo asal data me hai — subjects, experience aur unke asal courses. Neeche naam ya
              subject se khojo.
            </p>
            {teachers.length > 0 && (
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: '#f5b942',
                  marginTop: 12,
                }}
              >
                {teachers.length} {teachers.length === 1 ? 'educator' : 'educators'} on the platform
              </p>
            )}
          </div>

          {/* Grid / states */}
          {failed ? (
            <div style={emptyPanelStyle} role="status">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <THEShivaLogo size={52} variant="icon" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '16px 0 8px' }}>
                Teacher profiles load nahi ho paye
              </h3>
              <p style={{ fontSize: 14.5, color: '#a5a0d0', lineHeight: 1.65, marginBottom: 22 }}>
                Kuch takneeki dikkat aayi hai. Thodi der baad page dobara kholo — profiles yahin
                milengi.
              </p>
              <Link href="/teachers" className="btn btn-primary">
                Dobara Try Karo
              </Link>
            </div>
          ) : cards.length > 0 ? (
            <TeachersExplorer teachers={cards} />
          ) : (
            <div style={emptyPanelStyle} role="status">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <THEShivaLogo size={52} variant="icon" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '16px 0 8px' }}>
                Abhi koi teacher profile publish nahi hai
              </h3>
              <p style={{ fontSize: 14.5, color: '#a5a0d0', lineHeight: 1.65, marginBottom: 22 }}>
                THE SHIVA par educator profiles jald hi yahan dikhengi. Tab tak hamare published
                courses dekho aur apni taiyaari shuru karo.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                <Link href="/courses" className="btn btn-primary">
                  Courses Dekho
                </Link>
                <Link
                  href="/register"
                  className="btn"
                  style={{ background: '#f5b942', color: '#2a1650' }}
                >
                  Free Register Karo
                </Link>
              </div>
            </div>
          )}

          {/* Bottom CTA — dark deep→violet gradient panel (footer/header
              wali hi dark brand language) */}
          {teachers.length > 0 && (
            <div
              style={{
                marginTop: 48,
                background: 'linear-gradient(120deg,#2a1650 0%,#6d28d9 100%)',
                border: '1px solid rgba(167,139,250,.35)',
                borderRadius: 24,
                padding: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
                flexWrap: 'wrap',
                boxShadow: '0 18px 44px rgba(0,0,0,.5)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                  Padhai shuru karne ke liye taiyaar ho?
                </h2>
                <p style={{ color: '#d6ceff', fontSize: 15, lineHeight: 1.65, maxWidth: 560 }}>
                  Inhi teachers ke courses, batches aur live classes THE SHIVA par milte hain — ek
                  hi account se sab kuch.
                </p>
              </div>
              <Link
                href="/register"
                className="btn"
                style={{ background: '#f5b942', color: '#2a1650', flexShrink: 0 }}
              >
                Get Started →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
