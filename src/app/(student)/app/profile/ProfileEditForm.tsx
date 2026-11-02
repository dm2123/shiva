'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconPencil, IconCheckCircle, IconX } from '@/components/student/StudentIcons';

/**
 * Profile edit form — PUT /api/student/profile ka frontend.
 *
 * Sirf wahi teen fields jo naya API asal me save karta hai:
 * naam (StudentProfiles.name), target exam, avatar URL.
 * Email/phone yahan NAHI hain — wo API ke scope me hi nahi hain,
 * isliye nakli editable field nahi dikhaya gaya.
 */
export default function ProfileEditForm({
  initialName,
  initialTargetExam,
  initialAvatarUrl,
}: {
  initialName: string;
  initialTargetExam: string;
  initialAvatarUrl: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(initialName);
  const [targetExam, setTargetExam] = useState(initialTargetExam);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          targetExam: targetExam.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const detail = data?.error?.details?.[0]?.message;
        throw new Error(detail || data?.error?.message || 'Save nahi ho paya. Dobara try karo.');
      }
      setSaved(true);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Save nahi ho paya. Dobara try karo.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            setFullName(initialName);
            setTargetExam(initialTargetExam);
            setAvatarUrl(initialAvatarUrl);
            setError(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#5b21b6]"
        >
          <IconPencil size={13} />
          Naam, Target Exam ya Photo badlo
        </button>
        {saved && (
          <p className="ml-3 mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-600">
            <IconCheckCircle size={12} /> Profile update ho gaya
          </p>
        )}
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6d28d9]';
  const labelCls =
    'block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5';

  return (
    <form onSubmit={handleSave} className="mt-4 space-y-4 rounded-2xl border border-gray-200/80 bg-gray-50/60 p-5">
      <div>
        <label htmlFor="pe-name" className={labelCls}>Full Name</label>
        <input
          id="pe-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          minLength={2}
          maxLength={100}
          required
          placeholder="Tumhara poora naam"
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="pe-target" className={labelCls}>Target Exam</label>
        <input
          id="pe-target"
          type="text"
          value={targetExam}
          onChange={(e) => setTargetExam(e.target.value)}
          minLength={2}
          maxLength={100}
          required
          placeholder="Jaise: SSC CGL, RRB NTPC, IBPS PO"
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="pe-avatar" className={labelCls}>Photo URL (optional)</label>
        <input
          id="pe-avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          maxLength={500}
          placeholder="https://… (khaali chhodo to photo hat jayegi)"
          className={inputCls}
        />
      </div>
      {error && (
        <p className="flex items-start gap-1.5 text-xs font-semibold text-red-600">
          <IconX size={13} className="mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}
      <div className="flex items-center gap-2.5">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#5b21b6] disabled:opacity-50"
        >
          {saving ? 'Save ho raha hai…' : 'Save Karo'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-[13px] font-bold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
