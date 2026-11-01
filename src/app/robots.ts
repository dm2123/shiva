import type { MetadataRoute } from 'next';

/**
 * Robots — public pages crawlable; sitemap upar wali sitemap.ts se.
 * Student/admin/app routes yahan block nahi kiye gaye hain kyunki woh
 * login ke peeche hain (crawler un tak waise bhi nahi pahunchta).
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-shiva.onrender.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
