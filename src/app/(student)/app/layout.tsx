import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentHeader from '@/components/student/StudentHeader';
import StudentMobileDock from '@/components/student/StudentMobileDock';
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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--student-background)] flex">
        {/* Desktop Sidebar */}
        <StudentSidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 'var(--sidebar-width, 0)' }}>
          <div className="hidden lg:block" style={{ marginLeft: 0 }}>
            {/* Sidebar pushes content on lg+ */}
          </div>
          <StudentHeader user={session} />

          <main className="flex-1 relative z-10 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full pb-24 lg:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile Dock */}
        <StudentMobileDock />
      </div>
    </ThemeProvider>
  );
}
