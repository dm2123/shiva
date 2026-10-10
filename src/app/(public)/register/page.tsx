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

export default function StudentRegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

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
            text: 'signup_with',
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
        throw new Error(data.error?.message || 'Google sign-up failed.');
      }

      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/public/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Failed to send OTP.');
      setOtpSessionId(data.data.sessionId);
      setInfoMsg('OTP sent to your phone.');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/public/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otpSessionId, otpCode, fullName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'Registration failed.');
      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#c8a96e]/50 focus:ring-1 focus:ring-[#c8a96e]/30 transition";
  const labelClass = "block text-[10px] font-bold text-[#c8a96e] uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8a96e]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-[#c8a96e]/40 overflow-hidden bg-black/30 flex items-center justify-center shadow-lg shadow-[#c8a96e]/20">
              <Image src="/assets/logo.jpeg" alt="THE SHIVA" width={60} height={60} className="object-contain w-full h-full rounded-full" priority />
            </div>
          </div>

          <h2 className="text-2xl font-black mb-1 text-center text-white">Join THE SHIVA</h2>
          <p className="text-xs text-center text-slate-400 mb-6">Free Student Registration</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full transition ${step === 1 ? 'bg-[#c8a96e]' : 'bg-[#c8a96e]/40'}`} />
            <div className="w-8 h-px bg-white/10" />
            <div className={`w-2 h-2 rounded-full transition ${step === 2 ? 'bg-[#c8a96e]' : 'bg-white/20'}`} />
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium">{error}</div>
          )}
          {infoMsg && (
            <div className="mb-4 p-3.5 bg-[#c8a96e]/10 text-[#c8a96e] text-xs rounded-xl border border-[#c8a96e]/20 font-medium">{infoMsg}</div>
          )}

          {/* Google Sign-Up */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <div ref={googleBtnRef} className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full"></div>
                {googleLoading && (
                  <div className="mt-2 text-center text-xs text-slate-400 animate-pulse">Creating account with Google...</div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-slate-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
            </>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className={labelClass}>Mobile Number</label>
                <div className="flex gap-2">
                  <span className="px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-[#c8a96e] flex items-center">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="9876543210"
                    className={inputClass}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">A 6-digit OTP will be sent for verification.</p>
              </div>
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3 bg-[#c8a96e] hover:bg-[#e8d5a3] text-black rounded-xl font-black text-sm shadow-lg shadow-[#c8a96e]/20 transition disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCompleteRegister} className="space-y-4">
              <div>
                <label className={labelClass}>OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="------"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-lg text-white placeholder-slate-700 text-center tracking-[0.5em] font-mono font-bold focus:outline-none focus:border-[#c8a96e]/50 focus:ring-1 focus:ring-[#c8a96e]/30 transition"
                />
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-bold text-xs transition">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6 || !fullName}
                  className="w-2/3 py-3 bg-[#c8a96e] hover:bg-[#e8d5a3] text-black rounded-xl font-black text-sm shadow-lg shadow-[#c8a96e]/20 transition disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#c8a96e] hover:text-[#e8d5a3] transition">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
