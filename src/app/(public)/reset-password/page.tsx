'use client';

import { useState, FormEvent, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
          Naya password,
          <br />
          nayi shuruaat.
        </h2>
        <p style={{ fontSize: 14.5, color: '#ddd6fe', lineHeight: 1.65, marginBottom: 28 }}>
          OTP verify karke naya password set karo — phir seedha apni padhai par wapas.
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

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || '';
  const sessionId = searchParams.get('sessionId') || '';

  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    /^\d{6}$/.test(otpCode) &&
    newPassword.length >= 6 &&
    passwordsMatch &&
    identifier &&
    sessionId &&
    !loading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/public/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          otpSessionId: sessionId,
          otpCode,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Password reset me dikkat hui.');
      }

      setSuccess(true);
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
                Naya Password
              </h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                {identifier ? (
                  <>{identifier} par bheja gaya 6-digit OTP dalo</>
                ) : (
                  <>Pehle forgot-password page se OTP mangwao</>
                )}
              </p>

              {error && (
                <div className="form-err show" role="alert">
                  ⚠️ {error}
                </div>
              )}

              {success ? (
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 14,
                      color: '#166534',
                      marginBottom: 20,
                    }}
                    role="status"
                  >
                    ✅ Password reset ho gaya! Ab naye password se login karo.
                  </div>
                  <Link
                    href="/login"
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
                    Login Karo →
                  </Link>
                </div>
              ) : !identifier || !sessionId ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                    Ye page seedha nahi khulta. Pehle apna email/phone verify karo.
                  </p>
                  <Link
                    href="/forgot-password"
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
                    ← Forgot Password par jao
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="rp-otp" style={labelStyle}>
                      6-Digit OTP
                    </label>
                    <input
                      id="rp-otp"
                      type="text"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      autoFocus
                      autoComplete="one-time-code"
                      placeholder="123456"
                      aria-describedby="rp-otp-hint"
                      style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', fontSize: 20, fontWeight: 800 }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                    <p id="rp-otp-hint" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
                      {otpCode.length}/6 digits
                    </p>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="rp-new" style={labelStyle}>
                      Naya Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="rp-new"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Kam se kam 6 characters"
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
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <p style={{ fontSize: 12, color: '#991b1b', marginTop: 6, fontWeight: 600 }}>
                        Password kam se kam 6 characters ka ho ({newPassword.length}/6)
                      </p>
                    )}
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="rp-confirm" style={labelStyle}>
                      Password Confirm Karo
                    </label>
                    <input
                      id="rp-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Dobara wahi password"
                      aria-invalid={!!(confirmPassword && !passwordsMatch)}
                      style={{
                        ...inputStyle,
                        borderColor:
                          confirmPassword && !passwordsMatch ? '#fca5a5' : undefined,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                    {confirmPassword && !passwordsMatch && (
                      <p style={{ fontSize: 12, color: '#991b1b', marginTop: 6, fontWeight: 600 }} role="alert">
                        ⚠️ Dono password match nahi ho rahe
                      </p>
                    )}
                    {confirmPassword && passwordsMatch && (
                      <p style={{ fontSize: 12, color: '#166534', marginTop: 6, fontWeight: 600 }}>
                        ✓ Dono password match ho gaye
                      </p>
                    )}
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
                        Reset ho raha hai...
                      </>
                    ) : (
                      'Password Reset Karo →'
                    )}
                  </button>
                </form>
              )}

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '2px solid var(--line)', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                  <Link href="/login" style={{ fontWeight: 800, color: 'var(--brand)' }}>
                    ← Login par wapas
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
