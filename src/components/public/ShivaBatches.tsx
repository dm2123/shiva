import Link from 'next/link';
import Reveal from './Reveal';
import { listPublicCourses } from '@/services/academic.service';
import type { Course } from '@/types/models';

/* ------------------------------------------------------------------ */
/* ShivaBatches — landing section (id="batches", koi props nahi).      */
/* Data: listPublicCourses() — sirf published asal courses.            */
/* Pehle yahan hardcoded "Coming Soon" batch naam the jo asal data     */
/* nahi the — woh hata diye gaye hain. Ab ya to asal course-cards     */
/* dikhte hain, ya honest empty state. Exam tag course ke asal         */
/* title/slug se derive hota hai; price hamesha asal Course.price.    */
/* ------------------------------------------------------------------ */

const BANNERS = [
  'linear-gradient(135deg,#2a1650,#6d28d9)',
  'linear-gradient(135deg,#6d28d9,#8b5cf6)',
  'linear-gradient(135deg,#2a1650,#6d28d9 55%,#f5b942)',
];

const EXAM_RULES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bssc\b|\bcgl\b|\bchsl\b|\bmts\b|ssc\s*gd/i, label: 'SSC' },
  { pattern: /railway|\brrb\b|\bntpc\b|group\s*d/i, label: 'Railway' },
  { pattern: /bank|\bibps\b|\bsbi\b/i, label: 'Banking' },
  { pattern: /\bctet\b|\btet\b|teaching|teacher|\bkvs\b|\bdsssb\b/i, label: 'Teaching' },
  { pattern: /defence|defense|\bnda\b|\bcds\b|\bafcat\b/i, label: 'Defence' },
  { pattern: /\bupsc\b|\bias\b|\bpcs\b|civil\s*service/i, label: 'UPSC' },
  { pattern: /\bneet\b/i, label: 'NEET' },
  { pattern: /\bjee\b/i, label: 'JEE' },
];

function deriveExam(course: Course): string | null {
  const haystack = `${course.title || ''} ${course.slug || ''}`;
  for (const rule of EXAM_RULES) {
    if (rule.pattern.test(haystack)) return rule.label;
  }
  return null;
}

function formatINR(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/**
 * Price-pattern helper (design-map ka niyam #1): MRP sirf tab jab
 * asal data me originalPrice/mrp ho aur price se zyada ho — Course
 * model me aam taur par NAHI hai, tab sirf bold price. Invent nahi.
 */
function readMrp(course: Course): number {
  const raw = course as unknown as { originalPrice?: unknown; mrp?: unknown };
  const value = Number(raw.originalPrice ?? raw.mrp);
  return Number.isFinite(value) ? value : 0;
}

export default async function ShivaBatches() {
  let courses: Course[] = [];
  try {
    courses = (await listPublicCourses()).slice(0, 3);
  } catch {
    courses = [];
  }

  return (
    <section id="batches" style={{ background: '#f5f3ff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Featured Batches</span>
          <h2>
            Learn from the Best. <span className="hl">Build Your Future.</span>
          </h2>
          <p>
            Published courses ke saath structured batches — live classes, tests aur doubt
            solving ke saath apni taiyaari shuru karo.
          </p>
        </Reveal>

        {courses.length === 0 ? (
          /* Honest empty state — koi fake batch nahi */
          <Reveal>
            <div
              className="batch"
              style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 48 }}
            >
              <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.4 }} aria-hidden="true">
                🗓️
              </div>
              <h3
                style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--brand-dark)' }}
              >
                Abhi koi batch available nahi hai
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 22, lineHeight: 1.7 }}>
                Naye batches aur courses taiyaar ho rahe hain. Free me register karo aur launch
                hote hi sabse pehle khabar pao.
              </p>
              <div
                style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
              >
                <Link href="/courses" className="btn btn-primary">
                  Courses Dekho →
                </Link>
                <Link
                  href="/register"
                  className="btn btn-accent"
                  style={{ background: '#111111', color: '#fff' }}
                >
                  Register Free
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <>
            <div className="grid3">
              {courses.map((c, i) => {
                const price = Number(c.price) || 0;
                const free = price <= 0;
                const mrp = readMrp(c);
                const hasMrp = !free && mrp > price;
                const discountPct = hasMrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
                const exam = deriveExam(c);
                const href = c.slug ? `/courses/${c.slug}` : `/courses/${c.id}`;
                return (
                  <Reveal key={c.id} delay={i % 3}>
                    <div
                      className="batch"
                      style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 6px 24px rgba(42,22,80,.08)',
                        height: '100%',
                      }}
                    >
                      <div
                        className="banner"
                        style={{ background: BANNERS[i % BANNERS.length] }}
                      >
                        <span
                          style={{
                            display: 'block',
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: 1.2,
                            textTransform: 'uppercase',
                            opacity: 0.85,
                            marginBottom: 6,
                          }}
                        >
                          {exam ? `${exam} · THE SHIVA` : 'THE SHIVA Course'}
                        </span>
                        <span style={{ lineHeight: 1.3, display: 'block' }}>{c.title}</span>
                        {free && <span className="free-tag">100% FREE</span>}
                      </div>
                      <div className="body">
                        {/* Meta pills — grey outline; sirf asal record me
                            language / validityMonths ho tabhi (CourseCard jaisa hi pattern) */}
                        {(c.language?.trim() ||
                          (typeof c.validityMonths === 'number' && c.validityMonths > 0)) && (
                          <div
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}
                          >
                            {c.language?.trim() && (
                              <span
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  color: '#4b5563',
                                  border: '1.5px solid var(--line)',
                                  padding: '4px 11px',
                                  borderRadius: 999,
                                }}
                              >
                                🗣️ {c.language.trim()}
                              </span>
                            )}
                            {typeof c.validityMonths === 'number' && c.validityMonths > 0 && (
                              <span
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  color: '#4b5563',
                                  border: '1.5px solid var(--line)',
                                  padding: '4px 11px',
                                  borderRadius: 999,
                                }}
                              >
                                📅 {c.validityMonths} mahine validity
                              </span>
                            )}
                          </div>
                        )}
                        {c.description ? (
                          <p
                            style={{
                              fontSize: 14,
                              color: '#6b7280',
                              flex: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {c.description}
                          </p>
                        ) : (
                          <p style={{ fontSize: 14, color: '#6b7280', flex: 1 }}>
                            Structured course — poora syllabus, live classes aur practice tests
                            ke saath.
                          </p>
                        )}
                        {/* Price row — pakka pattern: bold price → grey kata
                            MRP → green % OFF chip (MRP/chip sirf asal data par) */}
                        <div className="price" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                          {free ? (
                            <>
                              <b style={{ color: '#059669' }}>Free</b>
                              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                                Poora access, koi fee nahi
                              </span>
                            </>
                          ) : (
                            <>
                              <b style={{ fontSize: 21 }}>{formatINR(price)}</b>
                              {hasMrp && (
                                <s style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600 }}>
                                  {formatINR(mrp)}
                                </s>
                              )}
                              {hasMrp && discountPct > 0 && (
                                <span
                                  style={{
                                    fontSize: 11.5,
                                    fontWeight: 800,
                                    color: '#047857',
                                    background: '#d1fae5',
                                    padding: '3px 9px',
                                    borderRadius: 999,
                                  }}
                                >
                                  {discountPct}% OFF
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {/* CTA row — kharid/enroll = solid KAALA; detail = purple outline */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
                          <Link
                            href={href}
                            style={{
                              flex: 1,
                              display: 'inline-block',
                              textAlign: 'center',
                              background: '#111111',
                              color: '#fff',
                              padding: '12px 18px',
                              borderRadius: 12,
                              fontWeight: 800,
                              fontSize: 15,
                              lineHeight: 1.4,
                            }}
                          >
                            {free ? 'Register Now' : 'Buy Now'}
                          </Link>
                          <Link
                            href={href}
                            aria-label={`${c.title} — details dekho`}
                            style={{
                              width: 48,
                              flexShrink: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#fff',
                              color: '#6d28d9',
                              border: '2px solid #6d28d9',
                              borderRadius: 12,
                              fontWeight: 900,
                              fontSize: 18,
                              lineHeight: 1,
                            }}
                          >
                            ›
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link
                href="/batches"
                style={{ fontWeight: 700, color: '#6d28d9', fontSize: 15 }}
              >
                Saare batches dekho →
              </Link>
              <span style={{ color: '#d1d5db', margin: '0 10px' }} aria-hidden="true">·</span>
              <Link
                href="/courses"
                style={{ fontWeight: 700, color: '#6d28d9', fontSize: 15 }}
              >
                Saare courses dekho →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
