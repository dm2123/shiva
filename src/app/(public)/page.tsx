import ShivaPromoCarousel from '@/components/public/ShivaPromoCarousel';
import ShivaHero from '@/components/public/ShivaHero';
import ShivaMarquee from '@/components/public/ShivaMarquee';
import ShivaExamCategories from '@/components/public/ShivaExamCategories';
import ShivaBatches from '@/components/public/ShivaBatches';
import ShivaFeatures from '@/components/public/ShivaFeatures';
import ShivaFreeMaterial from '@/components/public/ShivaFreeMaterial';
import ShivaFaculty from '@/components/public/ShivaFaculty';
import ShivaResults from '@/components/public/ShivaResults';
import ShivaScholarship from '@/components/public/ShivaScholarship';
import ShivaCounselStrip from '@/components/public/ShivaCounselStrip';
import ShivaTestimonials from '@/components/public/ShivaTestimonials';
import ShivaFaq from '@/components/public/ShivaFaq';
import ShivaAppDownload from '@/components/public/ShivaAppDownload';
import HomePageClient from './page.client';

export const revalidate = 0;

export const metadata = {
  title: 'THE SHIVA — SSC, Railway, Banking, Defence & Teaching Exam Preparation',
  description:
    "THE SHIVA — India's affordable learning platform for SSC, Railway, Banking, Defence and Teaching exams. Live classes, test series, DPPs and doubt solving.",
};

export default async function HomePage() {
  return (
    <HomePageClient>
      <ShivaPromoCarousel />
      <ShivaHero />
      <ShivaMarquee />
      <ShivaExamCategories />
      <ShivaBatches />
      <ShivaFeatures />
      <ShivaFreeMaterial />
      <ShivaFaculty />
      <ShivaResults />
      <ShivaScholarship />
      <ShivaCounselStrip />
      <ShivaTestimonials />
      <ShivaFaq />
      <ShivaAppDownload />
    </HomePageClient>
  );
}
