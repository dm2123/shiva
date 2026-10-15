import Reveal from './Reveal';
import { listPublicCourses } from '@/services/academic.service';

const PLACEHOLDERS = [
  {
    title: 'SSC CGL 2026 — Ranker Batch',
    gradient: 'linear-gradient(120deg,#6d28d9,#8b5cf6)',
    points: [
      '400+ Live Classes (Maths, Reasoning, English, GK)',
      '200+ Mock Tests with All-India Rank',
      'Daily Practice Problems (DPP)',
      'Doubt Solving — 24x7',
      'PDF Notes + Previous Year Papers',
    ],
  },
  {
    title: 'Railway RRB 2026 — Express Batch',
    gradient: 'linear-gradient(120deg,#059669,#10b981)',
    points: [
      '350+ Live Classes',
      '150+ Mock Tests with All-India Rank',
      'Daily Current Affairs Quiz',
      'Doubt Solving — 24x7',
      'PDF Notes + PYQs',
    ],
  },
  {
    title: 'Banking 2026 — Achiever Batch',
    gradient: 'linear-gradient(120deg,#d97706,#f59e0b)',
    points: [
      '380+ Live Classes (Quant, Reasoning, English)',
      '180+ Mock Tests with All-India Rank',
      'Speed Maths Special Sessions',
      'Interview Preparation',
      'PDF Notes + PYQs',
    ],
  },
];

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default async function ShivaBatches() {
  let courses: { id: string; title: string; description: string; price: number }[] = [];
  try {
    const all = await listPublicCourses();
    courses = all.slice(0, 3).map((c) => ({ id: c.id, title: c.title, description: c.description, price: c.price }));
  } catch {
    courses = [];
  }

  return (
    <section id="batches" style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Popular Batches</span>
          <h2>Sabse Affordable Batches</h2>
          <p>Poora saal ki taiyaari, ek hi batch me. EMI available.</p>
        </Reveal>
        <div className="grid3">
          {courses.length > 0
            ? courses.map((c, i) => (
                <Reveal key={c.id} delay={i % 3}>
                  <div className="batch">
                    <div className="banner" style={{ background: PLACEHOLDERS[i % 3].gradient }}>
                      {c.title}
                    </div>
                    <div className="body">
                      <p style={{ fontSize: 14, color: '#6b7280', flex: 1 }}>
                        {c.description?.slice(0, 140) || 'Complete exam preparation batch.'}
                      </p>
                      <div className="price">
                        <b>{c.price > 0 ? formatINR(c.price) : 'Fees jald ghoshit hogi'}</b>
                      </div>
                      <a className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} href={`/courses/${c.id}`}>
                        View Details
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))
            : PLACEHOLDERS.map((b, i) => (
                <Reveal key={b.title} delay={i % 3}>
                  <div className="batch">
                    <div className="banner" style={{ background: b.gradient }}>
                      {b.title}
                    </div>
                    <div className="body">
                      <ul>
                        {b.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      <div className="price">
                        <b>Fees jald ghoshit hogi</b>
                      </div>
                      <a className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} href="/login">
                        Enroll Now
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}
