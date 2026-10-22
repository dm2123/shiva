'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/teacher/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Login failed.');
      }

      window.location.href = '/teacher';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200/80">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 relative overflow-hidden rounded-full border border-amber-200 bg-white flex items-center justify-center p-1 shadow-md">
          <Image
            src="/assets/logo.jpeg"
            alt="THE SHIVA"
            width={60}
            height={60}
            className="object-contain w-full h-full rounded-full"
            priority
          />
        </div>
      </div>
      <h2 className="text-2xl font-black mb-1 text-center text-slate-900">Teacher Portal Login</h2>
      <p className="text-xs text-center text-slate-500 mb-6">Sign in to access your educator workspace</p>
      {error && (
        <div className="mb-6 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Teacher Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            placeholder="teacher@shiva.local"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In as Teacher'}
        </button>
      </form>
    </div>
  );
}
