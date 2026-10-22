'use client';

interface SolutionViewerProps {
  chapter: {
    chapterTitle: string;
    content: string;
  };
}

export default function SolutionViewer({ chapter }: SolutionViewerProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {chapter.chapterTitle}
      </h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="prose dark:prose-invert max-w-none">
          {chapter.content.split('\n').map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} className="text-slate-700 dark:text-slate-300 mb-4">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
