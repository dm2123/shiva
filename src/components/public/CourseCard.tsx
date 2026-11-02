'use client';

/**
 * THE SHIVA — Public Course Card + Courses Explorer
 * ---------------------------------------------------------------
 * Wave B1 (PW catalog parity): PW catalog ki anatomy — safed card
 * (radius 16, halki border), upar 16:9 banner (CourseBanner: asal
 * thumbnail ya designed tile), neeche exam line (narangi, chhoti,
 * bold) → bold title → "For <audience>" line → meta line (language
 * / validity) → price row (bold price; kata MRP + green OFF chip
 * SIRF asal data ho to) + daayen KAALA CTA (Buy Now / Register Now).
 *
 * HONEST-DATA RULE: Sirf asal Course fields hi render hote hain —
 * title, slug, description, thumbnailUrl, price, status, createdAt,
 * aur jab record me maujood hon to language / validityMonths /
 * targetAudience bhi (khaali hon to woh line nahi dikhti).
 * mrp/originalPrice listing data me aam taur par NAHI hota — MRP
 * sirf tab jab asal record par ho. Exam chip course ke apne
 * title/slug keywords se derive hota hai.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/types/models';
import CourseBanner from '@/components/student/CourseBanner';

/* ------------------------------------------------------------------ */
/* Exam category — derived ONLY from the course's own title + slug.    */
/* Asli implementation ab @/lib/exam-category (pure, server-safe       */
/* module) me hai — 'use client' module se plain function server par   */
/* call karna production build me crash karta tha (/test-series 500    */
/* ki jad). Yahan se re-export sirf isliye hai taaki purane importers   */
/* (StudyHomeClient) bina badle chalte rahein.                         */
/* ------------------------------------------------------------------ */

import { deriveExamCategory, type ExamCategory } from '@/lib/exam-category';
export { deriveExamCategory };
export type { ExamCategory } from '@/lib/exam-category';

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Price-pattern helper (design-map ka niyam #1):
 * bold current price → grey kata-hua MRP → green % OFF chip.
 * MRP SIRF tab jab asal data me originalPrice/mrp maujood ho aur
 * price se zyada ho — Course model me aam taur par ye field NAHI
 * hai, tab sirf bold price dikhta hai. Kuch invent NAHI hota.
 */
function readMrp(course: Course): number {
  const raw = course as unknown as { originalPrice?: unknown; mrp?: unknown };
  const value = Number(raw.originalPrice ?? raw.mrp);
  return Number.isFinite(value) ? value : 0;
}

/** Audience line — targetAudience ki pehli asal line ("For ..." ke liye) */
function firstAudienceLine(course: Course): string | null {
  const raw = course.targetAudience?.trim();
  if (!raw) return null;
  const line = raw.split('\n').map((s) => s.trim()).find(Boolean);
  return line || null;
}

/* ------------------------------------------------------------------ */
/* CourseCard — PW anatomy, light card                                 */
/* ------------------------------------------------------------------ */

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const price = Number(course.price) || 0;
  const isFree = price <= 0;
  const mrp = readMrp(course);
  const hasMrp = !isFree && mrp > price;
  const discountPct = hasMrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const category = deriveExamCategory(course);
  const audience = firstAudienceLine(course);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_6px_24px_rgba(42,22,80,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(42,22,80,0.12)]">
      {/* Banner — 16:9 (asal thumbnail ya designed tile), FREE badge asal price par */}
      <CourseBanner src={course.thumbnailUrl} title={course.title} seed={course.slug || course.id}>
        {isFree && (
          <span className="absolute right-3 top-3 rounded-full bg-[#f5b942] px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider text-[#2a1650] shadow">
            100% Free
          </span>
        )}
      </CourseBanner>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Exam line — narangi, chhoti, bold (PW pattern); sirf asal derive par */}
        {category && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-orange-600">
            {category.icon} {category.label}
          </p>
        )}

        {/* Title — course ka asal naam, zyada se zyada 2 line */}
        <h3 className="mt-1.5 line-clamp-2 text-[17px] font-bold leading-snug text-gray-900">
          {course.title}
        </h3>

        {/* Audience line — "For <audience>", sirf asal targetAudience par */}
        {audience && (
          <p className="mt-1 line-clamp-1 text-[13px] font-medium text-gray-500">For {audience}</p>
        )}

        {course.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-gray-500">
            {course.description}
          </p>
        )}

        {/* Meta line — sirf tab jab asal record me language / validityMonths ho */}
        {(course.language?.trim() ||
          (typeof course.validityMonths === 'number' && course.validityMonths > 0)) && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-gray-400">
            {course.language?.trim() && <span>🗣️ {course.language.trim()}</span>}
            {course.language?.trim() &&
              typeof course.validityMonths === 'number' &&
              course.validityMonths > 0 && (
                <span className="text-gray-300" aria-hidden="true">•</span>
              )}
            {typeof course.validityMonths === 'number' && course.validityMonths > 0 && (
              <span>📅 {course.validityMonths} mahine validity</span>
            )}
          </p>
        )}

        {/* Price row + KAALA CTA — PW pattern: price baayen, CTA daayen.
            MRP/OFF chip sirf asal data me hone par (invent nahi hota). */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            {isFree ? (
              <>
                <p className="text-[19px] font-extrabold leading-tight text-emerald-600">Free</p>
                <p className="mt-0.5 text-[11.5px] font-medium text-gray-400">
                  Poora access, koi fee nahi
                </p>
              </>
            ) : (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[20px] font-extrabold leading-tight text-gray-900">
                  {formatINR(price)}
                </span>
                {hasMrp && (
                  <s className="text-[14px] font-semibold text-gray-400">{formatINR(mrp)}</s>
                )}
                {hasMrp && discountPct > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-600">
                    {discountPct}% OFF
                  </span>
                )}
              </p>
            )}
          </div>
          <Link
            href={`/courses/${course.slug}`}
            aria-label={
              isFree
                ? `${course.title} — free register karo`
                : `${course.title} — abhi enroll karo`
            }
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#111111] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition-all hover:bg-black"
          >
            {isFree ? 'Register Now' : 'Buy Now'}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Skeletons                                                           */
/* ------------------------------------------------------------------ */

export function CourseCardSkeleton() {
  return (
    <div
      className="h-full animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white"
      aria-hidden="true"
    >
      <div className="aspect-[16/9] w-full bg-[#ede9fe]" />
      <div className="space-y-2.5 p-5">
        <div style={{ height: 12, borderRadius: 6, background: '#f3f0ff', width: '35%' }} />
        <div style={{ height: 18, borderRadius: 6, background: '#ede9fe', width: '85%' }} />
        <div style={{ height: 18, borderRadius: 6, background: '#ede9fe', width: '60%' }} />
        <div style={{ height: 13, borderRadius: 6, background: '#f3f0ff', width: '90%', marginTop: 8 }} />
        <div className="flex items-end justify-between pt-3">
          <div style={{ height: 22, borderRadius: 6, background: '#ede9fe', width: '30%' }} />
          <div style={{ height: 44, borderRadius: 12, background: '#111111', width: 118, opacity: 0.85 }} />
        </div>
      </div>
    </div>
  );
}

export function CoursesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Courses load ho rahe hain"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CoursesExplorer — search + filter chips + sort + responsive grid    */
/* ------------------------------------------------------------------ */

type PriceFilter = 'all' | 'free' | 'paid';
type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'title-az';

const chipBase: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 999,
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  color: '#374151',
  transition: 'all .18s ease',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
};

const chipActive: React.CSSProperties = {
  ...chipBase,
  background: '#6d28d9',
  borderColor: '#6d28d9',
  color: '#fff',
  boxShadow: '0 8px 20px rgba(109,40,217,.28)',
};

/** Grouped (default) view me har category ke itne courses pehle dikhte
 *  hain; baaki 'View All' dabane par usi category filter se khulte hain. */
const GROUP_PREVIEW = 8;

export function CoursesExplorer({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  /* Chips sirf un categories ke liye jo asal courses me maujood hain */
  const categories = useMemo(() => {
    const map = new Map<string, { cat: ExamCategory; count: number }>();
    for (const c of courses) {
      const cat = deriveExamCategory(c);
      if (!cat) continue;
      const entry = map.get(cat.id);
      if (entry) entry.count += 1;
      else map.set(cat.id, { cat, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [courses]);

  const freeCount = useMemo(() => courses.filter((c) => (Number(c.price) || 0) <= 0).length, [courses]);
  const paidCount = courses.length - freeCount;

  /* Language options — sirf wohi languages jo asal courses par lagi hain */
  const languages = useMemo(() => {
    const set = new Map<string, number>();
    for (const c of courses) {
      const lang = c.language?.trim();
      if (lang) set.set(lang, (set.get(lang) || 0) + 1);
    }
    return Array.from(set.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [courses]);
  /* Filter tabhi dikhao jab chunav asal me matlab rakhta ho:
     2+ languages hon, ya kuch courses par language lagi hi na ho */
  const showLanguageFilter =
    languages.length > 0 &&
    (languages.length > 1 || courses.some((c) => !c.language?.trim()));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (categoryId !== 'all' && deriveExamCategory(c)?.id !== categoryId) return false;
      if (priceFilter === 'free' && (Number(c.price) || 0) > 0) return false;
      if (priceFilter === 'paid' && (Number(c.price) || 0) <= 0) return false;
      if (languageFilter !== 'all' && c.language?.trim() !== languageFilter) return false;
      if (q) {
        const text = `${c.title} ${c.description ?? ''} ${c.slug.replace(/-/g, ' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    const by: Record<SortKey, (a: Course, b: Course) => number> = {
      newest: (a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
      'price-asc': (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
      'price-desc': (a, b) => (Number(b.price) || 0) - (Number(a.price) || 0),
      'title-az': (a, b) => a.title.localeCompare(b.title, 'en-IN'),
    };
    return [...list].sort(by[sort]);
  }, [courses, query, categoryId, priceFilter, languageFilter, sort]);

  const hasActiveFilters =
    query.trim() !== '' || categoryId !== 'all' || priceFilter !== 'all' || languageFilter !== 'all';

  const resetFilters = () => {
    setQuery('');
    setCategoryId('all');
    setPriceFilter('all');
    setLanguageFilter('all');
    setSort('newest');
  };

  const activeCategoryLabel = categories.find((c) => c.cat.id === categoryId)?.cat.label;

  /* Grouped view — koi filter/search/sort active na ho to courses apni
     exam category ke groups me dikhte hain (listing-map ka pattern:
     group heading + count + aakhir me 'View All'). Jis course ki
     category derive nahi hoti woh 'Baaki Courses' group me aata hai. */
  const isGroupedView = !hasActiveFilters && sort === 'newest';
  const groups = useMemo(() => {
    if (!isGroupedView) return null;
    const byCat = new Map<string, { cat: ExamCategory | null; items: Course[] }>();
    for (const c of filtered) {
      const cat = deriveExamCategory(c);
      const key = cat?.id ?? '__other__';
      const entry = byCat.get(key);
      if (entry) entry.items.push(c);
      else byCat.set(key, { cat, items: [c] });
    }
    const ordered = Array.from(byCat.values()).sort((a, b) => {
      if (a.cat === null) return 1;
      if (b.cat === null) return -1;
      return b.items.length - a.items.length;
    });
    // Ek hi group ho to grouping ka koi matlab nahi — flat grid hi rahe
    return ordered.length > 1 ? ordered : null;
  }, [filtered, isGroupedView]);

  return (
    <div>
      {/* ── Toolbar: gol search bar (PW pattern) + sort ────── */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'stretch',
          marginBottom: 18,
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <span
            aria-hidden="true"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }}
          >
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for courses — SSC, Railway, Banking…"
            aria-label="Course search karo"
            className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-10 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-[#6d28d9] focus:outline-none"
            style={{ fontFamily: 'inherit' }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Search saaf karo"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                background: '#ede9fe',
                color: '#6d28d9',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ×
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Courses sort karo"
          className="rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:border-[#6d28d9] focus:outline-none"
          style={{ flex: '0 1 210px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <option value="newest">Sort: Sabse Naya Pehle</option>
          <option value="price-asc">Sort: Price — Kam se Zyada</option>
          <option value="price-desc">Sort: Price — Zyada se Kam</option>
          <option value="title-az">Sort: Naam A–Z</option>
        </select>
      </div>

      {/* ── Exam category chips (sirf asal data wali categories) ── */}
      {categories.length > 0 && (
        <div
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}
          role="group"
          aria-label="Exam category se filter karo"
        >
          <button
            type="button"
            onClick={() => setCategoryId('all')}
            style={categoryId === 'all' ? chipActive : chipBase}
            aria-pressed={categoryId === 'all'}
          >
            All Courses · {courses.length}
          </button>
          {categories.map(({ cat, count }) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              style={categoryId === cat.id ? chipActive : chipBase}
              aria-pressed={categoryId === cat.id}
            >
              {cat.icon} {cat.label} · {count}
            </button>
          ))}
        </div>
      )}

      {/* ── Price chips (asal price field par based) ── */}
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}
        role="group"
        aria-label="Price se filter karo"
      >
        {(
          [
            { id: 'all', label: `💰 Sabhi Price · ${courses.length}` },
            { id: 'free', label: `🎉 Sirf Free · ${freeCount}` },
            { id: 'paid', label: `💳 Sirf Paid · ${paidCount}` },
          ] as { id: PriceFilter; label: string }[]
        ).map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setPriceFilter(chip.id)}
            style={{
              ...(priceFilter === chip.id ? chipActive : chipBase),
              padding: '6px 13px',
              fontSize: 12.5,
            }}
            aria-pressed={priceFilter === chip.id}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Language chips (sirf asal data wali languages) ── */}
      {showLanguageFilter && (
        <div
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}
          role="group"
          aria-label="Language se filter karo"
        >
          <button
            type="button"
            onClick={() => setLanguageFilter('all')}
            style={{
              ...(languageFilter === 'all' ? chipActive : chipBase),
              padding: '6px 13px',
              fontSize: 12.5,
            }}
            aria-pressed={languageFilter === 'all'}
          >
            🗣️ Sabhi Languages
          </button>
          {languages.map(({ label, count }) => (
            <button
              key={label}
              type="button"
              onClick={() => setLanguageFilter(label)}
              style={{
                ...(languageFilter === label ? chipActive : chipBase),
                padding: '6px 13px',
                fontSize: 12.5,
              }}
              aria-pressed={languageFilter === label}
            >
              🗣️ {label} · {count}
            </button>
          ))}
        </div>
      )}

      {/* ── Result count ── */}
      <p style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 16 }} aria-live="polite">
        {filtered.length === courses.length
          ? `Kul ${courses.length} published course${courses.length === 1 ? '' : 's'}`
          : `${filtered.length} of ${courses.length} courses dikh rahe hain`}
        {activeCategoryLabel ? ` · Category: ${activeCategoryLabel}` : ''}
        {languageFilter !== 'all' ? ` · Language: ${languageFilter}` : ''}
      </p>

      {/* ── Grid / honest empty state ── */}
      {filtered.length === 0 ? (
        <div
          className="mx-auto max-w-[560px] rounded-2xl border border-gray-200 bg-white p-11 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]"
          role="status"
        >
          <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.45 }}>🔍</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, color: '#111827' }}>
            Is filter me abhi koi course nahi hai
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, marginBottom: 20, lineHeight: 1.65 }}>
            {query.trim()
              ? `“${query.trim()}” se match karta koi published course nahi mila. Spelling check karo ya filters saaf karke saare courses dekho.`
              : activeCategoryLabel
                ? `Abhi ${activeCategoryLabel} category me koi published course uplabdh nahi hai. Dusri category ya All Courses par dekho — naye courses jald judeinge.`
                : 'Chune gaye filters se koi course match nahi hua. Filters saaf karke dobara dekho.'}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-black"
            style={{ fontFamily: 'inherit', cursor: 'pointer', border: 'none' }}
          >
            Filters Saaf Karo — Saare Courses Dekho
          </button>
        </div>
      ) : groups ? (
        /* ── Grouped view: category-wise sections + 'View All' ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {groups.map(({ cat, items }) => {
            const preview = cat ? items.slice(0, GROUP_PREVIEW) : items;
            const label = cat ? `${cat.icon} ${cat.label} Courses` : '📚 Baaki Courses';
            return (
              <section key={cat?.id ?? 'other'} aria-label={label}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                    paddingBottom: 10,
                    borderBottom: '2px solid var(--line)',
                  }}
                >
                  <h2 style={{ fontSize: 21, fontWeight: 800, color: '#111827' }}>
                    {label}
                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 12,
                        fontWeight: 800,
                        background: '#ede9fe',
                        color: '#6d28d9',
                        padding: '3px 10px',
                        borderRadius: 999,
                        verticalAlign: 'middle',
                      }}
                    >
                      {items.length}
                    </span>
                  </h2>
                  {cat && items.length > preview.length && (
                    <button
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 800,
                        fontSize: 14,
                        color: '#6d28d9',
                      }}
                    >
                      View All {cat.label} Courses →
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {preview.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
                {cat && items.length > preview.length && (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className="inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-black"
                      style={{ fontFamily: 'inherit', cursor: 'pointer', border: 'none' }}
                    >
                      View All {cat.label} Courses ({items.length}) →
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
