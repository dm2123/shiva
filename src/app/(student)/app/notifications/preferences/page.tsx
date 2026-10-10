'use client';

import { useState, useEffect } from 'react';

interface Prefs {
  liveClassAlerts: boolean; testAlerts: boolean; assignmentAlerts: boolean;
  doubtAlerts: boolean; announcementAlerts: boolean; streakReminders: boolean;
  weeklyReport: boolean; emailNotifications: boolean; smsNotifications: boolean;
  pushEnabled: boolean; quietHoursStart: string; quietHoursEnd: string;
}

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch('/api/student/notification-preferences').then(r => r.json()).then(d => {
      if (d.success) setPrefs(d.data);
    });
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    await fetch('/api/student/notification-preferences', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs)
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, p256dh, auth })
      });
      setSubscribed(true);
    } catch (e) {
      console.error('Push subscribe error:', e);
    }
  };

  if (!prefs) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-teal-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Notification Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Choose what notifications you receive</p>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3">Push Notifications</h3>
        {pushSupported ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Browser Push Notifications</p>
              <p className="text-xs text-slate-400">{subscribed ? 'Enabled' : 'Click to enable'}</p>
            </div>
            <button onClick={togglePush}
              className={`px-4 py-2 text-xs font-bold rounded-lg ${subscribed ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
              {subscribed ? 'Disable' : 'Enable'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Push notifications not supported in this browser</p>
        )}
      </div>

      {/* Alert Types */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3">Alert Types</h3>
        <Toggle label="Live Class Alerts" value={prefs.liveClassAlerts}
          onChange={() => setPrefs({ ...prefs, liveClassAlerts: !prefs.liveClassAlerts })} />
        <Toggle label="Test Alerts" value={prefs.testAlerts}
          onChange={() => setPrefs({ ...prefs, testAlerts: !prefs.testAlerts })} />
        <Toggle label="Assignment Alerts" value={prefs.assignmentAlerts}
          onChange={() => setPrefs({ ...prefs, assignmentAlerts: !prefs.assignmentAlerts })} />
        <Toggle label="Doubt Alerts" value={prefs.doubtAlerts}
          onChange={() => setPrefs({ ...prefs, doubtAlerts: !prefs.doubtAlerts })} />
        <Toggle label="Announcements" value={prefs.announcementAlerts}
          onChange={() => setPrefs({ ...prefs, announcementAlerts: !prefs.announcementAlerts })} />
        <Toggle label="Streak Reminders" value={prefs.streakReminders}
          onChange={() => setPrefs({ ...prefs, streakReminders: !prefs.streakReminders })} />
        <Toggle label="Weekly Report" value={prefs.weeklyReport}
          onChange={() => setPrefs({ ...prefs, weeklyReport: !prefs.weeklyReport })} />
      </div>

      {/* Channels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3">Notification Channels</h3>
        <Toggle label="Push Notifications" value={prefs.pushEnabled}
          onChange={() => setPrefs({ ...prefs, pushEnabled: !prefs.pushEnabled })} />
        <Toggle label="Email Notifications" value={prefs.emailNotifications}
          onChange={() => setPrefs({ ...prefs, emailNotifications: !prefs.emailNotifications })} />
        <Toggle label="SMS Notifications" value={prefs.smsNotifications}
          onChange={() => setPrefs({ ...prefs, smsNotifications: !prefs.smsNotifications })} />
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3">Quiet Hours</h3>
        <p className="text-xs text-slate-400 mb-3">No notifications during these hours</p>
        <div className="flex gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500">From</label>
            <input type="time" value={prefs.quietHoursStart}
              onChange={e => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
              className="block mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">To</label>
            <input type="time" value={prefs.quietHoursEnd}
              onChange={e => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
              className="block mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 disabled:opacity-50 transition-all">
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
      </button>
    </div>
  );
}
