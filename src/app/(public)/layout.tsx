import { ReactNode } from 'react';
import ShivaNav from '@/components/public/ShivaNav';
import ShivaFooter from '@/components/public/ShivaFooter';
import ShivaFloats from '@/components/public/ShivaFloats';
import '@/components/public/shiva-landing.css';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shiva-landing min-h-screen flex flex-col">
      <ShivaNav />
      <main className="flex-grow">{children}</main>
      <ShivaFooter />
      <ShivaFloats />
    </div>
  );
}
