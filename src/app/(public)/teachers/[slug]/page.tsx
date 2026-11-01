import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEducatorBySlug } from '@/services/educator.service';
import { listCoursesDb, getTeacherAssignmentsDb, findCourseByIdDb } from '@/lib/db';
import THEShivaLogo from '@/components/brand/THEShivaLogo';

interface PageProps {
  params: { slug: string };
}

/* ------------------------------------------------------------------ */
/*  Normalizers — asal TeacherProfiles row fields hi use hote hain.   */
/*  Jo field data me nahi, wo section page par dikhta hi nahi.        */
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

function parseStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  return parseSubjects(raw);
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

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Asal MRP — sirf tab jab course row me originalPrice/mrp field asal me
 * maujood ho aur price se zyada ho. Field na ho to MRP/OFF kuch nahi
 * dikhta (invent NAHI hota — CourseCard.tsx wala hi niyam).
 */
function readMrp(course: any): number {
  const value = Number(course?.originalPrice ?? course?.mrp);
  return Number.isFinite(value) ? value : 0;
}

/** Teacher ke asal published courses — educatorId match + course assignments dono se. */
async function loadTeacherCourses(teacher: TeacherRow): Promise<any[]> {
  const keys = [teacher.id, teacher.userId].filter(Boolean).map(String);
  if (keys.length === 0) return [];
  const seen = new Set<string>();
  const out: any[] = [];
  const push = (c: any) => {
    if (!c || !c.id || seen.has(String(c.id))) return;
    const published = c.isPublished === true || c.isPublished === 1 || c.status === 'PUBLISHED';
    if (!published) return;
    seen.add(String(c.id));
    out.push(c);
  };

  try {
    const published = await listCoursesDb(false);
    for (const c of published as any[]) {
      if (c.educatorId && keys.includes(String(c.educatorId))) push(c);
    }
  } catch {
    /* courses unavailable — section honest empty state dikhayega */
  }

  for (const key of keys) {
    try {
      const assignments = await getTeacherAssignmentsDb(key);
      for (const a of assignments as any[]) {
        if (!a?.courseId || seen.has(String(a.courseId))) continue;
        const course = await findCourseByIdDb(a.courseId).catch(() => null);
        push(course);
      }
    } catch {
      /* assignments unavailable */
    }
  }

  return out.slice(0, 12);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const educator = (await getEducatorBySlug(params.slug).catch(() => null)) as TeacherRow | null;

  if (!educator) {
    return { title: 'Teacher Not Found — THE SHIVA' };
  }

  const name = educator.displayName || educator.name || 'Teacher';
  const about = educator.bio || educator.description || undefined;
  const photo = educator.photoUrl || educator.logoUrl || undefined;

  return {
    title: `${name} — Teacher at THE SHIVA`,
    description: about || `${name} ke subjects, profile aur courses THE SHIVA par dekho.`,
    openGraph: {
      title: `${name} — THE SHIVA`,
      description: about || '',
      images: photo ? [{ url: photo }] : [],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Shared dark-theme styles — #12121a rounded-2xl card, violet-dark  */
/*  border, gehri shadow (public dark standard ke saath)              */
/* ------------------------------------------------------------------ */

const darkCard: React.CSSProperties = {
  background: '#12121a',
  border: '2px solid #26224a',
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0,0,0,.45)',
};

const greyPill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12.5,
  fontWeight: 700,
  color: '#c4c0e8',
  background: '#1d1a33',
  border: '1px solid #37316b',
  padding: '6px 13px',
  borderRadius: 999,
};

const subjectChip: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: '#c4b5fd',
  background: 'rgba(109,40,217,.16)',
  border: '1px solid rgba(109,40,217,.38)',
  padding: '5px 12px',
  borderRadius: 999,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 21,
  fontWeight: 800,
  color: '#ffffff',
  marginBottom: 16,
  lineHeight: 1.3,
};

export default async function EducatorDetailPage({ params }: PageProps) {
  const educator = (await getEducatorBySlug(params.slug).catch(() => null)) as TeacherRow | null;

  if (!educator) {
    notFound();
  }

  const name = educator.displayName || educator.name || 'Teacher';
  const photo = educator.photoUrl || educator.logoUrl || educator.avatarUrl || undefined;
  const about = educator.bio || educator.description || undefined;
  const tagline = educator.tagline || undefined;
  const qualification = educator.qualification || undefined;
  const exp = Number(educator.experienceYears) || 0;
  const subjects = parseSubjects(educator.subjects);
  const specialties = parseStringList(educator.specialties);
  const examCategories = parseStringList(educator.examCategories);

  const courses = await loadTeacherCourses(educator);

  const socialLinks = [
    { name: 'YouTube', url: educator.youtubeUrl, icon: '▶' },
    { name: 'Telegram', url: educator.telegramUrl, icon: '✈' },
    { name: 'Facebook', url: educator.facebookUrl || educator.facebookPageUrl, icon: 'f' },
    { name: 'Instagram', url: educator.instagramUrl, icon: '📷' },
    { name: 'Twitter/X', url: educator.twitterUrl, icon: '𝕏' },
    { name: 'Website', url: educator.website, icon: '🌐' },
  ].filter((link) => link.url);

  const hasSidebarContact = Boolean(educator.email || educator.website);

  return (
    <div className="shiva-landing">
      <section
        style={{
          paddingTop: 36,
          paddingBottom: 72,
          background: 'linear-gradient(180deg,#171233 0%,#0d0d13 55%)',
        }}
      >
        <div className="wrap" style={{ maxWidth: 1080 }}>
          {/* Breadcrumb — chhota lavender-grey */}
          <nav style={{ marginBottom: 22, fontSize: 13.5, color: '#8b87b0' }} aria-label="Breadcrumb">
            <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <Link href="/" style={{ color: '#8b87b0' }}>
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/teachers" style={{ color: '#8b87b0' }}>
                  Teachers
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li style={{ color: '#ffffff', fontWeight: 700 }} aria-current="page">
                {name}
              </li>
            </ol>
          </nav>

          {/* ── Header — safed card, photo band pattern ──────────── */}
          <header style={{ ...darkCard, overflow: 'hidden', marginBottom: 26 }}>
            <div
              style={{
                background: 'linear-gradient(135deg,#2a1650 0%,#6d28d9 100%)',
                height: 10,
              }}
              aria-hidden="true"
            />
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                gap: 26,
                padding: '28px 30px 30px',
              }}
            >
              {/* Photo / branded initial avatar */}
              <div style={{ flexShrink: 0 }}>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={name}
                    style={{
                      width: 132,
                      height: 132,
                      borderRadius: 20,
                      objectFit: 'cover',
                      border: '3px solid #37316b',
                      background: '#241d4d',
                    }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 132,
                      height: 132,
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                      fontWeight: 900,
                      color: '#fff',
                      background: 'linear-gradient(135deg,#2a1650 0%,#6d28d9 100%)',
                    }}
                  >
                    {initialsOf(name)}
                  </div>
                )}
              </div>

              {/* Identity */}
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                    {name}
                  </h1>
                  {educator.verified ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        background: '#f5b942',
                        color: '#2a1650',
                        padding: '5px 11px',
                        borderRadius: 999,
                      }}
                    >
                      ✓ Verified Educator
                    </span>
                  ) : null}
                </div>

                {(tagline || qualification) && (
                  <p style={{ fontSize: 16.5, fontWeight: 700, color: '#a78bfa', marginBottom: 12 }}>
                    {tagline || qualification}
                  </p>
                )}

                {/* Meta pills — grey, sirf asal data */}
                {(exp > 0 || subjects.length > 0 || courses.length > 0) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {exp > 0 && (
                      <span style={greyPill}>
                        🎓 {exp} {exp === 1 ? 'Year' : 'Years'} Exp
                      </span>
                    )}
                    {subjects.length > 0 && (
                      <span style={greyPill}>
                        📚 {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                      </span>
                    )}
                    {courses.length > 0 && (
                      <span style={greyPill}>
                        🎬 {courses.length} {courses.length === 1 ? 'course' : 'courses'} on THE SHIVA
                      </span>
                    )}
                  </div>
                )}

                {subjects.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {subjects.slice(0, 5).map((s) => (
                      <span key={s} style={subjectChip}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {socialLinks.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 18 }}>
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 15px',
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 13.5,
                          background: '#17171f',
                          border: '2px solid #37316b',
                          color: '#e9e4ff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 7,
                        }}
                      >
                        <span aria-hidden="true">{link.icon}</span>
                        {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Content grid ─────────────────────────────────────── */}
          <div
            style={{ gap: 26, alignItems: 'start' }}
            className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px]"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0 }}>
              {/* About */}
              <section style={{ ...darkCard, padding: '26px 28px' }} aria-labelledby="about-heading">
                <h2 id="about-heading" style={sectionTitle}>
                  About {name}
                </h2>
                {about ? (
                  <p style={{ fontSize: 15.5, color: '#c4c0e8', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                    {about}
                  </p>
                ) : (
                  <p style={{ fontSize: 14.5, color: '#a5a0d0', lineHeight: 1.7 }}>
                    Is educator ne abhi apna detailed parichay (bio) nahi joda hai. Neeche unke
                    subjects aur courses se unki teaching samjhi ja sakti hai — jaise hi bio update
                    hoga, woh yahin dikhega.
                  </p>
                )}
                {qualification && tagline && qualification !== tagline && (
                  <div style={{ marginTop: 18 }}>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        color: '#8b87b0',
                        marginBottom: 5,
                      }}
                    >
                      Qualification
                    </p>
                    <p style={{ fontSize: 14.5, color: '#e9e4ff' }}>{qualification}</p>
                  </div>
                )}
              </section>

              {/* Specialties */}
              {specialties.length > 0 && (
                <section style={{ ...darkCard, padding: '26px 28px' }} aria-labelledby="specialties-heading">
                  <h2 id="specialties-heading" style={sectionTitle}>
                    Teaching Specialties
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {specialties.map((s) => (
                      <span key={s} style={{ ...subjectChip, fontSize: 13.5, padding: '7px 14px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Subjects (full list) */}
              {subjects.length > 0 && (
                <section style={{ ...darkCard, padding: '26px 28px' }} aria-labelledby="subjects-heading">
                  <h2 id="subjects-heading" style={sectionTitle}>
                    Subjects Taught
                  </h2>
                  <div className="grid sm:grid-cols-2" style={{ gap: 11 }}>
                    {subjects.map((s) => (
                      <div
                        key={s}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: '#17171f',
                          border: '1px solid #26224a',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Exam categories */}
              {examCategories.length > 0 && (
                <section style={{ ...darkCard, padding: '26px 28px' }} aria-labelledby="exams-heading">
                  <h2 id="exams-heading" style={sectionTitle}>
                    Exam Categories
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {examCategories.map((c) => (
                      <span key={c} style={greyPill}>
                        {c}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Courses by this teacher */}
              <section aria-labelledby="teacher-courses-heading">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginBottom: 18,
                    padding: '0 2px',
                  }}
                >
                  <h2
                    id="teacher-courses-heading"
                    style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}
                  >
                    Courses by {name}
                  </h2>
                  <Link
                    href="/courses"
                    style={{ fontSize: 14, fontWeight: 800, color: '#a78bfa', flexShrink: 0 }}
                  >
                    All courses →
                  </Link>
                </div>

                {courses.length > 0 ? (
                  <div className="grid sm:grid-cols-2" style={{ gap: 20 }}>
                    {courses.map((course: any) => {
                      const price = Number(course.price) || 0;
                      const isFree = price <= 0;
                      const mrp = readMrp(course);
                      const hasMrp = !isFree && mrp > price;
                      const discountPct = hasMrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
                      const href = `/courses/${course.slug || course.id}`;
                      return (
                        <article
                          key={course.id}
                          style={{ ...darkCard, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                          {course.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              loading="lazy"
                              style={{ width: '100%', height: 144, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              style={{
                                width: '100%',
                                height: 144,
                                display: 'flex',
                                alignItems: 'flex-end',
                                padding: 18,
                                background: 'linear-gradient(135deg,#2a1650 0%,#6d28d9 90%)',
                              }}
                            >
                              <span style={{ fontWeight: 900, fontSize: 30, color: '#fff' }}>
                                {initialsOf(String(course.title || 'C'))}
                              </span>
                            </div>
                          )}
                          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h3
                              style={{
                                fontSize: 16.5,
                                fontWeight: 800,
                                color: '#ffffff',
                                lineHeight: 1.35,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {course.title}
                            </h3>
                            {course.description && (
                              <p
                                style={{
                                  fontSize: 14,
                                  color: '#a5a0d0',
                                  lineHeight: 1.6,
                                  marginTop: 8,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {course.description}
                              </p>
                            )}

                            {/* Meta — sirf asal course fields */}
                            {(course.language || Number(course.validityMonths) > 0) && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                                {course.language && <span style={greyPill}>{course.language}</span>}
                                {Number(course.validityMonths) > 0 && (
                                  <span style={greyPill}>
                                    {Number(course.validityMonths)} months validity
                                  </span>
                                )}
                              </div>
                            )}

                            <div style={{ flex: 1 }} />

                            {/* Price row — bold price + grey kata MRP (sirf asal)
                                + green OFF (sirf asal discount par) */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 10,
                                marginTop: 16,
                                marginBottom: 14,
                              }}
                            >
                              {isFree ? (
                                <>
                                  <b style={{ fontSize: 20, color: '#34d399' }}>Free</b>
                                  <span style={{ fontSize: 12.5, color: '#a5a0d0', fontWeight: 600 }}>
                                    Poora access, koi fee nahi
                                  </span>
                                </>
                              ) : (
                                <>
                                  <b style={{ fontSize: 20, color: '#ffffff' }}>{formatINR(price)}</b>
                                  {hasMrp && (
                                    <s style={{ fontSize: 14, color: '#8b87b0', fontWeight: 600 }}>
                                      {formatINR(mrp)}
                                    </s>
                                  )}
                                  {hasMrp && discountPct > 0 && (
                                    <span
                                      style={{
                                        fontSize: 11.5,
                                        fontWeight: 800,
                                        color: '#34d399',
                                        background: 'rgba(52,211,153,.15)',
                                        padding: '3px 9px',
                                        borderRadius: 999,
                                      }}
                                    >
                                      {discountPct}% OFF
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* CTA row — kharid = solid KAALA, detail = outline arrow */}
                            <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
                              <Link
                                href={href}
                                style={{
                                  flex: 1,
                                  display: 'inline-block',
                                  textAlign: 'center',
                                  background: '#f5b942',
                                  color: '#2a1650',
                                  padding: '12px 18px',
                                  borderRadius: 12,
                                  fontWeight: 800,
                                  fontSize: 15,
                                }}
                                aria-label={
                                  isFree
                                    ? `${course.title} — free register karo`
                                    : `${course.title} — abhi enroll karo`
                                }
                              >
                                {isFree ? 'Register Now' : 'Buy Now'}
                              </Link>
                              <Link
                                href={href}
                                style={{
                                  width: 48,
                                  flexShrink: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'transparent',
                                  color: '#a78bfa',
                                  border: '2px solid #6d28d9',
                                  borderRadius: 12,
                                  fontWeight: 900,
                                  fontSize: 18,
                                }}
                                aria-label={`${course.title} — course details dekho`}
                              >
                                ›
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ ...darkCard, padding: '30px 28px', textAlign: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                      Abhi is teacher ka koi published course nahi hai
                    </p>
                    <p style={{ fontSize: 14.5, color: '#a5a0d0', lineHeight: 1.65, marginBottom: 20 }}>
                      Jaise hi {name} ka course publish hoga, woh yahin dikhega. Tab tak baaki
                      courses dekho.
                    </p>
                    <Link href="/courses" className="btn btn-primary">
                      Browse All Courses
                    </Link>
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {hasSidebarContact && (
                <div style={{ ...darkCard, padding: 24 }}>
                  <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
                    Contact
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14 }}>
                    {educator.email && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            color: '#8b87b0',
                            marginBottom: 4,
                          }}
                        >
                          Email
                        </p>
                        <a
                          href={`mailto:${educator.email}`}
                          style={{ color: '#a78bfa', fontWeight: 700, wordBreak: 'break-all' }}
                        >
                          {educator.email}
                        </a>
                      </div>
                    )}
                    {educator.website && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            color: '#8b87b0',
                            marginBottom: 4,
                          }}
                        >
                          Website
                        </p>
                        <a
                          href={educator.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#a78bfa', fontWeight: 700, wordBreak: 'break-all' }}
                        >
                          {String(educator.website).replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ ...darkCard, padding: 24 }}>
                <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#ffffff', marginBottom: 14 }}>
                  Explore THE SHIVA
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link
                    href="/teachers"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: '#17171f',
                      border: '1px solid #26224a',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    ← Sabhi Teachers
                  </Link>
                  <Link
                    href="/courses"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: '#17171f',
                      border: '1px solid #26224a',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    Courses Dekho
                  </Link>
                  <Link href="/register" className="btn btn-primary" style={{ textAlign: 'center' }}>
                    Free Register Karo
                  </Link>
                </div>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  border: '2px solid #26224a',
                  background: 'linear-gradient(135deg,#1e0f3d 0%,#12121a 100%)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <THEShivaLogo size={36} variant="icon" />
                  <p style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff' }}>
                    THE SHIVA par padh rahe ho
                  </p>
                </div>
                <p style={{ fontSize: 13, color: '#a5a0d0', lineHeight: 1.65 }}>
                  {name} THE SHIVA platform par teaching karte hain. Enroll karke inke courses,
                  batches aur live classes ek hi jagah milte hain.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
