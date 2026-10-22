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
          <div className="sec-head">
            <span className="kicker">Course Catalog</span>
            <h2>
              Hamare <span style={{ color: 'var(--brand)' }}>Courses</span>
            </h2>
            <p>
              SSC, Railway, Banking, Defence aur Teaching exams ke liye structured courses —
              free se shuru karo, apne sapne poore karo. Neeche search aur category chips se
              apne exam ka course turant dhundho.
            </p>
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
