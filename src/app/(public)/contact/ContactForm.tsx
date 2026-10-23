'use client';

import { useState, FormEvent } from 'react';

/**
 * MARKETING-A polish — SIRF presentation/UX.
 * API contract bilkul unchanged hai: POST /api/public/contact,
 * JSON body { name, email, subject, message }, response ke
 * success / error / message fields hi padhe jaate hain.
 * Badlav: light-theme inputs, saaf labels + required nishan,
 * helper text, aria-live status, bhejte waqt disabled state.
 */

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '2px solid var(--line)',
  borderRadius: 12,
  fontSize: 15,
  color: 'var(--ink)',
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--ink)',
  marginBottom: 6,
};

const hintStyle: React.CSSProperties = { fontSize: 12, color: 'var(--muted)', marginTop: 6 };

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSending(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to send your message.');
      }
      setStatus({ type: 'success', text: data.message || 'Message sent successfully!' });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {status && (
        <div
          role={status.type === 'success' ? 'status' : 'alert'}
          aria-live="polite"
          style={{
            marginBottom: 20,
            padding: '14px 16px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            border: '1.5px solid',
            background: status.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: status.type === 'success' ? '#166534' : '#991b1b',
            borderColor: status.type === 'success' ? '#86efac' : '#fca5a5',
          }}
        >
          {status.type === 'success' ? '✅ ' : '⚠️ '}
          {status.text}
          {status.type === 'success' && (
            <span style={{ display: 'block', fontWeight: 500, marginTop: 4 }}>
              Dhanyavaad! Humari team aapke message par follow-up karegi.
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" aria-label="General inquiries form">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" style={labelStyle}>
              Your Name <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Apna poora naam"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email Address <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="aapka@email.com"
              required
              aria-required="true"
            />
            <p style={hintStyle}>Jawab isi email par bheja jayega — sahi email bharein.</p>
          </div>
        </div>

        <div>
          <label htmlFor="subject" style={labelStyle}>
            Subject <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={inputStyle}
            placeholder="Jaise: Course ke baare me sawaal"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="message" style={labelStyle}>
            Message <span aria-hidden="true" style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Apna sawaal ya baat yahan detail me likhein…"
            required
            aria-required="true"
          ></textarea>
          <p style={hintStyle}>
            Jitni saaf detail denge, utna sahi jawab milega. Apna password ya OTP kabhi mat
            likhein.
          </p>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <button
            type="submit"
            disabled={sending}
            className="btn btn-primary"
            style={{ padding: '13px 34px', fontSize: 15, opacity: sending ? 0.6 : 1 }}
            aria-busy={sending}
          >
            {sending ? 'Bhej rahe hain…' : 'Send Message →'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
            <span aria-hidden="true">*</span> wale fields zaroori hain. Messages are logged to
            the platform audit trail for follow-up.
          </p>
        </div>
      </form>
    </>
  );
}
