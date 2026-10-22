'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StudentPageHeader, StudentLoadingState } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconBook, IconLibrary, IconSearch, IconCheck } from '@/components/student/ShivaIcons';

/* ---------- Category icons (original, inline SVG) ---------- */
function IconNotes({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 3.5h9L20 8.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
      <path d="M15 3.5V8.5H20" />
      <path d="M9 12.5h6M9 16h4" strokeWidth={1.4} />
    </svg>
  );
}
function IconFormula({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 4H8l-4 8 4 8h10" />
      <path d="M10 9.5h5M10 14.5h5" strokeWidth={1.4} />
    </svg>
  );
}
function IconPractice({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 20l1.2-4.2L16.5 4.5a1.8 1.8 0 0 1 2.5 2.5L7.7 18.3 3.5 19.5z" />
      <path d="M14.5 6.5l3 3" strokeWidth={1.4} />
    </svg>
  );
}
function IconDownload({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 4v11M7.5 11.5L12 16l4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </svg>
  );
}

const CATEGORIES = [
  { id: '', label: 'All', Icon: IconLibrary },
  { id: 'TEXTBOOK', label: 'Textbooks', Icon: IconBook },
  { id: 'SHORT_NOTES', label: 'Short Notes', Icon: IconNotes },
  { id: 'FORMULA_SHEET', label: 'Formulas', Icon: IconFormula },
  { id: 'PRACTICE', label: 'Practice', Icon: IconPractice },
  { id: 'REFERENCE', label: 'Reference', Icon: IconLibrary },
] as const;

/* Deterministic cover art per book — CSS gradients, no external assets */
const COVERS = [
  'from-indigo-500 via-violet-500 to-purple-600',
  'from-sky-500 via-blue-500 to-indigo-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-fuchsia-500 via-purple-500 to-indigo-600',
  'from-cyan-500 via-sky-500 to-blue-600',
];
function coverFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return COVERS[h % COVERS.length];
}

const DIFF_STYLE: Record<string, string> = {
  BEGINNER: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
  INTERMEDIATE: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
  ADVANCED: 'bg-rose-500/15 text-rose-600 border-rose-500/25',
};

interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  pageCount?: number;
  fileSizeMB?: number;
  downloadCount?: number;
  subjectName?: string;
  isFree?: boolean;
  userCompleted?: boolean;
  userCurrentPage?: number;
}

export default function EBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState({ category: '', freeOnly: false, search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.freeOnly) params.set('freeOnly', 'true');
    if (filters.search.trim()) params.set('search', filters.search.trim());
    fetch(`/api/student/ebooks?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data?.books)) setBooks(d.data.books);
        else setBooks([]);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [filters.category, filters.freeOnly]);

  /* Debounced search */
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput })), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const visible = useMemo(() => books, [books]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-10 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-fuchsia-400/20 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-2">Study Library</p>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">e-Books &amp; Notes</h1>
            <p className="text-sm md:text-base text-indigo-100/90 mt-2 max-w-lg leading-relaxed">
              Textbooks, short notes aur formula sheets — sab kuch ek jagah, kabhi bhi padho.
            </p>
          </div>
          <div className="hidden md:flex w-28 h-28 rounded-3xl bg-white/15 backdrop-blur items-center justify-center text-white shrink-0">
            <IconLibrary size={56} />
          </div>
        </div>
        {/* Search */}
        <div className="relative z-10 mt-6 max-w-xl">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-2xl px-4 py-3 border border-white/20 focus-within:border-white/50 transition-colors">
            <IconSearch size={18} className="text-indigo-100 shrink-0" />
            <input
              type="text"
              placeholder="Search books, notes, authors..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder:text-indigo-200/70 text-sm focus:outline-none"
              aria-label="Search books"
            />
          </div>
        </div>
      </div>

      {/* Category pills + free toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Book categories">
          {CATEGORIES.map((cat) => {
            const active = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFilters((f) => ({ ...f, category: cat.id }))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-[var(--student-primary)] text-white border-transparent shadow-lg shadow-indigo-500/25'
                    : 'bg-[var(--student-surface)] text-[var(--student-text-muted)] border-[var(--student-border-light)] hover:border-[var(--student-primary)] hover:text-[var(--student-text)]'
                }`}
              >
                <cat.Icon size={15} />
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--student-text-muted)]">
            {!loading && !error && (
              <>
                <span className="font-bold text-[var(--student-text)]">{visible.length}</span>{' '}
                {visible.length === 1 ? 'item' : 'items'}
              </>
            )}
          </p>
          <button
            onClick={() => setFilters((f) => ({ ...f, freeOnly: !f.freeOnly }))}
            aria-pressed={filters.freeOnly}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              filters.freeOnly
                ? 'bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/25'
                : 'bg-[var(--student-surface)] text-[var(--student-text-muted)] border-[var(--student-border-light)]'
            }`}
          >
            <IconCheck size={14} />
            Free only
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <StudentLoadingState rows={3} />
      ) : error ? (
        <StudentEmptyState
          icon={<IconBook size={28} />}
          title="Kuch gadbad ho gayi"
          description="Library load nahi ho payi. Apna internet check karo aur dobara try karo."
          actionText="Retry"
          actionHref="/app/ebooks"
        />
      ) : visible.length === 0 ? (
        <StudentEmptyState
          icon={<IconLibrary size={28} />}
          title="Abhi library khaali hai"
          description="Hamari team study material taiyaar kar rahi hai. Aptitude Foundation course se padhai shuru karo — notes jald aa rahe hain."
          actionText="Explore Courses"
          actionHref="/app/courses"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {visible.map((book) => {
            const progress =
              book.pageCount && book.userCurrentPage
                ? Math.min(100, Math.round((book.userCurrentPage / book.pageCount) * 100))
                : 0;
            return (
              <article
                key={book.id}
                className="student-card overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Cover */}
                <div className={`relative h-44 bg-gradient-to-br ${coverFor(book.id)} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20" aria-hidden="true"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, white 1.5px, transparent 1.5px)', backgroundSize: '42px 42px' }} />
                  <div className="relative text-white/95 flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                    <IconBook size={44} />
                    {book.pageCount ? (
                      <span className="text-[11px] font-bold bg-black/25 px-2.5 py-1 rounded-full">{book.pageCount} pages</span>
                    ) : null}
                  </div>
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {book.isFree ? (
                      <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">Free</span>
                    ) : (
                      <span className="bg-white/90 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">Premium</span>
                    )}
                  </div>
                  {book.difficulty && (
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur bg-white/80 ${DIFF_STYLE[book.difficulty] || ''}`}>
                      {book.difficulty}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-4 md:p-5">
                  <h3 className="text-[15px] font-bold text-[var(--student-text)] leading-snug line-clamp-2 min-h-[2.6em]">
                    {book.title}
                  </h3>
                  {book.author && <p className="text-xs text-[var(--student-text-muted)] mt-1">by {book.author}</p>}
                  {book.description && (
                    <p className="text-xs text-[var(--student-text-faint)] mt-2 line-clamp-2 leading-relaxed">{book.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-[var(--student-text-faint)]">
                    {book.subjectName && <span className="font-semibold text-[var(--student-primary)]">{book.subjectName}</span>}
                    {typeof book.fileSizeMB === 'number' && <span>{book.fileSizeMB} MB</span>}
                    {typeof book.downloadCount === 'number' && (
                      <span className="inline-flex items-center gap-1"><IconDownload size={12} />{book.downloadCount}</span>
                    )}
                  </div>
                  <div className="mt-4">
                    {book.userCompleted ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 rounded-xl px-3 py-2.5">
                        <IconCheck size={14} />
                        Completed
                      </div>
                    ) : progress > 0 ? (
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[var(--student-text-muted)] mb-1.5">
                          <span>Continue reading</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-[var(--student-surface-hover)] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button className="w-full py-2.5 rounded-xl bg-[var(--student-primary-light)] text-[var(--student-primary)] text-xs font-bold hover:bg-[var(--student-primary)] hover:text-white transition-all">
                        Start Reading
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Cross-link */}
      {!loading && !error && visible.length > 0 && (
        <div className="student-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <IconLibrary size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--student-text)]">Quick revision chahiye?</p>
              <p className="text-xs text-[var(--student-text-muted)]">Formula sheets se 5 minute me revise karo.</p>
            </div>
          </div>
          <Link href="/app/formula-sheets" className="btn-primary text-xs whitespace-nowrap">
            Formula Sheets
          </Link>
        </div>
      )}
    </div>
  );
}
