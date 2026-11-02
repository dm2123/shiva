'use client';

import { useState, useEffect, useMemo } from 'react';
import { IconArrowRight, IconClipboard, IconFileText } from '@/components/student/StudentIcons';

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

type MaterialCategory = 'NOTE' | 'DPP' | 'OTHER';

/** Category ka kram aur label — PW chapter view ke content tabs
 *  (Lectures | Notes | DPP ...) wali soch: tab sirf wahi banta hai
 *  jis category ka asal material is lecture par sach me hai. */
const CATEGORY_ORDER: { id: MaterialCategory; label: string }[] = [
  { id: 'NOTE', label: 'Notes' },
  { id: 'DPP', label: 'DPP' },
  { id: 'OTHER', label: 'Other' },
];

function categoryOf(m: Material): MaterialCategory {
  return m.category === 'NOTE' || m.category === 'DPP' ? m.category : 'OTHER';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Per-lecture study materials (notes / DPP / slides) —
 * GET /api/student/lectures/[id]/materials se asal data aata hai.
 * Material na ho to component kuch render hi nahi karta (null) —
 * nakli placeholder kabhi nahi.
 *
 * PW chapter-view parity: 2+ asal categories hon to upar PW pill
 * tabs (halka violet-gray container, active safed bg + violet bold)
 * aate hain — bilkul wahi categories jo data me hain, ek bhi invent
 * tab nahi (DPP PDF / DPP Videos jaisi alag tab tabhi banti jab
 * model me waisa alag data ho; yahan NOTE/DPP/OTHER hi asal hai).
 * Rows PW anatomy ki: bold title, meta line, daayen gol violet
 * arrow button + neeche 'View'.
 */
export default function MaterialsList({ lectureId }: MaterialsListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | null>(null);

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

  // Sirf wahi categories jinka asal material hai (kram: Notes, DPP, Other)
  const presentCategories = useMemo(
    () => CATEGORY_ORDER.filter((c) => materials.some((m) => categoryOf(m) === c.id)),
    [materials],
  );

  // Lecture badalte hi purani tab state na atke: asal categories me
  // se pehli ko default rakho jab tak user khud na chune.
  const effectiveCategory: MaterialCategory | null =
    activeCategory && presentCategories.some((c) => c.id === activeCategory)
      ? activeCategory
      : presentCategories[0]?.id ?? null;

  if (materials.length === 0) return null;

  const showTabs = presentCategories.length > 1;
  const visible = showTabs
    ? materials.filter((m) => categoryOf(m) === effectiveCategory)
    : materials;

  return (
    <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-sm font-bold text-slate-900">
        Study Materials <span className="font-semibold text-slate-400">· Notes & DPP</span>
      </h3>

      {showTabs && (
        <div
          role="tablist"
          aria-label="Material types"
          className="mt-3 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#eef0fe] p-1"
        >
          {presentCategories.map((c) => {
            const active = effectiveCategory === c.id;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(c.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-[13px] transition ${
                  active
                    ? 'bg-white font-bold text-[#6d28d9] shadow-sm'
                    : 'font-semibold text-slate-500 hover:text-slate-800'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {visible.map((m) => {
          const cat = categoryOf(m);
          const date = formatDate(m.createdAt);
          const meta = [
            cat === 'DPP' ? 'DPP' : cat === 'NOTE' ? 'Notes' : m.fileType,
            cat !== 'OTHER' ? m.fileType : null,
            date || null,
          ].filter(Boolean) as string[];
          return (
            <a
              key={m.id}
              href={m.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition-colors hover:border-[#6d28d9]/40 hover:bg-violet-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-[#6d28d9]">
                {cat === 'DPP' ? <IconClipboard size={19} /> : <IconFileText size={19} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-800">{m.title}</span>
                {meta.length > 0 && (
                  <span className="mt-0.5 block text-xs font-medium text-slate-500">
                    {meta.join(' · ')}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 flex-col items-center gap-0.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6d28d9] text-white shadow-sm">
                  <IconArrowRight size={16} />
                </span>
                <span className="text-[10.5px] font-bold text-[#6d28d9]">View</span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
