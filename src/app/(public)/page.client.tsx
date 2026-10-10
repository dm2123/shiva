'use client';

import { useState, useEffect } from 'react';
import ShivaLogoIntro from '@/components/public/ShivaLogoIntro';

export default function HomePageClient({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Check if user has seen intro in this session
    const hasSeenIntro = sessionStorage.getItem('shiva-intro-seen');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('shiva-intro-seen', 'true');
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <ShivaLogoIntro onComplete={handleIntroComplete} />}
      {children}
    </>
  );
}
