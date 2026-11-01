'use client';

import { IconBookOpen } from '@/components/student/StudentIcons';

interface SolutionViewerProps {
  chapter: {
    chapterTitle: string;
    content: string;
  };
}

export default function SolutionViewer({ chapter }: SolutionViewerProps) {
  const paragraphs = (chapter.content || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="space-y-5">
      {/* Chapter title band */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] p-6 md:p-8 text-white">
        <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-8 w-44 h-44 rounded-full bg-[#f5b942]/20 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/15 backdrop-blur items-center justify-center shrink-0">
            <IconBookOpen size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5b942]">NCERT Solution</p>
            <h1 className="text-xl md:text-3xl font-black tracking-tight mt-1 leading-snug">{chapter.chapterTitle}</h1>
          </div>
        </div>
      </div>

      {/* Solution body */}
      <div className="student-card p-6 md:p-8">
        {paragraphs.length === 0 ? (
          <p className="text-sm text-[var(--student-text-muted)] text-center py-6 leading-relaxed">
            Is chapter ka solution content jald aa raha hai.
          </p>
        ) : (
          <div className="space-y-4">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-sm md:text-[15px] text-[var(--student-text-secondary)] leading-[1.85]">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
