import { Suspense } from 'react';
import Link from 'next/link';
import { listPublicCourses } from '@/services/academic.service';
import { CoursesExplorer, CoursesGridSkeleton } from '@/components/public/CourseCard';

export const revalidate = 0;

export const metadata = {
  title: 'All Courses — THE SHIVA',
  description: 'Browse all published courses for SSC, Railway, Banking, Defence, and Teaching exam preparation.',
};

/**
 * Data section — server par asal published courses fetch hote hain.
 * listPublicCourses() ki wiring/data shape bilkul unchanged hai;
 * sirf presentation (search / chips / sort / grid) CoursesExplorer me hai.
 */
async function CoursesSection() {
  const courses = await listPublicCourses();

  if (courses.length === 0) {
    return (
      <div
        className="batch"
        style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: 48 }}
      >
        <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>📚</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--brand-dark)' }}>
          Courses jald aa rahe hain
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 20 }}>
          Hum naye courses taiyaar kar rahe hain. Free me register karo aur sabse pehle
          khabar pao jab naye courses launch hon.
        </p>
        <Link
          href="/register"
          className="btn btn-primary"
          style={{ background: '#111111', color: '#fff' }}
        >
          Register Free →
        </Link>
      </div>
    );
  }

  return <CoursesExplorer courses={courses} />;
}

export default function PublicCoursesPage() {
  return (
    <div className="shiva-landing">
      {/* Section background — halka pastel purple tint (map ki design language) */}
      <section
        style={{
          paddingTop: 48,
          background: 'linear-gradient(180deg,#f5f3ff 0%,#faf9ff 100%)',
        }}
      >
        <div className="wrap">
          {/* Breadcrumb — chhota grey (listing-page pattern) */}
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}
          >
            <Link href="/" style={{ color: 'var(--brand)', fontWeight: 600 }}>
              Home
            </Link>
            {' / '}
            <span aria-current="page">Courses</span>
          </nav>

          <div className="sec-head" style={{ textAlign: 'left', marginBottom: 28 }}>
            <span className="kicker">Course Catalog</span>
            <h1
              style={{
                fontSize: 'clamp(34px, 4.6vw, 48px)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: -0.5,
                color: 'var(--brand-dark)',
                margin: '10px 0 12px',
              }}
            >
              Hamare <span style={{ color: 'var(--brand)' }}>Courses</span>
            </h1>
            <p style={{ maxWidth: 720 }}>
              SSC, Railway, Banking, Defence aur Teaching exams ke liye structured courses —
              free se shuru karo, apne sapne poore karo. Neeche search aur category chips se
              apne exam ka course turant dhundho.
            </p>
          </div>

          {/* Quick-link cards — sirf asal maujooda routes (koi page invent nahi) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 12,
              marginBottom: 34,
            }}
          >
            {[
              { href: '/batches', icon: '🗓️', title: 'Batches', sub: 'Live aur upcoming batches dekho', bg: '#ede9fe' },
              { href: '/teachers', icon: '👨‍🏫', title: 'Teachers', sub: 'Verified educators ki profiles', bg: '#fef3c7' },
              { href: '/register', icon: '🎓', title: 'Free Registration', sub: 'Account banao, dashboard pao', bg: '#dcfce7' },
              { href: '/contact', icon: '💬', title: 'Counselling', sub: 'Sawaal hai? Team se baat karo', bg: '#e0f2fe' },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  boxShadow: '0 4px 16px rgba(42,22,80,.06)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: c.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 19,
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: 14.5, color: 'var(--brand-dark)' }}>
                    {c.title} <span style={{ color: 'var(--brand)' }}>›</span>
                  </span>
                  <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
                    {c.sub}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {/* Loading par skeleton cards; data aate hi explorer (search/chips/sort/grid) */}
          <Suspense fallback={<CoursesGridSkeleton count={8} />}>
            <CoursesSection />
          </Suspense>

          {/* Bottom CTA */}
          <div className="counsel-strip" style={{ marginTop: 48 }}>
            <div>
              <h2>Confused ho kaunsa course lein?</h2>
              <p>Hamari counselling team se free me baat karo — sahi guidance pao.</p>
            </div>
            <Link href="/register" className="btn btn-accent">
              Free Counselling →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
