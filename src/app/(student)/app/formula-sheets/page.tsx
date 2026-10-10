'use client';

import { useState, useEffect } from 'react';

export default function FormulaSheetsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/student/formula-sheets').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  const diffColors: Record<string, string> = {
    JEE_MAIN: 'bg-blue-100 text-blue-700',
    JEE_ADVANCED: 'bg-purple-100 text-purple-700',
    NEET: 'bg-emerald-100 text-emerald-700',
    FOUNDATION: 'bg-amber-100 text-amber-700',
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading formula sheets...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Formula Sheets</h1>
        <p className="text-sm text-slate-500 mt-1">Quick revision formulas for all subjects</p>
      </div>

      <div className="space-y-4">
        {data.map((sheet: any) => (
          <div key={sheet.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 cursor-pointer hover:bg-slate-50 transition-all"
              onClick={() => setExpandedId(expandedId === sheet.id ? null : sheet.id)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                  📐
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">{sheet.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {sheet.subjectName && <span className="text-[10px] text-slate-500">{sheet.subjectName}</span>}
                    {sheet.chapterName && <><span className="text-[10px] text-slate-300">•</span><span className="text-[10px] text-slate-500">{sheet.chapterName}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${diffColors[sheet.difficulty] || 'bg-slate-100'}`}>
                    {sheet.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">⬇️ {sheet.downloadCount}</span>
                  <span className={`text-lg transition-transform ${expandedId === sheet.id ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </div>
            </div>

            {/* Content */}
            {expandedId === sheet.id && sheet.content && (
              <div className="border-t border-slate-100 p-5 bg-slate-50">
                {sheet.content.map((section: any, i: number) => (
                  <div key={i} className="mb-6 last:mb-0">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                      {section.topic}
                    </h4>
                    <div className="space-y-2">
                      {section.formulas.map((f: any, j: number) => (
                        <div key={j} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-700">{f.name}</p>
                            <p className="text-lg font-mono font-bold text-teal-700 mt-1">{f.formula}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{f.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-3xl mb-2">📐</p>
          <p className="text-slate-400 font-medium">No formula sheets available</p>
        </div>
      )}
    </div>
  );
}
