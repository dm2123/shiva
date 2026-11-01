'use client';

/**
 * StudyHomeClient — student study home ka dark block (dashboard /app
 * ke neeche mount hota hai).
 *
 * Layout pattern (user ke bheje screenshots se): near-black panel,
 * violet accent, rounded-2xl cards —
 *   • Quick actions row (student app ke asal routes: Community,
 *     Downloads, Tests, DPP, Library, Bookmarks, My Courses)
 *   • "Study Material" exam-category grid (graduation-cap tiles) —
 *     tiles FIXED list nahi hain: sirf wohi exams jinke asal courses
 *     ya batches data me maujood hain
 *   • Batches search bar (submit → /batches?q=…, type karne par
 *     neeche ke courses live filter hote hain)
 *   • Exam ke hisaab se course carousels + "View All →"
 *   • Browse by Teachers (asal educator data; photo na ho to
 *     initials wala placeholder — kisi aur ki photo kabhi nahi)
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
const VIOLET_SOFT = '#c4b5fd';

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

/* Graduation-cap glyph (screenshot ke tiles wala pattern, apna SVG) */
export function CapIcon({ size = 40, color = '#8b5cf6' }: { size?: number; color?: string }) {
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
    return (
      <article
        key={course.id}
        className="group relative flex w-[268px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] transition-colors hover:border-[#6d28d9]/60"
      >
        <Link href={`/courses/${course.slug}`} className="relative block aspect-[16/9] overflow-hidden" aria-label={course.title}>
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: gradientFor(course.slug) }}
              aria-hidden="true"
            >
              <CapIcon size={54} color="rgba(255,255,255,0.9)" />
            </span>
          )}
          {cat && (
            <span className="absolute left-3 top-3 rounded-full bg-[#6d28d9]/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
              {cat.label}
            </span>
          )}
          {isFree && (
            <span className="absolute bottom-3 left-3 rounded-md bg-[#f87171] px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg">
              Free
            </span>
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <Link href={`/courses/${course.slug}`}>
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-white">{course.title}</h3>
          </Link>
          {teacherName && <p className="text-[13px] text-slate-400">{teacherName}</p>}
          <div className="mt-auto flex items-center justify-between pt-2">
            {isFree ? (
              <span className="text-[15px] font-extrabold text-emerald-400">FREE</span>
            ) : (
              <span className="text-[15px] font-extrabold text-white">{formatINR(Number(course.price) || 0)}</span>
            )}
            <Link
              href={`/courses/${course.slug}`}
              className="text-[13px] font-bold"
              style={{ color: VIOLET_SOFT }}
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
    <section id="study-home" className="bg-[#07070c] py-14 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* ---------- Study Material panel ---------- */}
        <div className="rounded-3xl border border-white/10 bg-[#0d0d13] p-5 sm:p-7">
          {/* Search bar — submit par asal batches search khulta hai */}
          <form method="get" action="/batches" role="search" className="mb-7 flex items-stretch gap-2">
            <div className="relative flex-1">
              <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
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
                className="w-full rounded-2xl border border-white/10 bg-[#12121a] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#6d28d9] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-2xl bg-[#6d28d9] px-5 text-sm font-bold text-white transition-colors hover:bg-[#7c3aed]"
            >
              Khojo
            </button>
          </form>

          {/* Quick actions — student app ke asal routes */}
          <nav aria-label="Quick actions" className="mb-7">
            <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_ACTIONS.map((action) => (
                <li key={action.href} className="shrink-0">
                  <Link
                    href={action.href}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-[#12121a] px-4 py-2.5 text-[13px] font-bold text-slate-200 transition-colors hover:border-[#6d28d9]/60 hover:text-white"
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
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold sm:text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d28d9]/20 text-[#a78bfa]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5.5C10.6 4.2 8.6 3.6 6.5 3.6c-1 0-2 .13-3 .38v14.1c1-.25 2-.38 3-.38 2.1 0 4.1.6 5.5 1.9 1.4-1.3 3.4-1.9 5.5-1.9 1 0 2 .13 3 .38V3.98c-1-.25-2-.38-3-.38-2.1 0-4.1.6-5.5 1.9Zm0 1.7c1.2-.9 2.8-1.4 4.5-1.45v11.1c-1.7.05-3.3.55-4.5 1.45-1.2-.9-2.8-1.4-4.5-1.45V5.75c1.7.05 3.3.55 4.5 1.45Z" />
                </svg>
              </span>
              Study Material
            </h2>
            <span className="text-xs font-semibold text-slate-500">Exam ke hisaab se chuno</span>
          </div>

          {/* Category tiles — sirf asal data me maujood exams.
              Ek bhi exam derive na ho to grid hi nahi banta. */}
          {tiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tiles.map((tile) => (
                <Link
                  key={tile.label}
                  href={tile.href}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#12121a] px-3 py-6 text-center transition-colors hover:border-[#6d28d9]/60 hover:bg-[#17171f]"
                  aria-label={`${tile.label} exam ke batches aur courses`}
                >
                  <CapIcon size={42} />
                  <span className="text-[15px] font-bold leading-tight">{tile.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Exam</span>
                </Link>
              ))}
              <Link
                href="/courses"
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#6d28d9]/50 bg-[#6d28d9]/10 px-3 py-6 text-center transition-colors hover:bg-[#6d28d9]/20"
                aria-label="Saare courses dekho"
              >
                <span className="text-2xl font-black" style={{ color: VIOLET_SOFT }} aria-hidden="true">→</span>
                <span className="text-[15px] font-bold leading-tight">Saare Courses</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">View All</span>
              </Link>
            </div>
          )}
        </div>

        {/* ---------- Content: exam groups / search results ---------- */}
        {courses.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-[#0d0d13] px-6 py-12 text-center">
            <div className="mb-3 text-4xl opacity-40" aria-hidden="true">📚</div>
            <h3 className="mb-2 text-base font-bold">Courses jald aa rahe hain</h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
              Hum naye courses taiyaar kar rahe hain. Free me register karo aur sabse pehle
              khabar pao jab naye courses launch hon.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-block rounded-full bg-[#6d28d9] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7c3aed]"
            >
              Register Free →
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-[#0d0d13] px-6 py-12 text-center">
            <h3 className="mb-2 text-base font-bold">“{query}” se match karta koi course nahi mila</h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
              Spelling check karo ya dusra naam likh kar dekho — saare courses neeche
              categories me bhi mile hue hain.
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-5 rounded-full border border-[#6d28d9]/60 px-6 py-2.5 text-sm font-bold"
              style={{ color: VIOLET_SOFT }}
            >
              Search saaf karo
            </button>
          </div>
        ) : q ? (
          <>
            <p className="mt-6 text-sm text-slate-400">
              <span className="font-bold text-white">{visible.length}</span>{' '}
              {visible.length === 1 ? 'course mila' : 'courses mile'} · “{query}”
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>article]:w-full">
              {visible.map(renderCard)}
            </div>
          </>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mt-9">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-extrabold sm:text-xl">
                  <span aria-hidden="true">{group.icon}</span> {group.label}
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
                    {group.items.length}
                  </span>
                </h3>
                <Link
                  href="/courses"
                  className="shrink-0 rounded-full border border-[#6d28d9]/50 px-4 py-1.5 text-[13px] font-bold transition-colors hover:bg-[#6d28d9]/15"
                  style={{ color: VIOLET_SOFT }}
                >
                  View All →
                </Link>
              </div>
              <div className="flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {group.items.map(renderCard)}
              </div>
            </div>
          ))
        )}

        {/* ---------- Browse by Teachers ---------- */}
        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold sm:text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6d28d9]/20 text-[#a78bfa]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12.5a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 12.5Zm0 2c-3.6 0-8 1.8-8 4.5V20h16v-1c0-2.7-4.4-4.5-8-4.5Z" />
                </svg>
              </span>
              Browse by Teachers
            </h2>
            <Link
              href="/teachers"
              className="shrink-0 rounded-full border border-[#6d28d9]/50 px-4 py-1.5 text-[13px] font-bold transition-colors hover:bg-[#6d28d9]/15"
              style={{ color: VIOLET_SOFT }}
            >
              View All →
            </Link>
          </div>

          {teachers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-[#0d0d13] px-6 py-10 text-center">
              <h3 className="mb-2 text-base font-bold">Educators jald aa rahe hain</h3>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
                Hamari teaching team ki profiles yahan jald dikhengi. Tab tak courses
                dekh kar apni taiyaari shuru karo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {teachers.map((t) => (
                <Link
                  key={t.id}
                  href={`/teachers/${t.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] transition-colors hover:border-[#6d28d9]/60"
                  aria-label={`${t.displayName} ki profile dekho`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {t.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.logoUrl}
                        alt={t.displayName}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] text-5xl font-black text-white/90"
                        aria-hidden="true"
                      >
                        {initialsOf(t.displayName)}
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
                  </div>
                  <div className="p-3.5">
                    <h3 className="truncate text-[15px] font-bold text-white">{t.displayName}</h3>
                    {t.subjects.length > 0 && (
                      <p className="mt-0.5 truncate text-xs text-slate-400">{t.subjects.slice(0, 3).join(' · ')}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
