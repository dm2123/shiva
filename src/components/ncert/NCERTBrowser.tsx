'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconArrowRight, IconBookOpen } from '@/components/student/StudentIcons';

interface NCERTChapter {
  id: string;
  classLevel: string;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  content: string;
}

interface NCERTBrowserProps {
  classLevel?: string;
  subject?: string;
}

function BackPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--student-border)] bg-[var(--student-surface)] text-xs font-bold text-[var(--student-text-secondary)] hover:border-[#6d28d9] hover:text-[#6d28d9] transition-colors"
    >
      <IconArrowLeft size={13} />
      {label}
    </Link>
  );
}

function BrowserSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading NCERT content">
      <div className="skeleton h-6 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="student-card p-5 space-y-3">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowserEmpty({ text }: { text: string }) {
  return (
    <div className="student-card p-8 text-center space-y-3">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white flex items-center justify-center shadow-md shadow-[#6d28d9]/25">
        <IconBookOpen size={26} />
      </div>
      <p className="text-sm font-bold text-[var(--student-text)]">Abhi yahan content available nahi hai</p>
      <p className="text-xs text-[var(--student-text-muted)] leading-relaxed max-w-sm mx-auto">{text}</p>
    </div>
  );
}

export default function NCERTBrowser({ classLevel, subject }: NCERTBrowserProps) {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<NCERTChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!classLevel) {
          const res = await fetch('/api/student/ncert');
          const data = await res.json();
          if (data.success) setClasses(data.data.classes);
        } else if (!subject) {
          const res = await fetch(`/api/student/ncert/${classLevel}`);
          const data = await res.json();
          if (data.success) setSubjects(data.data.subjects);
        } else {
          const res = await fetch(`/api/student/ncert/${classLevel}/${subject}`);
          const data = await res.json();
          if (data.success) setChapters(data.data.chapters);
        }
      } catch (err) {
        console.error('Fetch NCERT data error:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [classLevel, subject]);

  if (loading) {
    return <BrowserSkeleton />;
  }

  // ── Classes ──
  if (!classLevel) {
    if (classes.length === 0) {
      return <BrowserEmpty text="NCERT solutions abhi library me add ho rahe hain. Tab tak e-Books aur formula sheets se padhai jaari rakho." />;
    }
    return (
      <div className="space-y-4">
        <h2 className="text-base md:text-lg font-bold text-[var(--student-text)] tracking-tight">Apni class chuno</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {classes.map((cls) => (
            <Link
              key={cls}
              href={`/app/ncert/${cls}`}
              className="student-card group relative overflow-hidden p-5 hover:border-[#6d28d9] hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#6d28d9]/10 blur-lg" aria-hidden="true" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6d28d9]">Class</p>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-br from-[#6d28d9] to-[#2a1650] bg-clip-text text-transparent mt-1">
                {cls}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--student-text-muted)] group-hover:text-[#6d28d9] group-hover:gap-2 transition-all">
                Subjects dekho
                <IconArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ── Subjects ──
  if (!subject) {
    return (
      <div className="space-y-4">
        <BackPill href="/app/ncert" label="All Classes" />
        <h2 className="text-base md:text-lg font-bold text-[var(--student-text)] tracking-tight">
          Class {classLevel} — Subjects
        </h2>
        {subjects.length === 0 ? (
          <BrowserEmpty text={`Class ${classLevel} ke liye abhi koi subject add nahi hua hai. NCERT material jald aa raha hai.`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {subjects.map((sub) => (
              <Link
                key={sub}
                href={`/app/ncert/${classLevel}/${sub}`}
                className="student-card group p-5 flex items-center gap-4 hover:border-[#6d28d9] hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#6d28d9]/25">
                  <IconBookOpen size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--student-text)] leading-snug">{sub}</p>
                  <p className="text-[11px] text-[var(--student-text-faint)] font-medium mt-0.5">Chapter-wise solutions</p>
                </div>
                <IconArrowRight size={15} className="text-[#6d28d9] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Chapters ──
  return (
    <div className="space-y-4">
      <BackPill href={`/app/ncert/${classLevel}`} label="Back to Subjects" />
      <div>
        <h2 className="text-base md:text-lg font-bold text-[var(--student-text)] tracking-tight">
          Class {classLevel} — {subject}
        </h2>
        {chapters.length > 0 && (
          <p className="text-xs text-[var(--student-text-faint)] font-medium mt-1">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} • kisi bhi chapter par tap karke solution padho
          </p>
        )}
      </div>
      {chapters.length === 0 ? (
        <BrowserEmpty text={`${subject} ke liye abhi chapters add nahi hue hain. Solutions jald aa rahe hain.`} />
      ) : (
        <div className="space-y-3">
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/app/ncert/${classLevel}/${subject}/${ch.chapterNumber}`}
              className="student-card group flex items-center gap-4 p-4 hover:border-[#6d28d9] hover:shadow-lg transition-all relative overflow-hidden"
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6d28d9] to-[#2a1650]" aria-hidden="true" />
              <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white flex items-center justify-center text-sm font-black shrink-0 shadow-md shadow-[#6d28d9]/25 ml-1">
                {ch.chapterNumber}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-[var(--student-text)] leading-snug">{ch.chapterTitle}</span>
                <span className="block text-[11px] text-[var(--student-text-faint)] font-medium mt-0.5">
                  Chapter {ch.chapterNumber} • Solution ke saath
                </span>
              </span>
              <IconArrowRight size={15} className="text-[#6d28d9] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
