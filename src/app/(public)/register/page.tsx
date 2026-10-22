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

/* ---- Presentation only: brand panel (desktop split / mobile compact) ---- */

const BENEFITS = [
  'Structured courses aur batches — step-by-step padhai',
  'Live classes, tests aur practice — sab ek hi dashboard me',
  'Doubts poochho aur apni progress track karo',
];

function BrandPanel() {
  return (
    <aside
      className="relative hidden overflow-hidden lg:flex lg:flex-col"
      style={{
        background: 'linear-gradient(160deg,#2a1650 0%,#4c1d95 55%,#6d28d9 100%)',
        color: '#fff',
        padding: '44px 40px',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          top: -70,
          right: -70,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(245,185,66,.16)',
          filter: 'blur(30px)',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              overflow: 'hidden',
              border: '2px solid rgba(245,185,66,.7)',
              flexShrink: 0,
            }}
          >
            <Image src="/assets/logo.jpeg" alt="" width={52} height={52} className="object-cover w-full h-full" />
          </div>
          <div>
            <p style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.1, letterSpacing: '.4px' }}>THE SHIVA</p>
            <p style={{ fontSize: 12, color: '#f5b942', fontWeight: 700 }}>Learn • Practice • Grow</p>
          </div>
        </div>

        <h2 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
          Aaj se padhai
          <br />
          shuru karo.
        </h2>
        <p style={{ fontSize: 14.5, color: '#ddd6fe', lineHeight: 1.65, marginBottom: 28 }}>
          Free student account banao aur apne courses, live classes aur tests ek hi jagah pao.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
          {BENEFITS.map((b) => (
            <li key={b} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.55, color: '#ede9fe' }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(245,185,66,.2)',
                  color: '#f5b942',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <p style={{ position: 'relative', marginTop: 'auto', paddingTop: 32, fontSize: 12.5, color: '#c4b5fd' }}>
        Registration me sirf kuch minute lagte hain.
      </p>
    </aside>
  );
}

function MobileBrandHeader() {
  return (
    <div
      className="lg:hidden"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'linear-gradient(120deg,#2a1650,#6d28d9)',
        borderRadius: 16,
        padding: '14px 16px',
        marginBottom: 24,
        color: '#fff',
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(245,185,66,.7)', flexShrink: 0 }}>
        <Image src="/assets/logo.jpeg" alt="THE SHIVA" width={44} height={44} className="object-cover w-full h-full" priority />
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>THE SHIVA</p>
        <p style={{ fontSize: 12, color: '#f5b942', fontWeight: 700 }}>Learn • Practice • Grow</p>
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

export default function StudentRegisterPage() {
  // Must match server Zod policy in src/services/auth.service.ts (studentRegisterSchema)
  const isPasswordValid = (pw: string) =>
    pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);

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
  const [emailTouched, setEmailTouched] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const showEmailError = emailTouched && email.trim().length > 0 && !email.includes('@');
  const passwordChecks = [
    { label: 'Kam se kam 8 characters', ok: password.length >= 8 },
    { label: 'Ek bada akshar (A-Z)', ok: /[A-Z]/.test(password) },
    { label: 'Ek chhota akshar (a-z)', ok: /[a-z]/.test(password) },
    { label: 'Ek number (0-9)', ok: /[0-9]/.test(password) },
  ];

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

        <div style={{ position: 'relative', width: '100%', maxWidth: 960 }}>
          {/* Back to marketing site */}
          <a
            href="https://dm2123.github.io/shiva/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--brand)',
              textDecoration: 'none',
            }}
          >
            ← Back
          </a>

          <div
            className="pop grid overflow-hidden lg:grid-cols-[400px_1fr]"
            style={{
              background: '#fff',
              border: '2px solid var(--line)',
              borderRadius: 24,
              boxShadow: '0 24px 60px rgba(109,40,217,.12)',
            }}
          >
            <BrandPanel />

            <div style={{ padding: '36px 32px' }} className="sm:px-10">
              <MobileBrandHeader />

              <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--brand-dark)', marginBottom: 6 }}>
                Join THE SHIVA
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                Free student registration — 2 minute me shuru karo
              </p>

              {error && (
                <div className="form-err show" role="alert">
                  ⚠️ {error}
                </div>
              )}
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
                  role="status"
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
                  <label htmlFor="register-name" style={labelStyle}>Full Name</label>
                  <input
                    id="register-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Tumhara poora naam"
                    maxLength={60}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="register-email" style={labelStyle}>Email</label>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    aria-invalid={showEmailError}
                    style={{ ...inputStyle, borderColor: showEmailError ? '#fca5a5' : undefined }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => {
                      setEmailTouched(true);
                      e.target.style.borderColor = 'var(--line)';
                    }}
                  />
                  {showEmailError && (
                    <p style={{ fontSize: 12, color: '#991b1b', marginTop: 6, fontWeight: 600 }} role="alert">
                      Sahi email format dalo — jaise you@example.com
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="register-password" style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="8+ characters, A-Z, a-z, 0-9"
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, display: 'inline-flex', padding: 2 }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {/* Live checklist — same 4 rules as isPasswordValid above, display only */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                    {passwordChecks.map((c) => (
                      <li
                        key={c.label}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: password.length === 0 ? 'var(--muted)' : c.ok ? '#166534' : '#991b1b',
                        }}
                      >
                        {password.length === 0 ? '•' : c.ok ? '✓' : '✕'} {c.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="submit"
                  disabled={loading || !fullName.trim() || !email.includes('@') || !isPasswordValid(password)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: 16, opacity: loading || !fullName.trim() || !email.includes('@') || !isPasswordValid(password) ? 0.5 : 1 }}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin" style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', verticalAlign: -2, marginRight: 8 }} />
                      Register ho raha hai...
                    </>
                  ) : (
                    'Register →'
                  )}
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
    </div>
  );
}
