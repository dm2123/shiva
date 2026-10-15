import Reveal from './Reveal';

const EXAMS = [
  { ico: '🏛️', name: 'SSC', sub: 'CGL • CHSL • MTS • GD' },
  { ico: '🚂', name: 'Railway', sub: 'RRB NTPC • Group D • ALP' },
  { ico: '🏦', name: 'Banking', sub: 'IBPS • SBI PO • Clerk' },
  { ico: '🪖', name: 'Defence', sub: 'Agniveer • NDA • CDS' },
  { ico: '📚', name: 'Teaching', sub: 'CTET • UPTET • STET' },
];

export default function ShivaExamCategories() {
  return (
    <section id="courses">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Exam Categories</span>
          <h2>Apna Exam Chuno, Taiyaari Shuru Karo</h2>
          <p>Har exam ke liye dedicated batches, expert faculty aur complete study material.</p>
        </Reveal>
        <div className="grid5">
          {EXAMS.map((e, i) => (
            <Reveal key={e.name} delay={i % 5}>
              <a className="exam-card" href="/batches">
                <div className="ico">{e.ico}</div>
                <b>{e.name}</b>
                <span>{e.sub}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
