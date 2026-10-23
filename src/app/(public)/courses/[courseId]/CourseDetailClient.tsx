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

interface Props {
  description?: string;
  subjects: SubjectDTO[];
  batches: BatchDTO[];
  teachers: EducatorProfile[];
  freeLectures: FreeLectureDTO[];
  /** Where a free-preview click should go (register / login / learn). */
  previewHref: string;
  isEnrolled: boolean;
  meta?: CourseMetaDTO;
}

type TabId = 'features' | 'about' | 'schedule' | 'teachers' | 'free' | 'more';

const PURPLE = '#6d28d9';
const PURPLE_DARK = '#2a1650';
const GOLD = '#f5b942';
const GREEN_DARK = '#166534';
const GREEN_BG = '#dcfce7';

/**
 * 6 tabs — design-map wala kram (structure only, SHIVA ka apna content):
 * Features | About | Schedule | Teachers | Free Content | More Details
 */
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'features', label: 'Features', icon: '✨' },
  { id: 'about', label: 'About', icon: '📖' },
  { id: 'schedule', label: 'Schedule', icon: '🗂️' },
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
  description,
  subjects,
  batches,
  teachers,
  freeLectures,
  previewHref,
  isEnrolled,
  meta,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('features');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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
            shuru karke seekhna chahte hain. Poora syllabus Schedule tab me pehle se dekh
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
            dates Schedule tab me di gayi hain.
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
            <strong>Schedule</strong> tab me bina enroll kiye dekh sakte ho.
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
      {/* ------------------------- TAB BAR ------------------------- */}
      <div
        role="tablist"
        aria-label="Course sections"
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          borderBottom: '2px solid var(--line)',
          marginBottom: 22,
          paddingBottom: 0,
          scrollbarWidth: 'none',
        }}
        className="cd-tabs"
      >
        {TABS.map((tab) => {
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
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                padding: '11px 16px',
                fontSize: 14,
                fontWeight: active ? 800 : 600,
                color: active ? PURPLE : 'var(--muted)',
                borderBottom: active ? `3px solid ${GOLD}` : '3px solid transparent',
                marginBottom: -2,
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
                    background: '#fef3c7',
                    color: '#92400e',
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
                    background: '#ede9fe',
                    color: PURPLE,
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  {totals.lectures}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------- FEATURES ------------------------- */}
      {/* Checklist style — sirf asal shamil cheezein, green check ke saath.
          Koi plan card / tulna table nahi: platform ke paas plan data nahi hai. */}
      {activeTab === 'features' && (
        <div role="tabpanel" className="batch" style={{ padding: 26 }}>
          <h2 style={sectionTitle}>Is course me kya-kya shamil hai</h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.65 }}>
            Neeche sirf wahi cheezein hain jo is course ke asal content aur record
            me sach me maujood hain — har item ke saamne green check isi liye hai.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FeatureRow
              title="Structured curriculum — subject-wise syllabus"
              desc={`${subjects.length} subjects, ${totals.chapters} chapters aur ${totals.lectures} lectures ke saath poora organised content.`}
              show={totals.lectures > 0}
            />
            <FeatureRow
              title={`${formatDuration(totals.seconds)} ka recorded video content`}
              desc="Saare lectures mila kar kul content duration — apni gati se kabhi bhi dekho."
              show={totals.seconds > 0}
            />
            <FeatureRow
              title={`${freeLectures.length} free demo lectures`}
              desc="Enroll karne se pehle free preview dekh kar teaching style aur quality check karo."
              show={freeLectures.length > 0}
            />
            <FeatureRow
              title={`${batches.length} batch option${batches.length === 1 ? '' : 's'}`}
              desc="Apni timing ke hisaab se batch chuno — start dates Schedule tab me di gayi hain."
              show={batches.length > 0}
            />
            <FeatureRow
              title="Verified educator ke saath padhai"
              desc="Course ek verified THE SHIVA educator dwara padhaya jata hai — Teachers tab me poori profile dekho."
              show={teachers.some((t) => t.verified)}
            />
            <FeatureRow
              title={meta?.language ? `${meta.language} medium me padhai` : 'Apni bhasha me padhai'}
              desc="Course ka medium of instruction asal record ke hisaab se upar diya gaya hai."
              show={!!meta?.language}
            />
            <FeatureRow
              title={meta?.validityLabel || 'Course validity'}
              desc="Enroll ke baad itne samay tak course ka poora access tumhare dashboard me rahega."
              show={!!meta?.validityLabel}
            />
            <FeatureRow
              title="Mobile + desktop dono par access"
              desc="Enroll ke baad apne THE SHIVA student dashboard se kabhi bhi, kahin bhi padho."
              show
            />
          </div>
          {totals.lectures === 0 && freeLectures.length === 0 && batches.length === 0 && (
            <p style={{ fontSize: 14, color: 'var(--muted)', fontStyle: 'italic', padding: '12px 0' }}>
              Is course ke features content publish hote hi yahan dikhenge.
            </p>
          )}
        </div>
      )}

      {/* ------------------------- ABOUT ------------------------- */}
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
                  Schedule tab
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
          {/* Subject pastel cards — halka tint + gehra left accent */}
          {subjects.length > 0 && (
            <div>
              <h2 style={{ ...sectionTitle, marginBottom: 12 }}>Subjects aur unki schedule</h2>
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
                className="cd-subject-grid"
              >
                {subjects.map((subject, i) => {
                  const palette = SUBJECT_PASTELS[i % SUBJECT_PASTELS.length];
                  const lectureCount = subject.chapters.reduce(
                    (n, c) => n + c.lectures.length,
                    0
                  );
                  const teacher = teacherForSubject(subject, teachers);
                  return (
                    <div
                      key={subject.id}
                      style={{
                        background: palette.bg,
                        borderLeft: `5px solid ${palette.accent}`,
                        borderRadius: 14,
                        padding: '16px 18px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: PURPLE_DARK, lineHeight: 1.35 }}>
                          {subject.name}
                        </h3>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            background: palette.chipBg,
                            color: palette.accent,
                            padding: '3px 9px',
                            borderRadius: 999,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {lectureCount} lectures
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                        {subject.chapters.length} chapters
                        {teacher && (
                          <>
                            {' · '}Teacher: <strong style={{ color: '#374151' }}>{teacher.displayName}</strong>
                          </>
                        )}
                      </p>
                      {subject.description && (
                        <p
                          style={{
                            fontSize: 12.5,
                            color: '#4b5563',
                            lineHeight: 1.6,
                            marginTop: 6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {subject.description}
                        </p>
                      )}
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

          <div className="batch" style={{ padding: 26 }}>
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
              <h2 style={sectionTitle}>📋 Curriculum — Contents</h2>
              {totals.lectures > 0 && (
                <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
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
                        border: `1.5px solid ${isOpen ? palette.accent : 'var(--line)'}`,
                        borderLeft: `5px solid ${palette.accent}`,
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: '#fff',
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
                          background: isOpen ? palette.bg : '#fff',
                          color: 'var(--ink)',
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
                        <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {subject.chapters.length} chapters · {lectureCount} lectures
                          <span style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>▾</span>
                        </span>
                      </button>

                      {isOpen && (
                        <div style={{ padding: '14px 16px', background: '#faf9ff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {subject.description && (
                            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{subject.description}</p>
                          )}
                          {subject.chapters.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                              Is subject ke chapters jald publish honge.
                            </p>
                          ) : (
                            subject.chapters.map((chapter, cIdx) => {
                              const chOpen = openChapter === chapter.id;
                              return (
                                <div
                                  key={chapter.id}
                                  style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--line)', overflow: 'hidden' }}
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
                                      padding: '13px 16px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      gap: 10,
                                    }}
                                  >
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                                      <span style={{ color: 'var(--muted)', fontWeight: 600, marginRight: 6 }}>
                                        {sIdx + 1}.{cIdx + 1}
                                      </span>
                                      {chapter.title}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                      {chapter.lectures.length} lectures{' '}
                                      <span style={{ display: 'inline-block', transform: chOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>▾</span>
                                    </span>
                                  </button>

                                  {chOpen && (
                                    <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column' }}>
                                      {chapter.description && (
                                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{chapter.description}</p>
                                      )}
                                      {chapter.lectures.length === 0 ? (
                                        <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                                          Lectures jald add honge.
                                        </p>
                                      ) : (
                                        chapter.lectures.map((lecture, lIdx) => (
                                          <LectureRow
                                            key={lecture.id}
                                            lecture={lecture}
                                            index={lIdx}
                                            previewHref={previewHref}
                                            isEnrolled={isEnrolled}
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
                  Schedule
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

function FeatureRow({
  title,
  desc,
  show,
}: {
  title: string;
  desc: string;
  show?: boolean;
}) {
  if (!show) return null;
  return (
    <div
      style={{
        display: 'flex',
        gap: 13,
        alignItems: 'flex-start',
        padding: '13px 2px',
        borderBottom: '1px dashed #f0edff',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: GREEN_BG,
          color: GREEN_DARK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 900,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        ✓
      </span>
      <span>
        <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</span>
      </span>
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
}: {
  lecture: LectureDTO;
  index: number;
  previewHref: string;
  isEnrolled: boolean;
}) {
  const duration = formatDuration(lecture.durationSeconds || 0);
  const row = (
    <>
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: lecture.isPreviewable ? GOLD : '#ede9fe',
          color: lecture.isPreviewable ? PURPLE_DARK : PURPLE,
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
        <span style={{ display: 'block', fontWeight: 600, fontSize: 13.5, lineHeight: 1.45 }}>
          {index + 1}. {lecture.title}
        </span>
        {lecture.description && (
          <span
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--muted)',
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
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {duration}
        </span>
      )}
      {lecture.isPreviewable ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            background: '#fef3c7',
            color: '#92400e',
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
    borderBottom: '1px solid #f5f3ff',
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
