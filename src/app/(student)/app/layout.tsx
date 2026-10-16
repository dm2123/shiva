import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata = {
  title: 'Student Portal — THE SHIVA',
  description: 'Your learning workspace on THE SHIVA platform',
};

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  // PW-style: pages render their own header (see PWDashboard)
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ThemeProvider>
  );
}
