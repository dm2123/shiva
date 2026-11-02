'use client';

import { useState, useEffect } from 'react';

interface Material {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  category?: 'NOTE' | 'DPP' | 'OTHER';
  createdAt: string;
}

interface MaterialsListProps {
  lectureId: string;
}

/**
 * Per-lecture study materials (notes / DPP / slides) —
 * GET /api/student/lectures/[id]/materials se asal data aata hai.
 * Material na ho to component kuch render hi nahi karta (null) —
 * nakli placeholder kabhi nahi. Pehle ye component kahin mount hi
 * nahi tha aur iski API ke peeche LectureMaterials table ka koi
 * runtime ensure nahi tha; dono ab jude hue hain (learn page).
 */
export default function MaterialsList({ lectureId }: MaterialsListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(`/api/student/lectures/${lectureId}/materials`);
        const data = await res.json();
        if (data.success) setMaterials(data.data.materials);
      } catch (err) {
        console.error('Fetch materials error:', err);
      }
    };
    fetchMaterials();
  }, [lectureId]);

  if (materials.length === 0) return null;

  const fileTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'SLIDES': return '📊';
      case 'DPP': return '📝';
      case 'ANSWER_KEY': return '✅';
      default: return '📋';
    }
  };

  return (
    <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">
        Study Materials <span className="text-slate-400 font-semibold">· Notes & DPP</span>
      </h3>
      <div className="space-y-2">
        {materials.map(m => (
          <a
            key={m.id}
            href={m.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-[#6d28d9]/40 transition-colors"
          >
            <span className="text-xl">{fileTypeIcon(m.fileType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
              <p className="text-xs text-slate-500">
                {m.category === 'DPP' ? 'DPP' : m.category === 'NOTE' ? 'Notes' : m.fileType}
                {' · '}{m.fileType}
              </p>
            </div>
            <span className="text-xs text-[#6d28d9] font-bold">Download</span>
          </a>
        ))}
      </div>
    </div>
  );
}
