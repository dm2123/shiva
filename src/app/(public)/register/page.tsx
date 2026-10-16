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
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const s = document.head.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (s) document.head.removeChild(s);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/public/auth/register/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
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
      if (!res.ok || !data.success) throw new Error(data.error?.message || 'OTP bhejne me dikkat hui.');
      setOtpSessionId(data.data.sessionId);
      setInfoMsg(`OTP bhej diya gaya hai ${phone} par.`);
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    border: '2px solid var(--line)',
    borderRadius: 12,
    fontSize: 15,
    transition: '.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--brand-dark)',
    marginBottom: 6,
  };

  return (
    <div className="shiva-landing">
      <div
        style={{
          minHeight: 'calc(100vh - 66px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(135deg,#faf9ff 0%,#f5f3ff 50%,#ede9fe 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(109,40,217,.08)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(245,158,11,.1)',
            filter: 'blur(40px)',
          }}
        />

        <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
          <div
            className="pop"
            style={{
              background: '#fff',
              border: '2px solid var(--line)',
              borderRadius: 24,
              padding: '36px 32px',
              boxShadow: '0 24px 60px rgba(109,40,217,.12)',
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(109,40,217,.2)',
                  border: '3px solid var(--line)',
                }}
              >
                <Image src="/assets/logo.jpeg" alt="THE SHIVA" width={72} height={72} className="object-cover w-full h-full" priority />
              </div>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', color: 'var(--brand-dark)', marginBottom: 6 }}>
              Join THE SHIVA 🎓
            </h2>
            <p style={{ fontSize: 14, textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              Free student registration — 2 minute me shuru karo
            </p>

            {error && <div className="form-err show">{error}</div>}
            {infoMsg && (
              <div
                style={{
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  color: '#166534',
                  marginBottom: 12,
                }}
              >
                ✅ {infoMsg}
              </div>
            )}

            {/* Google Sign-Up */}
            {step === 1 && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                  {googleLoading && (
                    <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }} className="animate-pulse">
                      Google se account ban raha hai...
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>YA</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                </div>
              </>
            )}

            {/* Email registration only — OTP removed (broken in prod) */}
            <form onSubmit={handleEmailRegister}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Tumhara poora naam"
                    maxLength={60}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Kam se kam 6 characters"
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !fullName.trim() || !email.includes('@') || password.length < 6}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: 16, opacity: loading || !fullName.trim() || !email.includes('@') || password.length < 6 ? 0.5 : 1 }}
                >
                  {loading ? '⏳ Register ho raha hai...' : 'Register →'}
                </button>
              </form>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '2px solid var(--line)', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                Pehle se account hai?{' '}
                <Link href="/login" style={{ fontWeight: 800, color: 'var(--brand)' }}>
                  Login karo
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
