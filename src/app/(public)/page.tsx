import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';

export const revalidate = 0;

// Marketing site GitHub Pages par hai — Render sirf app ke liye.
// Logged-in user → /app dashboard, baaki sab → marketing site.
export default async function HomePage() {
  const session = await getSessionFromHeaders(headers());
  if (session) {
    redirect('/app');
  }
  redirect('https://dm2123.github.io/shiva/');
}
