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
              Password Reset 🔑
            </h2>
            <p style={{ fontSize: 14, textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
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
                  {loading ? '⏳ OTP bhej rahe hain...' : 'OTP Bhejo →'}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
