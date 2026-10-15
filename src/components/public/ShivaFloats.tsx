'use client';

import { useEffect, useState, type FormEvent } from 'react';

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
        <button className="btn btn-ghost" onClick={() => setOpen(true)}>
          📞 Callback
        </button>
        <a className="btn btn-primary" href="/#demoCard">
          🎯 Book Free Demo
        </a>
      </div>

      <button className="cb-float" onClick={() => setOpen(true)}>
        📞 Request a Call Back
      </button>

      <div className={`modal${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal-box">
          <button className="x" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </button>
          <h3>📞 Request a Call Back</h3>
          <p>Apna number do — hamara counselor 30 minute me call karega.</p>
          <div className={`form-ok${done ? ' show' : ''}`}>
            ✅ Dhanyavaad <b>{name}</b>! 📞<br />
            Hamara counselor 30 minute me <b>{phone}</b> par call karega.
          </div>
          <div className={`form-err${error ? ' show' : ''}`}>{error}</div>
          {!done && (
            <form onSubmit={submit}>
              <input
                type="text"
                placeholder="Your Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
              <input
                type="tel"
                placeholder="Mobile Number (10-digit)"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
              <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? 'Requesting...' : 'Call Me Back →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
