'use client';

import { useState, type FormEvent } from 'react';

/**
 * ShivaHero — orphan landing hero (wiring parent ka faisla hai).
 * Round 2 Stream E: map ke hero pattern par aligned — bahut bada extra-bold H1
 * (CSS .hero h1 = 52px, 'Mission.' gradient .grad me), grey-toned subtext,
 * solid purple 'Get Started' pill (.btn-primary .btn-pill), 4 stat cards,
 * daaye FREE demo form card (#demoCard — nav/footer anchors isi par aate hain).
 */

const EXAMS = [
  'SSC CGL / CHSL / MTS',
  'Railway (RRB NTPC / Group D)',
  'Banking (IBPS / SBI PO-Clerk)',
  'Defence (Agniveer / CDS / NDA)',
  'Teaching (CTET / UPTET / STET)',
];

/* Map pattern: hero ke neeche 4 stat cards (flat icon + bold number/label + grey subtext).
   Saare asal platform facts hi — koi invented count nahi. */
const STATS = [
  { ico: '🎯', b: '100% Free', s: 'Starter Courses' },
  { ico: '📚', b: '5 Exams', s: 'Categories Covered' },
  { ico: '🔴', b: 'Live Classes', s: '+ Recordings' },
  { ico: '🌐', b: 'Hindi + English', s: 'Bilingual Content' },
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
          <span className="hero-pill">🛡️ Bharat ka Affordable Learning Platform</span>
          <h1>
            Your Dream Exams.
            <br />
            Our <span className="grad">Mission.</span>
          </h1>
          <p>
            Prepare for SSC, Railway, Banking, Defence & Teaching exams with expert guidance, live
            classes, quality study material and real exam practice.
          </p>
          <div className="hero-stats">
            {STATS.map((s) => (
              <div className="hstat" key={s.b}>
                <div className="ic">{s.ico}</div>
                <div>
                  <b>{s.b}</b>
                  <span>{s.s}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hero-ctas">
            {/* Map pattern: bada solid 'Get Started' pill = primary CTA */}
            <a href="/register" className="btn btn-primary btn-pill hero-cta-main">
              Get Started →
            </a>
            <a href="/courses" className="btn btn-ghost btn-pill">
              Explore Courses
            </a>
          </div>
          {/* Exam-goal chips — chip chunne par demo form ka exam pre-select hota hai */}
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd', marginBottom: 10 }}>
              Apna exam goal chuno:
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Exam goals">
              {EXAMS.map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => {
                    setExam(x);
                    document.getElementById('demoCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  aria-pressed={exam === x}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: exam === x ? '#1e1b2e' : '#e9e4ff',
                    background: exam === x ? '#f5b942' : 'rgba(124,58,237,.25)',
                    border: `1.5px solid ${exam === x ? '#f5b942' : 'rgba(167,139,250,.55)'}`,
                    transition: 'background .2s, color .2s',
                  }}
                >
                  {x}
                </button>
              ))}
            </div>
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
                aria-label="Your name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
              <input
                type="tel"
                placeholder="Mobile Number (10-digit)"
                aria-label="Mobile number, 10 digits"
                autoComplete="tel"
                inputMode="numeric"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
              <select required value={exam} onChange={(e) => setExam(e.target.value)} aria-label="Select your exam">
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
      <div className="float-a" style={{ width: 90, height: 90, background: 'rgba(245,158,11,.3)', top: '18%', right: '8%' }} />
      <div className="float-a" style={{ width: 54, height: 54, background: 'rgba(124,58,237,.4)', bottom: '22%', right: '38%', animationDelay: '1.2s' }} />
      <div className="float-b" style={{ fontSize: 44, top: '14%', left: '4%' }}>📚</div>
      <div className="float-b" style={{ fontSize: 38, bottom: '16%', left: '44%', animationDelay: '2s' }}>🎯</div>
      <div className="float-b" style={{ fontSize: 40, top: '48%', right: '4%', animationDelay: '.6s' }}>🏆</div>
    </div>
  );
}
