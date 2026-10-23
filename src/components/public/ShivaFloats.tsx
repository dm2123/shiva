'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';

export default function ShivaFloats() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setDone(false);
      setError('');
    };
    window.addEventListener('shiva:open-callback', handler);
    return () => window.removeEventListener('shiva:open-callback', handler);
  }, []);

  // Modal: Esc close + body scroll-lock (shell-level a11y polish).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="sticky-cta">
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>
          📞 Callback
        </button>
        <a className="btn btn-primary" href="/#demoCard">
          🎯 Book Free Demo
        </a>
      </div>

      <button type="button" className="cb-float" onClick={() => setOpen(true)} aria-label="Request a call back">
        📞 Request a Call Back
      </button>

      <div
        className={`modal${open ? ' open' : ''}`}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Request a call back"
        aria-hidden={!open}
      >
        <div className="modal-box">
          <button type="button" className="x" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </button>
          <h3>📞 Request a Call Back</h3>
          <p>Apna number do — hamara counselor 30 minute me call karega.</p>
          <div className={`form-ok${done ? ' show' : ''}`} role="status">
            ✅ Dhanyavaad <b>{name}</b>! 📞<br />
            Hamara counselor 30 minute me <b>{phone}</b> par call karega.
          </div>
          <div className={`form-err${error ? ' show' : ''}`} role="alert">
            {error}
          </div>
          {!done && (
            <form onSubmit={submit}>
              <label className="sr-only" htmlFor="cb-name">
                Your Name
              </label>
              <input
                id="cb-name"
                type="text"
                placeholder="Your Name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
              <label className="sr-only" htmlFor="cb-phone">
                Mobile Number (10-digit)
              </label>
              <input
                id="cb-phone"
                type="tel"
                placeholder="Mobile Number (10-digit)"
                required
                pattern="[0-9]{10}"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
              <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? 'Requesting...' : 'Call Me Back →'}
              </button>
            </form>
          )}
          <p className="cb-alt">
            Likha hua message bhejna hai?{' '}
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact page par jayein →
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
