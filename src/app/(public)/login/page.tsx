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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  border: '2px solid var(--line)',
  borderRadius: 12,
  fontSize: 15,
  transition: '.2s',
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--brand-dark)',
  marginBottom: 6,
};

const fieldErrorStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#991b1b',
  marginTop: 6,
  fontWeight: 600,
};

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
          Padhai, bina
          <br />
          rukawat.
        </h2>
        <p style={{ fontSize: 14.5, color: '#ddd6fe', lineHeight: 1.65, marginBottom: 28 }}>
          Apne courses, live classes aur tests — sab ek hi jagah, apni pace par.
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
        Apne account se wahi se shuru karo, jahan chhoda tha.
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

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isEmailValid && password.length > 0 && !loading;
  const showEmailError = emailTouched && email.trim().length > 0 && !isEmailValid;

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
            text: 'continue_with',
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
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/public/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Login failed. Please check your email and password.');
      }

      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
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
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
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
            left: -60,
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
                Welcome Back!
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                Apne THE SHIVA account me login karo
              </p>

              {error && (
                <div className="form-err show" role="alert">
                  ⚠️ {error}
                </div>
              )}

              {/* Google Sign-In */}
              <div style={{ marginBottom: 20 }}>
                <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                {googleLoading && (
                  <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }} className="animate-pulse">
                    Google se sign in ho raha hai...
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>YA</span>
                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} noValidate={false}>
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="login-email" style={labelStyle}>
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                    placeholder="tumhara@email.com"
                    aria-invalid={showEmailError}
                    style={{ ...inputStyle, borderColor: showEmailError ? '#fca5a5' : undefined }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => {
                      setEmailTouched(true);
                      e.target.style.borderColor = 'var(--line)';
                    }}
                  />
                  {showEmailError && (
                    <p style={fieldErrorStyle} role="alert">
                      Sahi email format dalo — jaise tumhara@email.com
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label htmlFor="login-password" style={labelStyle}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={handlePasswordKey}
                      onKeyDown={handlePasswordKey}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        lineHeight: 1,
                        display: 'inline-flex',
                        padding: 2,
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {capsLockOn && (
                    <p style={{ fontSize: 12, color: '#b45309', marginTop: 6, fontWeight: 600 }}>
                      ⚠️ Caps Lock on hai — password check kar lo
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', marginBottom: 20 }}>
                  <Link href="/forgot-password" style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600 }}>
                    Password bhool gaye?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: 16,
                    opacity: canSubmit ? 1 : 0.5,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin" style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', verticalAlign: -2, marginRight: 8 }} />
                      Login ho raha hai...
                    </>
                  ) : (
                    'Login →'
                  )}
                </button>
              </form>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '2px solid var(--line)', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Account nahi hai?{' '}
                  <Link href="/register" style={{ fontWeight: 800, color: 'var(--brand)' }}>
                    Free me Register karo
                  </Link>
                </p>
              </div>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
                <Link href="/teacher/login" style={{ color: 'var(--muted)' }}>Teacher Login</Link>
                {' · '}
                <Link href="/admin/login" style={{ color: 'var(--muted)' }}>Admin Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
