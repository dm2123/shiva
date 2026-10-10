'use client';

import { useState, useEffect } from 'react';

export default function EBooksPage() {
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({ category: '', difficulty: '', freeOnly: false, search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
    fetch(`/api/student/ebooks?${params}`).then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, [filters]);

  const categories = [
    { id: '', label: 'All', icon: '📚' },
    { id: 'TEXTBOOK', label: 'Textbooks', icon: '📖' },
    { id: 'SHORT_NOTES', label: 'Short Notes', icon: '📝' },
    { id: 'FORMULA_SHEET', label: 'Formulas', icon: '📐' },
    { id: 'PRACTICE', label: 'Practice', icon: '✏️' },
    { id: 'REFERENCE', label: 'Reference', icon: '📚' },
  ];

  const diffColors: Record<string, string> = {
    BEGINNER: 'bg-emerald-100 text-emerald-700',
    INTERMEDIATE: 'bg-amber-100 text-amber-700',
    ADVANCED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">e-Books Library</h1>
        <p className="text-sm text-slate-500 mt-1">Digital books, notes, and formula sheets</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFilters({ ...filters, category: cat.id })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filters.category === cat.id
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-900/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
            }`}>
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Search + Free Filter */}
      <div className="flex gap-3">
        <input type="text" placeholder="Search books..." value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
        <button onClick={() => setFilters({ ...filters, freeOnly: !filters.freeOnly })}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            filters.freeOnly ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}>
          {filters.freeOnly ? '✓ Free Only' : 'Free Only'}
        </button>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Loading books...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.books?.map((book: any) => (
            <div key={book.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
              {/* Cover */}
              <div className="h-40 bg-gradient-to-br from-teal-400 via-blue-500 to-purple-500 flex items-center justify-center relative">
                <div className="text-white text-center">
                  <p className="text-4xl mb-2">📖</p>
                  <p className="text-xs font-bold opacity-80">{book.pageCount} pages</p>
                </div>
                {book.isFree ? (
                  <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">FREE</span>
                ) : (
                  <span className="absolute top-3 left-3 bg-white/90 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-full">PREMIUM</span>
                )}
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full ${diffColors[book.difficulty] || 'bg-white/90'}`}>
                  {book.difficulty}
                </span>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 flex-1">{book.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-2">{book.author}</p>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{book.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3">
                  <span>📁 {book.fileSizeMB} MB</span>
                  <span>•</span>
                  <span>⬇️ {book.downloadCount} downloads</span>
                  {book.subjectName && <><span>•</span><span>{book.subjectName}</span></>}
                </div>
                {book.userCompleted ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                    <span>✓</span> Completed • Page {book.userCurrentPage}/{book.pageCount}
                  </div>
                ) : book.userCurrentPage > 0 ? (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Continue reading</span>
                      <span>{Math.round((book.userCurrentPage / book.pageCount) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(book.userCurrentPage / book.pageCount) * 100}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <button className="w-full py-2 bg-teal-50 text-teal-600 text-xs font-bold rounded-lg hover:bg-teal-100 transition-all">
                    Start Reading
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.books?.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-3xl mb-2">📚</p>
          <p className="text-slate-400 font-medium">No books found</p>
        </div>
      )}
    </div>
  );
}
