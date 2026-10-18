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

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isEmailValid && password.length > 0 && !loading;

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

        <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
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
              Welcome Back! 👋
            </h2>
            <p style={{ fontSize: 14, textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
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
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                />
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
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
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
                {loading ? '⏳ Login ho raha hai...' : 'Login →'}
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
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
            <Link href="/teacher/login" style={{ color: 'var(--muted)' }}>Teacher Login</Link>
            {' · '}
            <Link href="/admin/login" style={{ color: 'var(--muted)' }}>Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
