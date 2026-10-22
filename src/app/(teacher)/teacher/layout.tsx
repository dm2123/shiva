import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherHeader from '@/components/teacher/TeacherHeader';
import TeacherMobileDock from '@/components/teacher/TeacherMobileDock';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--teacher-background)] flex flex-col md:flex-row">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <div className="hidden md:block">
          <TeacherSidebar />
        </div>

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
          <TeacherHeader user={session} />
          
          <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-[1600px] mx-auto w-full">
            {children}
          </main>

          {/* Mobile Dock */}
          <TeacherMobileDock />
        </div>
      </div>
    </ThemeProvider>
  );
}
