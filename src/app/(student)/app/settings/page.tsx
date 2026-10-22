'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  IconMoon,
  IconSun,
  IconUser,
  IconCheck,
  IconBell,
  IconShield,
  IconHelpCircle,
  IconChevronRight,
} from '@/components/student/StudentIcons';
import StudentChangePassword from '@/components/student/StudentChangePassword';

const themes = [
  {
    id: 'light' as const,
    name: 'Light',
    description: 'Clean bright interface',
    icon: IconSun,
    preview: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e0e7ff 100%)',
  },
  {
    id: 'dark' as const,
    name: 'Dark',
    description: 'Elegant dark mode',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #0b0f1a 0%, #1e293b 50%, #334155 100%)',
  },
  {
    id: 'aurora' as const,
    name: 'Aurora',
    description: 'Purple, Pink, Blue, Cyan',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #a855f7 0%, #ec4899 33%, #3b82f6 66%, #06b6d4 100%)',
  },
  {
    id: 'sunset' as const,
    name: 'Sunset',
    description: 'Orange, Red, Pink, Yellow',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #f97316 0%, #ef4444 33%, #ec4899 66%, #fbbf24 100%)',
  },
  {
    id: 'ocean' as const,
    name: 'Ocean',
    description: 'Blue, Cyan, Teal, Green',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 33%, #14b8a6 66%, #10b981 100%)',
  },
  {
    id: 'forest' as const,
    name: 'Forest',
    description: 'Green, Emerald, Lime, Teal',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #10b981 0%, #14b8a6 33%, #84cc16 66%, #06b6d4 100%)',
  },
  {
    id: 'royal' as const,
    name: 'Royal',
    description: 'Purple, Violet, Indigo, Blue',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 33%, #6366f1 66%, #818cf8 100%)',
  },
];

export default function SettingsPage() {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-5 pb-24 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your appearance, security and preferences.</p>
      </div>

      {/* ── Appearance ── */}
      <section>
        <h2 className="text-[17px] font-bold text-gray-900 mb-3">Appearance</h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-900 mb-1">Theme</p>
          <p className="text-xs text-gray-500 mb-4">Pick the look you like — it applies across the app.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map((theme) => {
              const ThemeIcon = theme.icon;
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`relative p-3 rounded-2xl border-2 transition text-left ${
                    isActive
                      ? 'border-indigo-600 shadow-lg shadow-indigo-600/15'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow z-10">
                      <IconCheck size={13} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div
                    className="w-full h-20 rounded-xl mb-2.5 flex items-center justify-center"
                    style={{ background: theme.preview }}
                  >
                    <ThemeIcon size={22} className="text-white/70" />
                  </div>
                  <p className="text-[13px] font-bold text-gray-900">{theme.name}</p>
                  <p className="text-[10px] text-gray-500">{theme.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Account & Security ── */}
      <section>
        <h2 className="text-[17px] font-bold text-gray-900 mb-3">Account & Security</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <div className="p-5">
            <StudentChangePassword />
          </div>
          <Link href="/app/profile" className="p-4 flex items-center gap-3 hover:bg-gray-50 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <IconUser size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Profile Information</p>
              <p className="text-xs text-gray-500">Name, contact and target exam</p>
            </div>
            <IconChevronRight size={16} className="text-gray-300" />
          </Link>
        </div>
      </section>

      {/* ── Notifications ── */}
      <section>
        <h2 className="text-[17px] font-bold text-gray-900 mb-3">Notifications</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <Link href="/app/notifications" className="p-4 flex items-center gap-3 hover:bg-gray-50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <IconBell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">View Notifications</p>
              <p className="text-xs text-gray-500">Announcements, reminders and alerts</p>
            </div>
            <IconChevronRight size={16} className="text-gray-300" />
          </Link>
          <Link href="/app/notifications/preferences" className="p-4 flex items-center gap-3 hover:bg-gray-50 transition">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
              <IconShield size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Notification Preferences</p>
              <p className="text-xs text-gray-500">Choose what you want to hear about</p>
            </div>
            <IconChevronRight size={16} className="text-gray-300" />
          </Link>
        </div>
      </section>

      {/* ── Help ── */}
      <section>
        <h2 className="text-[17px] font-bold text-gray-900 mb-3">Help & Support</h2>
        <div className="bg-white rounded-2xl border border-gray-200">
          <Link href="/app/counsellor" className="p-4 flex items-center gap-3 hover:bg-gray-50 transition rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <IconHelpCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Talk to a Counsellor</p>
              <p className="text-xs text-gray-500">Account help, course guidance and more</p>
            </div>
            <IconChevronRight size={16} className="text-gray-300" />
          </Link>
        </div>
      </section>
    </div>
  );
}
