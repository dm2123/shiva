'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconDashboard, IconBookOpen, IconVideo, IconUsers, IconSettings } from './TeacherIcons';

export default function TeacherMobileDock() {
  const pathname = usePathname();

  const dockItems = [
    { name: 'Dashboard', href: '/teacher', icon: IconDashboard },
    { name: 'Courses', href: '/teacher/courses', icon: IconBookOpen },
    { name: 'Lectures', href: '/teacher/lectures', icon: IconVideo },
    { name: 'Students', href: '/teacher/students', icon: IconUsers },
    { name: 'More', href: '/teacher/settings', icon: IconSettings },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-[rgba(15,23,42,0.92)] dark:bg-[rgba(11,15,26,0.95)] backdrop-blur-xl border border-white/10 rounded-2xl flex justify-around items-center p-2 shadow-2xl">
        {dockItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/teacher' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-teal-500/20 text-teal-400 scale-110' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {isActive && <span className="w-1 h-1 rounded-full bg-teal-400 mt-1 absolute bottom-1" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
