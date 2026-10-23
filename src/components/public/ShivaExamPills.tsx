import Link from 'next/link';
import Reveal from './Reveal';

/* ------------------------------------------------------------------ */
/* ShivaExamPills — "Exams Coverage" pills band.                      */
/* pw-pattern: results band ki jagah dozens exam pills — lekin yahan  */
/* koi result/topper daava nahi; sirf woh asal exams jin ki taiyaari  */
/* ke courses/categories platform par hain. Har pill /courses par.    */
/* ------------------------------------------------------------------ */

const EXAMS = [
  'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD',
  'RRB NTPC', 'Railway Group D', 'RRB ALP',
  'IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk',
  'Agniveer', 'NDA', 'CDS', 'AFCAT',
  'CTET', 'UPTET', 'STET',
  'UPSSSC PET', 'Lekhpal', 'UP Police',
];

export default function ShivaExamPills() {
  return (
    <section style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Exams Coverage</span>
          <h2>
            Kin Exams Ki <span className="hl">Taiyaari</span> Hoti Hai?
          </h2>
          <p>
            SSC, Railway, Banking, Defence, Teaching aur State exams — apna exam chuno aur
            uske courses dekho.
          </p>
        </Reveal>
        <Reveal>
          <div className="exam-pills">
            {EXAMS.map((x) => (
              <Link key={x} href="/courses">
                {x}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
