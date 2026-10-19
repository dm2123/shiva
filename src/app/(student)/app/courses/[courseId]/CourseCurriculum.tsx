'use client';

import { useState } from 'react';
import { IconChevronDown, IconPlay, IconCheckCircle } from '@/components/student/StudentIcons';

interface Chapter {
  id: string;
  title: string;
  lectures: any[];
}

interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export default function CourseCurriculum({ subjects }: { subjects: Subject[] }) {
  const [openSubject, setOpenSubject] = useState<string | null>(
    subjects.length > 0 ? subjects[0].id : null
  );

  if (subjects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--student-border-strong)] bg-[var(--student-surface)] p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--student-primary-light)]">
          <IconPlay size={22} className="text-[var(--student-primary)]" />
        </div>
        <p className="text-sm font-bold text-[var(--student-text)]">Content taiyaar ho raha hai</p>
        <p className="mt-1 text-xs text-[var(--student-text-muted)] leading-relaxed max-w-xs mx-auto">
          Is course ka syllabus jald aa raha hai. Enroll karke rakho — naye lectures aate hi tumhe notify karenge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subjects.map((subject, sIdx) => {
        const isOpen = openSubject === subject.id;
        const chapterCount = subject.chapters.length;
        const lectureCount = subject.chapters.reduce((n, c) => n + c.lectures.length, 0);
        return (
          <div
            key={subject.id}
            className={`overflow-hidden rounded-2xl border bg-[var(--student-surface)] transition-all ${
              isOpen
                ? 'border-[var(--student-primary)] shadow-lg shadow-indigo-500/10'
                : 'border-[var(--student-border)]'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenSubject(isOpen ? null : subject.id)}
              className="flex w-full items-center gap-4 p-4 text-left"
              aria-expanded={isOpen}
            >
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                  isOpen
                    ? 'bg-[var(--student-primary)] text-white'
                    : 'bg-[var(--student-primary-light)] text-[var(--student-primary)]'
                }`}
              >
                {String(sIdx + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[var(--student-text)]">
                  {subject.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-[var(--student-text-faint)]">
                  {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
                  {lectureCount > 0 && ` · ${lectureCount} ${lectureCount === 1 ? 'lecture' : 'lectures'}`}
                </span>
              </span>
              <IconChevronDown
                size={18}
                className={`flex-shrink-0 text-[var(--student-text-faint)] transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-2 border-t border-[var(--student-border-light)] p-4 pt-3">
                  {subject.chapters.length === 0 ? (
                    <p className="py-2 text-center text-xs text-[var(--student-text-faint)]">
                      Chapters jald add honge.
                    </p>
                  ) : (
                    subject.chapters.map((chapter, cIdx) => (
                      <div
                        key={chapter.id}
                        className="flex items-center gap-3 rounded-xl bg-[var(--student-background)] px-3.5 py-3"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[var(--student-primary)] shadow-sm border border-[var(--student-border-light)]">
                          <IconPlay size={13} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-[var(--student-text-secondary)]">
                            <span className="mr-1.5 text-[var(--student-text-faint)]">{sIdx + 1}.{cIdx + 1}</span>
                            {chapter.title}
                          </p>
                          {chapter.lectures.length > 0 && (
                            <p className="mt-0.5 text-[11px] text-[var(--student-text-faint)]">
                              {chapter.lectures.length} {chapter.lectures.length === 1 ? 'lecture' : 'lectures'}
                            </p>
                          )}
                        </div>
                        <IconCheckCircle size={15} className="flex-shrink-0 text-[var(--student-border-strong)]" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
