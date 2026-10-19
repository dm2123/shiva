import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/contexts/ThemeContext';
import PWStudentHeader from '@/components/student/PWStudentHeader';
import StudentHeaderWrapper from '@/components/student/StudentHeaderWrapper';

export const metadata = {
  title: 'Student Portal — THE SHIVA',
  description: 'Your learning workspace on THE SHIVA platform',
};

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  const userName = (session as any).name || session.email.split('@')[0];

  // Consistent PW-style header on every student page (dashboard renders its own content below)
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <StudentHeaderWrapper userName={userName} userEmail={session.email} goal="SSC CGL" />
        {children}
      </div>
    </ThemeProvider>
  );
}
