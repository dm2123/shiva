import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { UserRole } from '@/types/auth';
import { listPublicCourses } from '@/services/academic.service';
import type { Course } from '@/types/models';
import HomePageClient from './page.client';
import Hero from '@/components/marketing/Hero';
import Categories from '@/components/marketing/Categories';
import FeaturedBatches from '@/components/marketing/FeaturedBatches';
import ScholarshipStrip from '@/components/marketing/ScholarshipStrip';
import WhyShiva from '@/components/marketing/WhyShiva';
import TeachersTeaser, { ResultsHonest } from '@/components/marketing/TeachersTeaser';
import StudyResources from '@/components/marketing/StudyResources';
import AppBand from '@/components/marketing/AppBand';
import FaqSection from '@/components/marketing/FaqSection';
import '@/components/marketing/marketing.css';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'THE SHIVA — SSC, Railway, Banking Exam Preparation',
  description:
    'THE SHIVA — Bharat ka affordable learning platform. SSC, Railway, Banking, Defence, Teaching aur State exams ki taiyaari free course se shuru karo.',
};

/**
 * ROOT BEHAVIOR (user order 2026-11-02 — JSX rule pakka):
 * Marketing website ab plain HTML (GitHub Pages) NAHI hai —
 * index.html ka poora design React JSX me isi app ke andar hai
 * (src/components/marketing/*).
 *
 * - Logged-in user → uska apna portal (/app /teacher /admin)
 * - Logged-out visitor → JSX landing yahin render hota hai
 *   (pehle GitHub Pages par redirect hota tha — ab NAHI)
 *
 * Landing ka data asal hai: published courses server par
 * listPublicCourses() se aate hain (stats ki ginti + Featured
 * Batches ke cards); DB na mile to imaandaar empty state.
 */
export default async function HomePage() {
  const session = await getSessionFromHeaders(headers()).catch(() => null);
  if (session) {
    if (session.role === UserRole.TEACHER) {
      redirect('/teacher');
    }
    if (session.role === UserRole.ADMIN) {
      redirect('/admin');
    }
    redirect('/app');
  }

  let courses: Course[] = [];
  try {
    courses = await listPublicCourses();
  } catch {
    courses = [];
  }

  const flagship =
    courses.find((c) => c.slug === 'aptitude-foundation-free') ??
    courses.find((c) => Number(c.price) <= 0) ??
    courses[0] ??
    null;
  const featured = courses.slice(0, 6);

  return (
    <HomePageClient>
      <div className="mkt-root">
        <Hero
          courseCount={courses.length > 0 ? courses.length : null}
          flagship={flagship}
        />
        <Categories />
        <FeaturedBatches courses={featured} />
        <ScholarshipStrip />
        <WhyShiva />
        <TeachersTeaser />
        <ResultsHonest />
        <StudyResources />
        <AppBand />
        <FaqSection />
      </div>
    </HomePageClient>
  );
}
