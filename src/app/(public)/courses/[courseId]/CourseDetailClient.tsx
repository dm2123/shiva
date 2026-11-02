'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { EducatorProfile } from '@/types/educator';
import { formatDuration } from './format';

/* ------------------------------------------------------------------ */
/* Serializable shapes — mirror the server syllabus tree exactly.      */
/* No field here is invented: anything optional renders only when    */
/* the API/service actually supplied it.                             */
/* ------------------------------------------------------------------ */

export interface LectureDTO {
  id: string;
  title: string;
  description?: string;
  durationSeconds?: number;
  isPreviewable: boolean;
}

export interface ChapterDTO {
  id: string;
  title: string;
  description?: string;
  lectures: LectureDTO[];
}

export interface SubjectDTO {
  id: string;
  name: string;
  code?: string;
  description?: string;
  chapters: ChapterDTO[];
}

export interface BatchDTO {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

export interface FreeLectureDTO extends LectureDTO {
  subjectName: string;
  chapterTitle: string;
}

/**
 * Real course-level meta for the More Details tab.
 * Every field is optional and is rendered ONLY when the server record
 * actually carries it — nothing here is ever fabricated.
 */
export interface CourseMetaDTO {
  language?: string | null;
  validityLabel?: string | null;
  /** Asal record ka "kiske liye hai" text (lines \n se alag) — FAQ ke liye. */
  targetAudience?: string | null;
}

/**
 * Course se linked asal published test (Tests table, courseId match).
 * Sirf wohi fields jo record par sach me hain — question count per-test
 * derive nahi hota (questions chapters se jude hain), isliye yahan nahi hai.
 */
export interface CourseTestDTO {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  totalMarks?: number;
  type?: string;
  category?: string;
}

interface Props {
  /** Violet band ke andar ka hero hissa (server-rendered): H1, meta, teacher line. */
  header: React.ReactNode;
  /** Right rail (server-rendered): sticky purchase card + baaki sidebar cards. */
  rail: React.ReactNode;
  description?: string;
  subjects: SubjectDTO[];
  batches: BatchDTO[];
  teachers: EducatorProfile[];
  freeLectures: FreeLectureDTO[];
  /** Where a free-preview click should go (register / login / learn). */
  previewHref: string;
  isEnrolled: boolean;
  meta?: CourseMetaDTO;
  /** Asal published tests (courseId-linked). Khaali ho to Tests tab hi nahi banta. */
  tests?: CourseTestDTO[];
}

type TabId = 'about' | 'schedule' | 'tests' | 'teachers' | 'free' | 'more';

const PURPLE = '#6d28d9';
const PURPLE_DARK = '#2a1650';
const GOLD = '#f5b942';
const GREEN_DARK = '#166534';
const GREEN_BG = '#dcfce7';

/**
 * Tabs — PW batch-overview wala kram (structure only, SHIVA ka apna
 * content): Description | All Classes | Tests (sirf asal published
 * tests hon tab) | Teachers | Free Content | More Details.
 * Includes wala purana alag tab hata diya — wo ab Description ke
 * andar accordion ke roop me hai (duplication nahi).
 */
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'about', label: 'Description', icon: '📖' },
  { id: 'schedule', label: 'All Classes', icon: '🗂️' },
  { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
  { id: 'free', label: 'Free Content', icon: '🎬' },
  { id: 'more', label: 'More Details', icon: '📋' },
];

/** Pastel palette for Schedule subject cards — halka tint + gehra left accent. */
const SUBJECT_PASTELS: { bg: string; accent: string; chipBg: string }[] = [
  { bg: '#f5f3ff', accent: '#6d28d9', chipBg: '#ede9fe' },
  { bg: '#fffbeb', accent: '#d97706', chipBg: '#fef3c7' },
  { bg: '#ecfdf5', accent: '#059669', chipBg: '#d1fae5' },
  { bg: '#f0f9ff', accent: '#0284c7', chipBg: '#e0f2fe' },
  { bg: '#fff1f2', accent: '#e11d48', chipBg: '#ffe4e6' },
  { bg: '#fdf4ff', accent: '#a21caf', chipBg: '#fae8ff' },
];

/** "Know Your Teachers" carousel ke initials avatars ke pastel rang. */
const TEACHER_PASTELS: { bg: string; fg: string }[] = [
  { bg: '#ede9fe', fg: '#4c1d95' },
  { bg: '#fef3c7', fg: '#92400e' },
  { bg: '#d1fae5', fg: '#065f46' },
  { bg: '#e0f2fe', fg: '#075985' },
  { bg: '#ffe4e6', fg: '#9f1239' },
  { bg: '#fae8ff', fg: '#86198f' },
];

function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Subject ke liye teacher — sirf tab jab asal data match kare:
 * teacher ke subjects/specialties me subject naam ho, ya course ka
 * ek hi teacher ho. Koi match na ho to kuch nahi dikhega (nakli nahi).
 */
function teacherForSubject(
  subject: SubjectDTO,
  teachers: EducatorProfile[]
): EducatorProfile | null {
  if (teachers.length === 0) return null;
  const needle = subject.name.trim().toLowerCase();
  const match = teachers.find((t) =>
    [...(t.subjects || []), ...(t.specialties || [])].some((s) => {
      const hay = s.trim().toLowerCase();
      return hay === needle || hay.includes(needle) || needle.includes(hay);
    })
  );
  if (match) return match;
  if (teachers.length === 1) return teachers[0];
  return null;
}

/** Calm inner-section heading (hero ke muqable shaant — design language). */
const sectionTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: PURPLE_DARK,
  marginBottom: 6,
  lineHeight: 1.4,
};

export default function CourseDetailClient({
  header,
  rail,
  description,
  subjects,
  batches,
  teachers,
  freeLectures,
  previewHref,
  isEnrolled,
  meta,
  tests = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [includesOpen, setIncludesOpen] = useState(true);
  const [openSubject, setOpenSubject] = useState<string | null>(subjects[0]?.id ?? null);
  const [openChapter, setOpenChapter] = useState<string | null>(
    subjects[0]?.chapters[0]?.id ?? null
  );

  const totals = useMemo(() => {
    let chapters = 0;
    let lectures = 0;
    let seconds = 0;
    for (const s of subjects) {
      chapters += s.chapters.length;
      for (const c of s.chapters) {
        lectures += c.lectures.length;
        for (const l of c.lectures) seconds += l.durationSeconds || 0;
      }
    }
    return { chapters, lectures, seconds };
  }, [subjects]);

  /* Tabs — Tests tab sirf tab jab course ke asal published tests hon.
     Khaali ho to tab hi nahi banta (invented section nahi dikhta). */
  const visibleTabs = useMemo(() => {
    if (tests.length === 0) return TABS;
    const idx = TABS.findIndex((t) => t.id === 'schedule');
    const testsTab: { id: TabId; label: string; icon: string } = {
      id: 'tests',
      label: 'Tests',
      icon: '📝',
    };
    return [...TABS.slice(0, idx + 1), testsTab, ...TABS.slice(idx + 1)];
  }, [tests.length]);

  /* -------- Description: "Is Batch Me Kya-Kya Shamil Hai" accordion --------
     PW ke "This Batch Includes" pattern par — icon rows sirf unhi
     attributes ke liye banti hain jo course record/content me sach
     me maujood hain (subjects, lectures, schedule, validity, medium,
     audience, demo, verified teachers). Access wali row platform ki
     asal capability hai (dashboard se padhai), isliye hamesha hai. */
  const includeRows: { icon: string; bg: string; label: string; value: React.ReactNode }[] = [];
  if (subjects.length > 0) {
    includeRows.push({
      icon: '📚',
      bg: '#ede9fe',
      label: 'Subjects',
      value: subjects.map((s) => s.name).join(', '),
    });
  }
  if (totals.lectures > 0) {
    includeRows.push({
      icon: '🎬',
      bg: '#fef3c7',
      label: 'Recorded Lectures',
      value: `${totals.lectures} lectures${totals.seconds > 0 ? ` · kul ${formatDuration(totals.seconds)}` : ''} — apni gati se kabhi bhi dekho`,
    });
  }
  if (batches.length > 0) {
    includeRows.push({
      icon: '🗓️',
      bg: '#e0f2fe',
      label: 'Batch Schedule',
      value: batches
        .map((b) => {
          const st = formatDate(b.startDate);
          return `${b.name}${st ? ` — ${st} se shuru` : ''}`;
        })
        .join(' · '),
    });
  }
  if (meta?.validityLabel) {
    includeRows.push({ icon: '📅', bg: '#d1fae5', label: 'Course Validity', value: meta.validityLabel });
  }
  if (meta?.language) {
    includeRows.push({ icon: '🗣️', bg: '#ffe4e6', label: 'Padhai ka Medium', value: meta.language });
  }
  if (meta?.targetAudience?.trim()) {
    includeRows.push({
      icon: '🎯',
      bg: '#fae8ff',
      label: 'Kiske Liye Hai',
      value: <span style={{ whiteSpace: 'pre-line' }}>{meta.targetAudience.trim()}</span>,
    });
  }
  if (freeLectures.length > 0) {
    includeRows.push({
      icon: '🎁',
      bg: '#fef3c7',
      label: 'Free Demo Lectures',
      value: `${freeLectures.length} lectures bina enroll kiye preview ke liye khule hain`,
    });
  }
  if (teachers.some((t) => t.verified)) {
    includeRows.push({
      icon: '👨‍🏫',
      bg: '#ede9fe',
      label: 'Verified Educators',
      value: teachers
        .filter((t) => t.verified)
        .map((t) => t.displayName)
        .join(', '),
    });
  }
  includeRows.push({
    icon: '📱',
    bg: '#e0f2fe',
    label: 'Mobile + Desktop Access',
    value: 'Enroll ke baad apne THE SHIVA student dashboard se kabhi bhi, kahin bhi padho',
  });

  /* -------- More Details: numbered sections, asal data se hi bane -------- */
  const moreSections = useMemo(() => {
    const sections: { title: string; body: React.ReactNode }[] = [];

    if (description || subjects.length > 0) {
      sections.push({
        title: 'Course overview',
        body: (
          <>
            {description ? (
              <p style={{ marginBottom: subjects.length > 0 ? 8 : 0 }}>{description}</p>
            ) : null}
            {subjects.length > 0 && (
              <p>
                Is course me kul {subjects.length} subject
                {subjects.length === 1 ? '' : 's'} shamil hain:{' '}
                {subjects.map((s) => s.name).join(', ')}.
              </p>
            )}
          </>
        ),
      });
    }

    if (totals.lectures > 0) {
      sections.push({
        title: 'Content aur duration',
        body: (
          <p>
            Kul {totals.lectures} recorded lectures aur {totals.chapters} chapters
            {totals.seconds > 0
              ? ` — mila kar lagbhag ${formatDuration(totals.seconds)} ka video content`
              : ''}
            . Content subject-wise aur chapter-wise organised hai, taaki tum apni
            gati se aage badh sako.
          </p>
        ),
      });
    }

    if (subjects.length > 0) {
      sections.push({
        title: 'Subjects covered',
        body: (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subjects.map((s) => {
              const lec = s.chapters.reduce((n, c) => n + c.lectures.length, 0);
              return (
                <li key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ color: '#059669', fontWeight: 900 }}>✓</span>
                  <span>
                    <strong>{s.name}</strong>
                    <span style={{ color: 'var(--muted)' }}>
                      {' '}
                      — {s.chapters.length} chapters · {lec} lectures
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        ),
      });
    }

    if (meta?.language) {
      sections.push({
        title: 'Medium of instruction',
        body: (
          <p>
            Is course ki padhai <strong>{meta.language}</strong> medium me hai.
          </p>
        ),
      });
    }

    if (meta?.validityLabel) {
      sections.push({
        title: 'Validity aur access',
        body: (
          <p>
            Enroll karne ke baad course access: <strong>{meta.validityLabel}</strong>.
            Access tumhare THE SHIVA student dashboard se milta hai — mobile aur
            desktop dono par.
          </p>
        ),
      });
    }

    if (batches.length > 0) {
      sections.push({
        title: 'Batches aur schedule',
        body: (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {batches.map((b) => {
              const start = formatDate(b.startDate);
              const end = formatDate(b.endDate);
              return (
                <li key={b.id}>
                  <strong>{b.name}</strong>
                  <span style={{ color: 'var(--muted)' }}>
                    {start ? ` — ${start} se shuru` : ''}
                    {end ? ` · ${end} tak` : ''} ({b.status})
                  </span>
                </li>
              );
            })}
          </ul>
        ),
      });
    }

    if (teachers.length > 0) {
      sections.push({
        title: 'Teachers',
        body: (
          <p>
            Is course ko {teachers.map((t) => t.displayName).join(', ')} padhate
            hain. Poori profile aur baaki courses Teachers tab me dekho.
          </p>
        ),
      });
    }

    if (freeLectures.length > 0) {
      sections.push({
        title: 'Free demo content',
        body: (
          <p>
            Enroll karne se pehle {freeLectures.length} free demo lecture
            {freeLectures.length === 1 ? '' : 's'} Free Content tab me uplabdh
            hain — bina payment ke teaching style check karo.
          </p>
        ),
      });
    }

    sections.push({
      title: 'Kaise enroll karein',
      body: (
        <p>
          {isEnrolled
            ? 'Tum is course me pehle se enrolled ho — daahine card se seedha Continue Learning par jao.'
            : 'Daahine diye gaye card se Enroll karo. Free course par koi payment nahi lagega; paid course par enrollment login ke baad student dashboard se poora hota hai.'}
        </p>
      ),
    });

    return sections;
  }, [description, subjects, totals, meta, batches, teachers, freeLectures, isEnrolled]);

  /* -------- FAQ: sawal asal course fields se hi bante hain --------
     Duration / validity / language / kiske-liye-hai — jo field record
     me nahi hai, uska sawal hi nahi banta. Refund ka jawaab THE SHIVA
     ke asal Terms of Service (§6 Payment) se hai — usse zyada koi
     daava nahi. Support ka jawaab asal maujooda raaste (Contact page
     ka form / login ke baad student portal) hi deta hai — koi phone
     ya email invent nahi hota. */
  const faqItems = useMemo(() => {
    const items: { q: string; a: React.ReactNode }[] = [];

    if (meta?.targetAudience?.trim()) {
      items.push({
        q: 'Ye course kiske liye hai?',
        a: <span style={{ whiteSpace: 'pre-line' }}>{meta.targetAudience.trim()}</span>,
      });
    } else if (subjects.length > 0) {
      items.push({
        q: 'Ye course kiske liye hai?',
        a: (
          <>
            Ye course un students ke liye hai jo{' '}
            {subjects.map((s) => s.name).join(', ')} ko structured tareeke se, basics se
            shuru karke seekhna chahte hain. Poora syllabus All Classes tab me pehle se dekh
            sakte ho.
          </>
        ),
      });
    }

    if (totals.lectures > 0) {
      items.push({
        q: 'Course me kitna content hai aur kitna samay lagega?',
        a: (
          <>
            Is course me kul {totals.lectures} recorded lectures aur {totals.chapters}{' '}
            chapters hain
            {totals.seconds > 0
              ? ` — mila kar lagbhag ${formatDuration(totals.seconds)} ka video content`
              : ''}
            . Saare lectures recorded hain, isliye tum apni gati se, apne samay par padh
            sakte ho.
          </>
        ),
      });
    }

    if (meta?.language) {
      items.push({
        q: 'Course kis language (medium) me hai?',
        a: (
          <>
            Is course ki padhai <strong>{meta.language}</strong> medium me hai.
          </>
        ),
      });
    }

    if (meta?.validityLabel) {
      items.push({
        q: 'Enroll karne ke baad course ka access kitne samay tak rahega?',
        a: (
          <>
            Enroll karne ke baad is course ki validity <strong>{meta.validityLabel}</strong>{' '}
            hai. Access tumhare THE SHIVA student dashboard se milta hai — mobile aur
            desktop dono par.
          </>
        ),
      });
    }

    if (batches.length > 0) {
      const next = batches.find((b) => b.status === 'ACTIVE') || batches[0];
      const start = formatDate(next.startDate);
      items.push({
        q: 'Batch kab shuru hoga?',
        a: (
          <>
            Is course ke {batches.length} batch option{batches.length === 1 ? '' : 's'}{' '}
            uplabdh hain. {next.name}
            {start ? ` — ${start} se shuru` : ''} ({next.status}). Saare batches ki
            dates All Classes tab me di gayi hain.
          </>
        ),
      });
    }

    items.push({
      q: 'Kya main enroll karne se pehle free me try kar sakta/sakti hoon?',
      a:
        freeLectures.length > 0 ? (
          <>
            Haan — is course ke {freeLectures.length} lecture bilkul free preview ke liye
            khule hain. Upar <strong>Free Content</strong> tab me jaakar bina payment ke
            teaching style aur quality pehle check karo, phir faisla lo.
          </>
        ) : (
          <>
            Is course ke liye abhi koi free preview lecture publish nahi hua hai. Lekin
            poora syllabus — har subject, chapter aur lecture ki list —{' '}
            <strong>All Classes</strong> tab me bina enroll kiye dekh sakte ho.
          </>
        ),
    });

    items.push({
      q: 'Refund policy kya hai?',
      a: (
        <>
          THE SHIVA ke Terms of Service ke hisaab se course enrollment aur subscription
          fees aam taur par <strong>non-refundable</strong> hain — siwaye wahan jahan
          kanoon (law) ke tahat refund zaroori ho. Poori policy yahan padho:{' '}
          <Link href="/terms" style={{ color: PURPLE, fontWeight: 700 }}>
            Terms of Service →
          </Link>
        </>
      ),
    });

    items.push({
      q: 'Madad chahiye ya koi sawaal hai — sampark kaise karoon?',
      a: (
        <>
          {isEnrolled
            ? 'Tum enrolled ho — login ke baad apne student portal se support tak pahunch sakte ho. '
            : ''}
          Aam sawaalon ke liye hamari team se{' '}
          <Link href="/contact" style={{ color: PURPLE, fontWeight: 700 }}>
            Contact page
          </Link>{' '}
          par diye gaye form se sampark karo — wahi hamara official support raasta hai.
        </>
      ),
    });

    return items;
  }, [meta, subjects, totals, batches, freeLectures, isEnrolled]);

  return (
    <div>
      {/* ================= VIOLET BAND + TAB BAR ================= */}
      {/* PW batch-overview grammar: violet header band, uske andar
          H1/meta wala header (server se aaya) aur band ke neeche
          tab bar — active tab SAFED pill. Tabs sirf wahi bante hain
          jinke peeche asal data hai (Tests tab published tests par). */}
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
        {header}
        <div
          role="tablist"
          aria-label="Course sections"
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.18)',
            padding: '12px 16px',
            scrollbarWidth: 'none',
          }}
          className="cd-tabs"
        >
          {visibleTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: active ? '#ffffff' : 'rgba(255,255,255,0.08)',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  padding: '9px 16px',
                  fontSize: 13.5,
                  fontWeight: active ? 800 : 600,
                  color: active ? PURPLE_DARK : 'rgba(255,255,255,0.78)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span aria-hidden>{tab.icon}</span>
                {tab.label}
                {tab.id === 'free' && freeLectures.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: 'rgba(245,185,66,.22)',
                      color: active ? '#92400e' : GOLD,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {freeLectures.length} FREE
                  </span>
                )}
                {tab.id === 'schedule' && totals.lectures > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: active ? '#ede9fe' : 'rgba(255,255,255,.18)',
                      color: active ? PURPLE : '#fff',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {totals.lectures}
                  </span>
                )}
                {tab.id === 'tests' && tests.length > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: active ? '#ede9fe' : 'rgba(255,255,255,.18)',
                      color: active ? PURPLE : '#fff',
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {tests.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MAIN GRID: panels + sticky rail ================= */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'start' }}
        className="course-detail-grid"
      >
        <div style={{ minWidth: 0 }}>
      {/* ------------------------- DESCRIPTION ------------------------- */}
      {activeTab === 'about' && (
        <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="batch" style={{ padding: 26 }}>
            <h2 style={sectionTitle}>Is course ke baare me</h2>
            {description ? (
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {description}
              </p>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>
                Is course ka detailed description jald update hoga. Neeche diye syllabus se tum
                poora content pehle hi dekh sakte ho.
              </p>
            )}

            {/* About meta — duration / subjects / medium, asal data ho tabhi */}
            {(totals.lectures > 0 || subjects.length > 0 || meta?.language || meta?.validityLabel) && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
                  gap: 10,
                  marginTop: 20,
                }}
              >
                {totals.lectures > 0 && (
                  <AboutMeta label="Lectures" value={`${totals.lectures}`} />
                )}
                {totals.seconds > 0 && (
                  <AboutMeta label="Kul duration" value={formatDuration(totals.seconds)} />
                )}
                {subjects.length > 0 && (
                  <AboutMeta label="Subjects" value={`${subjects.length}`} />
                )}
                {totals.chapters > 0 && (
                  <AboutMeta label="Chapters" value={`${totals.chapters}`} />
                )}
                {meta?.language && <AboutMeta label="Medium" value={meta.language} />}
                {meta?.validityLabel && <AboutMeta label="Validity" value={meta.validityLabel} />}
              </div>
            )}

            {subjects.length > 0 && (
              <>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: PURPLE_DARK, margin: '22px 0 12px' }}>
                  Tum kya-kya seekhoge
                </h3>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
                  className="cd-learn-grid"
                >
                  {subjects.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        background: '#faf9ff',
                        border: '1px solid var(--line)',
                        borderRadius: 12,
                        padding: '12px 14px',
                      }}
                    >
                      <span style={{ color: '#059669', fontWeight: 900, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 }}>
                        {s.name}
                        <span style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12 }}>
                          {s.chapters.length} chapters ·{' '}
                          {s.chapters.reduce((n, c) => n + c.lectures.length, 0)} lectures
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* -------- Includes accordion (PW "This Batch Includes") -------- */}
          <div className="batch" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              type="button"
              aria-expanded={includesOpen}
              onClick={() => setIncludesOpen(!includesOpen)}
              style={{
                width: '100%',
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                padding: '20px 26px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700, color: PURPLE_DARK, lineHeight: 1.4 }}>
                Is Batch Me Kya-Kya Shamil Hai
              </span>
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  transform: includesOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform .25s',
                  color: PURPLE,
                  fontWeight: 900,
                  fontSize: 15,
                }}
              >
                ▾
              </span>
            </button>
            {includesOpen && (
              <div style={{ padding: '2px 26px 20px', display: 'flex', flexDirection: 'column' }}>
                {includeRows.map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      gap: 13,
                      alignItems: 'flex-start',
                      padding: '11px 0',
                      borderTop: i === 0 ? '1px solid var(--line)' : '1px dashed #f0edff',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: row.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 17,
                        flexShrink: 0,
                      }}
                    >
                      {row.icon}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{row.label}</span>
                      <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                        {row.value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* -------- Demo lectures strip (asal free previews hi) -------- */}
          {freeLectures.length > 0 && (
            <div className="batch" style={{ padding: 26 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: PURPLE_DARK, marginBottom: 4 }}>
                🎬 Demo Lectures — Pehle Try Karo
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.65 }}>
                Bina enroll kiye ye free preview lectures dekho — teaching style pehle
                check karo, phir faisla lo.
              </p>
              <div
                style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}
                className="cd-tabs"
              >
                {freeLectures.map((lec) => (
                  <Link
                    key={lec.id}
                    href={previewHref}
                    style={{
                      minWidth: 228,
                      maxWidth: 228,
                      flexShrink: 0,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg,#2a1650,#6d28d9)',
                      color: '#fff',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      textDecoration: 'none',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: GOLD,
                        color: PURPLE_DARK,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                      }}
                    >
                      ▶
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {lec.title}
                    </span>
                    <span style={{ fontSize: 11.5, opacity: 0.85, lineHeight: 1.55 }}>
                      {lec.subjectName} · {lec.chapterTitle}
                      {lec.durationSeconds ? ` · ${formatDuration(lec.durationSeconds)}` : ''}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* -------- Know Your Teachers carousel -------- */}
          {teachers.length > 0 && (
            <div className="batch" style={{ padding: 26 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: PURPLE_DARK, marginBottom: 4 }}>
                👨‍🏫 Know Your Teachers
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.65 }}>
                Is course ko padhane wale asal educators — poori profile ke liye
                card par click karo.
              </p>
              <div
                style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}
                className="cd-tabs"
              >
                {teachers.map((t, i) => {
                  const subs = [...(t.subjects || []), ...(t.specialties || [])];
                  const initials =
                    t.displayName
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w.charAt(0).toUpperCase())
                      .join('') || 'T';
                  const pastel = TEACHER_PASTELS[i % TEACHER_PASTELS.length];
                  return (
                    <Link
                      key={t.id}
                      href={`/teachers/${t.slug}`}
                      style={{
                        minWidth: 218,
                        maxWidth: 218,
                        flexShrink: 0,
                        border: '1.5px solid var(--line)',
                        borderRadius: 16,
                        padding: 18,
                        background: '#fff',
                        display: 'block',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      {t.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.logoUrl}
                          alt={t.displayName}
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginBottom: 12,
                            background: '#fff',
                          }}
                        />
                      ) : (
                        <span
                          aria-hidden
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background: pastel.bg,
                            color: pastel.fg,
                            fontSize: 19,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12,
                          }}
                        >
                          {initials}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 15, flexWrap: 'wrap', lineHeight: 1.35 }}>
                        {t.displayName}
                        {t.verified && (
                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 800,
                              background: GREEN_BG,
                              color: GREEN_DARK,
                              padding: '2px 7px',
                              borderRadius: 999,
                            }}
                          >
                            ✓ VERIFIED
                          </span>
                        )}
                      </span>
                      {subs.length > 0 && (
                        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55, marginTop: 4 }}>
                          {subs.join(' · ')}
                        </span>
                      )}
                      {t.tagline && (
                        <span style={{ display: 'block', fontSize: 12.5, color: PURPLE, fontWeight: 600, marginTop: 4, lineHeight: 1.55 }}>
                          {t.tagline}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {batches.length > 0 && (
            <div className="batch" style={{ padding: 26 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: PURPLE_DARK, marginBottom: 6 }}>
                Batch jankari
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 14 }}>
                Is course ke batches aur unki start dates — poori schedule ke liye{' '}
                <button
                  onClick={() => setActiveTab('schedule')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: PURPLE,
                    fontWeight: 700,
                    fontSize: 13.5,
                  }}
                >
                  All Classes tab
                </button>{' '}
                dekho.
              </p>
              <BatchList batches={batches} compact />
            </div>
          )}
        </div>
      )}

      {/* ------------------------- SCHEDULE ------------------------- */}
      {activeTab === 'schedule' && (
        <div role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Subject rows — dark pattern: ring-graphic box + naam +
              "N Lectures | N Chapters" (sirf asal counts; koi % nahi,
              kyunki public page par visitor ki asal progress hoti hi nahi) */}
          {subjects.length > 0 && (
            <div>
              <h2 style={{ ...sectionTitle, marginBottom: 12 }}>Subjects aur unki schedule</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {subjects.map((subject) => {
                  const lectureCount = subject.chapters.reduce(
                    (n, c) => n + c.lectures.length,
                    0
                  );
                  const teacher = teacherForSubject(subject, teachers);
                  const initials =
                    subject.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w.charAt(0).toUpperCase())
                      .join('') || 'S';
                  return (
                    <div
                      key={subject.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        background: '#12121a',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: 16,
                        padding: '16px 18px',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 52,
                          height: 52,
                          flexShrink: 0,
                          borderRadius: 14,
                          background: '#17171f',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                          <circle cx="20" cy="20" r="15.5" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3.5" />
                          <circle
                            cx="20"
                            cy="20"
                            r="15.5"
                            fill="none"
                            stroke={PURPLE}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray="24 97.4"
                            transform="rotate(-90 20 20)"
                          />
                        </svg>
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 900,
                            color: '#e4e4e7',
                          }}
                        >
                          {initials}
                        </span>
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800, color: '#f4f4f5', lineHeight: 1.35 }}>
                          {subject.name}
                        </span>
                        <span style={{ display: 'block', fontSize: 12.5, color: '#a1a1aa', marginTop: 3 }}>
                          {lectureCount} Lectures | {subject.chapters.length} Chapters
                          {teacher && (
                            <>
                              {' · '}Teacher: <strong style={{ color: '#d4d4d8' }}>{teacher.displayName}</strong>
                            </>
                          )}
                        </span>
                        {subject.description && (
                          <span
                            style={{
                              display: '-webkit-box',
                              fontSize: 12.5,
                              color: '#a1a1aa',
                              lineHeight: 1.6,
                              marginTop: 4,
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {subject.description}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {batches.length > 0 && (
            <div className="batch" style={{ padding: 26 }}>
              <h2 style={{ ...sectionTitle, marginBottom: 16 }}>🗓️ Batches &amp; Schedule</h2>
              <BatchList batches={batches} />
            </div>
          )}

          {/* Curriculum panel — dark (chapter cards wala pattern) */}
          <div
            className="batch"
            style={{
              padding: 26,
              background: '#0d0d13',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#e4e4e7',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 18,
              }}
            >
              <h2 style={{ ...sectionTitle, color: '#f4f4f5' }}>📋 Curriculum — Contents</h2>
              {totals.lectures > 0 && (
                <span style={{ fontSize: 12.5, color: '#a1a1aa', fontWeight: 600 }}>
                  {subjects.length} subjects · {totals.chapters} chapters · {totals.lectures} lectures
                  {totals.seconds > 0 ? ` · ${formatDuration(totals.seconds)}` : ''}
                </span>
              )}
            </div>

            {subjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.35 }}>📝</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Syllabus jald aa raha hai</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Subjects aur chapters hamare educators publish kar rahe hain.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {subjects.map((subject, sIdx) => {
                  const isOpen = openSubject === subject.id;
                  const palette = SUBJECT_PASTELS[sIdx % SUBJECT_PASTELS.length];
                  const lectureCount = subject.chapters.reduce((n, c) => n + c.lectures.length, 0);
                  return (
                    <div
                      key={subject.id}
                      style={{
                        border: `1.5px solid ${isOpen ? palette.accent : 'rgba(255,255,255,0.1)'}`,
                        borderLeft: `5px solid ${palette.accent}`,
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: '#12121a',
                      }}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenSubject(isOpen ? null : subject.id)}
                        style={{
                          width: '100%',
                          appearance: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          background: isOpen ? '#17171f' : '#12121a',
                          color: '#f4f4f5',
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 11,
                              fontWeight: 800,
                              background: palette.chipBg,
                              color: palette.accent,
                              padding: '3px 8px',
                              borderRadius: 6,
                              flexShrink: 0,
                            }}
                          >
                            {subject.code || `S${String(sIdx + 1).padStart(2, '0')}`}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{subject.name}</span>
                        </span>
                        <span style={{ fontSize: 12, color: '#a1a1aa', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {subject.chapters.length} chapters · {lectureCount} lectures
                          <span style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>▾</span>
                        </span>
                      </button>

                      {isOpen && (
                        <div style={{ padding: '14px 16px', background: '#0d0d13', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {subject.description && (
                            <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6 }}>{subject.description}</p>
                          )}
                          {subject.chapters.length === 0 ? (
                            <p style={{ fontSize: 13, color: '#a1a1aa', fontStyle: 'italic' }}>
                              Is subject ke chapters jald publish honge.
                            </p>
                          ) : (
                            subject.chapters.map((chapter, cIdx) => {
                              const chOpen = openChapter === chapter.id;
                              return (
                                <div
                                  key={chapter.id}
                                  style={{
                                    background: '#17171f',
                                    borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.09)',
                                    borderLeft: `4px solid ${PURPLE}`,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <button
                                    type="button"
                                    aria-expanded={chOpen}
                                    onClick={() => setOpenChapter(chOpen ? null : chapter.id)}
                                    style={{
                                      width: '100%',
                                      appearance: 'none',
                                      border: 'none',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      fontFamily: 'inherit',
                                      textAlign: 'left',
                                      color: '#f4f4f5',
                                      padding: '13px 16px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      gap: 10,
                                    }}
                                  >
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                                      <span style={{ color: '#a1a1aa', fontWeight: 600, marginRight: 6 }}>
                                        {sIdx + 1}.{cIdx + 1}
                                      </span>
                                      {chapter.title}
                                    </span>
                                    <span style={{ fontSize: 12, color: '#a1a1aa', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 800,
                                          background: 'rgba(109,40,217,.25)',
                                          color: '#c4b5fd',
                                          padding: '3px 9px',
                                          borderRadius: 999,
                                        }}
                                      >
                                        🎬 {chapter.lectures.length} Lectures
                                      </span>
                                      <span style={{ display: 'inline-block', transform: chOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>▾</span>
                                    </span>
                                  </button>

                                  {chOpen && (
                                    <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column' }}>
                                      {chapter.description && (
                                        <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 8 }}>{chapter.description}</p>
                                      )}
                                      {chapter.lectures.length === 0 ? (
                                        <p style={{ fontSize: 12.5, color: '#a1a1aa', fontStyle: 'italic' }}>
                                          Is chapter ke liye abhi koi lecture uplabdh nahi hai.
                                        </p>
                                      ) : (
                                        chapter.lectures.map((lecture, lIdx) => (
                                          <LectureRow
                                            key={lecture.id}
                                            lecture={lecture}
                                            index={lIdx}
                                            previewHref={previewHref}
                                            isEnrolled={isEnrolled}
                                            dark
                                          />
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------- TESTS ------------------------- */}
      {/* Sirf tab render hota hai jab course ke asal PUBLISHED tests hon
          (tab bhi tabhi banta hai). Meta sirf record ke asal fields se:
          duration, total marks, type/category — per-test question count
          platform par derive nahi hota, isliye dikhaya nahi jata. */}
      {activeTab === 'tests' && tests.length > 0 && (
        <div
          role="tabpanel"
          className="batch"
          style={{
            padding: 26,
            background: '#0d0d13',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#e4e4e7',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 18,
            }}
          >
            <h2 style={{ ...sectionTitle, color: '#f4f4f5' }}>📝 Course Tests</h2>
            <span style={{ fontSize: 12.5, color: '#a1a1aa', fontWeight: 600 }}>
              {tests.length} {tests.length === 1 ? 'test' : 'tests'} · is course se linked
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tests.map((test) => (
              <div
                key={test.id}
                style={{
                  background: '#12121a',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderLeft: `4px solid ${PURPLE}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <h3 style={{ fontSize: 15.5, fontWeight: 800, color: '#f4f4f5', lineHeight: 1.35 }}>
                    {test.title}
                  </h3>
                  {test.type && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: 'rgba(109,40,217,.25)',
                        color: '#c4b5fd',
                        padding: '3px 9px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {test.type}
                    </span>
                  )}
                </div>
                {test.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: '#a1a1aa',
                      lineHeight: 1.6,
                      marginTop: 6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {test.description}
                  </p>
                )}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#d4d4d8',
                  }}
                >
                  {typeof test.durationMinutes === 'number' && test.durationMinutes > 0 && (
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      ⏱️ {test.durationMinutes} min
                    </span>
                  )}
                  {typeof test.totalMarks === 'number' && test.totalMarks > 0 && (
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      🎯 {test.totalMarks} marks
                    </span>
                  )}
                  {test.category && (
                    <span
                      style={{
                        background: 'rgba(245,185,66,.14)',
                        color: GOLD,
                        border: '1px solid rgba(245,185,66,.25)',
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {test.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, marginTop: 18 }}>
            Ye tests student dashboard ke <strong style={{ color: '#e4e4e7' }}>Tests</strong> section
            me attempt hote hain — enroll karke login karo, phir apna score aur analysis wahan dekho.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <Link
              href="/app/tests"
              style={{
                display: 'inline-block',
                background: PURPLE,
                color: '#fff',
                fontWeight: 800,
                fontSize: 13.5,
                padding: '11px 22px',
                borderRadius: 999,
                textDecoration: 'none',
              }}
            >
              Tests Attempt Karo →
            </Link>
            <Link
              href="/test-series"
              style={{
                display: 'inline-block',
                border: '1.5px solid rgba(109,40,217,.6)',
                color: '#c4b5fd',
                fontWeight: 700,
                fontSize: 13.5,
                padding: '11px 22px',
                borderRadius: 999,
                textDecoration: 'none',
              }}
            >
              Test Series Dekho
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------- TEACHERS ------------------------- */}
      {activeTab === 'teachers' && (
        <div role="tabpanel" className="batch" style={{ padding: 26 }}>
          <h2 style={{ ...sectionTitle, marginBottom: 16 }}>Is course ke teachers</h2>
          {teachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.35 }}>👨‍🏫</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Teacher jankari jald aayegi</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420, margin: '0 auto' }}>
                Is course ke liye educator ki profile abhi publish nahi hui hai.{' '}
                <Link href="/teachers" style={{ color: PURPLE, fontWeight: 700 }}>
                  Saare THE SHIVA educators dekho →
                </Link>
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="cd-teachers-grid">
              {teachers.map((t) => (
                <Link
                  key={t.id}
                  href={`/teachers/${t.slug}`}
                  style={{
                    display: 'block',
                    border: '2px solid var(--line)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#fff',
                  }}
                >
                  {/* Photo/gradient band — asal photo ho to wahi, warna initials */}
                  <div
                    style={{
                      height: 86,
                      background: 'linear-gradient(120deg,#2a1650,#6d28d9)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '0 18px',
                      position: 'relative',
                    }}
                  >
                    {t.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.logoUrl}
                        alt={t.displayName}
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #fff',
                          marginBottom: -14,
                          background: '#fff',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: '50%',
                          background: GOLD,
                          color: PURPLE_DARK,
                          fontSize: 22,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid #fff',
                          marginBottom: -14,
                        }}
                      >
                        {(t.displayName || 'T')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '24px 18px 18px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 15, flexWrap: 'wrap' }}>
                      {t.displayName}
                      {t.verified && (
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            background: GREEN_BG,
                            color: GREEN_DARK,
                            padding: '2px 7px',
                            borderRadius: 999,
                          }}
                        >
                          ✓ VERIFIED
                        </span>
                      )}
                    </span>
                    {t.tagline && (
                      <span style={{ display: 'block', fontSize: 13, color: PURPLE, fontWeight: 600, marginTop: 2 }}>
                        {t.tagline}
                      </span>
                    )}
                    {t.description && (
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--muted)',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          margin: '10px 0',
                        }}
                      >
                        {t.description}
                      </p>
                    )}
                    {(t.specialties?.length || t.subjects?.length) ? (
                      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {[...(t.subjects || []), ...(t.specialties || [])].slice(0, 4).map((chip) => (
                          <span
                            key={chip}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#ede9fe',
                              color: PURPLE,
                              padding: '3px 9px',
                              borderRadius: 999,
                            }}
                          >
                            {chip}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <span style={{ fontSize: 13, fontWeight: 800, color: PURPLE }}>
                      Poora profile dekho →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------- FREE CONTENT ------------------------- */}
      {activeTab === 'free' && (
        <div role="tabpanel" className="batch" style={{ padding: 26 }}>
          <h2 style={sectionTitle}>🎬 Free demo lectures</h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.65 }}>
            {isEnrolled
              ? 'Tum enrolled ho — kisi bhi lecture par click karke seedha seekhna shuru karo.'
              : 'Ye lectures bilkul free hain. Play karne ke liye free register/login karo — koi payment nahi lagega.'}
          </p>
          {freeLectures.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '5px 12px',
                  borderRadius: 999,
                }}
              >
                🎁 {freeLectures.length} free lecture{freeLectures.length === 1 ? '' : 's'}
              </span>
              {freeLectures.reduce((n, l) => n + (l.durationSeconds || 0), 0) > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    background: '#ede9fe',
                    color: PURPLE,
                    padding: '5px 12px',
                    borderRadius: 999,
                  }}
                >
                  ⏱️ Kul {formatDuration(freeLectures.reduce((n, l) => n + (l.durationSeconds || 0), 0))} free content
                </span>
              )}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#faf9ff',
                  border: '1px solid var(--line)',
                  color: 'var(--muted)',
                  padding: '5px 12px',
                  borderRadius: 999,
                }}
              >
                {Array.from(new Set(freeLectures.map((l) => l.subjectName))).length} subjects se
              </span>
            </div>
          )}
          {freeLectures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.35 }}>🎬</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Abhi free demo uplabdh nahi hai</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 420, margin: '0 auto' }}>
                Is course ke liye abhi koi free preview lecture publish nahi hua hai. Poora syllabus{' '}
                <button
                  onClick={() => setActiveTab('schedule')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: PURPLE,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  All Classes
                </button>{' '}
                tab me dekho.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {freeLectures.map((lecture, i) => (
                <div key={lecture.id}>
                  <LectureRow lecture={lecture} index={i} previewHref={previewHref} isEnrolled={isEnrolled} />
                  <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '2px 0 6px 46px' }}>
                    {lecture.subjectName} · {lecture.chapterTitle}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------- MORE DETAILS ------------------------- */}
      {activeTab === 'more' && (
        <div role="tabpanel" className="batch" style={{ padding: 26 }}>
          <h2 style={sectionTitle}>More Details</h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.65 }}>
            Course ki vistaarit jankari — har section asal course data se bana hai.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {moreSections.map((sec, i) => (
              <div
                key={sec.title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr',
                  gap: 14,
                  padding: '18px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#ddd6fe',
                    lineHeight: 1.1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: PURPLE_DARK, marginBottom: 6 }}>
                    {sec.title}
                  </h3>
                  <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.75 }}>{sec.body}</div>
                </div>
              </div>
            ))}
          </div>
          {moreSections.length <= 1 && (
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--muted)',
                fontStyle: 'italic',
                background: '#faf9ff',
                border: '1px dashed var(--line)',
                borderRadius: 12,
                padding: '12px 14px',
                marginTop: 8,
              }}
            >
              Note: Is course ki aur vistaarit details (duration, subjects, validity)
              content publish hote hi isi tab me apne aap jud jayengi — abhi ke liye
              upar di gayi jankari hi asal record me uplabdh hai.
            </p>
          )}
        </div>
      )}

      {/* ------------------------- FAQ ------------------------- */}
      {/* Tabs ke neeche hamesha dikhne wala accordion — sawal asal
          course data se bane hain (upar faqItems dekho). */}
      <section
        aria-label="Aksar poochhe jaane wale sawaal"
        className="batch"
        style={{ padding: 26, marginTop: 22 }}
      >
        <h2 style={sectionTitle}>❓ Aksar Poochhe Jaane Wale Sawaal</h2>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.65 }}>
          Is course ke baare me aam sawaal aur unke seedhe jawaab.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqItems.map((item, i) => {
            const open = openFaq === i;
            return (
              <div
                key={item.q}
                style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`cd-faq-a-${i}`}
                  onClick={() => setOpenFaq(open ? null : i)}
                  style={{
                    width: '100%',
                    appearance: 'none',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    padding: '15px 2px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: open ? PURPLE : PURPLE_DARK,
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: open ? PURPLE : '#ede9fe',
                      color: open ? '#fff' : PURPLE,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      fontWeight: 900,
                      flexShrink: 0,
                      transition: 'all .2s',
                    }}
                  >
                    {open ? '−' : '+'}
                  </span>
                </button>
                {open && (
                  <div
                    id={`cd-faq-a-${i}`}
                    style={{
                      fontSize: 14,
                      color: '#374151',
                      lineHeight: 1.75,
                      padding: '0 2px 16px',
                      maxWidth: 720,
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
        </div>
        {rail}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .cd-learn-grid, .cd-teachers-grid, .cd-subject-grid { grid-template-columns: 1fr !important; }
        }
        .cd-tabs::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AboutMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#faf9ff',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '12px 14px',
      }}
    >
      <span style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3 }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: PURPLE_DARK }}>{value}</span>
    </div>
  );
}

function BatchList({ batches, compact = false }: { batches: BatchDTO[]; compact?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="cd-batch-grid">
      {batches.map((batch) => {
        const start = formatDate(batch.startDate);
        const end = formatDate(batch.endDate);
        return (
          <div
            key={batch.id}
            style={{ padding: 16, background: '#faf9ff', border: '2px solid var(--line)', borderRadius: 14 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14 }}>{batch.name}</h3>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: batch.status === 'ACTIVE' ? GREEN_BG : batch.status === 'UPCOMING' ? '#fef3c7' : '#e5e7eb',
                  color: batch.status === 'ACTIVE' ? GREEN_DARK : batch.status === 'UPCOMING' ? '#92400e' : '#374151',
                  whiteSpace: 'nowrap',
                }}
              >
                {batch.status}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
              {start ? `Shuru: ${start}` : 'Start: turant (immediate)'}
              {!compact && end ? ` · Khatm: ${end}` : ''}
            </p>
          </div>
        );
      })}
      <style>{`@media (max-width: 700px){ .cd-batch-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function LectureRow({
  lecture,
  index,
  previewHref,
  isEnrolled,
  dark = false,
}: {
  lecture: LectureDTO;
  index: number;
  previewHref: string;
  isEnrolled: boolean;
  /** dark = gehre panel (curriculum) par; warna halke panel (free tab) ke rang */
  dark?: boolean;
}) {
  const muted = dark ? '#a1a1aa' : 'var(--muted)';
  const duration = formatDuration(lecture.durationSeconds || 0);
  const row = (
    <>
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: lecture.isPreviewable ? GOLD : dark ? 'rgba(109,40,217,.28)' : '#ede9fe',
          color: lecture.isPreviewable ? PURPLE_DARK : dark ? '#c4b5fd' : PURPLE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          flexShrink: 0,
        }}
        aria-hidden
      >
        ▶
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 600, fontSize: 13.5, lineHeight: 1.45, color: dark ? '#e4e4e7' : 'inherit' }}>
          {index + 1}. {lecture.title}
        </span>
        {lecture.description && (
          <span
            style={{
              display: 'block',
              fontSize: 12,
              color: muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lecture.description}
          </span>
        )}
      </span>
      {duration && (
        <span style={{ fontSize: 12, color: muted, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {duration}
        </span>
      )}
      {lecture.isPreviewable ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            background: dark ? 'rgba(245,185,66,.18)' : '#fef3c7',
            color: dark ? GOLD : '#92400e',
            padding: '4px 10px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          FREE
        </span>
      ) : (
        !isEnrolled && (
          <span style={{ fontSize: 13, opacity: 0.55 }} aria-label="Enroll ke baad uplabdh">
            🔒
          </span>
        )
      )}
    </>
  );

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '9px 4px',
    borderBottom: `1px solid ${dark ? 'rgba(255,255,255,.07)' : '#f5f3ff'}`,
    width: '100%',
    textAlign: 'left',
  };

  // Free previews get a real play affordance; locked lectures stay static
  // for guests and deep-link to the player for enrolled students.
  if (lecture.isPreviewable || isEnrolled) {
    return (
      <Link href={previewHref} style={rowStyle} aria-label={`${lecture.title}${lecture.isPreviewable ? ' — free preview' : ''}`}>
        {row}
      </Link>
    );
  }
  return <div style={rowStyle}>{row}</div>;
}
