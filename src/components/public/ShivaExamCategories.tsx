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
    <section id="courses">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Exam Categories</span>
          <h2>
            Apna Exam Chuno, <span className="hl">Taiyaari Shuru Karo</span>
          </h2>
          <p>Har exam ke liye dedicated courses, quality content aur complete study material.</p>
        </Reveal>
        <Reveal>
          {/* marginTop override: .cats-strip ka -56px overlap sirf tab sahi lagta hai
              jab ye strip seedha hero ke neeche ho; heading ke baad normal flow rakha hai. */}
          <div className="cats-strip" style={{ marginTop: 0 }}>
            {EXAMS.map((e) => (
              <a className="cat" key={e.name} href="/courses" aria-label={`${e.name} courses — ${e.sub}`}>
                <div className="icon" style={{ background: e.bg }} aria-hidden>
                  {e.ico}
                </div>
                <h3>{e.name}</h3>
                <p>{e.sub}</p>
                <span className="arrow" aria-hidden>→</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
