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
 * presentation (search / chips / sort / grid) CoursesExplorer me hai.
 *
 * Wave B1 (PW catalog parity): page ab shudh catalog hai — upar
 * bada title, uske neeche gol search bar (explorer ke andar) aur
 * PW-anatomy wale bade banner cards. PW ke catalog page par jo
 * sections nahi hain (promo carousel, quick-link cards, FAQ,
 * counsel strip) woh yahan se hata diye gaye hain.
 */
async function CoursesSection() {
  const courses = await listPublicCourses();

  if (courses.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]">
        <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>📚</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#111827' }}>
          Courses jald aa rahe hain
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.65 }}>
          Hum naye courses taiyaar kar rahe hain. Free me register karo aur sabse pehle
          khabar pao jab naye courses launch hon.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-xl bg-[#111111] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-black"
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
      {/* Catalog section — halka gray bg (PW catalog jaisa), safed cards */}
      <section style={{ padding: '44px 0 64px', background: '#f4f5f7' }}>
        <div className="wrap">
          {/* Breadcrumb — chhota grey (listing-page pattern) */}
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}
          >
            <Link href="/" style={{ color: 'var(--brand)', fontWeight: 600 }}>
              Home
            </Link>
            {' / '}
            <span aria-current="page">Courses</span>
          </nav>

          {/* Page header — PW catalog pattern: bada bold title + ek line */}
          <div style={{ marginBottom: 26 }}>
            <h1
              style={{
                fontSize: 'clamp(30px, 4vw, 40px)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: -0.5,
                color: '#111827',
                margin: '0 0 8px',
              }}
            >
              Courses
            </h1>
            <p style={{ maxWidth: 720, color: 'var(--muted)', fontSize: 15, lineHeight: 1.65 }}>
              SSC, Railway, Banking, Defence aur Teaching exams ke liye published courses —
              neeche search aur category chips se apne exam ka course turant dhundho.
            </p>
          </div>

          {/* Search (gol bar) + chips + bade banner cards — explorer ke andar.
              Loading par skeleton cards dikhte hain. */}
          <Suspense fallback={<CoursesGridSkeleton count={6} />}>
            <CoursesSection />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
