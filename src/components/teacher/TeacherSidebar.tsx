'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconDashboard, IconBookOpen, IconVideo, IconFileText, IconTarget, IconList,
  IconRadio, IconUsers, IconBarChart, IconSettings, IconUser, IconLogOut,
  IconFolder, IconLayers, IconMessageCircle, IconMonitorPlay
} from './TeacherIcons';

const navGroups = [
  {
    title: 'DASHBOARD',
    items: [
      { name: 'Dashboard', href: '/teacher', icon: IconDashboard },
    ]
  },
  {
    title: 'TEACHING',
    items: [
      { name: 'Assigned Courses', href: '/teacher/courses', icon: IconBookOpen },
      { name: 'Subjects', href: '/teacher/subjects', icon: IconFolder },
      { name: 'Chapters', href: '/teacher/chapters', icon: IconLayers },
      { name: 'Lectures', href: '/teacher/lectures', icon: IconVideo },
      { name: 'Notes', href: '/teacher/notes', icon: IconFileText },
      { name: 'Question Bank', href: '/teacher/questions', icon: IconList },
      { name: 'Tests & Assignments', href: '/teacher/tests', icon: IconTarget },
    ]
  },
  {
    title: 'LIVE CLASS',
    items: [
      { name: 'Live Classes', href: '/teacher/live-classes', icon: IconRadio },
      { name: 'Live Studio', href: '/teacher/live-studio', icon: IconMonitorPlay },
      { name: 'Schedule', href: '/teacher/schedule', icon: IconBarChart },
      { name: 'Announcements', href: '/teacher/announcements', icon: IconBarChart },
    ]
  },
  {
    title: 'STUDENTS',
    items: [
      { name: 'My Students', href: '/teacher/students', icon: IconUsers },
      { name: 'Doubts', href: '/teacher/doubts', icon: IconMessageCircle },
    ]
  },
  {
    title: 'ANALYTICS',
    items: [
      { name: 'Platform Analytics', href: '/teacher/analytics', icon: IconBarChart },
    ]
  }
];

export default function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <h2 className="text-white font-bold text-lg tracking-tight">THE SHIVA</h2>
        <p className="text-xs text-teal-400">Teacher Workspace</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all font-medium ${
                      active ? 'bg-teal-900 text-teal-50 shadow-sm' : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex-shrink-0">
        <Link href="/teacher/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all font-medium">
          <IconUser size={18} />
          Profile
        </Link>
        <Link href="/teacher/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all font-medium mt-1">
          <IconSettings size={18} />
          Settings
        </Link>
        <button 
          onClick={async () => {
            await fetch('/api/teacher/auth/logout', { method: 'POST' });
            window.location.href = '/teacher/login';
          }}
          className="flex items-center gap-3 px-3 py-2 mt-1 w-full text-left rounded-lg text-sm font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <IconLogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}