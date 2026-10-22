'use client';

import { useState, useEffect } from 'react';

export default function VideoSolutionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/video-solutions').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading solutions...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Video Solutions</h1>
        <p className="text-sm text-slate-500 mt-1">Watch detailed video explanations for questions</p>
      </div>
      <div className="space-y-4">
        {data.map((sol: any) => (
          <div key={sol.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-video bg-slate-900 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg">
                  <span className="text-2xl ml-1">▶</span>
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                {Math.floor(sol.durationSeconds / 60)}:{String(sol.durationSeconds % 60).padStart(2, '0')}
              </div>
              {sol.subjectName && (
                <div className="absolute top-2 left-2 bg-teal-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {sol.subjectName}
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">{sol.questionText}</p>
              <p className="text-xs text-slate-500 mb-3">{sol.explanation}</p>
              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                <span>👁️ {sol.viewCount} views</span>
                <span>👍 {sol.likeCount} likes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
