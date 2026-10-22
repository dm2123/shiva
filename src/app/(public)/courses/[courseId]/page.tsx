import type { Metadata } from 'next';
import { getCourseSyllabusTree } from '@/services/academic.service';
import { getEducatorById } from '@/services/educator.service';
import { notFound } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { mysqlPool } from '@/lib/db';
import type { EducatorProfile } from '@/types/educator';
import CourseDetailClient, {
  type BatchDTO,
  type FreeLectureDTO,
  type SubjectDTO,
} from './CourseDetailClient';
import { formatDuration } from './format';

export const revalidate = 0;

const PURPLE_DARK = '#2a1650';
const GOLD = '#f5b942';

export async function generateMetadata({
  params,
}: {
  params: { courseId: string };
}): Promise<Metadata> {
  const tree = await getCourseSyllabusTree(params.courseId).catch(() => null);
  if (!tree || !tree.isPublished) {
    return { title: 'Course Not Found — THE SHIVA' };
  }
  return {
    title: `${tree.title} — THE SHIVA`,
    description:
      tree.description?.slice(0, 160) ||
      `${tree.title} — structured course on THE SHIVA with recorded lectures, batches and free demo content.`,
    openGraph: {
      title: `${tree.title} — THE SHIVA`,
      description: tree.description?.slice(0, 160) || '',
      images: tree.thumbnailUrl ? [{ url: tree.thumbnailUrl }] : [],
    },
  };
}

export default async function PublicCourseDetailPage({ params }: { params: { courseId: string } }) {
  let courseTree;
  try {
    courseTree = await getCourseSyllabusTree(params.courseId);
  } catch (err) {
    notFound();
  }

  if (!courseTree.isPublished) {
    notFound();
  }

  // Fetch educator if course has one (original wiring — unchanged)
  let educator: EducatorProfile | null = null;
  if (courseTree.educatorId) {
    educator = await getEducatorById(courseTree.educatorId).catch(() => null);
  }

  // Additional teachers: distinct educators attached to this course's batches.
  // Best-effort only — a failure here never breaks the page.
  const teachersById = new Map<string, EducatorProfile>();
  if (educator) teachersById.set(educator.id, educator);
  const batchEducatorIds = Array.from(
    new Set(
      (courseTree.batches || [])
        .map((b: any) => b.educatorId as string | undefined)
        .filter((id): id is string => !!id && !teachersById.has(id))
    )
  );
  for (const id of batchEducatorIds) {
    const extra = await getEducatorById(id).catch(() => null);
    if (extra) teachersById.set(extra.id, extra);
  }
  const teachers = Array.from(teachersById.values());

  const session = await getSessionFromHeaders(headers()).catch(() => null);
  let isEnrolled = false;
  if (session?.role === 'STUDENT') {
    const [rows]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS c FROM StudentEnrollments WHERE studentId = ? AND courseId = ? AND status = ?',
      [session.userId, courseTree.id, 'ACTIVE']
    ).catch(() => [[]]);
    isEnrolled = Number(rows?.[0]?.c || 0) > 0;
  }

  const ctaHref = !session
    ? '/register'
    : session.role === 'STUDENT' && isEnrolled
      ? `/app/learn/${courseTree.slug || courseTree.id}`
      : session.role === 'STUDENT'
        ? `/app/courses/${courseTree.slug || courseTree.id}`
        : session.role === 'TEACHER'
          ? '/teacher'
          : '/admin';
  const ctaLabel = !session
    ? 'Enroll Now — Free Register'
    : session.role === 'STUDENT' && isEnrolled
      ? 'Continue Learning →'
      : session.role === 'STUDENT'
        ? 'Enroll Now'
        : 'Go to Dashboard';

  /* ---------------- Honest, real-data-only derivations ---------------- */
  const raw: any = courseTree as any;
  // Price: number > 0 = paid, 0 = free, null/undefined = not published yet.
  const priceValue: number | null =
    raw.price === null || raw.price === undefined || Number.isNaN(Number(raw.price))
      ? null
      : Number(raw.price);
  const isFree = priceValue === 0;
  // Discount ONLY when a genuine higher list price exists on the record.
  const listPrice: number | null =
    raw.originalPrice ?? raw.mrp ?? raw.listPrice ?? null;
  const hasDiscount =
    priceValue !== null && listPrice !== null && Number(listPrice) > priceValue;
  const discountPct = hasDiscount
    ? Math.round((1 - priceValue / Number(listPrice)) * 100)
    : null;
  // Optional meta — rendered only when the record actually carries it.
  const rating: number | null =
    typeof raw.rating === 'number' && raw.rating > 0 ? raw.rating : null;
  const ratingCount: number | null =
    typeof raw.ratingCount === 'number' && raw.ratingCount > 0 ? raw.ratingCount : null;
  const enrolledCount: number | null =
    typeof raw.enrolledCount === 'number' && raw.enrolledCount > 0
      ? raw.enrolledCount
      : typeof raw.studentsCount === 'number' && raw.studentsCount > 0
        ? raw.studentsCount
        : null;
  const language: string | null =
    typeof raw.language === 'string' && raw.language.trim() ? raw.language : null;
  const validityLabel: string | null =
    typeof raw.validity === 'string' && raw.validity.trim()
      ? raw.validity
      : typeof raw.validityMonths === 'number' && raw.validityMonths > 0
        ? `${raw.validityMonths} mahine ki validity`
        : typeof raw.validityDays === 'number' && raw.validityDays > 0
          ? `${raw.validityDays} din ki validity`
          : null;

  const subjectsDTO: SubjectDTO[] = (courseTree.subjects || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    description: s.description,
    chapters: (s.chapters || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      lectures: (c.lectures || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        durationSeconds: l.durationSeconds,
        isPreviewable: !!l.isPreviewable,
      })),
    })),
  }));

  const batchesDTO: BatchDTO[] = (courseTree.batches || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    startDate: b.startDate,
    endDate: b.endDate,
    status: b.status,
  }));

  const chapterCount = subjectsDTO.reduce((n, s) => n + s.chapters.length, 0);
  const allLectures = subjectsDTO.flatMap((s) =>
    s.chapters.flatMap((c) => c.lectures.map((l) => ({ ...l, subjectName: s.name, chapterTitle: c.title })))
  );
  const lectureCount = allLectures.length;
  const totalSeconds = allLectures.reduce((n, l) => n + (l.durationSeconds || 0), 0);
  const freeLectures: FreeLectureDTO[] = allLectures.filter((l) => l.isPreviewable);
  const totalDurationLabel = formatDuration(totalSeconds);

  // Where free-preview / lecture clicks should land.
  const previewHref = isEnrolled
    ? `/app/learn/${courseTree.slug || courseTree.id}`
    : ctaHref;

  // "Ye course kiske liye hai" — from real exam categories / subjects only.
  const audiencePoints: string[] = [];
  const examCats = Array.from(
    new Set(teachers.flatMap((t) => t.examCategories || []))
  ).slice(0, 3);
  for (const cat of examCats) audiencePoints.push(`${cat} exam ki taiyaari karne wale students`);
  if (subjectsDTO.length > 0) {
    audiencePoints.push(
      `${subjectsDTO.slice(0, 3).map((s) => s.name).join(', ')}${subjectsDTO.length > 3 ? ' jaise subjects' : ''} ko basics se strong karna chahte hain`
    );
  }
  if (freeLectures.length > 0) {
    audiencePoints.push('Pehle free demo dekh kar faisla lene wale students');
  }

  const activeBatch = batchesDTO.find((b) => b.status === 'ACTIVE');
  const nextBatch =
    activeBatch || batchesDTO.find((b) => b.status === 'UPCOMING') || batchesDTO[0];

  const priceBlock = (compact = false) => {
    if (priceValue === null) {
      return (
        <span style={{ display: 'block' }}>
          <span style={{ fontSize: compact ? 16 : 20, fontWeight: 800, display: 'block', lineHeight: 1.35 }}>
            Price jankari ke liye login karein
          </span>
          <span style={{ fontSize: 12.5, opacity: 0.85, display: 'block', marginTop: 4 }}>
            Is course ki fee abhi publish nahi hui hai.
          </span>
        </span>
      );
    }
    if (isFree) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: compact ? 26 : 34, fontWeight: 900, color: '#059669' }}>FREE</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            100% FREE COURSE
          </span>
        </span>
      );
    }
    return (
      <span style={{ display: 'block' }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: compact ? 24 : 34, fontWeight: 900, color: '#6d28d9' }}>
            ₹{priceValue.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span style={{ fontSize: compact ? 14 : 17, color: '#9ca3af', textDecoration: 'line-through' }}>
              ₹{Number(listPrice).toLocaleString('en-IN')}
            </span>
          )}
        </span>
        {hasDiscount && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 11.5,
              fontWeight: 800,
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 11px',
              borderRadius: 999,
            }}
          >
            {discountPct}% OFF — Discount applied
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="shiva-landing">
      <section style={{ paddingTop: 32, paddingBottom: 72 }}>
        <div className="wrap">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
            <Link href="/" style={{ color: 'var(--brand)' }}>Home</Link>
            {' / '}
            <Link href="/courses" style={{ color: 'var(--brand)' }}>Courses</Link>
            {' / '}
            <span>{courseTree.title}</span>
          </nav>

          {/* ================= HERO ================= */}
          <div
            style={{
              background: `linear-gradient(120deg, ${PURPLE_DARK} 0%, #4c1d95 55%, #6d28d9 100%)`,
              color: '#fff',
              borderRadius: 22,
              boxShadow: '0 18px 44px rgba(42,22,80,.35)',
              overflow: 'hidden',
              marginBottom: 26,
            }}
          >
            <div
              style={{ display: 'grid', gridTemplateColumns: courseTree.thumbnailUrl ? '1.6fr .9fr' : '1fr', gap: 0 }}
              className="cd-hero-grid"
            >
              <div style={{ padding: '34px 32px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    background: 'rgba(245,185,66,.18)',
                    border: `1px solid ${GOLD}`,
                    color: GOLD,
                    padding: '6px 14px',
                    borderRadius: 999,
                    marginBottom: 14,
                  }}
                >
                  📖 THE SHIVA Course
                </span>
                <h1 style={{ fontSize: 'clamp(32px, 4.2vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.18, letterSpacing: -0.5, color: '#fff' }}>
                  {courseTree.title}
                </h1>
                {courseTree.description && (
                  <p
                    style={{
                      fontSize: 15,
                      opacity: 0.92,
                      lineHeight: 1.7,
                      maxWidth: 620,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {courseTree.description}
                  </p>
                )}

                {/* Teacher line — real educator only */}
                {educator && (
                  <Link
                    href={`/teachers/${educator.slug}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 16, color: '#fff' }}
                  >
                    {educator.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={educator.logoUrl}
                        alt={educator.displayName}
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${GOLD}` }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: GOLD,
                          color: PURPLE_DARK,
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                        }}
                      >
                        {(educator.displayName || 'T')[0].toUpperCase()}
                      </span>
                    )}
                    <span style={{ fontSize: 14 }}>
                      <span style={{ opacity: 0.8 }}>Padhane wale: </span>
                      <strong>{educator.displayName}</strong>
                      {educator.verified && <span style={{ color: GOLD, fontWeight: 800 }}> ✓</span>}
                      {educator.tagline && (
                        <span style={{ display: 'block', fontSize: 12.5, opacity: 0.85 }}>{educator.tagline}</span>
                      )}
                    </span>
                  </Link>
                )}

                {/* Meta row — every item below exists only with real data */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: 22, fontSize: 13.5 }}>
                  {rating !== null && (
                    <span>⭐ <strong>{rating.toFixed(1)}</strong>{ratingCount !== null ? ` (${ratingCount.toLocaleString('en-IN')} ratings)` : ''}</span>
                  )}
                  {enrolledCount !== null && (
                    <span>👥 <strong>{enrolledCount.toLocaleString('en-IN')}</strong> students enrolled</span>
                  )}
                  {lectureCount > 0 && <span>🎬 <strong>{lectureCount}</strong> lectures</span>}
                  {totalDurationLabel && <span>⏱️ Kul <strong>{totalDurationLabel}</strong> content</span>}
                  {language && <span>🗣️ Language: <strong>{language}</strong></span>}
                  {validityLabel && <span>📅 <strong>{validityLabel}</strong></span>}
                  {freeLectures.length > 0 && (
                    <span style={{ color: GOLD, fontWeight: 700 }}>🎁 {freeLectures.length} free demo lectures</span>
                  )}
                  {nextBatch && (
                    <span>
                      🗓️ Batch: <strong>{nextBatch.name}</strong>
                      {nextBatch.startDate
                        ? ` · ${new Date(nextBatch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} se`
                        : ''}
                    </span>
                  )}
                </div>
              </div>

              {courseTree.thumbnailUrl && (
                <div style={{ position: 'relative', minHeight: 220 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={courseTree.thumbnailUrl}
                    alt={courseTree.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ================= MAIN + STICKY CARD ================= */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'start' }} className="course-detail-grid">
            {/* Main column — tabbed content */}
            <div style={{ minWidth: 0 }}>
              <CourseDetailClient
                description={courseTree.description}
                subjects={subjectsDTO}
                batches={batchesDTO}
                teachers={teachers}
                freeLectures={freeLectures}
                previewHref={previewHref}
                isEnrolled={isEnrolled}
                meta={{ language, validityLabel }}
              />
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="cd-sidebar">
              {/* Sticky enroll / price card — map pattern:
                  safed card, ONLINE ribbon, banner, title, language pill,
                  bold rang-daar price + grey kata MRP + halki-green discount
                  chip, aur poora KAALA solid CTA. Saare price elements
                  sirf asal record data par hi render hote hain. */}
              <div
                style={{
                  background: '#fff',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: 20,
                  boxShadow: '0 16px 40px rgba(42,22,80,.14)',
                  position: 'sticky',
                  top: 84,
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative' }}>
                  {courseTree.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={courseTree.thumbnailUrl}
                      alt=""
                      style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      background: PURPLE_DARK,
                      color: '#fff',
                      padding: '5px 11px',
                      borderRadius: 999,
                    }}
                  >
                    ONLINE
                  </span>
                </div>
                <div style={{ padding: 22 }}>
                  <h2
                    style={{
                      fontSize: 16.5,
                      fontWeight: 800,
                      color: PURPLE_DARK,
                      lineHeight: 1.4,
                      marginBottom: 8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {courseTree.title}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {language && (
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#4b5563',
                          border: '1.5px solid var(--line)',
                          padding: '4px 11px',
                          borderRadius: 999,
                        }}
                      >
                        🗣️ {language}
                      </span>
                    )}
                    {validityLabel && (
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#4b5563',
                          border: '1.5px solid var(--line)',
                          padding: '4px 11px',
                          borderRadius: 999,
                        }}
                      >
                        📅 {validityLabel}
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', marginBottom: 6 }}>
                    Course Fee
                  </span>
                  <div style={{ marginBottom: 18 }}>{priceBlock()}</div>

                  <Link
                    href={ctaHref}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      padding: '14px',
                      fontSize: 16,
                      fontWeight: 800,
                      background: '#111111',
                      color: '#fff',
                      borderRadius: 12,
                      textDecoration: 'none',
                    }}
                  >
                    {ctaLabel}
                  </Link>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>
                    {session?.role === 'STUDENT' && isEnrolled
                      ? '✅ Tum enrolled ho — padhai jaari rakho!'
                      : priceValue === null
                        ? 'Login karke course ki poori jankari aur enrollment dekho.'
                        : isFree
                          ? 'Free registration — koi payment nahi lagega.'
                          : '📱 Login karke enroll karo'}
                  </p>

                  {/* Includes — real counts only, green check sirf asal par */}
                  {(lectureCount > 0 || freeLectures.length > 0 || batchesDTO.length > 0 || validityLabel || language) && (
                    <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
                        Is course me shamil hai
                      </p>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 13.5, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {lectureCount > 0 && (
                          <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#059669', fontWeight: 900 }}>✓</span><span>{lectureCount} recorded lectures{totalDurationLabel ? ` (${totalDurationLabel})` : ''}</span></li>
                        )}
                        {chapterCount > 0 && (
                          <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#059669', fontWeight: 900 }}>✓</span><span>{subjectsDTO.length} subjects · {chapterCount} chapters</span></li>
                        )}
                        {freeLectures.length > 0 && (
                          <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#059669', fontWeight: 900 }}>✓</span><span>{freeLectures.length} free demo lectures</span></li>
                        )}
                        {batchesDTO.length > 0 && (
                          <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#059669', fontWeight: 900 }}>✓</span><span>{batchesDTO.length} batch option{batchesDTO.length === 1 ? '' : 's'}</span></li>
                        )}
                        {language && (
                          <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#059669', fontWeight: 900 }}>✓</span><span>Language: {language}</span></li>
                        )}
                        {validityLabel && (
                          <li style={{ display: 'flex', gap: 8 }}><span style={{ color: '#059669', fontWeight: 900 }}>✓</span><span>{validityLabel}</span></li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Ye course kiske liye hai */}
              {audiencePoints.length > 0 && (
                <div className="batch" style={{ padding: 22 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: PURPLE_DARK, marginBottom: 12 }}>
                    🎯 Ye course kiske liye hai?
                  </h3>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {audiencePoints.map((point) => (
                      <li key={point} style={{ fontSize: 13.5, color: '#374151', display: 'flex', gap: 8, lineHeight: 1.55 }}>
                        <span style={{ color: '#059669', fontWeight: 900 }}>✓</span>
                        <span>Jo {point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Educator mini-card */}
              {educator && (
                <div className="batch" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: PURPLE_DARK, marginBottom: 12 }}>
                    👨‍🏫 Educator
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {educator.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={educator.logoUrl}
                        alt={educator.displayName}
                        style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg,#2a1650,#6d28d9)',
                          color: '#fff',
                          fontSize: 20,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {(educator.displayName || 'E')[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <b style={{ fontSize: 15 }}>{educator.displayName}</b>
                      {educator.verified && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#166534', marginLeft: 6 }}>✓ VERIFIED</span>
                      )}
                      {educator.tagline && (
                        <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600 }}>{educator.tagline}</p>
                      )}
                      <Link href={`/teachers/${educator.slug}`} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--brand)' }}>
                        Profile dekho →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Quality note */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
                  border: '2px solid #fcd34d',
                }}
              >
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.7 }}>
                  <strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>🏆 THE SHIVA Quality</strong>
                  Har course quality-checked hai — verified educators, structured syllabus, aur jo
                  content dikhaya gaya hai wahi milta hai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MOBILE STICKY BAR ================= */}
      <div className="cd-mobile-bar" role="navigation" aria-label="Course enrollment">
        <div style={{ minWidth: 0 }}>
          {priceValue === null ? (
            <span style={{ fontSize: 12.5, fontWeight: 700, color: PURPLE_DARK, lineHeight: 1.3, display: 'block' }}>
              Price ke liye login karein
            </span>
          ) : isFree ? (
            <span style={{ fontSize: 19, fontWeight: 900, color: '#059669' }}>FREE</span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontSize: 19, fontWeight: 900, color: '#6d28d9' }}>
                ₹{priceValue.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: 12.5, color: '#9ca3af', textDecoration: 'line-through' }}>
                    ₹{Number(listPrice).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#166534' }}>
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </span>
          )}
          <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
            {courseTree.title}
          </span>
        </div>
        <Link
          href={ctaHref}
          style={{
            padding: '12px 22px',
            fontSize: 14.5,
            fontWeight: 800,
            background: '#111111',
            color: '#fff',
            borderRadius: 12,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {session?.role === 'STUDENT' && isEnrolled ? 'Continue →' : 'Enroll Now'}
        </Link>
      </div>

      <style>{`
        .cd-mobile-bar { display: none; }
        @media (max-width: 900px) {
          .course-detail-grid { grid-template-columns: 1fr !important; }
          .cd-hero-grid { grid-template-columns: 1fr !important; }
          .cd-sidebar { order: -1; }
          .cd-mobile-bar {
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 80;
            background: #fff; border-top: 2px solid var(--line);
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
            box-shadow: 0 -8px 24px rgba(42,22,80,.14);
          }
        }
      `}</style>
    </div>
  );
}
