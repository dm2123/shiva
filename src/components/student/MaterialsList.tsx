'use client';

import { useState, useEffect } from 'react';

interface Material {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

interface MaterialsListProps {
  lectureId: string;
}

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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-bold text-slate-900 dark:text-white mb-3">Study Materials</h3>
      <div className="space-y-2">
        {materials.map(m => (
          <a
            key={m.id}
            href={m.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-xl">{fileTypeIcon(m.fileType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{m.title}</p>
              <p className="text-xs text-slate-500">{m.fileType}</p>
            </div>
            <span className="text-xs text-indigo-600 font-medium">Download</span>
          </a>
        ))}
      </div>
    </div>
  );
}
