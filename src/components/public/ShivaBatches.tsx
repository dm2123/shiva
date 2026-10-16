import Reveal from './Reveal';
import { listPublicCourses } from '@/services/academic.service';
import type { Course } from '@/types/models';

const COMING_SOON = [
  {
    title: 'SSC CGL Foundation Batch',
    emoji: '📚',
    gradient: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
  },
  {
    title: 'Railway NTPC Complete Batch',
    emoji: '🚂',
    gradient: 'linear-gradient(135deg,#059669,#10b981)',
  },
  {
    title: 'Banking PO/Clerk Batch',
    emoji: '🏦',
    gradient: 'linear-gradient(135deg,#d97706,#f59e0b)',
  },
];

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default async function ShivaBatches() {
  let courses: Course[] = [];
  try {
    courses = (await listPublicCourses()).slice(0, 3);
  } catch {
    courses = [];
  }

  return (
    <section id="batches" style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Featured Courses</span>
          <h2>
            Learn from the Best. <span className="hl">Build Your Future.</span>
          </h2>
          <p>Free aur upcoming courses — apni taiyaari yahin se shuru karo.</p>
        </Reveal>
        <div className="grid3">
          {courses.length > 0
            ? courses.map((c, i) => {
                const free = c.price <= 0;
                const href = c.slug ? `/courses/${c.slug}` : `/courses/${c.id}`;
                return (
                  <Reveal key={c.id} delay={i % 3}>
                    <div className="batch">
                      <div
                        className="banner"
                        style={{ background: COMING_SOON[i % 3].gradient }}
                      >
                        {COMING_SOON[i % 3].emoji} {c.title}
                        {free && <span className="free-tag">100% FREE</span>}
                      </div>
                      <div className="body">
                        <p style={{ fontSize: 14, color: '#6b7280', flex: 1 }}>
                          {c.description?.slice(0, 140) || 'Complete exam preparation course.'}
                        </p>
                        <div className="price">
                          <b>{free ? 'FREE' : formatINR(c.price)}</b>
                        </div>
                        <a
                          className="btn btn-primary"
                          style={{ width: '100%', textAlign: 'center' }}
                          href={href}
                        >
                          {free ? 'Enroll Now →' : 'View Details'}
                        </a>
                      </div>
                    </div>
                  </Reveal>
                );
              })
            : COMING_SOON.map((b, i) => (
                <Reveal key={b.title} delay={i % 3}>
                  <div className="batch">
                    <div className="banner" style={{ background: b.gradient }}>
                      {b.emoji} {b.title}
                    </div>
                    <div className="body">
                      <p style={{ fontSize: 14, color: '#6b7280', flex: 1 }}>
                        Live classes, mock tests, doubt solving aur study material — poora system ek hi
                        batch me.
                      </p>
                      <div className="price">
                        <b style={{ color: '#6b7280', fontSize: 16 }}>Coming Soon</b>
                      </div>
                      <a
                        className="btn btn-ghost"
                        style={{ width: '100%', textAlign: 'center', border: '2px solid #7c3aed', color: '#7c3aed' }}
                        href="/courses"
                      >
                        Notify Me
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
