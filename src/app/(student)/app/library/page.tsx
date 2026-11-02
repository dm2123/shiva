'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IconAward, IconBook, IconClipboard, IconClock, IconDownload, IconFileText,
  IconPlay, IconSearch, IconTarget, IconX,
} from '@/components/student/StudentIcons';
import { IconChevronLeft, IconChevronRight } from '@/components/student/ShivaIcons';

/**
 * THE SHIVA — Student Library (PW Library page ki anatomy).
 *
 * Structure (PW jaisa): bada 'Library' title → text-tabs (active par
 * violet bold + violet underline) — PW ke tab naam/kram par:
 * Exam Zone | Learning Zone | Ranker's Zone | Top Lectures. Sections
 * seedha page par hain (koi bada safed wrapper card nahi) — har
 * section ka header row (icon + title + daayen 'View All' violet
 * link) aur neeche horizontal scroll row ke item cards.
 *   - Exam Zone → PYQ papers, asal `examName` se group karke har
 *     exam ka alag section ('<Exam> - PYP PDFs'); PDF wale papers
 *     document card, bina-PDF wale attempt-test card (asal variant).
 *   - Learning Zone → Formula Sheets + eBooks + Question Bank —
 *     teeno isi zone ke sections (purani categories ka data kahin
 *     khoya nahi; Question Bank ka apna page sidebar me pehle se hai).
 *   - Ranker's Zone → SHIVA ke paas iske liye koi data source hai
 *     hi nahi — isliye sirf imaandaar khaali state, nakli ranker /
 *     topper content bilkul nahi.
 *   - Top Lectures → Free Lectures (published courses ke
 *     preview/free lectures — sabse bhara asal data yahi hai).
 * Har section apne asal student API se data laata hai. Jo data nahi
 * hai woh invent nahi hota — khaali section me imaandaar chhota
 * note aata hai.
 *
 * Notes aur Formula Sheets ka asal data ek hi source (FormulaSheets)
 * se aata hai, isliye PW ke 'Short Notes and Mindmaps' wale combined
 * section ki tarah yahan bhi ek hi section hai — same items do
 * sections me dohrana duplication hota. Practice / DPP / NCERT
 * sidebar me apne pages par hain, isliye Library me dohre section
 * nahi hain.
 */

interface Sheet {
  id: string; title: string; subjectName?: string; chapterName?: string; courseTitle?: string;
  pdfUrl?: string | null; difficulty?: string; language?: string; downloadCount?: number;
  createdAt?: string; content?: { formulas?: unknown[] }[];
}
interface PyqExam {
  id: string; examName: string | null; year: number | null; subject: string | null;
  shift?: string | null; totalQuestions: number; totalMarks: number;
  durationMinutes?: number; pdfUrl?: string | null;
}
interface Lecture { id: string; title: string; courseId: string; courseTitle: string; subject?: string; chapter?: string; duration?: string }
interface Book {
  id: string; title: string; author?: string; category?: string; pageCount?: number;
  isFree?: boolean; fileUrl?: string | null; coverUrl?: string | null; language?: string;
  subjectName?: string; createdAt?: string; downloadCount?: number;
}

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

function fmtDate(v?: string | null): string {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** 'en' → 'En', 'hi' → 'Hi' (PW ke language chip jaisa) */
function langLabel(l?: string | null): string {
  if (!l) return '';
  const s = l.trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

/** File URL se asal format chip — sirf pehchane hue extensions par */
function fmtFromUrl(u?: string | null): string {
  if (!u) return '';
  const m = u.split('?')[0].match(/\.([a-z0-9]+)$/i);
  const ext = (m?.[1] || '').toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'epub') return 'EPUB';
  return '';
}

const TABS = [
  { id: 'exam-zone', label: 'Exam Zone' },
  { id: 'learning-zone', label: 'Learning Zone' },
  { id: 'rankers-zone', label: "Ranker's Zone" },
  { id: 'top-lectures', label: 'Top Lectures' },
] as const;
type TabId = (typeof TABS)[number]['id'];

/* ── Section header + content, seedha page par (bada safed wrapper NAHI) ── */
function SectionBlock({
  icon, title, viewAllHref, children,
}: {
  icon: React.ReactNode; title: string; viewAllHref: string; children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex shrink-0 items-center justify-center text-[#6d28d9]">{icon}</span>
        <h2 className="min-w-0 flex-1 truncate text-[18px] font-bold leading-snug text-gray-900">{title}</h2>
        <Link
          href={viewAllHref}
          className="shrink-0 text-[14px] font-semibold text-[#6d28d9] transition-colors hover:text-[#2a1650]"
        >
          View All
        </Link>
      </div>
      {children}
    </section>
  );
}

/* ── Horizontal scroll row + kinare wale gol arrow buttons (PW carousel) ── */
function CardRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 380, behavior: 'smooth' });
  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex items-stretch gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label="Pichhle items"
        className="absolute -left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition hover:text-[#6d28d9] md:flex"
      >
        <IconChevronLeft size={17} />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Agle items"
        className="absolute -right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition hover:text-[#6d28d9] md:flex"
      >
        <IconChevronRight size={17} />
      </button>
    </div>
  );
}

function Chips({ format, language }: { format?: string; language?: string }) {
  if (!format && !language) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {format && (
        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10.5px] font-black tracking-wide text-red-600">
          <IconFileText size={11} />
          {format}
        </span>
      )}
      {language && (
        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[10.5px] font-bold text-gray-600">
          {language}
        </span>
      )}
    </div>
  );
}

/* ── Document card (PW PDF variant): thumbnail baayen, content daayen ── */
function DocCard({
  thumb, title, meta, date, format, language, viewHref, viewExternal, downloadUrl,
}: {
  thumb: React.ReactNode; title: string; meta?: string; date?: string;
  format?: string; language?: string; viewHref: string; viewExternal?: boolean;
  downloadUrl?: string | null;
}) {
  const viewCls =
    'inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-[13px] font-bold text-gray-800 transition hover:border-[#6d28d9] hover:text-[#6d28d9]';
  return (
    <article className="flex w-[320px] shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-white sm:w-[364px]">
      {thumb}
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 text-[14.5px] font-bold leading-snug text-gray-900">{title}</h3>
        {meta ? (
          <p className="truncate text-[12px] font-medium text-gray-500">{meta}</p>
        ) : null}
        {date ? <p className="text-[12px] text-gray-400">{date}</p> : null}
        <Chips format={format} language={language} />
        <div className="mt-auto flex items-center gap-2 pt-2.5">
          {viewExternal ? (
            <a href={viewHref} target="_blank" rel="noopener noreferrer" className={viewCls}>
              View Now
            </a>
          ) : (
            <Link href={viewHref} className={viewCls}>
              View Now
            </Link>
          )}
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} download karo`}
              className="inline-flex h-[38px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[#6d28d9] transition hover:bg-violet-100"
            >
              <IconDownload size={17} />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ── Test card (PW PYQ-test variant) ───────────────────────── */
function TestCard({
  title, meta, questions, marks, minutes, difficulty, attemptHref,
}: {
  title: string; meta?: string; questions: number; marks: number;
  minutes?: number; difficulty?: string | null; attemptHref: string;
}) {
  return (
    <article className="flex w-[300px] shrink-0 snap-start flex-col rounded-xl border border-gray-200 bg-white p-4 sm:w-[330px]">
      {difficulty ? (
        <span className="mb-2.5 inline-flex w-fit items-center rounded-md bg-violet-50 px-2 py-1 text-[11px] font-bold capitalize text-[#6d28d9]">
          {difficulty.replace('_', ' ')}
        </span>
      ) : null}
      <h3 className="line-clamp-2 text-[16px] font-bold leading-snug text-gray-900">{title}</h3>
      {meta ? <p className="mt-1 truncate text-[12.5px] font-medium text-gray-500">{meta}</p> : null}
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <IconClipboard size={14} className="text-gray-400" />
          {questions} Questions
        </span>
        <span aria-hidden="true" className="text-gray-300">•</span>
        <span className="inline-flex items-center gap-1.5">
          <IconAward size={14} className="text-gray-400" />
          {marks} Marks
        </span>
        {minutes ? (
          <>
            <span aria-hidden="true" className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <IconClock size={14} className="text-gray-400" />
              {minutes} min
            </span>
          </>
        ) : null}
      </p>
      <div className="mt-auto pt-4">
        <Link
          href={attemptHref}
          className="block rounded-lg bg-[#ede9fe] py-2.5 text-center text-[14px] font-bold text-[#6d28d9] transition hover:bg-[#ddd6fe]"
        >
          Attempt Now
        </Link>
      </div>
    </article>
  );
}

/* ── Lecture card (video variant) ──────────────────────────── */
function LectureCard({ lec }: { lec: Lecture }) {
  return (
    <article className="flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className={`relative flex h-[104px] items-center justify-center bg-gradient-to-br ${coverFor(lec.id)} text-white`}>
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <IconPlay size={19} />
        </span>
        <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-400 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-emerald-950">
          Free
        </span>
        {lec.duration && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white">
            <IconClock size={10} />
            {lec.duration}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 text-[14.5px] font-bold leading-snug text-gray-900">{lec.title}</h3>
        <p className="truncate text-[12px] font-medium text-gray-500">
          {[lec.subject, lec.chapter].filter(Boolean).join(' • ') || lec.courseTitle}
        </p>
        <p className="truncate text-[12px] text-gray-400">{lec.courseTitle}</p>
        <div className="mt-auto pt-2.5">
          <Link
            href={`/app/learn/${lec.courseId}?lecture=${lec.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-[13px] font-bold text-gray-800 transition hover:border-[#6d28d9] hover:text-[#6d28d9]"
          >
            <IconPlay size={12} />
            Watch Now
          </Link>
        </div>
      </div>
    </article>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-[132px] w-[320px] shrink-0 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

function EmptyNote({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-5 text-center">
      <p className="text-[13px] leading-relaxed text-gray-500">{text}</p>
      <Link href={href} className="mt-1.5 inline-block text-[13px] font-bold text-[#6d28d9] hover:text-[#2a1650]">
        {cta}
      </Link>
    </div>
  );
}

/* ── PYQ papers ko asal examName se group karna (L2) ──────────
   Exam-naam wale groups pehle (zyada papers wala pehle, phir
   varnamala kram); bina examName wale papers aakhir me ek saamanya
   'PYP PDFs' section me — koi exam naam invent NAHI hota. */
function groupPyqsByExam(list: PyqExam[]): { examName: string | null; exams: PyqExam[] }[] {
  const map = new Map<string, PyqExam[]>();
  for (const e of list) {
    const key = (e.examName || '').trim();
    const arr = map.get(key);
    if (arr) arr.push(e);
    else map.set(key, [e]);
  }
  return [...map.entries()]
    .map(([k, exams]) => ({ examName: k || null, exams }))
    .sort((a, b) => {
      if (a.examName === null) return 1;
      if (b.examName === null) return -1;
      return b.exams.length - a.exams.length || a.examName.localeCompare(b.examName);
    });
}

/* ── Ek exam ka PYQ section ('<Exam> - PYP PDFs') ───────────── */
function PyqExamSection({ examName, exams }: { examName: string | null; exams: PyqExam[] }) {
  return (
    <SectionBlock
      icon={<IconClipboard size={21} />}
      title={examName ? `${examName} - PYP PDFs` : 'PYP PDFs'}
      viewAllHref="/app/pyq"
    >
      <CardRow>
        {exams.slice(0, 10).map((exam) => {
          const title = [exam.examName, exam.year].filter(Boolean).join(' ') || 'Previous Year Paper';
          const meta = [exam.subject, exam.shift].filter(Boolean).join(' • ');
          return exam.pdfUrl ? (
            <DocCard
              key={exam.id}
              thumb={
                <div className="relative flex w-[104px] shrink-0 items-center justify-center self-stretch bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white">
                  <IconFileText size={32} />
                  {exam.year ? (
                    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-black text-indigo-700">
                      {exam.year}
                    </span>
                  ) : null}
                </div>
              }
              title={title}
              meta={meta || 'Previous Year Paper'}
              format="PDF"
              viewHref={exam.pdfUrl}
              viewExternal
              downloadUrl={exam.pdfUrl}
            />
          ) : (
            <TestCard
              key={exam.id}
              title={title}
              meta={meta}
              questions={exam.totalQuestions}
              marks={exam.totalMarks}
              minutes={exam.durationMinutes}
              attemptHref="/app/pyq"
            />
          );
        })}
      </CardRow>
    </SectionBlock>
  );
}

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('exam-zone');
  const [sheets, setSheets] = useState<Sheet[] | null>(null);
  const [pyqs, setPyqs] = useState<PyqExam[] | null>(null);
  const [lectures, setLectures] = useState<Lecture[] | null>(null);
  const [books, setBooks] = useState<Book[] | null>(null);
  const [qb, setQb] = useState<{ total: number; distribution: { difficulty: string; count: number }[] } | null>(null);

  useEffect(() => {
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

  /* ── Search: asal fetched data par hi filter (koi nakli index nahi) ── */
  const searching = query.trim().length > 0;
  const q = query.trim().toLowerCase();
  const inQ = (s?: string | null) => (s || '').toLowerCase().includes(q);
  const fSheets = sheets ? sheets.filter((s) => inQ(s.title) || inQ(s.subjectName) || inQ(s.chapterName)) : null;
  const fPyqs = pyqs
    ? pyqs.filter((p) => inQ(p.examName) || inQ(p.subject) || inQ(p.year ? String(p.year) : null))
    : null;
  const fLectures = lectures ? lectures.filter((l) => inQ(l.title) || inQ(l.courseTitle) || inQ(l.subject) || inQ(l.chapter)) : null;
  const fBooks = books ? books.filter((b) => inQ(b.title) || inQ(b.author) || inQ(b.category)) : null;
  const matchCount =
    (fSheets?.length || 0) + (fPyqs?.length || 0) + (fLectures?.length || 0) + (fBooks?.length || 0);

  /* QB difficulty chips — asal difficulty wale hi groups. API ka
     difficultyDistribution NULL difficulty ko bhi group karta hai;
     String(null) + uppercase se screen par raw 'NULL' chhapta tha,
     isliye null/empty groups yahan filter hote hain. */
  const qbDist = (qb?.distribution || []).filter(
    (d) => d.difficulty != null && String(d.difficulty).trim() !== ''
  );

  const showZone = (id: TabId) => searching || activeTab === id;

  /* ── Exam Zone: PYQ exam-wise sections ── */
  const pyqList = searching ? fPyqs : pyqs;
  const examZone = (
    <>
      {pyqs === null ? (
        <SkeletonRow />
      ) : pyqs.length === 0 ? (
        <EmptyNote
          text="Abhi koi PYQ paper uplabdh nahi hai — naye papers jald judenge."
          href="/app/pyq"
          cta="PYQ page dekho"
        />
      ) : pyqList !== null && pyqList.length === 0 ? (
        <EmptyNote text="Is search me koi paper nahi mila — dusra keyword try karo." href="/app/pyq" cta="Saare papers dekho" />
      ) : (
        <div className="space-y-8">
          {groupPyqsByExam(pyqList ?? []).map((g) => (
            <PyqExamSection key={g.examName ?? '__none__'} examName={g.examName} exams={g.exams} />
          ))}
        </div>
      )}
    </>
  );

  /* ── Learning Zone sections ── */
  const notesSection = (
    <SectionBlock icon={<IconFileText size={21} />} title="Formula Sheets" viewAllHref="/app/formula-sheets">
      {sheets === null ? (
        <SkeletonRow />
      ) : sheets.length === 0 ? (
        <EmptyNote
          text="Abhi koi formula sheet uplabdh nahi hai — naye sheets jald judenge."
          href="/app/formula-sheets"
          cta="Formula Sheets page dekho"
        />
      ) : fSheets !== null && fSheets.length === 0 ? (
        <EmptyNote text="Is search me koi sheet nahi mili — dusra keyword try karo." href="/app/formula-sheets" cta="Saari sheets dekho" />
      ) : (
        <CardRow>
          {(fSheets ?? sheets).slice(0, 10).map((sheet) => {
            const formulaCount = (sheet.content || []).reduce((n, s) => n + (s.formulas?.length || 0), 0);
            return (
              <DocCard
                key={sheet.id}
                thumb={
                  <div className="relative flex w-[104px] shrink-0 items-center justify-center self-stretch bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
                    <IconFileText size={32} />
                  </div>
                }
                title={sheet.title}
                meta={
                  [sheet.subjectName, sheet.chapterName].filter(Boolean).join(' • ') ||
                  (formulaCount > 0 ? `${formulaCount} formulas` : 'Formula Sheet')
                }
                date={fmtDate(sheet.createdAt)}
                format={sheet.pdfUrl ? 'PDF' : ''}
                language={langLabel(sheet.language)}
                viewHref={sheet.pdfUrl || '/app/formula-sheets'}
                viewExternal={!!sheet.pdfUrl}
                downloadUrl={sheet.pdfUrl}
              />
            );
          })}
        </CardRow>
      )}
    </SectionBlock>
  );

  const ebooksSection = (
    <SectionBlock icon={<IconBook size={21} />} title="eBooks" viewAllHref="/app/ebooks">
      {books === null ? (
        <SkeletonRow />
      ) : books.length === 0 ? (
        <EmptyNote
          text="Abhi koi eBook uplabdh nahi hai — library me naya material jald judega."
          href="/app/ebooks"
          cta="eBooks page dekho"
        />
      ) : fBooks !== null && fBooks.length === 0 ? (
        <EmptyNote text="Is search me koi book nahi mili — dusra keyword try karo." href="/app/ebooks" cta="Saari books dekho" />
      ) : (
        <CardRow>
          {(fBooks ?? books).slice(0, 10).map((book) => (
            <DocCard
              key={book.id}
              thumb={
                <div className={`relative flex w-[104px] shrink-0 items-center justify-center self-stretch overflow-hidden bg-gradient-to-br ${coverFor(book.id)} text-white`}>
                  {book.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <IconBook size={32} />
                  )}
                  {book.isFree ? (
                    <span className="absolute left-2 top-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-emerald-950">
                      Free
                    </span>
                  ) : null}
                </div>
              }
              title={book.title}
              meta={
                [book.author ? `by ${book.author}` : null, book.category ? String(book.category).replace('_', ' ') : null]
                  .filter(Boolean)
                  .join(' • ') || 'eBook'
              }
              date={fmtDate(book.createdAt)}
              format={fmtFromUrl(book.fileUrl)}
              language={langLabel(book.language)}
              viewHref={book.fileUrl || '/app/ebooks'}
              viewExternal={!!book.fileUrl}
              downloadUrl={book.fileUrl}
            />
          ))}
        </CardRow>
      )}
    </SectionBlock>
  );

  const qbSection = (
    <SectionBlock icon={<IconTarget size={21} />} title="Question Bank" viewAllHref="/app/question-bank">
      {qb === null ? (
        <SkeletonRow />
      ) : qb.total === 0 ? (
        <EmptyNote
          text="Question Bank abhi taiyaar ho raha hai — curated questions jald judenge."
          href="/app/question-bank"
          cta="Question Bank dekho"
        />
      ) : (
        <div>
          <p className="text-[15px] font-bold text-gray-900">{qb.total} questions available</p>
          <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
            Subject, chapter, difficulty aur type — jaise chaho waisa filter karke practice karo.
          </p>
          {qbDist.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {qbDist.map((d) => (
                <span
                  key={d.difficulty}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-gray-600"
                >
                  {String(d.difficulty).replace('_', ' ')} · {d.count}
                </span>
              ))}
            </div>
          )}
          <Link
            href="/app/question-bank"
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2 text-[13px] font-bold text-gray-800 transition hover:border-[#6d28d9] hover:text-[#6d28d9]"
          >
            View Now
          </Link>
        </div>
      )}
    </SectionBlock>
  );

  /* Learning Zone: sections ek ke neeche ek; search me QB chhupta
     hai (uska item-wise search data hi nahi — pehle jaisa vyavhaar). */
  const learningHasMatch =
    (fSheets === null || fSheets.length > 0) || (fBooks === null || fBooks.length > 0);
  const learningZone = (
    <div className="space-y-8">
      {(!searching || fSheets === null || fSheets.length > 0) && notesSection}
      {(!searching || fBooks === null || fBooks.length > 0) && ebooksSection}
      {!searching && qbSection}
    </div>
  );

  /* ── Ranker's Zone: koi data source NAHI — imaandaar khaali state ── */
  const rankersZone = (
    <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
      <p className="text-[14px] font-semibold text-gray-700">
        Ranker&apos;s Zone me abhi koi content uplabdh nahi hai
      </p>
      <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-gray-500">
        Topper notes aur rank-holder material ke liye hamare paas abhi asal content nahi hai —
        jaise hi taiyaar hoga, yahin dikhega. Tab tak Exam Zone aur Learning Zone ka asal
        study material uplabdh hai.
      </p>
    </div>
  );

  /* ── Top Lectures section ── */
  const lecturesSection = (
    <SectionBlock icon={<IconPlay size={21} />} title="Free Lectures" viewAllHref="/app/courses">
      {lectures === null ? (
        <SkeletonRow />
      ) : lectures.length === 0 ? (
        <EmptyNote
          text="Abhi koi free lecture uplabdh nahi hai — free courses se padhai shuru karo."
          href="/app/courses"
          cta="Courses dekho"
        />
      ) : fLectures !== null && fLectures.length === 0 ? (
        <EmptyNote text="Is search me koi lecture nahi mila — dusra keyword try karo." href="/app/courses" cta="Saare courses dekho" />
      ) : (
        <CardRow>
          {(fLectures ?? lectures).slice(0, 10).map((lec) => (
            <LectureCard key={lec.id} lec={lec} />
          ))}
        </CardRow>
      )}
    </SectionBlock>
  );

  return (
    <main className="mx-auto w-full max-w-[64rem] min-w-0 space-y-6 px-4 py-6 pb-10">
      {/* ── Title + search ── */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[28px] font-extrabold leading-tight text-gray-900">Library</h1>
        <div className="ml-auto w-full sm:w-[320px]">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 transition-colors focus-within:border-[#6d28d9]">
            <IconSearch size={17} className="shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, papers, lectures, books..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              aria-label="Search library"
            />
            {searching && (
              <button
                onClick={() => setQuery('')}
                aria-label="Search saaf karo"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <IconX size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
      {searching && (
        <p className="-mt-3 text-[13px] font-medium text-gray-500">
          &ldquo;{query.trim()}&rdquo; ke liye {matchCount} items mile
        </p>
      )}

      {/* ── Text tabs (PW pattern: bold active + violet underline) ── */}
      {!searching && (
        <nav
          className="flex gap-6 overflow-x-auto border-b border-gray-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8"
          aria-label="Library categories"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={active ? 'true' : undefined}
                className={`relative whitespace-nowrap pb-2.5 text-[15px] transition-colors ${
                  active
                    ? 'font-bold text-[#6d28d9]'
                    : 'font-semibold text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span
                  className={`absolute inset-x-0 -bottom-px h-[2.5px] rounded-full ${active ? 'bg-[#6d28d9]' : 'bg-transparent'}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Zones (sections seedha page par — koi bada safed wrapper nahi) ── */}
      {showZone('exam-zone') && (searching ? fPyqs === null || fPyqs.length > 0 : true) && examZone}
      {showZone('learning-zone') && (searching ? learningHasMatch : true) && learningZone}
      {showZone('rankers-zone') && !searching && rankersZone}
      {showZone('top-lectures') && (searching ? fLectures === null || fLectures.length > 0 : true) && lecturesSection}

      {searching && matchCount === 0 && sheets !== null && pyqs !== null && lectures !== null && books !== null && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
          <p className="text-[14px] font-semibold text-gray-700">
            &ldquo;{query.trim()}&rdquo; ke liye library me kuch nahi mila
          </p>
          <p className="mt-1 text-[13px] text-gray-500">Dusra keyword try karo, ya tabs se category kholo.</p>
        </section>
      )}
    </main>
  );
}
