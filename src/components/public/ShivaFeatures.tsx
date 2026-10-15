import Reveal from './Reveal';

const FEATS = [
  { ico: '📡', bg: '#ede9fe', t: 'Live Interactive Classes', d: 'Real-time me padho, beech me quiz, turant doubt poochho.' },
  { ico: '📝', bg: '#dcfce7', t: 'Daily Practice (DPP)', d: 'Roz ke practice problems se concept pakka.' },
  { ico: '🏆', bg: '#fef3c7', t: 'All-India Test Series', d: 'Mock test ke baad rank, accuracy aur time analysis.' },
  { ico: '❓', bg: '#e0e7ff', t: '24x7 Doubt Solving', d: 'Photo kheecho, expert se answer pao.' },
  { ico: '📊', bg: '#fce7f3', t: 'Smart Study Planner', d: 'AI-powered plan — kya padhna hai, kab padhna hai.' },
  { ico: '🔥', bg: '#ede9fe', t: 'Streaks & Leaderboard', d: 'Roz padho, XP kamao, doston se aage niklo.' },
  { ico: '📥', bg: '#dcfce7', t: 'Offline Download', d: 'Class download karo, bina internet ke padho.' },
  { ico: '💰', bg: '#fef3c7', t: 'Affordable Fees', d: 'Best teachers, sabse kam fees. EMI available.' },
];

export default function ShivaFeatures() {
  return (
    <section>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Why THE SHIVA</span>
          <h2>Selection Ka Poora System</h2>
        </Reveal>
        <div className="grid4">
          {FEATS.map((f, i) => (
            <Reveal key={f.t} delay={i % 4}>
              <div className="feat">
                <div className="ico" style={{ background: f.bg }}>
                  {f.ico}
                </div>
                <b>{f.t}</b>
                <p>{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
