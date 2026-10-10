'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setGoogleLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/public/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Google sign-in failed.');
      }

      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/public/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Login failed.');
      }

      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8a96e]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#c8a96e]/40 overflow-hidden bg-black/30 flex items-center justify-center shadow-lg shadow-[#c8a96e]/20">
              <Image src="/assets/logo.jpeg" alt="THE SHIVA" width={60} height={60} className="object-contain w-full h-full rounded-full" priority />
            </div>
          </div>

          <h2 className="text-2xl font-black mb-1 text-center text-white">Welcome Back</h2>
          <p className="text-xs text-center text-slate-400 mb-8">Sign in to your THE SHIVA account</p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-6">
            <div ref={googleBtnRef} className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full"></div>
            {googleLoading && (
              <div className="mt-2 text-center text-xs text-slate-400 animate-pulse">Signing in with Google...</div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-slate-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#c8a96e] uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#c8a96e]/50 focus:ring-1 focus:ring-[#c8a96e]/30 transition"
                placeholder="student@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#c8a96e] uppercase tracking-widest mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#c8a96e]/50 focus:ring-1 focus:ring-[#c8a96e]/30 transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#c8a96e] hover:bg-[#e8d5a3] text-black rounded-xl font-black text-sm shadow-lg shadow-[#c8a96e]/20 transition disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-[#c8a96e] hover:text-[#e8d5a3] transition">
                Register Free
              </Link>
            </p>
            <p className="text-xs text-slate-600">
              <Link href="/admin/login" className="hover:text-slate-400 transition">Admin Login</Link>
              {' · '}
              <Link href="/teacher/login" className="hover:text-slate-400 transition">Teacher Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
