import MarketingHero from '@/components/public/MarketingHero';
import MarketingExamCategories from '@/components/public/MarketingExamCategories';
import MarketingFeatures from '@/components/public/MarketingFeatures';
import MarketingStats from '@/components/public/MarketingStats';
import MarketingCourses from '@/components/public/MarketingCourses';
import MarketingFacultySection from '@/components/public/MarketingFacultySection';
import MarketingWhyShiva from '@/components/public/MarketingWhyShiva';
import MarketingProcess from '@/components/public/MarketingProcess';
import MarketingEmptyPanel from '@/components/public/MarketingEmptyPanel';
import MarketingDemoSection from '@/components/public/MarketingDemoSection';
import MarketingCTA from '@/components/public/MarketingCTA';
import MarketingBatches from '@/components/public/MarketingBatches';
import HomePageClient from './page.client';
import { getLivePlatformStats } from '@/services/stats.service';

export const revalidate = 0;

export const metadata = {
  title: 'THE SHIVA — Learn • Practice • Grow',
  description: 'Premium digital learning platform for competitive exam preparation. Expert-led courses for SSC, Railway, Banking, Defence, and Teaching exams. Learn from verified educators on India&apos;s most comprehensive exam prep platform.',
};

export default async function HomePage() {
  const stats = await getLivePlatformStats();

  return (
    <HomePageClient>
      <MarketingHero />
      <MarketingExamCategories />
      <MarketingStats stats={stats} />
      <MarketingCourses />
      <MarketingFacultySection />
      <MarketingDemoSection />
      <MarketingBatches />
      <MarketingEmptyPanel
        capsule="Live"
        title="Live classes"
        description="Scheduled YouTube live sessions will appear when educators publish them. No fake streams."
        href="/app/live"
        cta="Open live area"
      />
      <MarketingFeatures />
      <MarketingWhyShiva />
      <MarketingProcess />
      <MarketingEmptyPanel
        capsule="Results"
        title="Success stories"
        description="No verified student results are published yet. THE SHIVA does not display invented ranks or placement numbers."
      />
      <MarketingEmptyPanel
        capsule="Updates"
        title="Latest updates"
        description="Job notifications, current affairs, and platform news will appear here when published."
      />
      <MarketingCTA />
    </HomePageClient>
  );
}
