'use client';

import { useState, type FormEvent } from 'react';

const EXAMS = [
  'SSC CGL / CHSL / MTS',
  'Railway (RRB NTPC / Group D)',
  'Banking (IBPS / SBI PO-Clerk)',
  'Defence (Agniveer / CDS / NDA)',
  'Teaching (CTET / UPTET / STET)',
];

export default function ShivaHero() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [exam, setExam] = useState('');
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
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone, exam }),
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
    <div className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1>
            SSC, Railway, Banking <span className="hl">mein Selection</span> Pakka!
          </h1>
          <p>
            Live classes, daily practice, All-India test series aur 1-on-1 doubt solving — sab kuch ek hi
            platform par, sabse affordable fees me.
          </p>
          <div className="hero-ctas">
            <a href="/batches" className="btn btn-accent">
              Explore Batches
            </a>
            <a
              href="#demoCard"
              className="btn"
              style={{ border: '2px solid #fff', color: '#fff', background: 'rgba(255,255,255,.12)' }}
            >
              Book Free Demo
            </a>
          </div>
          <div className="trust-chips">
            <span>📡 Live Interactive Classes</span>
            <span>📝 Daily Practice + Tests</span>
            <span>❓ 1-on-1 Doubt Solving</span>
            <span>💰 Sabse Affordable Fees</span>
          </div>
        </div>
        <div className="hero-card pop" id="demoCard">
          <h3>🎯 Book Your FREE Demo Class</h3>
          <p>Apna exam chuno — hamari team call karke free demo book karegi.</p>
          <div className={`form-ok${done ? ' show' : ''}`}>
            ✅ Dhanyavaad <b>{name}</b>!<br />
            {exam} ki FREE demo book ho gayi.
            <br />
            Hamari team <b>{phone}</b> par jald call karegi.
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
              <select required value={exam} onChange={(e) => setExam(e.target.value)}>
                <option value="">Select Your Exam</option>
                {EXAMS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
                {loading ? 'Booking...' : 'Book Free Demo →'}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="float-a" style={{ width: 90, height: 90, background: 'rgba(245,158,11,.35)', top: '18%', right: '8%' }} />
      <div className="float-a" style={{ width: 54, height: 54, background: 'rgba(255,255,255,.25)', bottom: '22%', right: '38%', animationDelay: '1.2s' }} />
      <div className="float-b" style={{ fontSize: 44, top: '14%', left: '4%' }}>📚</div>
      <div className="float-b" style={{ fontSize: 38, bottom: '16%', left: '44%', animationDelay: '2s' }}>🎯</div>
      <div className="float-b" style={{ fontSize: 40, top: '48%', right: '4%', animationDelay: '.6s' }}>🏆</div>
    </div>
  );
}
