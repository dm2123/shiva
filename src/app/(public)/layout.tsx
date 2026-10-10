import { ReactNode } from 'react';
import MarketingNav from '@/components/public/MarketingNav';
import MarketingFooter from '@/components/public/MarketingFooter';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-root min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-grow">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
