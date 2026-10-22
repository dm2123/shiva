'use client';

import { useState } from 'react';
import CounsellorChat from '@/components/counsellor/CounsellorChat';
import CallbackRequestForm from '@/components/counsellor/CallbackRequestForm';

type Tab = 'chat' | 'callback';

export default function CounsellorTabs({ userName = '' }: { userName?: string }) {
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div
        className="grid grid-cols-2 gap-1 rounded-2xl border border-[var(--student-border)] bg-[var(--student-surface)] p-1.5"
        role="tablist"
        aria-label="Counsellor options"
      >
        {(
          [
            { id: 'chat', label: '💬 Chat karo', desc: 'Turant baat shuru karo' },
            { id: 'callback', label: '📞 Callback lo', desc: 'Hum tumhe call karenge' },
          ] as { id: Tab; label: string; desc: string }[]
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-3 text-left transition ${
              tab === t.id
                ? 'bg-[var(--student-primary)] text-white shadow-lg shadow-indigo-600/25'
                : 'text-[var(--student-text-muted)] hover:bg-[var(--student-surface-hover)]'
            }`}
          >
            <span className="block text-sm font-bold">{t.label}</span>
            <span className={`mt-0.5 block text-[11px] ${tab === t.id ? 'text-white/80' : 'text-[var(--student-text-faint)]'}`}>
              {t.desc}
            </span>
          </button>
        ))}
      </div>

      {tab === 'chat' ? (
        <div role="tabpanel">
          <CounsellorChat />
          <p className="mt-3 text-center text-[12px] text-[var(--student-text-faint)]">
            Sawal likho — counsellor ya hamari team jald jawab degi.
          </p>
        </div>
      ) : (
        <div role="tabpanel">
          <CallbackRequestForm defaultName={userName} />
        </div>
      )}
    </div>
  );
}
