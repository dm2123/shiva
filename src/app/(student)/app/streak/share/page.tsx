'use client';

import { useState } from 'react';

export default function StreakSharePage() {
  const [streakDays, setStreakDays] = useState(7);
  const [shared, setShared] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  const share = async (platform: string) => {
    const res = await fetch('/api/student/streak-share', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, streakDays })
    });
    const d = await res.json();
    if (d.success) {
      setShared(platform);
      setShareUrl(d.data.shareUrl);
      if (platform === 'COPY_LINK') {
        navigator.clipboard?.writeText(d.data.shareUrl);
      }
    }
  };

  const platforms = [
    { id: 'TWITTER', label: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
    { id: 'FACEBOOK', label: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'INSTAGRAM', label: 'Instagram', icon: '📸', color: 'bg-pink-500' },
    { id: 'COPY_LINK', label: 'Copy Link', icon: '🔗', color: 'bg-slate-600' },
  ];

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Share Your Streak</h1>
        <p className="text-sm text-slate-500 mt-1">Show the world your dedication!</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white text-center">
        <p className="text-7xl font-black mb-2">{streakDays}</p>
        <p className="text-xl font-bold opacity-90">Day Streak 🔥</p>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500">Streak Days</label>
        <input type="number" value={streakDays} onChange={e => setStreakDays(parseInt(e.target.value) || 0)}
          className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl text-center text-2xl font-bold" />
      </div>

      <div className="space-y-3">
        {platforms.map(p => (
          <button key={p.id} onClick={() => share(p.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl text-white font-bold transition-all ${
              shared === p.id ? 'bg-emerald-500' : p.color
            } hover:opacity-90`}>
            <span className="text-xl">{p.icon}</span>
            <span className="flex-1 text-left">{shared === p.id ? 'Shared!' : `Share on ${p.label}`}</span>
          </button>
        ))}
      </div>

      {shareUrl && (
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-400 mb-1">Share URL</p>
          <p className="text-xs text-slate-600 font-mono break-all">{shareUrl}</p>
        </div>
      )}
    </div>
  );
}
