'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft, IconArrowRight, IconBook, IconBookOpen, IconClock,
  IconFileText, IconPlay, IconTarget, IconZap,
} from '@/components/student/StudentIcons';
import { IconLibrary } from '@/components/student/ShivaIcons';

/**
 * THE SHIVA — Student Library hub.
 *
 * Ek hi page par saara free study material: Short Notes / Formula Sheets,
 * PYQs, Practice Papers (Question Bank), Free Lectures, e-Books aur NCERT.
 * Har section apne asal student API se data laata hai — wahi endpoints jo
 * andar ke pages use karte hain. Jis section ka data khaali/fail ho, wahan
 * nakli items ki jagah saaf link-card dikhta hai. Koi count ya title
 * invent nahi hota.
 */

interface Sheet { id: string; title: string; subjectName?: string; chapterName?: string; content?: { formulas?: unknown[] }[] }
interface PyqExam { id: string; title: string; examName: string | null; year: number | null; subject: string | null; totalQuestions: number; totalMarks: number; timeLimitMinutes: number }
interface Lecture { id: string; title: string; courseId: string; courseTitle: string; subject?: string; chapter?: string; duration?: string }
interface Book { id: string; title: string; author?: string; category?: string; pageCount?: number; isFree?: boolean }

const COVERS = [
  'from-[#6d28d9] via-[#7c3aed] to-[#2a1650]',
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

const TABS = [
  { id: 'notes', label: 'Short Notes & Formulas' },
  { id: 'pyq', label: 'PYQs' },
  { id: 'practice', label: 'Practice Papers' },
  { id: 'lectures', label: 'Free Lectures' },
  { id: 'question-bank', label: 'Question Bank' },
  { id: 'ebooks', label: 'e-Books' },
  { id: 'ncert', label: 'NCERT' },
];

function SectionShell({
  id, title, blurb, viewAllHref, children,
}: {
  id: string; title: string; blurb: string; viewAllHref: string; children: React.ReactNode;
}) {
  return (
    <section id={`library-${id}`} className="space-y-4 scroll-mt-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[var(--student-text)] tracking-tight">{title}</h2>
          <p className="text-xs text-[var(--student-text-faint)] mt-1 font-medium">{blurb}</p>
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6d28d9] flex-shrink-0 hover:gap-2.5 transition-all"
        >
          View All
          <IconArrowRight size={14} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function RowScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

function LinkCard({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link
      href={href}
      className="student-card p-5 md:p-6 flex items-center gap-4 hover:border-[#6d28d9] hover:shadow-lg transition-all group w-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-[#6d28d9]/20">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--student-text)]">{title}</p>
        <p className="text-xs text-[var(--student-text-muted)] mt-0.5 leading-relaxed">{text}</p>
      </div>
      <IconArrowRight size={16} className="text-[#6d28d9] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
    </Link>
  );
}

function SkeletonRow() {
  return (
    <RowScroller>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="student-card overflow-hidden min-w-[240px] max-w-[240px] snap-start flex-shrink-0">
          <div className="skeleton h-24 rounded-none" />
          <div className="p-4 space-y-2">
            <div className="skeleton h-3.5 w-4/5" />
            <div className="skeleton h-3 w-3/5" />
          </div>
        </div>
      ))}
    </RowScroller>
  );
}

export default function LibraryPage() {
  const [xp, setXp] = useState<number | null>(null);
  const [sheets, setSheets] = useState<Sheet[] | null>(null);
  const [pyqs, setPyqs] = useState<PyqExam[] | null>(null);
  const [lectures, setLectures] = useState<Lecture[] | null>(null);
  const [books, setBooks] = useState<Book[] | null>(null);
  const [qb, setQb] = useState<{ total: number; distribution: { difficulty: string; count: number }[] } | null>(null);

  useEffect(() => {
    fetch('/api/student/xp')
      .then((r) => r.json())
      .then((d) => { if (d.success) setXp(Number(d.data?.totalXP) || 0); })
      .catch(() => {});

    fetch('/api/student/formula-sheets')
      .then((r) => r.json())
      .then((d) => setSheets(d.success && Array.isArray(d.data) ? d.data : []))
      .catch(() => setSheets([]));

    fetch('/api/student/pyq')
      .then((r) => r.json())
      .then((d) => setPyqs(d.success ? (d.data?.pyqExams || []) : []))
      .catch(() => setPyqs([]));

    fetch('/api/student/free-lectures')
      .then((r) => r.json())
      .then((d) => setLectures(d.success ? (d.data?.lectures || []) : []))
      .catch(() => setLectures([]));

    fetch('/api/student/ebooks')
      .then((r) => r.json())
      .then((d) => setBooks(d.success && Array.isArray(d.data?.books) ? d.data.books : []))
      .catch(() => setBooks([]));

    fetch('/api/student/question-bank?page=1')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setQb({
            total: Number(d.data?.pagination?.total) || 0,
            distribution: d.data?.filters?.difficultyDistribution || [],
          });
        } else setQb({ total: 0, distribution: [] });
      })
      .catch(() => setQb({ total: 0, distribution: [] }));
  }, []);

  return (
    <div className="space-y-10">
      {/* ── Header: back arrow + title + XP chip ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/app"
          aria-label="Back to dashboard"
          className="w-10 h-10 rounded-full border border-[var(--student-border)] bg-[var(--student-surface)] flex items-center justify-center text-[var(--student-text)] hover:border-[#6d28d9] hover:text-[#6d28d9] transition-colors flex-shrink-0"
        >
          <IconArrowLeft size={17} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--student-text)] tracking-tight">Library</h1>
          <p className="text-sm text-[var(--student-text-muted)] mt-0.5">
            Saara free study material ek jagah — notes, PYQ, practice, lectures aur books.
          </p>
        </div>
        {xp !== null && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#f5b942]/15 border border-[#f5b942]/40 text-[#92600a] dark:text-[#f5b942] text-sm font-bold flex-shrink-0">
            <IconZap size={15} />
            {xp} XP
          </span>
        )}
      </div>

      {/* ── Category tabs (anchor navigation) ── */}
      <nav className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Library categories">
        {TABS.map((tab) => (
          <a
            key={tab.id}
            href={`#library-${tab.id}`}
            className="px-4 py-2 rounded-full border border-[var(--student-border)] bg-[var(--student-surface)] text-sm font-semibold text-[var(--student-text-secondary)] hover:border-[#6d28d9] hover:text-[#6d28d9] transition-colors whitespace-nowrap"
          >
            {tab.label}
          </a>
        ))}
      </nav>

      {/* ── Short Notes & Formula Sheets ── */}
      <SectionShell
        id="notes"
        title="Short Notes & Formula Sheets"
        blurb="Exam se pehle 5 minute me poora chapter revise karo."
        viewAllHref="/app/formula-sheets"
      >
        {sheets === null ? (
          <SkeletonRow />
        ) : sheets.length === 0 ? (
          <LinkCard
            href="/app/formula-sheets"
            icon={<IconFileText size={20} />}
            title="Formula Sheets kholo"
            text="Chapter-wise formula sheets aur short notes yahan milenge — naye sheets jald aa rahe hain."
          />
        ) : (
          <RowScroller>
            {sheets.slice(0, 8).map((sheet) => {
              const formulaCount = (sheet.content || []).reduce((n, s) => n + (s.formulas?.length || 0), 0);
              return (
                <article key={sheet.id} className="student-card overflow-hidden min-w-[240px] max-w-[240px] snap-start flex-shrink-0 flex flex-col hover:border-[#6d28d9] hover:shadow-lg transition-all group">
                  <div className="h-24 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                    <IconFileText size={34} />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-sm font-bold text-[var(--student-text)] leading-snug line-clamp-2">{sheet.title}</h3>
                    <p className="text-[11px] text-[var(--student-text-faint)] font-medium truncate">
                      {[sheet.subjectName, sheet.chapterName].filter(Boolean).join(' • ') || 'Formula Sheet'}
                    </p>
                    {formulaCount > 0 && (
                      <p className="text-[11px] text-[var(--student-text-muted)]">{formulaCount} formulas</p>
                    )}
                    <Link
                      href="/app/formula-sheets"
                      className="mt-auto pt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#6d28d9] text-[#6d28d9] text-xs font-bold hover:bg-[#6d28d9] hover:text-white transition-colors"
                    >
                      View Now
                    </Link>
                  </div>
                </article>
              );
            })}
          </RowScroller>
        )}
      </SectionShell>

      {/* ── PYQs ── */}
      <SectionShell
        id="pyq"
        title="Previous Year Questions"
        blurb="Asli exam papers, timer ke saath — pattern samjho, taiyaari pakki karo."
        viewAllHref="/app/pyq"
      >
        {pyqs === null ? (
          <SkeletonRow />
        ) : pyqs.length === 0 ? (
          <LinkCard
            href="/app/pyq"
            icon={<IconFileText size={20} />}
            title="PYQ Papers kholo"
            text="Previous year ke papers year-wise aur subject-wise yahan milenge — naye papers jald aa rahe hain."
          />
        ) : (
          <RowScroller>
            {pyqs.slice(0, 8).map((exam) => (
              <article key={exam.id} className="student-card overflow-hidden min-w-[240px] max-w-[240px] snap-start flex-shrink-0 flex flex-col hover:border-[#6d28d9] hover:shadow-lg transition-all group">
                <div className="h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                  <IconFileText size={34} />
                  {exam.year && (
                    <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-white/90 text-indigo-700">
                      {exam.year}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-sm font-bold text-[var(--student-text)] leading-snug line-clamp-2">{exam.title}</h3>
                  <p className="text-[11px] text-[var(--student-text-faint)] font-medium truncate">
                    {[exam.examName, exam.subject].filter(Boolean).join(' • ') || 'Previous Year Paper'}
                  </p>
                  <p className="text-[11px] text-[var(--student-text-muted)]">
                    {exam.totalQuestions} questions • {exam.totalMarks} marks • {exam.timeLimitMinutes} min
                  </p>
                  <Link
                    href="/app/pyq"
                    className="mt-auto pt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#6d28d9] text-[#6d28d9] text-xs font-bold hover:bg-[#6d28d9] hover:text-white transition-colors"
                  >
                    View Now
                  </Link>
                </div>
              </article>
            ))}
          </RowScroller>
        )}
      </SectionShell>

      {/* ── Practice Papers ── */}
      <SectionShell
        id="practice"
        title="Chapterwise Practice Papers"
        blurb="Topic-wise practice se kamzor hisse strong banao."
        viewAllHref="/app/practice"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LinkCard
            href="/app/practice"
            icon={<IconTarget size={20} />}
            title="Practice Zone"
            text="Chapter-wise practice sessions — roz ki practice, turant feedback ke saath."
          />
          <LinkCard
            href="/app/dpp"
            icon={<IconZap size={20} />}
            title="Daily Practice Problems"
            text="Roz ke DPP se consistency banao — chhote sets, roz ka target."
          />
        </div>
      </SectionShell>

      {/* ── Free Lectures ── */}
      <SectionShell
        id="lectures"
        title="Free Lectures"
        blurb="Bina kisi charge ke — free courses aur preview lectures, seedha classroom se."
        viewAllHref="/app/courses"
      >
        {lectures === null ? (
          <SkeletonRow />
        ) : lectures.length === 0 ? (
          <LinkCard
            href="/app/courses"
            icon={<IconPlay size={20} />}
            title="Courses kholo"
            text="Free lectures courses ke andar milenge — free course choose karke padhai shuru karo."
          />
        ) : (
          <RowScroller>
            {lectures.slice(0, 10).map((lec) => (
              <article key={lec.id} className="student-card overflow-hidden min-w-[260px] max-w-[260px] snap-start flex-shrink-0 flex flex-col hover:border-[#6d28d9] hover:shadow-lg transition-all group">
                <div className={`h-24 bg-gradient-to-br ${coverFor(lec.id)} flex items-center justify-center text-white relative overflow-hidden`}>
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                  <span className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <IconPlay size={20} />
                  </span>
                  <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 uppercase tracking-wide">
                    Free
                  </span>
                  {lec.duration && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-black/30 text-white">
                      <IconClock size={10} />
                      {lec.duration}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-sm font-bold text-[var(--student-text)] leading-snug line-clamp-2">{lec.title}</h3>
                  <p className="text-[11px] text-[var(--student-text-faint)] font-medium truncate">
                    {[lec.subject, lec.chapter].filter(Boolean).join(' • ') || lec.courseTitle}
                  </p>
                  <p className="text-[11px] text-[var(--student-text-muted)] truncate">{lec.courseTitle}</p>
                  <Link
                    href={`/app/learn/${lec.courseId}?lecture=${lec.id}`}
                    className="mt-auto pt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#6d28d9] text-[#6d28d9] text-xs font-bold hover:bg-[#6d28d9] hover:text-white transition-colors"
                  >
                    <IconPlay size={12} />
                    Watch Now
                  </Link>
                </div>
              </article>
            ))}
          </RowScroller>
        )}
      </SectionShell>

      {/* ── Question Bank ── */}
      <SectionShell
        id="question-bank"
        title="Free Question Bank"
        blurb="Difficulty aur type ke hisaab se filtered handpicked questions."
        viewAllHref="/app/question-bank"
      >
        {qb === null ? (
          <SkeletonRow />
        ) : qb.total === 0 ? (
          <LinkCard
            href="/app/question-bank"
            icon={<IconTarget size={20} />}
            title="Question Bank kholo"
            text="Har chapter ke curated questions yahan milenge — bank taiyaar ho raha hai."
          />
        ) : (
          <div className="student-card p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-teal-500/20">
                <IconTarget size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--student-text)]">
                  {qb.total} questions available
                </p>
                {qb.distribution.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {qb.distribution.map((d) => (
                      <span
                        key={d.difficulty}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--student-surface-hover)] text-[var(--student-text-secondary)] uppercase tracking-wider"
                      >
                        {String(d.difficulty).replace('_', ' ')} · {d.count}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-[var(--student-text-muted)] mt-2 leading-relaxed">
                  Subject, chapter, difficulty aur type — jaise chaho waisa filter karke practice karo.
                </p>
              </div>
              <Link
                href="/app/question-bank"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2a1650] text-white text-sm font-bold hover:bg-[#6d28d9] transition-colors flex-shrink-0"
              >
                View Now
                <IconArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </SectionShell>

      {/* ── e-Books ── */}
      <SectionShell
        id="ebooks"
        title="e-Books & Notes"
        blurb="Textbooks, short notes aur reference material — kabhi bhi padho."
        viewAllHref="/app/ebooks"
      >
        {books === null ? (
          <SkeletonRow />
        ) : books.length === 0 ? (
          <LinkCard
            href="/app/ebooks"
            icon={<IconBook size={20} />}
            title="e-Books kholo"
            text="Digital books aur notes yahan milenge — library me naya material jald aa raha hai."
          />
        ) : (
          <RowScroller>
            {books.slice(0, 8).map((book) => (
              <article key={book.id} className="student-card overflow-hidden min-w-[240px] max-w-[240px] snap-start flex-shrink-0 flex flex-col hover:border-[#6d28d9] hover:shadow-lg transition-all group">
                <div className={`h-24 bg-gradient-to-br ${coverFor(book.id)} flex items-center justify-center text-white relative overflow-hidden`}>
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                  <IconBook size={34} />
                  {book.isFree && (
                    <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 uppercase tracking-wide">
                      Free
                    </span>
                  )}
                  {book.pageCount ? (
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-black/30 text-white">
                      {book.pageCount} pages
                    </span>
                  ) : null}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-sm font-bold text-[var(--student-text)] leading-snug line-clamp-2">{book.title}</h3>
                  <p className="text-[11px] text-[var(--student-text-faint)] font-medium truncate">
                    {[book.author ? `by ${book.author}` : null, book.category ? String(book.category).replace('_', ' ') : null].filter(Boolean).join(' • ') || 'e-Book'}
                  </p>
                  <Link
                    href="/app/ebooks"
                    className="mt-auto pt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#6d28d9] text-[#6d28d9] text-xs font-bold hover:bg-[#6d28d9] hover:text-white transition-colors"
                  >
                    View Now
                  </Link>
                </div>
              </article>
            ))}
          </RowScroller>
        )}
      </SectionShell>

      {/* ── NCERT ── */}
      <SectionShell
        id="ncert"
        title="NCERT Solutions"
        blurb="Class-wise NCERT solutions — board ki taiyaari ki neev."
        viewAllHref="/app/ncert"
      >
        <LinkCard
          href="/app/ncert"
          icon={<IconBookOpen size={20} />}
          title="NCERT Solutions kholo"
          text="Apni class aur subject choose karo — chapter-wise solutions ek jagah milenge."
        />
      </SectionShell>

      {/* ── Bottom note ── */}
      <div className="student-card p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#6d28d9]/10 text-[#6d28d9] flex items-center justify-center flex-shrink-0">
          <IconLibrary size={22} />
        </div>
        <p className="text-xs md:text-sm text-[var(--student-text-muted)] leading-relaxed">
          Library ka material lagatar badh raha hai — naye notes, papers, lectures aur books
          yahan judte rahenge. Roz 10 minute ka revision bhi exam me bada fark laata hai.
        </p>
      </div>
    </div>
  );
}
