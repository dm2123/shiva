'use client';

import { useState, useEffect } from 'react';

interface Material {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

interface MaterialsManagerProps {
  lectureId: string;
}

export default function MaterialsManager({ lectureId }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('NOTES');
  const [adding, setAdding] = useState(false);

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`/api/teacher/lectures/${lectureId}/materials`);
      const data = await res.json();
      if (data.success) setMaterials(data.data.materials);
    } catch (err) {
      console.error('Fetch materials error:', err);
    }
  };

  useEffect(() => { fetchMaterials(); }, [lectureId]);

  const addMaterial = async () => {
    if (!title.trim() || !fileUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/teacher/lectures/${lectureId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), fileUrl: fileUrl.trim(), fileType }),
      });
      if (res.ok) {
        setTitle('');
        setFileUrl('');
        fetchMaterials();
      }
    } catch (err) {
      console.error('Add material error:', err);
    }
    setAdding(false);
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      await fetch(`/api/teacher/lectures/${lectureId}/materials/${id}`, { method: 'DELETE' });
      fetchMaterials();
    } catch (err) {
      console.error('Delete material error:', err);
    }
  };

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
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Lecture Materials</h3>

      {/* Add Form */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Material title"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
        <input
          type="text"
          value={fileUrl}
          onChange={e => setFileUrl(e.target.value)}
          placeholder="File URL (e.g., /uploads/notes.pdf)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
        <div className="flex gap-2">
          <select
            value={fileType}
            onChange={e => setFileType(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="NOTES">Notes</option>
            <option value="PDF">PDF</option>
            <option value="SLIDES">Slides</option>
            <option value="DPP">DPP</option>
            <option value="ANSWER_KEY">Answer Key</option>
          </select>
          <button
            onClick={addMaterial}
            disabled={adding || !title.trim() || !fileUrl.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Material'}
          </button>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-2">
        {materials.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No materials uploaded yet</p>
        ) : (
          materials.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-xl">{fileTypeIcon(m.fileType)}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{m.title}</p>
                  <p className="text-xs text-slate-500">{m.fileType} • {new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  View
                </a>
                <button
                  onClick={() => deleteMaterial(m.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
