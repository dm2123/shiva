import Reveal from './Reveal';

const FEATS = [
  { ico: '📡', bg: '#ede9fe', t: 'Live Interactive Classes', d: 'Learn from expert faculty in real-time.' },
  { ico: '📝', bg: '#dcfce7', t: 'Practice & Mock Tests', d: 'Improve with real exam pattern tests.' },
  { ico: '📚', bg: '#dbeafe', t: 'Study Material', d: 'Notes, PDFs, eBooks and more.' },
  { ico: '❓', bg: '#fef3c7', t: 'Doubt Solving', d: 'Get your doubts cleared 24x7.' },
  { ico: '🎓', bg: '#fee2e2', t: 'Scholarship Test', d: 'Fee discount on selected courses.' },
  { ico: '📱', bg: '#ede9fe', t: 'Mobile App', d: 'Learn anytime, anywhere on your device.' },
];

export default function ShivaFeatures() {
  return (
    <section>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">✨ Why THE SHIVA?</span>
          <h2>
            Everything You Need
            <br />
            for <span className="hl">Exam Success</span>
          </h2>
          <p>
            We provide complete preparation support with modern teaching methods, expert guidance and
            personalized learning experience.
          </p>
        </Reveal>
        <div className="grid4">
          {FEATS.map((f, i) => (
            <Reveal key={f.t} delay={i % 3}>
              <div className="feat">
                <div className="ico" style={{ background: f.bg }}>
                  {f.ico}
                </div>
                <div>
                  <b>{f.t}</b>
                  <p>{f.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
