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

function formatPrice(price: unknown): string | null {
  if (price === null || price === undefined || price === '') return null;
  const n = Number(price);
  if (Number.isNaN(n)) return null;
  return n > 0 ? `₹${n.toLocaleString('en-IN')}` : 'Free';
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
  const specialties: string[] = Array.isArray(educator.specialties) ? educator.specialties : [];
  const examCategories: string[] = Array.isArray(educator.examCategories) ? educator.examCategories : [];

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
    <div
      className="min-h-screen py-14 sm:py-20 px-6"
      style={{
        background:
          'radial-gradient(ellipse 75% 45% at 15% 0%, rgba(109,40,217,0.20) 0%, transparent 60%), linear-gradient(180deg,#2a1650 0%,#170b33 300px,#0a0a12 640px)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-slate-400">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/teachers" className="hover:text-white transition-colors">
                Teachers
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-white font-semibold" aria-current="page">
              {name}
            </li>
          </ol>
        </nav>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="shiva-feature-card p-7 sm:p-10 mb-8" style={{ borderColor: 'rgba(245,185,66,0.22)' }}>
          <div className="flex flex-col md:flex-row items-start gap-7 sm:gap-9">
            {/* Photo / branded initial avatar */}
            <div className="flex-shrink-0">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={name}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-[#f5b942]/30"
                />
              ) : (
                <div
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center font-black text-5xl ring-4 ring-[#f5b942]/30"
                  style={{ background: 'linear-gradient(135deg,#2a1650 0%,#6d28d9 100%)', color: '#f5b942' }}
                  aria-hidden="true"
                >
                  {initialsOf(name)}
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{name}</h1>
                {educator.verified ? (
                  <span className="shiva-capsule shiva-capsule-violet">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Educator
                  </span>
                ) : null}
              </div>

              {(tagline || qualification) && (
                <p className="text-base sm:text-lg font-bold mb-3" style={{ color: '#f5b942' }}>
                  {tagline || qualification}
                </p>
              )}

              {/* Meta chips — sirf asal data */}
              {(exp > 0 || subjects.length > 0 || courses.length > 0) && (
                <div className="flex flex-wrap gap-2.5 mb-5">
                  {exp > 0 && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-200">
                      🎓 {exp} {exp === 1 ? 'year' : 'years'} experience
                    </span>
                  )}
                  {subjects.length > 0 && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-200">
                      📚 {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                    </span>
                  )}
                  {courses.length > 0 && (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-200">
                      🎬 {courses.length} {courses.length === 1 ? 'course' : 'courses'} on THE SHIVA
                    </span>
                  )}
                </div>
              )}

              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {subjects.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{ background: 'rgba(109,40,217,0.16)', color: '#c4b5fd', borderColor: 'rgba(109,40,217,0.4)' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mt-5">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold text-sm bg-white/5 hover:bg-white/10 text-slate-200 transition-all inline-flex items-center gap-2"
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

        {/* ── Content grid ───────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <section className="shiva-feature-card p-7 sm:p-8" aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-xl sm:text-2xl font-bold text-white mb-4">
                About {name}
              </h2>
              {about ? (
                <p className="text-base text-slate-300 leading-relaxed whitespace-pre-line">{about}</p>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed">
                  Is educator ne abhi apna detailed parichay (bio) nahi joda hai. Neeche unke subjects aur
                  courses se unki teaching samjhi ja sakti hai — jaise hi bio update hoga, woh yahin dikhega.
                </p>
              )}
              {qualification && tagline && qualification !== tagline && (
                <p className="text-sm text-slate-400 mt-4">
                  <span className="text-slate-500 font-bold uppercase text-xs tracking-wider block mb-1">Qualification</span>
                  {qualification}
                </p>
              )}
            </section>

            {/* Specialties */}
            {specialties.length > 0 && (
              <section className="shiva-feature-card p-7 sm:p-8" aria-labelledby="specialties-heading">
                <h2 id="specialties-heading" className="text-xl sm:text-2xl font-bold text-white mb-5">
                  Teaching Specialties
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="px-3.5 py-1.5 rounded-full text-sm font-semibold border"
                      style={{ background: 'rgba(245,185,66,0.10)', color: '#f5b942', borderColor: 'rgba(245,185,66,0.35)' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Subjects (full list) */}
            {subjects.length > 0 && (
              <section className="shiva-feature-card p-7 sm:p-8" aria-labelledby="subjects-heading">
                <h2 id="subjects-heading" className="text-xl sm:text-2xl font-bold text-white mb-5">
                  Subjects Taught
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {subjects.map((s) => (
                    <div
                      key={s}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold text-sm"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Exam categories */}
            {examCategories.length > 0 && (
              <section className="shiva-feature-card p-7 sm:p-8" aria-labelledby="exams-heading">
                <h2 id="exams-heading" className="text-xl sm:text-2xl font-bold text-white mb-5">
                  Exam Categories
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {examCategories.map((c) => (
                    <span key={c} className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-white/5 border border-white/10 text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Courses by this teacher */}
            <section aria-labelledby="teacher-courses-heading">
              <div className="flex items-end justify-between gap-4 mb-5 px-1">
                <h2 id="teacher-courses-heading" className="text-xl sm:text-2xl font-bold text-white">
                  Courses by {name}
                </h2>
                <Link href="/courses" className="text-sm font-bold shrink-0 hover:underline" style={{ color: '#f5b942' }}>
                  All courses →
                </Link>
              </div>

              {courses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-5">
                  {courses.map((course: any) => {
                    const price = formatPrice(course.price);
                    return (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug || course.id}`}
                        className="shiva-course-card block group"
                      >
                        {course.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-36 object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="w-full h-36 flex items-end p-5"
                            style={{ background: 'linear-gradient(135deg,#2a1650 0%,#6d28d9 90%)' }}
                            aria-hidden="true"
                          >
                            <span className="font-black text-3xl" style={{ color: '#f5b942' }}>
                              {initialsOf(String(course.title || 'C'))}
                            </span>
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-bold text-white leading-snug line-clamp-2 group-hover:text-[#e8d5a3] transition-colors">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mt-2">{course.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                            {price ? (
                              <span className="text-sm font-black" style={{ color: '#f5b942' }}>
                                {price}
                              </span>
                            ) : (
                              <span />
                            )}
                            <span className="text-sm font-bold text-slate-200 group-hover:translate-x-0.5 transition-transform">
                              View Course →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="shiva-feature-card p-7 sm:p-8 text-center">
                  <p className="text-white font-semibold mb-2">Abhi is teacher ka koi published course nahi hai</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">
                    Jaise hi {name} ka course publish hoga, woh yahin dikhega. Tab tak baaki courses dekho.
                  </p>
                  <Link
                    href="/courses"
                    className="inline-block px-6 py-3 rounded-full text-sm font-bold text-[#2a1650] transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg,#f5b942,#e8d5a3)' }}
                  >
                    Browse All Courses
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {hasSidebarContact && (
              <div className="shiva-feature-card p-6">
                <h3 className="text-base font-bold text-white mb-4">Contact</h3>
                <div className="space-y-4 text-sm">
                  {educator.email && (
                    <div>
                      <p className="text-slate-500 uppercase font-bold text-[11px] tracking-wider mb-1">Email</p>
                      <a href={`mailto:${educator.email}`} className="hover:underline break-all" style={{ color: '#f5b942' }}>
                        {educator.email}
                      </a>
                    </div>
                  )}
                  {educator.website && (
                    <div>
                      <p className="text-slate-500 uppercase font-bold text-[11px] tracking-wider mb-1">Website</p>
                      <a
                        href={educator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                        style={{ color: '#f5b942' }}
                      >
                        {String(educator.website).replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="shiva-feature-card p-6">
              <h3 className="text-base font-bold text-white mb-3">Explore THE SHIVA</h3>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/teachers"
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-200 transition-colors"
                >
                  ← Sabhi Teachers
                </Link>
                <Link
                  href="/courses"
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-200 transition-colors"
                >
                  Courses Dekho
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-3 rounded-xl text-sm font-bold text-[#2a1650] text-center transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#f5b942,#e8d5a3)' }}
                >
                  Free Register Karo
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-[#f5b942]/20 bg-gradient-to-br from-[#2a1650]/70 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <THEShivaLogo size={36} variant="icon" />
                <p className="text-sm font-bold text-white">THE SHIVA par padh rahe ho</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {name} THE SHIVA platform par teaching karte hain. Enroll karke inke courses, batches aur
                live classes ek hi jagah milte hain.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
