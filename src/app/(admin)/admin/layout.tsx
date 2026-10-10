'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGroups = [
    { title: 'CONTROL CENTER', links: [{ name: 'Dashboard', href: '/admin' }] },
    {
      title: 'USERS',
      links: [
        { name: 'Students', href: '/admin/students' },
        { name: 'Teachers', href: '/admin/teachers' },
        { name: 'Organizations', href: '/admin/educators' },
      ],
    },
    {
      title: 'ACADEMICS',
      links: [
        { name: 'Courses', href: '/admin/courses' },
      ],
    },
    {
      title: 'BATCHES & ENROLLMENT',
      links: [
        { name: 'Batches', href: '/admin/batches' },
        { name: 'Enrollments', href: '/admin/enrollments' },
      ],
    },
    {
      title: 'LIVE CLASS',
      links: [
        { name: 'Live Classes', href: '/admin/live-classes' },
        { name: 'Recordings', href: '/admin/recordings' },
        { name: 'Live Monitoring', href: '/admin/live-monitoring' },
        { name: 'Live Analytics', href: '/admin/live-analytics' },
      ],
    },
    {
      title: 'SUPPORT',
      links: [
        { name: 'Doubts', href: '/admin/doubts' },
        { name: 'Community', href: '/admin/community' },
        { name: 'Notifications', href: '/admin/notifications' },
      ],
    },
    {
      title: 'COMMERCE',
      links: [
        { name: 'Payments', href: '/admin/payments' },
        { name: 'Orders', href: '/admin/orders' },
        { name: 'Invoices', href: '/admin/invoices' },
      ],
    },
    {
      title: 'OUTCOMES',
      links: [
        { name: 'Certificates', href: '/admin/certificates' },
        { name: 'Platform Analytics', href: '/admin/analytics' },
      ],
    },
    {
      title: 'PLATFORM',
      links: [
        { name: 'Settings', href: '/admin/settings' },
        { name: 'Audit Logs', href: '/admin/audit-logs' },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - Desktop fixed, Mobile overlay */}
      <aside className={`${mobileOpen ? 'fixed inset-0 z-50' : 'hidden'} md:flex md:w-64 bg-red-950 text-white flex-col h-full`}>
        <div className="p-6">
          <h2 className="text-lg font-black text-red-400 mb-8">THE SHIVA</h2>
          <nav className="space-y-6 overflow-y-auto h-[calc(100vh-120px)] pr-2">
            {navGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[10px] uppercase font-bold text-red-500 mb-2">{group.title}</h3>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-1.5 text-xs text-red-100 hover:text-white">
                    {link.name}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden p-4 bg-red-950 text-white flex justify-between">
          <span>ADMIN</span>
          <button onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? 'Close' : 'Menu'}</button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
