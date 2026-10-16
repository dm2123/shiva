import Reveal from './Reveal';

const EXAMS = [
  { ico: '🏛️', bg: '#fee2e2', name: 'SSC', sub: 'CGL | CHSL | MTS | GD' },
  { ico: '🚂', bg: '#dbeafe', name: 'Railway', sub: 'NTPC | Group D | ALP' },
  { ico: '🏦', bg: '#fef3c7', name: 'Banking', sub: 'PO | Clerk | SO' },
  { ico: '🛡️', bg: '#dcfce7', name: 'Defence', sub: 'NDA | CDS | AFCAT' },
  { ico: '👩‍🏫', bg: '#ede9fe', name: 'Teaching', sub: 'TET | CTET | Others' },
];

export default function ShivaExamCategories() {
  return (
    <section id="courses" style={{ padding: 0 }}>
      <div className="wrap" style={{ padding: '0 20px' }}>
        <Reveal>
          <div className="cats-strip">
            {EXAMS.map((e) => (
              <a className="cat" key={e.name} href="/courses">
                <div className="icon" style={{ background: e.bg }}>
                  {e.ico}
                </div>
                <h3>{e.name}</h3>
                <p>{e.sub}</p>
                <span className="arrow">→</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
      <div className="wrap" style={{ paddingTop: 44 }}>
        <Reveal className="sec-head">
          <span className="kicker">Exam Categories</span>
          <h2>
            Apna Exam Chuno, <span className="hl">Taiyaari Shuru Karo</span>
          </h2>
          <p>Har exam ke liye dedicated courses, quality content aur complete study material.</p>
        </Reveal>
      </div>
    </section>
  );
}
