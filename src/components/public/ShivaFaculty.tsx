import Link from 'next/link';
import Reveal from './Reveal';
import { listActiveEducators } from '@/services/educator.service';

/* ------------------------------------------------------------------ */
/*  Landing "Our Educators" section — asal active teacher profiles    */
/*  hi dikhte hain. Data na ho to honest empty panel, koi placeholder */
/*  teacher invent nahi hota. CSS: shiva-landing.css (.teacher etc.)  */
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

export default async function ShivaFaculty() {
  let teachers: TeacherRow[] = [];
  try {
    teachers = ((await listActiveEducators()) as TeacherRow[]).filter((t) => t && (t.displayName || t.name));
  } catch {
    teachers = [];
  }
  const shown = teachers.slice(0, 5);

  return (
    <section id="faculty" style={{ background: '#fff', padding: '72px 0' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Our Educators</span>
          <h2>
            Our Expert <span className="hl">Educators</span>
          </h2>
          <p>THE SHIVA par padhane wale asal teachers — unke subjects aur profiles ke saath.</p>
        </Reveal>

        {shown.length === 0 ? (
          <Reveal>
            <div
              style={{
                maxWidth: 640,
                margin: '0 auto',
                textAlign: 'center',
                background: '#faf8ff',
                border: '2px dashed #ddd6fe',
                borderRadius: 20,
                padding: '36px 28px',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  margin: '0 auto 14px',
                  background: 'linear-gradient(135deg,#2a1650,#6d28d9)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 900,
                }}
                aria-hidden="true"
              >
                S
              </div>
              <b style={{ display: 'block', fontSize: 17, color: '#1e1b2e', marginBottom: 6 }}>
                Teacher profiles jald aa rahi hain
              </b>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>
                Hum verified educators ko THE SHIVA par jod rahe hain. Jaise hi profiles publish hongi,
                woh yahin dikhengi — tab tak courses dekhkar apni taiyaari shuru karo.
              </p>
              <Link
                href="/courses"
                style={{
                  display: 'inline-block',
                  marginTop: 18,
                  background: '#6d28d9',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '11px 22px',
                  borderRadius: 12,
                }}
              >
                Courses Dekho →
              </Link>
            </div>
          </Reveal>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
                gap: 18,
                maxWidth: shown.length >= 4 ? undefined : 860,
                margin: '0 auto',
              }}
            >
              {shown.map((t, i) => {
                const name = t.displayName || t.name;
                const photo = t.photoUrl || t.logoUrl || undefined;
                const subjects = parseSubjects(t.subjects);
                const specialties: string[] = Array.isArray(t.specialties) ? t.specialties : [];
                const subjectLine = subjects[0] || specialties[0] || t.qualification || undefined;
                const exp = Number(t.experienceYears) || 0;
                const about = t.bio || t.description || undefined;

                const card = (
                  <div
                    className="teacher"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt={name}
                        loading="lazy"
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          margin: '0 auto 12px',
                          display: 'block',
                          border: '3px solid #ddd6fe',
                          background: '#f5f3ff',
                        }}
                      />
                    ) : (
                      <div
                        className="av"
                        style={{
                          background: 'linear-gradient(135deg,#2a1650,#6d28d9)',
                          color: '#fff',
                          fontWeight: 900,
                          border: '3px solid #ddd6fe',
                        }}
                        aria-hidden="true"
                      >
                        {initialsOf(name)}
                      </div>
                    )}
                    <b style={{ fontSize: 16 }}>{name}</b>
                    {subjectLine && <span>{subjectLine}</span>}
                    {/* Grey experience pill — SIRF asal experienceYears par */}
                    {exp > 0 && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: 9,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#4b5563',
                          background: '#f3f4f6',
                          border: '1px solid #e5e7eb',
                          padding: '5px 12px',
                          borderRadius: 999,
                        }}
                      >
                        🎓 {exp} {exp === 1 ? 'Year' : 'Years'} Exp
                      </span>
                    )}
                    {about && (
                      <p
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {about}
                      </p>
                    )}
                    {/* Detail arrow — profile wale cards par */}
                    {t.slug && (
                      <span
                        aria-hidden="true"
                        style={{
                          marginTop: 'auto',
                          paddingTop: 14,
                          display: 'inline-flex',
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: '2px solid #6d28d9',
                            color: '#6d28d9',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        >
                          →
                        </span>
                      </span>
                    )}
                  </div>
                );

                return (
                  <Reveal key={t.slug || t.id || name} delay={i % 5}>
                    {t.slug ? (
                      <Link href={`/teachers/${t.slug}`} aria-label={`${name} — teacher profile`} style={{ display: 'block', height: '100%' }}>
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </Reveal>
                );
              })}
            </div>

            <Reveal>
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <Link href="/teachers" style={{ color: '#6d28d9', fontWeight: 700, fontSize: 15 }}>
                  Sabhi teachers dekho →
                </Link>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
