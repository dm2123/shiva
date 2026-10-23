import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import HomePageClient from './page.client';
import ShivaPromoCarousel from '@/components/public/ShivaPromoCarousel';
import ShivaCategoryStrip from '@/components/public/ShivaCategoryStrip';
import ShivaHero from '@/components/public/ShivaHero';
import ShivaMarquee from '@/components/public/ShivaMarquee';
import ShivaExamCategories from '@/components/public/ShivaExamCategories';
import ShivaStatsBand from '@/components/public/ShivaStatsBand';
import ShivaBatches from '@/components/public/ShivaBatches';
import ShivaFeatures from '@/components/public/ShivaFeatures';
import ShivaFaculty from '@/components/public/ShivaFaculty';
import ShivaExamPills from '@/components/public/ShivaExamPills';
import ShivaFreeMaterial from '@/components/public/ShivaFreeMaterial';
import ShivaResults from '@/components/public/ShivaResults';
import ShivaTestimonials from '@/components/public/ShivaTestimonials';
import ShivaScholarship from '@/components/public/ShivaScholarship';
import ShivaAppDownload from '@/components/public/ShivaAppDownload';
import ShivaFaq from '@/components/public/ShivaFaq';
import ShivaCounselStrip from '@/components/public/ShivaCounselStrip';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'THE SHIVA — SSC, Railway, Banking Exam Preparation',
  description:
    'THE SHIVA — Bharat ka affordable learning platform. SSC, Railway, Banking, Defence, Teaching aur State exams ki taiyaari free course se shuru karo.',
};

/**
 * JSX LANDING HOME (user order 2026-10-23: website JSX/React me hi bane).
 * Logged-in user → /app dashboard. Baaki sab ke liye yahi asal homepage hai —
 * koi static HTML redirect nahi.
 *
 * Section kram (design-map ke homepage pattern par):
 * promo band → gol category icons strip → hero (+4 cards, demo form) →
 * exam marquee → Exam Categories → stats/bharosa band (counters) →
 * Featured Batches (asal courses) → Why/Features → Educators (asal) →
 * Exams Coverage pills → Free Study Material → Results (imaandaar) →
 * Testimonials (imaandaar) → Scholarship → App CTA → FAQ → Counsel strip.
 * Header/Footer/Floats layout.tsx se aate hain.
 */
export default async function HomePage() {
  const session = await getSessionFromHeaders(headers());
  if (session) {
    redirect('/app');
  }

  return (
    <HomePageClient>
      <ShivaPromoCarousel />
      <ShivaCategoryStrip />
      <ShivaHero />
      <ShivaMarquee />
      <ShivaExamCategories />
      <ShivaStatsBand />
      <ShivaBatches />
      <ShivaFeatures />
      <ShivaFaculty />
      <ShivaExamPills />
      <ShivaFreeMaterial />
      <ShivaResults />
      <ShivaTestimonials />
      <ShivaScholarship />
      <ShivaAppDownload />
      <ShivaFaq />
      <ShivaCounselStrip />
    </HomePageClient>
  );
}
