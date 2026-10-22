'use client';

import { useState, FormEvent } from 'react';

export default function CallbackRequestForm({ defaultName = '' }: { defaultName?: string }) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!name.trim()) {
      setError('Apna naam likho.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Sahi 10-digit mobile number dalo.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok || data?.data?.success === false) {
        throw new Error(data?.data?.error || data?.error?.message || 'Request fail ho gayi.');
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Request fail ho gayi. Thodi der baad try karo.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="student-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          ✅
        </div>
        <h3 className="text-base font-bold text-[var(--student-text)]">Request mil gayi!</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--student-text-muted)]">
          Hamare counsellor jald hi <b className="text-[var(--student-text)]">{phone}</b> par call
          karenge. Kripya apna phone paas rakhein.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="student-card space-y-4 p-6">
      <div>
        <h3 className="text-base font-bold text-[var(--student-text)]">📞 Callback request karo</h3>
        <p className="mt-1 text-sm text-[var(--student-text-muted)]">
          Number do — counsellor khud tumhe call karega. Koi charge nahi.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="cb-name" className="mb-1.5 block text-[13px] font-bold text-[var(--student-text)]">
          Tumhara naam
        </label>
        <input
          id="cb-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Apna naam likho"
          maxLength={60}
          className="w-full rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] px-4 py-3 text-sm text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:border-[var(--student-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div>
        <label htmlFor="cb-phone" className="mb-1.5 block text-[13px] font-bold text-[var(--student-text)]">
          Mobile number
        </label>
        <input
          id="cb-phone"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, '').slice(0, 13))}
          placeholder="10-digit mobile number"
          className="w-full rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] px-4 py-3 text-sm text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:border-[var(--student-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <p className="mt-1.5 text-[12px] text-[var(--student-text-faint)]">
          Sirf call ke liye use hoga. Koi spam nahi.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--student-primary)] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? '⏳ Bhej rahe hain...' : '📞 Mujhe call karo'}
      </button>
    </form>
  );
}
