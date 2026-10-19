'use client';

import { useState, useEffect } from 'react';

interface Prefs {
  liveClassAlerts: boolean; testAlerts: boolean; assignmentAlerts: boolean;
  doubtAlerts: boolean; announcementAlerts: boolean; streakReminders: boolean;
  weeklyReport: boolean; emailNotifications: boolean; smsNotifications: boolean;
  pushEnabled: boolean; quietHoursStart: string; quietHoursEnd: string;
}

function SectionIcon({ name }: { name: string }) {
  const cls = 'w-5 h-5';
  const paths: Record<string, React.ReactNode> = {
    bell: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
    grid: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    send: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    moon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    ),
  };
  return <>{paths[name]}</>;
}

function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-indigo-600' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5" aria-label="Loading preferences">
      <div className="space-y-2">
        <div className="h-7 bg-slate-100 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-8 bg-slate-50 rounded" />
          <div className="h-8 bg-slate-50 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const load = async () => {
    setLoadError(false);
    try {
      const r = await fetch('/api/student/notification-preferences');
      const d = await r.json();
      if (d.success && d.data) setPrefs(d.data);
      else setLoadError(true);
    } catch {
      setLoadError(true);
    }
  };

  useEffect(() => {
    load();
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const update = (patch: Partial<Prefs>) => {
    setPrefs((p) => (p ? { ...p, ...patch } : p));
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    if (!prefs || saving) return;
    setSaving(true);
    try {
      await fetch('/api/student/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* keep dirty so user can retry */
    } finally {
      setSaving(false);
    }
  };

  const togglePush = async () => {
    if (!pushSupported) return;
    if (subscribed) {
      setSubscribed(false);
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: '' });
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!)));
      await fetch('/api/student/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, p256dh, auth }),
      });
      setSubscribed(true);
    } catch (e) {
      console.error('Push subscribe error:', e);
    }
  };

  if (!prefs && !loadError) return <Skeleton />;

  if (loadError || !prefs) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
          <p className="text-4xl mb-3">🔕</p>
          <p className="font-bold text-gray-800">Settings load nahi ho payi</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Dobara try karo.</p>
          <button
            onClick={load}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sectionHeader = (icon: string, title: string, sub: string, bg: string, fg: string) => (
    <div className="flex items-center gap-3 mb-2">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} ${fg}`}>
        <SectionIcon name={icon} />
      </span>
      <div>
        <h3 className="font-bold text-slate-900 text-[15px]">{title}</h3>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-32 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notification Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Tay karo kaunsi alerts tumhe milengi — bharosa bana rahe, spam nahi.</p>
      </div>

      {/* Browser push */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        {sectionHeader('bell', 'Browser Push', 'Is device par turant alerts', 'bg-indigo-100', 'text-indigo-700')}
        {pushSupported ? (
          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Push Notifications</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {subscribed ? 'Chalu hai — important updates turant milengi' : 'Enable karo taaki class/test alerts miss na hon'}
              </p>
            </div>
            <button
              onClick={togglePush}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex-shrink-0 ${
                subscribed ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {subscribed ? 'Band karo' : 'Chalu karo'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400 mt-2 bg-slate-50 rounded-xl px-4 py-3">
            Ye browser push notifications support nahi karta. Chrome ya Edge me kholo.
          </p>
        )}
      </section>

      {/* Alert types */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        {sectionHeader('grid', 'Kis cheez ki alerts', 'Apni padhai ke hisaab se chunno', 'bg-violet-100', 'text-violet-700')}
        <div className="mt-1">
          <Toggle label="Live Class Alerts" hint="Class shuru hone se pehle reminder" value={prefs.liveClassAlerts} onChange={() => update({ liveClassAlerts: !prefs.liveClassAlerts })} />
          <Toggle label="Test Alerts" hint="Naye test aur result ki suchna" value={prefs.testAlerts} onChange={() => update({ testAlerts: !prefs.testAlerts })} />
          <Toggle label="Assignment Alerts" hint="Nayi assignment aur deadline" value={prefs.assignmentAlerts} onChange={() => update({ assignmentAlerts: !prefs.assignmentAlerts })} />
          <Toggle label="Doubt Alerts" hint="Tumhare doubt ka jawab aane par" value={prefs.doubtAlerts} onChange={() => update({ doubtAlerts: !prefs.doubtAlerts })} />
          <Toggle label="Announcements" hint="Batch aur platform ki khabrein" value={prefs.announcementAlerts} onChange={() => update({ announcementAlerts: !prefs.announcementAlerts })} />
          <Toggle label="Streak Reminders" hint="Roz ki padhai ka streak banaye rakho" value={prefs.streakReminders} onChange={() => update({ streakReminders: !prefs.streakReminders })} />
          <Toggle label="Weekly Report" hint="Hafte bhar ki progress ka summary" value={prefs.weeklyReport} onChange={() => update({ weeklyReport: !prefs.weeklyReport })} />
        </div>
      </section>

      {/* Channels */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        {sectionHeader('send', 'Kaise milegi', 'Channel chunno', 'bg-emerald-100', 'text-emerald-700')}
        <div className="mt-1">
          <Toggle label="Push Notifications" hint="App/browser me turant" value={prefs.pushEnabled} onChange={() => update({ pushEnabled: !prefs.pushEnabled })} />
          <Toggle label="Email Notifications" hint="Tumhare registered email par" value={prefs.emailNotifications} onChange={() => update({ emailNotifications: !prefs.emailNotifications })} />
          <Toggle label="SMS Notifications" hint="Zaroori alerts ke liye (kam bhejte hain)" value={prefs.smsNotifications} onChange={() => update({ smsNotifications: !prefs.smsNotifications })} />
        </div>
      </section>

      {/* Quiet hours */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        {sectionHeader('moon', 'Quiet Hours', 'In hours me koi notification nahi', 'bg-slate-100', 'text-slate-600')}
        <div className="flex gap-4 mt-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500">Shuru</label>
            <input
              type="time"
              value={prefs.quietHoursStart}
              onChange={(e) => update({ quietHoursStart: e.target.value })}
              className="block mt-1.5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500">Khatam</label>
            <input
              type="time"
              value={prefs.quietHoursEnd}
              onChange={(e) => update({ quietHoursEnd: e.target.value })}
              className="block mt-1.5 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
      </section>

      {/* Sticky save bar (mobile-friendly) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-slate-100 z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={save}
            disabled={saving || !dirty}
            className={`w-full py-3.5 text-white font-bold rounded-2xl transition-all text-[15px] ${
              saved
                ? 'bg-emerald-600'
                : dirty
                  ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] shadow-lg shadow-indigo-200'
                  : 'bg-slate-300'
            } disabled:cursor-default`}
          >
            {saving ? 'Save ho raha hai…' : saved ? '✓ Save ho gaya!' : dirty ? 'Preferences Save Karo' : 'Koi change nahi'}
          </button>
          {dirty && !saving && (
            <p className="text-center text-[11px] text-amber-600 mt-1.5 font-medium">
              Badlav save nahi hue hain — save dabana na bhoolo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
