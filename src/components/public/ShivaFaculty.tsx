import Reveal from './Reveal';

const SUBJECTS = [
  { av: '👨‍🏫', s: 'Quantitative Aptitude' },
  { av: '👩‍🏫', s: 'English' },
  { av: '👨‍🏫', s: 'Reasoning' },
  { av: '👩‍🏫', s: 'General Studies' },
  { av: '👨‍🏫', s: 'Current Affairs' },
];

export default function ShivaFaculty() {
  return (
    <section id="faculty" style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Our Educators</span>
          <h2>
            Our Expert <span className="hl">Educators</span>
          </h2>
          <p>Learn from experienced and dedicated teachers.</p>
        </Reveal>
        <div className="grid5f">
          {SUBJECTS.map((f, i) => (
            <Reveal key={f.s} delay={i % 5}>
              <div className="teacher">
                <div className="av">{f.av}</div>
                <b>Joining Soon</b>
                <span>{f.s}</span>
                <p>Best educators ko jod rahe hain — jald profiles yahan dikhengi.</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
