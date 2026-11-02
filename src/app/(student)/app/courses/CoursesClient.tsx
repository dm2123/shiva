'use client';

/**
 * Student Courses Catalog — client hissa (PW listing parity,
 * fix list C2 + C5).
 *
 * PW listing ki anatomy: upar ek hi controls row — gol search +
 * "Sort by" + "Filter" buttons. Sort sirf asal fields par hai
 * (Newest = createdAt, Price low→high / high→low) aur Filter
 * sirf un groups par jo asal data se bante hain (Target Exam =
 * deriveExamCategory ka server-derived label, Price = Free/Paid)
 * — koi nakli control nahi. Filter ka poora PW-group dialog
 * (Status/Validity aadi) C3 ka kaam hai, yahan nahi.
 *
 * Card (C5): banner par language pill top-left (asal language
 * par) + heart top-right — heart maujooda ContentBookmarks API
 * (contentType 'COURSE') par chalta hai, detail page wale
 * CourseBookmarkButton jaisa hi asal toggle. Title ke neeche
 * "Target:" line (asal targetAudience), "Starts:" line (Batches
 * ka sabse paas wala startDate, server se), "Validity:" line
 * (asal validityMonths). Listing card par description NAHI hai.
 * Price row me sirf asal price — Courses me MRP/coupon field
 * hai hi nahi, isliye strikethrough/% OFF/coupon line NAHI
 * banti (nakli discount mana hai). Footer: kaala CTA left
 * (asal state se label — enrolled → Continue, free → Enroll
 * Free, paid → Enroll Now; teeno detail page ke asal
 * enrollment/payment flow par le jate hain) + "View details"
 * chevron-link right.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import CourseBanner from '@/components/student/CourseBanner';
import {
  IconPlay,
  IconCheckCircle,
  IconHeart,
  IconChevronDown,
  IconChevronRight,
  IconFilter,
} from '@/components/student/StudentIcons';

export interface StudentCourseItem {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  language: string | null;
  validityMonths: number | null;
  targetAudience: string | null;
  createdAt: string | null;
  /** 'YYYY-MM-DD' — Batches ka sabse paas wala startDate, warna null */
  startsOn: string | null;
  examCategory: { id: string; label: string } | null;
}

type SortKey = 'newest' | 'priceAsc' | 'priceDesc';
type PriceFilter = 'all' | 'free' | 'paid';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'priceAsc', label: 'Price: Low to High' },
  { key: 'priceDesc', label: 'Price: High to Low' },
];

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** 'YYYY-MM-DD' → "11th Dec'25" (PW Starts line wala format) */
function formatStartsOn(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${ordinal(day)} ${MONTHS_SHORT[month - 1]}'${String(year).slice(2)}`;
}

/** validityMonths → "1 Year" / "2 Years" / "6 Months" (PW Duration line jaisa roop, label Validity) */
function formatValidity(months: number): string {
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12;
    return `${years} Year${years > 1 ? 's' : ''}`;
  }
  return `${months} Month${months > 1 ? 's' : ''}`;
}

function CourseCard({
  course,
  isEnrolled,
  saved,
  saveLoaded,
  saveBusy,
  onToggleSave,
}: {
  course: StudentCourseItem;
  isEnrolled: boolean;
  saved: boolean;
  saveLoaded: boolean;
  saveBusy: boolean;
  onToggleSave: (course: StudentCourseItem) => void;
}) {
  const isFree = course.price <= 0;
  const href = `/app/courses/${course.id}`;
  const audience = course.targetAudience
    ? course.targetAudience.split('\n').map((s) => s.trim()).find(Boolean)
    : null;
  const startsLabel = course.startsOn ? formatStartsOn(course.startsOn) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_6px_24px_rgba(42,22,80,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(42,22,80,0.12)]">
      {/* Banner — 16:9; overlays Link ke bahar hain taaki heart
          button click par navigate na ho */}
      <div className="relative">
        <Link href={href} aria-label={`${course.title} kholo`} className="block">
          <CourseBanner src={course.thumbnailUrl} title={course.title} seed={course.slug || course.id} />
        </Link>

        {/* Top-left — language pill (asal language par), uske neeche Free badge */}
        {(course.language || isFree) && (
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {course.language && (
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-800 shadow">
                {course.language}
              </span>
            )}
            {isFree && (
              <span className="rounded-full bg-[#f5b942] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#2a1650] shadow">
                100% Free
              </span>
            )}
          </div>
        )}

        {/* Top-right — heart (asal bookmark toggle), uske neeche Enrolled badge */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={() => onToggleSave(course)}
            disabled={!saveLoaded || saveBusy}
            aria-pressed={saved}
            aria-label={saved ? `${course.title} ka bookmark hatao` : `${course.title} bookmark karo`}
            title={saved ? 'Bookmarked' : 'Bookmark karo'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow transition hover:bg-white disabled:opacity-60"
          >
            <IconHeart
              size={16}
              className={saved ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}
            />
          </button>
          {isEnrolled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#6d28d9] shadow">
              <IconCheckCircle size={11} />
              Enrolled
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Title — course ka asal naam */}
        <Link href={href}>
          <h3 className="line-clamp-2 text-[16px] font-bold leading-snug text-gray-900 transition-colors hover:text-[#6d28d9]">
            {course.title}
          </h3>
        </Link>

        {/* Title ke neeche wali lines — sirf asal data par (PW card ka kram) */}
        {(audience || startsLabel || (course.validityMonths && course.validityMonths > 0)) && (
          <div className="mt-1.5 space-y-1">
            {audience && (
              <p className="line-clamp-1 text-[13px] text-gray-500">
                <span className="font-semibold text-gray-600">Target:</span> {audience}
              </p>
            )}
            {startsLabel && (
              <p className="text-[13px] text-gray-500">
                <span className="font-semibold text-gray-600">Starts:</span> {startsLabel}
              </p>
            )}
            {course.validityMonths && course.validityMonths > 0 && (
              <p className="text-[13px] text-gray-500">
                <span className="font-semibold text-gray-600">Validity:</span>{' '}
                {formatValidity(course.validityMonths)}
              </p>
            )}
          </div>
        )}

        {/* Price row — sirf asal price (MRP/coupon field hai hi nahi) */}
        <div className="mt-auto pt-5">
          {isFree ? (
            <p className="text-[19px] font-extrabold leading-tight text-emerald-600">Free</p>
          ) : (
            <p className="text-[20px] font-extrabold leading-tight text-gray-900">
              {formatINR(course.price)}
            </p>
          )}

          {/* Footer — kaala CTA left + View details right (PW pattern) */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <Link
              href={href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111111] px-5 py-2.5 text-[13px] font-extrabold text-white shadow-lg shadow-black/20 transition-all hover:bg-black"
            >
              {isEnrolled && <IconPlay size={12} />}
              {isEnrolled ? 'Continue' : isFree ? 'Enroll Free' : 'Enroll Now'}
            </Link>
            <Link
              href={href}
              className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-bold text-[#6d28d9] transition-colors hover:text-[#4c1d95]"
            >
              View details
              <IconChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CoursesClient({
  courses,
  enrolledIds,
}: {
  courses: StudentCourseItem[];
  enrolledIds: string[];
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [examFilter, setExamFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [openPanel, setOpenPanel] = useState<'sort' | 'filter' | null>(null);

  const enrolledSet = useMemo(() => new Set(enrolledIds), [enrolledIds]);

  /* Filter ke liye asal exam categories — sirf jo courses me asal me hain */
  const examOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of courses) {
      if (c.examCategory && !seen.has(c.examCategory.id)) {
        seen.set(c.examCategory.id, c.examCategory.label);
      }
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }));
  }, [courses]);

  const activeFilterCount = (examFilter ? 1 : 0) + (priceFilter !== 'all' ? 1 : 0);

  /* ── Bookmarks (heart) — detail page wala hi asal API ── */
  const [savedMap, setSavedMap] = useState<Record<string, string>>({});
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [saveBusyId, setSaveBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/student/bookmarks?type=COURSE')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const rows = d?.data?.bookmarks || [];
        const map: Record<string, string> = {};
        for (const b of rows) {
          if (b?.contentId && b?.id) map[String(b.contentId)] = String(b.id);
        }
        setSavedMap(map);
        setSavedLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setSavedLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleSave(course: StudentCourseItem) {
    if (!savedLoaded || saveBusyId) return;
    const existingId = savedMap[course.id];
    setSaveBusyId(course.id);
    try {
      if (existingId) {
        const res = await fetch(`/api/student/bookmarks?id=${existingId}`, { method: 'DELETE' });
        const d = await res.json();
        if (d.success) {
          setSavedMap((prev) => {
            const next = { ...prev };
            delete next[course.id];
            return next;
          });
        }
      } else {
        const res = await fetch('/api/student/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: 'COURSE',
            contentId: course.id,
            title: course.title,
          }),
        });
        const d = await res.json();
        if (d.success && d.data?.bookmarkId) {
          setSavedMap((prev) => ({ ...prev, [course.id]: String(d.data.bookmarkId) }));
        }
      }
    } catch {
      /* network fail — state waisa hi rakho, nakli success nahi */
    } finally {
      setSaveBusyId(null);
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (
        q &&
        !`${c.title} ${c.description ?? ''} ${(c.slug ?? '').replace(/-/g, ' ')}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      if (examFilter && c.examCategory?.id !== examFilter) return false;
      if (priceFilter === 'free' && c.price > 0) return false;
      if (priceFilter === 'paid' && c.price <= 0) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === 'priceAsc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'priceDesc') sorted.sort((a, b) => b.price - a.price);
    else
      sorted.sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
      );
    return sorted;
  }, [courses, query, examFilter, priceFilter, sort]);

  function resetFilters() {
    setExamFilter(null);
    setPriceFilter('all');
  }

  const chipClass = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${
      active
        ? 'bg-[#111111] text-white'
        : 'border border-gray-300 bg-white text-gray-600 hover:border-gray-400'
    }`;

  return (
    <div>
      {/* Panel khula ho to bahar click se band */}
      {openPanel && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setOpenPanel(null)}
        />
      )}

      {/* Controls row — PW pattern: search + Sort by + Filter ek hi line me */}
      <div className="relative z-20 flex flex-wrap items-center gap-3">
        {/* Gol search bar */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xl">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] opacity-50"
          >
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for courses…"
            aria-label="Course search karo"
            className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-10 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-[#6d28d9] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Search saaf karo"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#ede9fe] font-extrabold text-[#6d28d9]"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort by — asal fields par hi (createdAt / price) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === 'sort' ? null : 'sort')}
            aria-haspopup="listbox"
            aria-expanded={openPanel === 'sort'}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-3 text-[14px] font-bold text-gray-800 transition hover:border-gray-400"
          >
            Sort by
            <IconChevronDown size={15} />
          </button>
          {openPanel === 'sort' && (
            <div
              role="listbox"
              aria-label="Sort ka vikalp"
              className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_16px_36px_rgba(42,22,80,0.14)]"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  role="option"
                  aria-selected={sort === opt.key}
                  onClick={() => {
                    setSort(opt.key);
                    setOpenPanel(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold transition ${
                    sort === opt.key
                      ? 'bg-violet-50 text-[#6d28d9]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                  {sort === opt.key && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter — asal groups hi (poora PW-group dialog C3 ka kaam hai) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === 'filter' ? null : 'filter')}
            aria-haspopup="dialog"
            aria-expanded={openPanel === 'filter'}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-3 text-[14px] font-bold text-gray-800 transition hover:border-gray-400"
          >
            <IconFilter size={15} />
            Filter
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6d28d9] text-[11px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          {openPanel === 'filter' && (
            <div
              role="dialog"
              aria-label="Course filters"
              className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_16px_36px_rgba(42,22,80,0.14)]"
            >
              {examOptions.length > 0 && (
                <div>
                  <p className="text-[12px] font-black uppercase tracking-wider text-gray-400">
                    Target Exam
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setExamFilter(null)}
                      aria-pressed={examFilter === null}
                      className={chipClass(examFilter === null)}
                    >
                      All
                    </button>
                    {examOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setExamFilter(opt.id)}
                        aria-pressed={examFilter === opt.id}
                        className={chipClass(examFilter === opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={examOptions.length > 0 ? 'mt-4' : ''}>
                <p className="text-[12px] font-black uppercase tracking-wider text-gray-400">
                  Price
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { key: 'all', label: 'All' },
                      { key: 'free', label: 'Free' },
                      { key: 'paid', label: 'Paid' },
                    ] as { key: PriceFilter; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setPriceFilter(opt.key)}
                      aria-pressed={priceFilter === opt.key}
                      className={chipClass(priceFilter === opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[13px] font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Result count — asal ginati */}
      <p className="mt-5 text-[13.5px] font-semibold text-gray-500" aria-live="polite">
        {visible.length === courses.length
          ? `Kul ${courses.length} course${courses.length === 1 ? '' : 's'}`
          : `${visible.length} of ${courses.length} courses dikh rahe hain`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]" role="status">
          {query.trim() ? (
            <>
              <p className="text-[15px] font-bold text-gray-900">
                “{query.trim()}” se match karta koi course nahi mila
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
                Spelling check karo ya search saaf karke saare courses dekho.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-black"
              >
                Saare Courses Dekho
              </button>
            </>
          ) : (
            <>
              <p className="text-[15px] font-bold text-gray-900">
                In filters se koi course match nahi hua
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
                Filters saaf karke saare courses dekho.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-black"
              >
                Filters Saaf Karo
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledSet.has(course.id)}
              saved={!!savedMap[course.id]}
              saveLoaded={savedLoaded}
              saveBusy={saveBusyId === course.id}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
