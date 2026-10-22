'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
          Account wapas,
          <br />
          aasani se.
        </h2>
        <p style={{ fontSize: 14.5, color: '#ddd6fe', lineHeight: 1.65, marginBottom: 28 }}>
          Registered email ya phone par OTP bhejte hain — usi se naya password set kar lo.
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
        OTP kisi ke saath share mat karo.
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

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = identifier.trim().length > 0 && !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/public/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Request bhejne me dikkat hui.');
      }

      // Generic message (server doesn't reveal whether account exists)
      setSuccess(
        data.data?.message ||
          'Agar is email/phone se account hai, to recovery OTP bhej diya gaya hai.'
      );
      // OTP session id is only present when an account actually matched
      setOtpSessionId(data.data?.sessionId || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
                Password Reset
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                Apna registered email ya phone number dalo — OTP bhejenge
              </p>

              {error && (
                <div className="form-err show" role="alert">
                  ⚠️ {error}
                </div>
              )}
              {success && (
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
                  ✅ {success}
                </div>
              )}

              {!success ? (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="fp-identifier" style={labelStyle}>
                      Email ya Phone Number
                    </label>
                    <input
                      id="fp-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoFocus
                      autoComplete="email"
                      placeholder="tumhara@email.com"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                      Wahi email ya phone dalo jo registration me use kiya tha.
                    </p>
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
                        OTP bhej rahe hain...
                      </>
                    ) : (
                      'OTP Bhejo →'
                    )}
                  </button>
                </form>
              ) : otpSessionId ? (
                <Link
                  href={`/reset-password?identifier=${encodeURIComponent(identifier.trim())}&sessionId=${encodeURIComponent(otpSessionId)}`}
                  className="btn btn-primary"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    width: '100%',
                    padding: '14px',
                    fontSize: 16,
                    textDecoration: 'none',
                  }}
                >
                  OTP Dalke Password Reset Karo →
                </Link>
              ) : null}

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '2px solid var(--line)', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Yaad aa gaya?{' '}
                  <Link href="/login" style={{ fontWeight: 800, color: 'var(--brand)' }}>
                    Login karo
                  </Link>
                </p>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
                  Account nahi hai?{' '}
                  <Link href="/register" style={{ fontWeight: 800, color: 'var(--brand)' }}>
                    Free me Register karo
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
