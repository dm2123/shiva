import type { MetadataRoute } from 'next';

/**
 * Public sitemap — sirf asal static public routes.
 * Dynamic course/teacher slugs isme nahi hain (woh DB content par badalte
 * rehte hain; unke liye alag dynamic sitemap tabhi jab canonical host
 * stable ho). Koi invented route nahi.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-shiva.onrender.com';

const STATIC_ROUTES = [
  '/',
  '/courses',
  '/batches',
  '/test-series',
  '/teachers',
  '/about',
  '/contact',
  '/login',
  '/register',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));
}
