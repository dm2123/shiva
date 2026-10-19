'use client';

import Link from 'next/link';

interface PWStudentMenuProps {
  open: boolean;
  onClose: () => void;
  userName: string;
}

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'LEARN ONLINE',
    items: [
      { icon: '📝', label: 'Study', href: '/app/my-courses' },
      { icon: '📚', label: 'Library', href: '/app/ebooks' },
    ],
  },
  {
    title: 'STUDY PACKS',
    items: [
      { icon: '🖥️', label: 'Batches', href: '/app/batches' },
      { icon: '⚡', label: 'Power Batch', href: '/app/batches' },
      { icon: '📋', label: 'Test Series', href: '/app/tests' },
      { icon: '✅', label: 'My Test', href: '/app/tests' },
      { icon: '🎓', label: 'Scholarship', href: '/app/scholarships' },
    ],
  },
  {
    title: 'EXPLORE',
    items: [
      { icon: '📖', label: 'Books', href: '/app/ebooks', badge: 'NEW' },
      { icon: '💬', label: 'Doubts', href: '/app/doubts', badge: 'NEW' },
      { icon: '🎯', label: 'Saarthi', href: '/app/counsellor' },
    ],
  },
  {
    title: 'MORE',
    items: [
      { icon: '🎧', label: 'Help & Support', href: '/app/counsellor' },
    ],
  },
];

export default function PWStudentMenu({ open, onClose, userName }: PWStudentMenuProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
      />
      <aside className="fixed left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-[61] overflow-y-auto shadow-2xl">
        {/* User header */}
        <div className="bg-[#1a1a2e] text-white px-5 py-6">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-lg">
              {(userName || 'S').charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold text-[15px]">{userName || 'Student'}</p>
              <p className="text-xs text-white/60">THE SHIVA Learner</p>
            </div>
          </div>
        </div>

        {/* Menu sections */}
        <nav className="py-2">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              <p className="px-5 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-gray-400">
                {section.title}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-violet-50 transition"
                >
                  <span className="text-xl w-7 text-center">{item.icon}</span>
                  <span className="text-[14px] text-gray-800 flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 mt-2">
          <p className="text-xs text-gray-400 text-center">THE SHIVA v1.0</p>
        </div>
      </aside>
    </>
  );
}
