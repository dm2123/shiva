'use client';

/**
 * StudyHomeClient — student study home (dashboard /app ke neeche
 * mount hota hai). PW grammar (light): safed panel, pastel tiles,
 * safed course cards responsive grid me (1/2/3 columns).
 *
 *   • Quick actions row (student app ke asal routes: Community,
 *     Downloads, Tests, DPP, Library, Bookmarks, My Courses)
 *   • "Study Material" exam-category grid (graduation-cap tiles) —
 *     tiles FIXED list nahi hain: sirf wohi exams jinke asal courses
 *     ya batches data me maujood hain
 *   • Batches search bar (submit → /batches?q=…, type karne par
 *     neeche ke courses live filter hote hain)
 *   • Exam ke hisaab se course grids + "View All →"
 *   • Browse by Teachers (asal educator data; photo na ho ya load
 *     fail ho to initials wala pastel tile — kisi aur ki photo
 *     kabhi nahi; subjects poori text me, truncate nahi)
 *
 * THUMBNAIL RULE: seed/legacy Courses.thumbnailUrl aksar aisi
 * paths hoti hain jinki file disk par hoti hi nahi (jaise
 * /assets/courses/ssc-cgl.jpg — public/assets/courses exist hi
 * nahi karta). Isliye image fail hote hi designed brand-gradient
 * tile (course title ki typography ke saath) dikhta hai —
 * kaala dabba/alt-text kabhi nahi. (Public CourseCard wala hi
 * pattern.)
 *
 * FAVORITES NOTE: platform ka bookmarks system sirf content ke liye
 * hai (lecture/note/DPP/PYQ) — course-level favorites kahin wired
 * nahi hain, isliye yahan koi Favorites toggle NAHI hai.
 *
 * HONEST-DATA RULE: sirf asal Course/Educator fields render hote hain.
 * Koi count, price, teacher ya status invent nahi hota; data na ho
 * to honest empty state dikhta hai.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { deriveExamCategory } from './CourseCard';

export type StudyCourse = {
  id: string;
  title: string;
  slug: string;
  price: number;
  thumbnailUrl?: string;
  educatorId?: string;
  language?: string;
};

export type StudyTeacher = {
  id: string;
  displayName: string;
  slug: string;
  logoUrl?: string;
  subjects: string[];
};

const VIOLET = '#6d28d9';

const BANNER_GRADIENTS = [
  'linear-gradient(120deg,#2a1650,#6d28d9)',
  'linear-gradient(120deg,#4c1d95,#7c3aed)',
  'linear-gradient(120deg,#312e81,#6d28d9)',
  'linear-gradient(120deg,#2a1650,#8b5cf6)',
];

function gradientFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length];
}

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
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

/* Graduation-cap glyph (apna SVG) */
export function CapIcon({ size = 40, color = '#6d28d9' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 3.6 1.8 8.7 12 13.8l8.7-4.35v6.05h1.5V8.7L12 3.6Z" />
      <path d="M5.9 11.35v4.1c0 1.66 2.73 3 6.1 3s6.1-1.34 6.1-3v-4.1l-6.1 3.05-6.1-3.05Z" />
    </svg>
  );
}

/* Tile pradarshan ka kram — tile sirf tab banta hai jab label asal
   course categories ya batch exams me maujood ho (neeche computed). */
const TILE_ORDER = [
  'SSC',
  'Railway',
  'Banking',
  'Defence',
  'Teaching',
  'UPSC',
  'NEET',
  'JEE',
  'State Exams',
  'Foundation',
];

/* Study-material tiles ke pastel rang (PW dashboard wali halki feel) */
const TILE_PASTELS = [
  { bg: 'bg-violet-50', border: 'border-violet-100', cap: '#6d28d9' },
  { bg: 'bg-sky-50', border: 'border-sky-100', cap: '#0284c7' },
  { bg: 'bg-amber-50', border: 'border-amber-100', cap: '#d97706' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', cap: '#059669' },
  { bg: 'bg-rose-50', border: 'border-rose-100', cap: '#e11d48' },
  { bg: 'bg-orange-50', border: 'border-orange-100', cap: '#ea580c' },
  { bg: 'bg-indigo-50', border: 'border-indigo-100', cap: '#4f46e5' },
  { bg: 'bg-teal-50', border: 'border-teal-100', cap: '#0d9488' },
];

/* Quick actions — student app ke asal maujood routes hi hain.
   Koi dead button nahi: har tile ek live page par jata hai. */
const QUICK_ACTIONS: { label: string; href: string; icon: string }[] = [
  { label: 'Community', href: '/app/community', icon: '💬' },
  { label: 'Downloads', href: '/app/offline-downloads', icon: '⬇️' },
  { label: 'Tests', href: '/app/tests', icon: '📝' },
  { label: 'DPP Practice', href: '/app/dpp', icon: '🎯' },
  { label: 'Library', href: '/app/library', icon: '📚' },
  { label: 'Bookmarks', href: '/app/bookmarks', icon: '🔖' },
  { label: 'My Courses', href: '/app/my-courses', icon: '🎓' },
];

const CARD = 'bg-white border border-gray-200 rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.05)]';
const VIEW_ALL = 'shrink-0 rounded-full bg-violet-50 px-4 py-1.5 text-[13px] font-bold text-[#6d28d9] transition hover:bg-violet-100';

export default function StudyHomeClient({
  courses,
  teachers,
  batchExams,
}: {
  courses: StudyCourse[];
  teachers: StudyTeacher[];
  /** Asal batches se derive hue exam labels (server se). */
  batchExams: string[];
}) {
  const [query, setQuery] = useState('');
  /* Load fail hue thumbnails/photos — inke badle designed fallback */
  const [failedThumbs, setFailedThumbs] = useState<ReadonlySet<string>>(new Set());
  const [failedPhotos, setFailedPhotos] = useState<ReadonlySet<string>>(new Set());
  const markThumbFailed = (id: string) =>
    setFailedThumbs((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  const markPhotoFailed = (id: string) =>
    setFailedPhotos((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const teacherNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of teachers) map.set(t.id, t.displayName);
    return map;
  }, [teachers]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!q) return courses;
    return courses.filter((c) =>
      `${c.title} ${c.slug.replace(/-/g, ' ')} ${c.educatorId ? teacherNameById.get(c.educatorId) || '' : ''}`
        .toLowerCase()
        .includes(q),
    );
  }, [courses, q, teacherNameById]);

  /* Exam ke hisaab se groups — category sirf course ke apne title/slug se */
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; icon: string; items: StudyCourse[] }>();
    for (const c of visible) {
      const cat = deriveExamCategory(c);
      const key = cat?.id ?? '__other__';
      const entry = map.get(key);
      if (entry) entry.items.push(c);
      else
        map.set(key, {
          label: cat?.label ?? 'Baaki Courses',
          icon: cat?.icon ?? '📚',
          items: [c],
        });
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.label === 'Baaki Courses') return 1;
      if (b.label === 'Baaki Courses') return -1;
      return b.items.length - a.items.length;
    });
  }, [visible]);

  /* Study Material tiles — sirf asal data wale exams:
     course categories (title/slug se derive) ∪ batch exams (server).
     Batch wala exam /batches?exam=… par, sirf-course wala /courses par. */
  const tiles = useMemo(() => {
    const courseLabels = new Set<string>();
    for (const c of courses) {
      const cat = deriveExamCategory(c);
      if (cat) courseLabels.add(cat.label);
    }
    const batchSet = new Set(batchExams);
    return TILE_ORDER.filter((label) => courseLabels.has(label) || batchSet.has(label)).map(
      (label) => ({
        label,
        href: batchSet.has(label) ? `/batches?exam=${encodeURIComponent(label)}` : '/courses',
      }),
    );
  }, [courses, batchExams]);

  const renderCard = (course: StudyCourse) => {
    const isFree = (Number(course.price) || 0) <= 0;
    const cat = deriveExamCategory(course);
    const teacherName = course.educatorId ? teacherNameById.get(course.educatorId) : undefined;
    const thumbUsable =
      typeof course.thumbnailUrl === 'string' &&
      course.thumbnailUrl.trim().length > 0 &&
      !failedThumbs.has(course.id);
    return (
      <article
        key={course.id}
        className={`group flex w-full flex-col overflow-hidden transition hover:shadow-md ${CARD}`}
      >
        <Link href={`/courses/${course.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-gray-100" aria-label={course.title}>
          {thumbUsable ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              loading="lazy"
              onError={() => markThumbFailed(course.id)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center"
              style={{ background: gradientFor(course.slug) }}
              aria-hidden="true"
            >
              <CapIcon size={40} color="rgba(255,255,255,0.9)" />
              <span className="line-clamp-2 text-[15px] font-extrabold leading-snug text-white">{course.title}</span>
            </span>
          )}
          {cat && (
            <span className="absolute left-3 top-3 rounded-full bg-[#6d28d9]/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
              {cat.label}
            </span>
          )}
          {isFree && (
            <span className="absolute bottom-3 left-3 rounded-md bg-red-500 px-2.5 py-1 text-[11px] font-extrabold text-white shadow">
              Free
            </span>
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <Link href={`/courses/${course.slug}`}>
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#6d28d9]">{course.title}</h3>
          </Link>
          {teacherName && <p className="text-[13px] text-gray-500">{teacherName}</p>}
          {course.language && <p className="text-[12px] text-gray-400">{course.language}</p>}
          <div className="mt-auto flex items-center justify-between pt-2">
            {isFree ? (
              <span className="text-[15px] font-extrabold text-emerald-600">FREE</span>
            ) : (
              <span className="text-[15px] font-extrabold text-gray-900">{formatINR(Number(course.price) || 0)}</span>
            )}
            <Link
              href={`/courses/${course.slug}`}
              className="text-[13px] font-bold text-[#6d28d9]"
              aria-label={`${course.title} — details dekho`}
            >
              Details →
            </Link>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section id="study-home" className="py-8">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* ---------- Study Material panel ---------- */}
        <div className={`${CARD} p-4 sm:p-6`}>
          {/* Search bar — submit par asal batches search khulta hai */}
          <form method="get" action="/batches" role="search" className="mb-6 flex items-stretch gap-2">
            <div className="relative flex-1">
              <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.8-3.8" />
                </svg>
              </span>
              <input
                type="search"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search batches…"
                aria-label="Batches search karo"
                className="w-full rounded-[10px] border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-[10px] bg-gray-900 px-5 text-sm font-bold text-white transition hover:bg-black"
            >
              Khojo
            </button>
          </form>

          {/* Quick actions — student app ke asal routes */}
          <nav aria-label="Quick actions" className="mb-6">
            <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_ACTIONS.map((action) => (
                <li key={action.href} className="shrink-0">
                  <Link
                    href={action.href}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] font-bold text-gray-700 transition hover:border-violet-300 hover:text-gray-900"
                  >
                    <span aria-hidden="true">{action.icon}</span>
                    {action.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Panel header */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-gray-900 sm:text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-violet-50 text-[#6d28d9]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5.5C10.6 4.2 8.6 3.6 6.5 3.6c-1 0-2 .13-3 .38v14.1c1-.25 2-.38 3-.38 2.1 0 4.1.6 5.5 1.9 1.4-1.3 3.4-1.9 5.5-1.9 1 0 2 .13 3 .38V3.98c-1-.25-2-.38-3-.38-2.1 0-4.1.6-5.5 1.9Zm0 1.7c1.2-.9 2.8-1.4 4.5-1.45v11.1c-1.7.05-3.3.55-4.5 1.45-1.2-.9-2.8-1.4-4.5-1.45V5.75c1.7.05 3.3.55 4.5 1.45Z" />
                </svg>
              </span>
              Study Material
            </h2>
            <span className="text-xs font-semibold text-gray-400">Exam ke hisaab se chuno</span>
          </div>

          {/* Category tiles — sirf asal data me maujood exams.
              Ek bhi exam derive na ho to grid hi nahi banta. */}
          {tiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tiles.map((tile, i) => {
                const pastel = TILE_PASTELS[i % TILE_PASTELS.length];
                return (
                  <Link
                    key={tile.label}
                    href={tile.href}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-6 text-center transition hover:shadow-sm ${pastel.bg} ${pastel.border}`}
                    aria-label={`${tile.label} exam ke batches aur courses`}
                  >
                    <CapIcon size={42} color={pastel.cap} />
                    <span className="text-[15px] font-bold leading-tight text-gray-900">{tile.label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">Exam</span>
                  </Link>
                );
              })}
              <Link
                href="/courses"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/60 px-3 py-6 text-center transition hover:bg-violet-50"
                aria-label="Saare courses dekho"
              >
                <span className="text-2xl font-black text-[#6d28d9]" aria-hidden="true">→</span>
                <span className="text-[15px] font-bold leading-tight text-gray-900">Saare Courses</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">View All</span>
              </Link>
            </div>
          )}
        </div>

        {/* ---------- Content: exam groups / search results ---------- */}
        {courses.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <div className="mb-3 text-4xl opacity-40" aria-hidden="true">📚</div>
            <h3 className="mb-2 text-base font-bold text-gray-900">Courses jald aa rahe hain</h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
              Hum naye courses taiyaar kar rahe hain. Free me register karo aur sabse pehle
              khabar pao jab naye courses launch hon.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-block rounded-full bg-gray-900 px-7 py-3 text-sm font-bold text-white transition hover:bg-black"
            >
              Register Free →
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <h3 className="mb-2 text-base font-bold text-gray-900">{`“${query}” se match karta koi course nahi mila`}</h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
              Spelling check karo ya dusra naam likh kar dekho — saare courses neeche
              categories me bhi mile hue hain.
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-5 rounded-full border border-[#6d28d9] px-6 py-2.5 text-sm font-bold"
              style={{ color: VIOLET }}
            >
              Search saaf karo
            </button>
          </div>
        ) : q ? (
          <>
            <p className="mt-6 text-sm text-gray-500">
              <span className="font-bold text-gray-900">{`${visible.length}`}</span>
              {` ${visible.length === 1 ? 'course mila' : 'courses mile'} · “${query}”`}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map(renderCard)}
            </div>
          </>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mt-9">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 sm:text-xl">
                  <span aria-hidden="true">{group.icon}</span>
                  <span>{group.label}</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-600">
                    {`${group.items.length}`}
                  </span>
                </h3>
                <Link href="/courses" className={VIEW_ALL}>
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map(renderCard)}
              </div>
            </div>
          ))
        )}

        {/* ---------- Browse by Teachers ---------- */}
        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-gray-900 sm:text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-violet-50 text-[#6d28d9]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12.5a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 12.5Zm0 2c-3.6 0-8 1.8-8 4.5V20h16v-1c0-2.7-4.4-4.5-8-4.5Z" />
                </svg>
              </span>
              Browse by Teachers
            </h2>
            <Link href="/teachers" className={VIEW_ALL}>
              View All →
            </Link>
          </div>

          {teachers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <h3 className="mb-2 text-base font-bold text-gray-900">Educators jald aa rahe hain</h3>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
                Hamari teaching team ki profiles yahan jald dikhengi. Tab tak courses
                dekh kar apni taiyaari shuru karo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {teachers.map((t) => {
                const photoUsable =
                  typeof t.logoUrl === 'string' && t.logoUrl.trim().length > 0 && !failedPhotos.has(t.id);
                return (
                  <Link
                    key={t.id}
                    href={`/teachers/${t.slug}`}
                    className={`group flex flex-col overflow-hidden transition hover:shadow-md ${CARD}`}
                    aria-label={`${t.displayName} ki profile dekho`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-violet-50">
                      {photoUsable ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.logoUrl}
                          alt={t.displayName}
                          loading="lazy"
                          onError={() => markPhotoFailed(t.id)}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-100 via-violet-200 to-violet-300 text-5xl font-black text-[#6d28d9]"
                          aria-hidden="true"
                        >
                          {initialsOf(t.displayName)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3.5">
                      <h3 className="truncate text-[15px] font-bold text-gray-900">{t.displayName}</h3>
                      {t.subjects.length > 0 && (
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">{t.subjects.join(' · ')}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
