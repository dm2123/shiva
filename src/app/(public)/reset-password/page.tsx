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
              Naya Password 🔐
            </h2>
            <p style={{ fontSize: 14, textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
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
                    style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', fontSize: 20, fontWeight: 800 }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                  />
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
                        fontSize: 18,
                        lineHeight: 1,
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
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
                    style={{
                      ...inputStyle,
                      borderColor:
                        confirmPassword && !passwordsMatch ? '#fca5a5' : undefined,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p style={{ fontSize: 12, color: '#991b1b', marginTop: 6, fontWeight: 600 }}>
                      ⚠️ Dono password match nahi ho rahe
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
                  {loading ? '⏳ Reset ho raha hai...' : 'Password Reset Karo →'}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
