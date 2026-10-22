'use client';

import { useEffect } from 'react';
import { StudentSidebarNav } from './StudentSidebar';

interface PWStudentMenuProps {
  open: boolean;
  onClose: () => void;
  userName: string;
}

/**
 * Mobile sidebar drawer — desktop wale grouped sidebar (StudentSidebarNav)
 * ka hi mobile roop. Hamburger se khulta hai; StudentMobileDock ke upar
 * (z-[61]) rehta hai taaki dono takrayein nahi.
 */
export default function PWStudentMenu({ open, onClose, userName }: PWStudentMenuProps) {
  // Escape se band + khule rehte body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-[61] overflow-y-auto shadow-2xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        {/* User header */}
        <div className="bg-[#2a1650] text-white px-5 py-6">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-[#6d28d9] flex items-center justify-center font-bold text-lg shrink-0">
              {(userName || 'S').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] truncate">{userName || 'Student'}</p>
              <p className="text-xs text-white/60">THE SHIVA Learner</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="ml-auto min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 transition shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Grouped nav — desktop sidebar wali hi asal list */}
        <StudentSidebarNav onNavigate={onClose} />

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 mt-2">
          <p className="text-xs text-gray-400 text-center">THE SHIVA</p>
        </div>
      </aside>
    </>
  );
}
