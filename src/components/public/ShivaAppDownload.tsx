'use client';

import { useState, type FormEvent } from 'react';
import Reveal from './Reveal';

export default function ShivaAppDownload() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/notify', {
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
    <section id="app" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <Reveal>
          <div className="appcta">
            <div>
              <h2>📱 THE SHIVA App — Padhai Ab Pocket Me</h2>
              <p>Website par sirf batches dekho — asli padhai app me hoti hai:</p>
              <ul className="app-points">
                <li>Live classes with polls &amp; quizzes</li>
                <li>Doubt photo upload — instant answer</li>
                <li>Offline download for travel</li>
                <li>Daily streaks &amp; leaderboard</li>
                <li>Push notifications for classes</li>
              </ul>
              <br />
              <div className={`form-ok${done ? ' show' : ''}`} style={{ marginTop: 6 }}>
                ✅ Noted, <b>{name}</b>!
                <br />
                Android app launch hote hi <b>{phone}</b> par inform karenge.
              </div>
              <div className={`form-err${error ? ' show' : ''}`}>{error}</div>
              {!done && (
                <form onSubmit={submit} className="notify-form">
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
                    placeholder="Mobile (10-digit)"
                    required
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                  <button className="btn btn-accent" type="submit" disabled={loading}>
                    {loading ? '...' : '🔔 Notify Me'}
                  </button>
                </form>
              )}
              <p style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
                📱 Android app jald aa raha hai — launch par sabse pehle khabar pao.
              </p>
            </div>
            <div>
              <div className="phone-mock">
                <div className="scr">
                  <div className="mark">S</div>
                  <b style={{ fontSize: 20 }}>THE SHIVA</b>
                  <p style={{ fontSize: 13, opacity: 0.9, margin: '10px 0 20px' }}>
                    SSC • Railway • Banking
                    <br />
                    Defence • Teaching
                  </p>
                  <div
                    style={{
                      background: 'rgba(255,255,255,.15)',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 13,
                      textAlign: 'left',
                    }}
                  >
                    🔴 LIVE now: Maths — SSC CGL
                    <br />
                    <br />
                    📝 Today&apos;s DPP: 20 questions
                    <br />
                    <br />
                    🏆 Your AIR: #1,247
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
