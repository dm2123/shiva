import { ReactNode } from 'react';
import ShivaNav from '@/components/public/ShivaNav';
import ShivaFooter from '@/components/public/ShivaFooter';
import ShivaFloats from '@/components/public/ShivaFloats';
import '@/components/public/shiva-landing.css';

/**
 * GLOBAL PUBLIC SHELL (Workstream 10)
 * Skip-link + sticky header + footer + floats.
 * Root layout / globals.css are the coordinator's — untouched.
 * New additive class: .shell-skip (styled in shiva-landing.css).
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shiva-landing min-h-screen flex flex-col">
      <a className="shell-skip" href="#main-content">
        Skip to content
      </a>
      <ShivaNav />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        {children}
      </main>
      <ShivaFooter />
      <ShivaFloats />
    </div>
  );
}
