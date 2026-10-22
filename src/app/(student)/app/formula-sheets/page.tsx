'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { StudentLoadingState } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconSearch, IconCheck } from '@/components/student/ShivaIcons';

/* Original formula icon */
function IconFormulaBig({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 4H8l-4 8 4 8h10" />
      <path d="M10 9.5h5M10 14.5h5" strokeWidth={1.3} />
    </svg>
  );
}
function IconChevron({ size = 18, open, className }: { size?: number; open?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      className={`${className || ''} transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}
function IconCopy({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 5.5v-1a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1" />
    </svg>
  );
}

interface Formula {
  name: string;
  formula: string;
  description?: string;
}
interface FormulaSection {
  topic: string;
  formulas: Formula[];
}
interface Sheet {
  id: string;
  title: string;
  subjectName?: string;
  chapterName?: string;
  difficulty?: string;
  downloadCount?: number;
  content?: FormulaSection[];
}

const DIFF_STYLE: Record<string, string> = {
  JEE_MAIN: 'bg-blue-500/15 text-blue-600',
  JEE_ADVANCED: 'bg-purple-500/15 text-purple-600',
  NEET: 'bg-emerald-500/15 text-emerald-600',
  FOUNDATION: 'bg-amber-500/15 text-amber-600',
};

function SheetCard({ sheet, open, onToggle }: { sheet: Sheet; open: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const formulaCount = (sheet.content || []).reduce((n, s) => n + (s.formulas?.length || 0), 0);

  const copyFormula = async (f: string) => {
    try {
      await navigator.clipboard.writeText(f);
      setCopied(f);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <article className="student-card overflow-hidden transition-shadow hover:shadow-lg">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full p-4 md:p-5 flex items-center gap-4 text-left hover:bg-[var(--student-surface-hover)]/50 transition-colors"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/25">
          <IconFormulaBig size={26} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[var(--student-text)] leading-snug truncate">{sheet.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--student-text-muted)]">
            {sheet.subjectName && <span className="font-semibold">{sheet.subjectName}</span>}
            {sheet.chapterName && (
              <>
                <span className="text-[var(--student-text-faint)]">•</span>
                <span className="truncate">{sheet.chapterName}</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-[var(--student-text-faint)] mt-1">{formulaCount} formulas</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {sheet.difficulty && (
            <span className={`hidden sm:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${DIFF_STYLE[sheet.difficulty] || 'bg-[var(--student-surface-hover)] text-[var(--student-text-muted)]'}`}>
              {sheet.difficulty.replace('_', ' ')}
            </span>
          )}
          <IconChevron open={open} className="text-[var(--student-text-faint)]" />
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--student-border-light)] bg-[var(--student-surface-hover)]/40 p-4 md:p-5 space-y-6">
          {(sheet.content || []).map((section, i) => (
            <div key={i}>
              <h4 className="flex items-center gap-2.5 text-sm font-bold text-[var(--student-text)] mb-3">
                <span className="w-6 h-6 rounded-lg bg-[var(--student-primary)] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {i + 1}
                </span>
                {section.topic}
              </h4>
              <div className="space-y-2">
                {(section.formulas || []).map((f, j) => (
                  <div key={j} className="student-card p-3.5 md:p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--student-text-secondary)]">{f.name}</p>
                      <p className="text-base md:text-lg font-mono font-bold text-[var(--student-primary)] mt-1.5 break-words">{f.formula}</p>
                      {f.description && (
                        <p className="text-[11px] text-[var(--student-text-muted)] mt-1.5 leading-relaxed">{f.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => copyFormula(f.formula)}
                      title="Copy formula"
                      aria-label={`Copy formula ${f.name}`}
                      className="p-2 rounded-lg text-[var(--student-text-faint)] hover:text-[var(--student-primary)] hover:bg-[var(--student-primary-light)] transition-colors shrink-0"
                    >
                      {copied === f.formula ? <IconCheck size={15} className="text-emerald-500" /> : <IconCopy size={15} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(!sheet.content || sheet.content.length === 0) && (
            <p className="text-xs text-[var(--student-text-muted)] text-center py-4">
              Is sheet ka content jald aa raha hai.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default function FormulaSheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/student/formula-sheets')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setSheets(d.data);
        else setSheets([]);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sheets;
    return sheets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subjectName?.toLowerCase().includes(q) ||
        s.chapterName?.toLowerCase().includes(q)
    );
  }, [sheets, query]);

  const totalFormulas = useMemo(
    () => sheets.reduce((n, s) => n + (s.content || []).reduce((m, sec) => m + (sec.formulas?.length || 0), 0), 0),
    [sheets]
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 md:p-10 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-yellow-300/20 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100 mb-2">Quick Revision</p>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">Formula Sheets</h1>
            <p className="text-sm md:text-base text-orange-50/90 mt-2 max-w-lg leading-relaxed">
              Exam se pehle 5 minute me poora chapter revise karo — saare important formulas ek jagah.
            </p>
            {!loading && !error && totalFormulas > 0 && (
              <div className="flex gap-2.5 mt-4">
                <span className="bg-white/20 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-bold">{sheets.length} sheets</span>
                <span className="bg-white/20 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-bold">{totalFormulas} formulas</span>
              </div>
            )}
          </div>
          <div className="hidden md:flex w-28 h-28 rounded-3xl bg-white/15 backdrop-blur items-center justify-center text-white shrink-0">
            <IconFormulaBig size={56} />
          </div>
        </div>
        <div className="relative z-10 mt-6 max-w-xl">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-2xl px-4 py-3 border border-white/20 focus-within:border-white/50 transition-colors">
            <IconSearch size={18} className="text-orange-100 shrink-0" />
            <input
              type="text"
              placeholder="Search by chapter, subject..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder:text-orange-100/70 text-sm focus:outline-none"
              aria-label="Search formula sheets"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <StudentLoadingState rows={4} />
      ) : error ? (
        <StudentEmptyState
          icon={<IconFormulaBig size={28} />}
          title="Kuch gadbad ho gayi"
          description="Formula sheets load nahi ho payi. Internet check karo aur dobara try karo."
          actionText="Retry"
          actionHref="/app/formula-sheets"
        />
      ) : visible.length === 0 ? (
        <StudentEmptyState
          icon={<IconFormulaBig size={28} />}
          title={query ? 'Kuch nahi mila' : 'Sheets taiyaar ho rahi hain'}
          description={
            query
              ? `"${query}" se matching koi sheet nahi mili. Kuch aur search karo.`
              : 'Hamari team har chapter ke liye formula sheets bana rahi hai. Tab tak e-books se padhai jaari rakho.'
          }
          actionText={query ? undefined : 'Open e-Books'}
          actionHref={query ? undefined : '/app/ebooks'}
        />
      ) : (
        <div className="space-y-3 md:space-y-4 max-w-4xl">
          {visible.map((sheet) => (
            <SheetCard
              key={sheet.id}
              sheet={sheet}
              open={expandedId === sheet.id}
              onToggle={() => setExpandedId(expandedId === sheet.id ? null : sheet.id)}
            />
          ))}
        </div>
      )}

      {/* Cross-link */}
      {!loading && !error && visible.length > 0 && (
        <div className="student-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl">
          <div>
            <p className="text-sm font-bold text-[var(--student-text)]">Formulas yaad ho gaye?</p>
            <p className="text-xs text-[var(--student-text-muted)] mt-0.5">Practice questions se apni speed test karo.</p>
          </div>
          <Link href="/app/practice" className="btn-primary text-xs whitespace-nowrap">
            Start Practice
          </Link>
        </div>
      )}
    </div>
  );
}
