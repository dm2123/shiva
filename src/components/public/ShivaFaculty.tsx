import Reveal from './Reveal';

const FACULTY = [
  { av: '∑', t: 'Maths Faculty', s: 'SSC • Banking • Railway', d: 'Concept + short-trick based teaching' },
  { av: 'Aa', t: 'English Faculty', s: 'Grammar • Comprehension', d: 'Basic se advanced tak, exam-oriented' },
  { av: '🧩', t: 'Reasoning Faculty', s: 'Logical • Analytical', d: 'Speed ke saath accuracy' },
  { av: '🌍', t: 'GK / GS Faculty', s: 'Current Affairs', d: 'Roz ke updates, exam pattern par' },
  { av: '⚡', t: 'Quant Faculty', s: 'Speed Maths', d: 'Calculation tricks + daily practice' },
];

export default function ShivaFaculty() {
  return (
    <section id="faculty" style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Our Educators</span>
          <h2>Expert Faculty Team</h2>
        </Reveal>
        <div className="grid5f">
          {FACULTY.map((f, i) => (
            <Reveal key={f.t} delay={i % 5}>
              <div className="teacher">
                <div className="av">{f.av}</div>
                <b>{f.t}</b>
                <span>{f.s}</span>
                <p>{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
