import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { UserRole } from '@/types/auth';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'THE SHIVA — SSC, Railway, Banking Exam Preparation',
  description:
    'THE SHIVA — Bharat ka affordable learning platform. SSC, Railway, Banking, Defence, Teaching aur State exams ki taiyaari free course se shuru karo.',
};

/**
 * ROOT BEHAVIOR (user order 2026-10-30): Azure par marketing landing
 * NAHI rahegi. Marketing page GitHub Pages par hai
 * (https://dm2123.github.io/shiva/).
 *
 * - Logged-in user → uska apna portal (/app /teacher /admin)
 * - Logged-out visitor → GitHub Pages marketing page
 *
 * Platform ki asal browsing /courses, /batches aur detail pages par
 * hai — wahin se visitor courses dekh kar login/register karta hai.
 */
export default async function HomePage() {
  const session = await getSessionFromHeaders(headers()).catch(() => null);
  if (session) {
    if (session.role === UserRole.TEACHER) {
      redirect('/teacher');
    }
    if (session.role === UserRole.ADMIN) {
      redirect('/admin');
    }
    redirect('/app');
  }

  redirect('https://dm2123.github.io/shiva/');
}
