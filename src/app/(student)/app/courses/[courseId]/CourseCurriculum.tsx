'use client';

/**
 * Course Curriculum — PW "Subjects → Chapters" grammar (student portal).
 *
 * Pehle ye ek accordion tha: subjects expand hote the aur chapters
 * uske andar chhote rows the — PW ke batch flow se bilkul alag, aur
 * "Subjects"/"Tests" naam ki koi pill-tab bhi nahi thi. Ab grammar
 * PW jaisi hai (structure only — data SHIVA ka asal):
 *
 *   [ Subjects | Tests ]  pill tabs — Tests tab sirf tabhi jab course
 *                         ke asal PUBLISHED tests linked hon; warna
 *                         tab bar hi nahi banta.
 *   Subjects panel: safed "Subjects" card → subject cards ka grid
 *   (pastel medallion, bold naam, asal chapter count) → kisi subject
 *   ko chuno to uske chapter cards (violet left accent bar, meta sirf
 *   asal counts se); chapter me lectures hon to poora card Learn
 *   page ka link hai (pehli lecture ke saath).
 *   Tests panel: public page jaisi test rows — title/description +
 *   asal duration/marks/type chips, neeche /app/tests CTA.
 *
 * Chapter meta me sirf "N Videos" banta hai: chapter model me
 * exercises/notes counts exist hi nahi karte — nakli 0 chhapne ke
 * bajaye wo count hi nahi dikhta (pakka niyam).
 *
 * Note: isi naam ki ek purani file src/components/student/ me bhi thi
 * jo kahin import hi nahi hoti thi (dead code) — ye local wali hi
 * asal istemal wali hai.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconArrowRight, IconBook, IconPlay } from '@/components/student/StudentIcons';

export type CourseTestSummary = {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  totalMarks?: number;
  type?: string;
  category?: string;
};

type Props = {
  subjects: any[];
  courseId: string;
  tests?: CourseTestSummary[];
};

/** Subject medallions ke pastel rang (Dashboard v2 wali halki palette). */
const SUBJECT_TINTS = [
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-fuchsia-100 text-fuchsia-700',
];

function subjectInitials(name: string): string {
  const parts = String(name || '')
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function CourseCurriculum({ subjects, courseId, tests = [] }: Props) {
  const hasTests = tests.length > 0;
  const [activeTab, setActiveTab] = useState<'subjects' | 'tests'>('subjects');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const selectedSubject = useMemo(
    () => subjects.find((s: any) => s.id === selectedSubjectId) || null,
    [subjects, selectedSubjectId],
  );

  const totalChapters = subjects.reduce((n: number, s: any) => n + (s.chapters?.length || 0), 0);
  const totalLectures = subjects.reduce(
    (n: number, s: any) =>
      n + (s.chapters || []).reduce((m: number, c: any) => m + (c.lectures?.length || 0), 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* ---------- PW pill tabs (sirf jab Tests asal me hain) ---------- */}
      {hasTests && (
        <div
          role="tablist"
          aria-label="Course sections"
          className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-[var(--student-border)] bg-[var(--student-surface)] p-1 shadow-sm"
        >
          {(
            [
              { id: 'subjects', label: 'Subjects' },
              { id: 'tests', label: `Tests (${tests.length})` },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-[13px] font-bold transition ${
                  active
                    ? 'bg-[#6d28d9] text-white shadow'
                    : 'text-[var(--student-text-muted)] hover:text-[var(--student-text)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ================= SUBJECTS ================= */}
      {activeTab === 'subjects' && (
        <section className="rounded-2xl border border-[var(--student-border)] bg-[var(--student-surface)] p-5 shadow-sm sm:p-6">
          {!selectedSubject ? (
            <>
              <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-[17px] font-bold text-[var(--student-text)]">Subjects</h2>
                {subjects.length > 0 && (
                  <p className="text-xs font-semibold text-[var(--student-text-muted)]">
                    {subjects.length} Subjects · {totalChapters} Chapters
                    {totalLectures > 0 ? ` · ${totalLectures} Lectures` : ''}
                  </p>
                )}
              </div>
              <p className="mb-5 text-[13px] leading-relaxed text-[var(--student-text-muted)]">
                Apna subject chuno — uske chapters aur lectures wahan milenge.
              </p>

              {subjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--student-border)] px-4 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--student-surface-hover)] text-[var(--student-text-muted)]">
                    <IconBook size={22} />
                  </div>
                  <p className="text-sm font-bold text-[var(--student-text)]">Abhi syllabus add nahi hua hai</p>
                  <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-[var(--student-text-muted)]">
                    Is course ke subjects aur chapters jald hi yahan dikhenge.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {subjects.map((subject: any, i: number) => {
                    const chapterCount = subject.chapters?.length || 0;
                    const lectureCount = (subject.chapters || []).reduce(
                      (n: number, c: any) => n + (c.lectures?.length || 0),
                      0,
                    );
                    return (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className="group flex items-center gap-3.5 rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] p-4 text-left transition hover:border-[#6d28d9] hover:shadow-md"
                      >
                        <span
                          aria-hidden
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[15px] font-black ${SUBJECT_TINTS[i % SUBJECT_TINTS.length]}`}
                        >
                          {subjectInitials(subject.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[14.5px] font-bold leading-snug text-[var(--student-text)]">
                            {subject.name}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-[var(--student-text-muted)]">
                            {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
                            {lectureCount > 0 ? ` · ${lectureCount} Lectures` : ''}
                          </span>
                        </span>
                        <span className="ml-auto shrink-0 text-[var(--student-text-muted)] transition group-hover:text-[#6d28d9]">
                          <IconArrowRight size={16} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* ---------- Subject view: chapter cards ---------- */}
              <button
                onClick={() => setSelectedSubjectId(null)}
                className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6d28d9] hover:underline"
              >
                <IconArrowLeft size={15} /> Saare Subjects
              </button>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-[17px] font-bold text-[var(--student-text)]">{selectedSubject.name}</h2>
                <p className="text-xs font-semibold text-[var(--student-text-muted)]">
                  {(selectedSubject.chapters?.length || 0)} Chapters
                </p>
              </div>

              {(selectedSubject.chapters?.length || 0) === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--student-border)] px-4 py-10 text-center">
                  <p className="text-sm font-bold text-[var(--student-text)]">Is subject me abhi chapters nahi hain</p>
                  <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-[var(--student-text-muted)]">
                    Chapters jald hi add honge — tab tak doosre subjects dekh lo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(selectedSubject.chapters || []).map((chapter: any, ci: number) => {
                    const chapterLectures = chapter.lectures || [];
                    const firstLecture = chapterLectures[0];
                    const cardClass =
                      'block rounded-xl border border-[var(--student-border)] border-l-4 border-l-[#6d28d9] bg-[var(--student-surface)] p-4 transition sm:p-5';
                    const inner = (
                      <>
                        <div className="flex items-start gap-3.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[13px] font-black text-violet-700">
                            {ci + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[14.5px] font-bold leading-snug text-[var(--student-text)]">
                              {chapter.title}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[var(--student-text-muted)]">
                              {chapterLectures.length > 0
                                ? `${chapterLectures.length} Videos`
                                : 'Lectures jald aayenge'}
                            </p>
                          </div>
                          {firstLecture && (
                            <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-[#6d28d9] px-3.5 py-1.5 text-[11.5px] font-bold text-white">
                              <IconPlay size={12} /> Shuru Karo
                            </span>
                          )}
                        </div>
                        {chapter.description && (
                          <p className="mt-2.5 pl-[50px] text-[13px] leading-relaxed text-[var(--student-text-muted)]">
                            {chapter.description}
                          </p>
                        )}
                      </>
                    );
                    return firstLecture ? (
                      <Link
                        key={chapter.id}
                        href={`/app/learn/${courseId}?lecture=${firstLecture.id}`}
                        className={`${cardClass} hover:border-[#6d28d9] hover:shadow-md`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div key={chapter.id} className={cardClass}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ================= TESTS ================= */}
      {activeTab === 'tests' && hasTests && (
        <section className="rounded-2xl border border-[var(--student-border)] bg-[var(--student-surface)] p-5 shadow-sm sm:p-6">
          <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-[17px] font-bold text-[var(--student-text)]">Course Tests</h2>
            <p className="text-xs font-semibold text-[var(--student-text-muted)]">{tests.length} Tests</p>
          </div>
          <p className="mb-5 text-[13px] leading-relaxed text-[var(--student-text-muted)]">
            Is course se jude asal tests — apni taiyaari yahin se check karo.
          </p>

          <div className="space-y-3">
            {tests.map((test) => (
              <article
                key={test.id}
                className="rounded-xl border border-[var(--student-border)] border-l-4 border-l-[#6d28d9] bg-[var(--student-surface)] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-[var(--student-text)]">
                    {test.title}
                  </h3>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {test.type && (
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10.5px] font-bold text-violet-700">
                        {test.type}
                      </span>
                    )}
                    {test.category && (
                      <span className="rounded-full bg-[var(--student-surface-hover)] px-2.5 py-1 text-[10.5px] font-bold text-[var(--student-text-muted)]">
                        {test.category}
                      </span>
                    )}
                  </div>
                </div>
                {test.description && (
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--student-text-muted)]">
                    {test.description}
                  </p>
                )}
                {(test.durationMinutes || test.totalMarks) && (
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-[var(--student-text-muted)]">
                    {test.durationMinutes ? <span>⏱ {test.durationMinutes} min</span> : null}
                    {test.totalMarks ? <span>🎯 {test.totalMarks} marks</span> : null}
                  </div>
                )}
              </article>
            ))}
          </div>

          <Link
            href="/app/tests"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#5b21b6]"
          >
            Tests Attempt Karo <IconArrowRight size={14} />
          </Link>
        </section>
      )}
    </div>
  );
}
