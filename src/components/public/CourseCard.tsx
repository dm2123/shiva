'use client';

/**
 * THE SHIVA — Public Course Card + Courses Explorer
 * ---------------------------------------------------------------
 * Workstream 2 (Public Courses Listing).
 *
 * HONEST-DATA RULE: Sirf asal Course fields hi render hote hain —
 * title, slug, description, thumbnailUrl, price, status, createdAt,
 * aur jab record me maujood hon to language / validityMonths bhi
 * (ye optional fields hain — khaali hon to pill nahi dikhta).
 * mrp/originalPrice, rating, student-count ya teacher field listing
 * data me nahi aata, isliye woh kabhi render nahi hota — MRP sirf
 * tab jab asal record par ho. Exam chip course ke apne title/slug
 * keywords se derive hota hai.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/types/models';

/* ------------------------------------------------------------------ */
/* Exam category — derived ONLY from the course's own title + slug     */
/* ------------------------------------------------------------------ */

export interface ExamCategory {
  id: string;
  label: string;
  icon: string;
}

const CATEGORY_RULES: { id: string; label: string; icon: string; pattern: RegExp }[] = [
  { id: 'ssc', label: 'SSC', icon: '🎯', pattern: /\bssc\b|cgl|chsl|\bmts\b|steno/i },
  { id: 'railway', label: 'Railway', icon: '🚂', pattern: /railway|ntpc|\brrb\b|group[\s-]?d/i },
  { id: 'banking', label: 'Banking', icon: '🏦', pattern: /bank|ibps|\bsbi\b|banking/i },
  { id: 'defence', label: 'Defence', icon: '🛡️', pattern: /defence|defense|\bnda\b|\bcds\b|afcat|agniveer|army|navy|air[\s-]?force/i },
  { id: 'teaching', label: 'Teaching', icon: '👩‍🏫', pattern: /ctet|uptet|\btet\b|teacher|teaching|\bkvs\b|dsssb|b\.?ed/i },
  { id: 'upsc', label: 'UPSC', icon: '🏛️', pattern: /upsc|\bias\b|civil[\s-]?service/i },
  { id: 'state', label: 'State Exams', icon: '🗺️', pattern: /upsssc|uppsc|bpsc|\bpsc\b|\bpet\b|state[\s-]?exam/i },
  { id: 'foundation', label: 'Foundation', icon: '📚', pattern: /foundation|aptitude|crash/i },
];

/** Returns the exam category honestly derivable from title/slug, else null. */
export function deriveExamCategory(course: Pick<Course, 'title' | 'slug'>): ExamCategory | null {
  const haystack = `${course.title} ${course.slug.replace(/-/g, ' ')}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(haystack)) {
      return { id: rule.id, label: rule.label, icon: rule.icon };
    }
  }
  return null;
}

/* Brand gradients (deep purple family + gold-tinted) — stable per course */
const BANNER_GRADIENTS = [
  'linear-gradient(120deg,#2a1650,#6d28d9)',
  'linear-gradient(120deg,#4c1d95,#7c3aed)',
  'linear-gradient(120deg,#312e81,#6d28d9)',
  'linear-gradient(120deg,#2a1650,#8b5cf6)',
  'linear-gradient(120deg,#3b0764,#7c3aed)',
  'linear-gradient(120deg,#2a1650,#b45309)',
];

function gradientFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length];
}

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

/* Kharid/enroll CTA — solid KAALA (map: kaala sirf final-buy buttons ke liye) */
const buyBtnStyle: React.CSSProperties = {
  flex: 1,
  display: 'inline-block',
  textAlign: 'center',
  background: '#111111',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 15,
  lineHeight: 1.4,
};

/* Detail CTA — purple outline (secondary) */
const detailBtnStyle: React.CSSProperties = {
  width: 48,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  color: '#6d28d9',
  border: '2px solid #6d28d9',
  borderRadius: 12,
  fontWeight: 900,
  fontSize: 18,
  lineHeight: 1,
};

/* ------------------------------------------------------------------ */
/* CourseCard                                                          */
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
  const hasThumb = typeof course.thumbnailUrl === 'string' && course.thumbnailUrl.trim().length > 0;
  // Seed/legacy thumbnail paths may not exist on disk — fall back to the
  // branded gradient banner instead of showing a broken image.
  const [imgOk, setImgOk] = useState(hasThumb);

  return (
    <article
      className="batch"
      style={{
        height: '100%',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 6px 24px rgba(42,22,80,.08)',
      }}
    >
      {/* Thumbnail / banner area */}
      <div
        style={{
          position: 'relative',
          minHeight: 132,
          background: gradientFor(course.slug),
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasThumb && imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            loading="lazy"
            onError={() => setImgOk(false)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 52, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.35))' }} aria-hidden="true">
            {category?.icon ?? '📖'}
          </span>
        )}

        {/* Category badge — narangi tag (map: orange sirf category labels ke liye);
            only when honestly derivable from title/slug */}
        {category && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              background: '#ffedd5',
              border: '1px solid #fed7aa',
              color: '#c2410c',
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            {category.icon} {category.label}
          </span>
        )}

        {/* FREE badge — only when the real price is 0 */}
        {isFree && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 0.6,
              background: '#f5b942',
              color: '#2a1650',
              padding: '5px 11px',
              borderRadius: 999,
              boxShadow: '0 4px 14px rgba(0,0,0,.25)',
            }}
          >
            100% FREE
          </span>
        )}
      </div>

      {/* Body */}
      <div className="body">
        <h3
          style={{
            fontSize: 17,
            fontWeight: 800,
            lineHeight: 1.35,
            color: '#2a1650',
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {course.title}
        </h3>

        {course.description ? (
          <p
            style={{
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 1.6,
              marginBottom: 14,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description}
          </p>
        ) : null}

        {/* Meta pills — grey outline; sirf tab jab asal record me
            language / validityMonths maujood ho (warna kuch nahi) */}
        {(course.language?.trim() ||
          (typeof course.validityMonths === 'number' && course.validityMonths > 0)) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {course.language?.trim() && (
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
                🗣️ {course.language.trim()}
              </span>
            )}
            {typeof course.validityMonths === 'number' && course.validityMonths > 0 && (
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
                📅 {course.validityMonths} mahine validity
              </span>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Price row — map ka pakka pattern: bold current price →
            grey kata-hua MRP → green % OFF chip. MRP/chip sirf asal
            data me hone par; warna sirf bold price (invent nahi). */}
        <div className="price" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {isFree ? (
            <>
              <b style={{ color: '#059669' }}>Free</b>
              <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
                Poora access, koi fee nahi
              </span>
            </>
          ) : (
            <>
              <b style={{ fontSize: 21 }}>{formatINR(price)}</b>
              {hasMrp && (
                <s style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600 }}>
                  {formatINR(mrp)}
                </s>
              )}
              {hasMrp && discountPct > 0 && (
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: '#047857',
                    background: '#d1fae5',
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

        {/* CTA row — kharid/enroll = solid KAALA; detail = purple outline */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
          <Link
            href={`/courses/${course.slug}`}
            style={buyBtnStyle}
            aria-label={
              isFree
                ? `${course.title} — free register karo`
                : `${course.title} — abhi enroll karo`
            }
          >
            {isFree ? 'Register Now' : 'Buy Now'}
          </Link>
          <Link
            href={`/courses/${course.slug}`}
            style={detailBtnStyle}
            aria-label={`${course.title} — course details dekho`}
          >
            ›
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
    <div className="batch animate-pulse" aria-hidden="true" style={{ height: '100%' }}>
      <div style={{ minHeight: 132, background: 'linear-gradient(120deg,#ede9fe,#ddd6fe)' }} />
      <div className="body" style={{ gap: 10 }}>
        <div style={{ height: 18, borderRadius: 6, background: '#ede9fe', width: '85%' }} />
        <div style={{ height: 18, borderRadius: 6, background: '#ede9fe', width: '60%' }} />
        <div style={{ height: 13, borderRadius: 6, background: '#f3f0ff', width: '95%', marginTop: 6 }} />
        <div style={{ height: 13, borderRadius: 6, background: '#f3f0ff', width: '80%' }} />
        <div style={{ height: 22, borderRadius: 6, background: '#ede9fe', width: '40%', marginTop: 14 }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <div style={{ height: 44, borderRadius: 12, background: '#2a1650', flex: 1 }} />
          <div style={{ height: 44, width: 48, borderRadius: 12, background: '#ede9fe' }} />
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{ gap: 22 }}
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
  border: '2px solid var(--line)',
  background: '#fff',
  color: '#4c1d95',
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

const controlStyle: React.CSSProperties = {
  padding: '11px 14px',
  border: '2px solid var(--line)',
  borderRadius: 12,
  fontSize: 14.5,
  color: 'var(--ink)',
  background: '#fff',
  fontFamily: 'inherit',
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
      {/* ── Toolbar: search + sort ─────────────────────────────── */}
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
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.55 }}
          >
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Course khojo — jaise SSC, Railway, Banking…"
            aria-label="Course search karo"
            style={{ ...controlStyle, width: '100%', paddingLeft: 42, paddingRight: query ? 40 : 14 }}
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
          style={{ ...controlStyle, flex: '0 1 210px', cursor: 'pointer', fontWeight: 600 }}
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
          className="batch"
          style={{ maxWidth: 560, margin: '8px auto 0', textAlign: 'center', padding: 44 }}
          role="status"
        >
          <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.45 }}>🔍</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, color: '#2a1650' }}>
            Is filter me abhi koi course nahi hai
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, marginBottom: 20, lineHeight: 1.65 }}>
            {query.trim()
              ? `“${query.trim()}” se match karta koi published course nahi mila. Spelling check karo ya filters saaf karke saare courses dekho.`
              : activeCategoryLabel
                ? `Abhi ${activeCategoryLabel} category me koi published course uplabdh nahi hai. Dusri category ya All Courses par dekho — naye courses jald judeinge.`
                : 'Chune gaye filters se koi course match nahi hua. Filters saaf karke dobara dekho.'}
          </p>
          <button type="button" onClick={resetFilters} className="btn btn-primary" style={{ fontFamily: 'inherit' }}>
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
                  <h2 style={{ fontSize: 21, fontWeight: 800, color: '#2a1650' }}>
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
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  style={{ gap: 22 }}
                >
                  {preview.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
                {cat && items.length > preview.length && (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className="btn btn-primary"
                      style={{ fontFamily: 'inherit' }}
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
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{ gap: 22 }}
        >
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
