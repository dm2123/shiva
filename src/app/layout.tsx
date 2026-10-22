import '@/styles/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://theshiva.com'),
  title: 'THE SHIVA — Learn • Practice • Grow',
  description: 'Premium digital learning platform for competitive exam preparation. Expert-led courses for SSC, Railway, Banking, Defence, and Teaching exams.',
  keywords: ['THE SHIVA', 'online learning', 'competitive exams', 'SSC preparation', 'Railway exams', 'Banking exams', 'Defence exams', 'Teaching exams', 'CTET', 'online education'],
  authors: [{ name: 'THE SHIVA' }],
  creator: 'THE SHIVA',
  publisher: 'THE SHIVA',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/assets/logo.jpeg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://theshiva.com',
    siteName: 'THE SHIVA',
    title: 'THE SHIVA — Learn • Practice • Grow',
    description: 'Premium digital learning platform for competitive exam preparation. Expert-led courses for SSC, Railway, Banking, Defence, and Teaching exams.',
    images: [
      {
        url: '/assets/logo.jpeg',
        width: 500,
        height: 500,
        alt: 'THE SHIVA Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE SHIVA — Learn • Practice • Grow',
    description: 'Premium digital learning platform for competitive exam preparation.',
    images: ['/assets/logo.jpeg'],
    creator: '@theshiva',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
