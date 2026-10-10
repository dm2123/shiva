'use client';

import { useState } from 'react';
import { IconCheck, IconX, IconShield } from '@/components/student/StudentIcons';

export default function StudentChangePassword() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submit = async () => {
    setStatus(null);
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setStatus({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/student/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setOpen(false), 1200);
      } else {
        setStatus({ type: 'error', text: data?.error?.message || 'Failed to change password.' });
      }
    } catch {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 rounded-lg bg-[var(--student-primary-light)] flex items-center justify-center text-[var(--student-primary)] flex-shrink-0">
          <IconShield />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--student-text)] mb-0.5">Password</p>
          <p className="text-xs text-[var(--student-text-muted)]">Update your account password securely</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {open ? (
          <div className="flex flex-col items-end gap-2 w-64 sm:w-80">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--student-border-light)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] focus:ring-2 focus:ring-[var(--student-primary)] focus:outline-none"
            />
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--student-border-light)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] focus:ring-2 focus:ring-[var(--student-primary)] focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--student-border-light)] bg-[var(--student-surface)] text-sm text-[var(--student-text)] focus:ring-2 focus:ring-[var(--student-primary)] focus:outline-none"
            />
            {status && (
              <p className={`w-full text-xs ${status.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                <span className="inline-flex items-center gap-1">
                  {status.type === 'success' ? <IconCheck size={11} /> : <IconX size={11} />}
                  {status.text}
                </span>
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={submitting}
                className="text-xs font-semibold px-4 py-2 bg-[var(--student-primary)] text-white rounded-full hover:opacity-90 disabled:opacity-50 transition"
              >
                {submitting ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setOpen(false); setStatus(null); }}
                className="text-xs font-semibold px-4 py-2 bg-[var(--student-surface-hover)] text-[var(--student-text-secondary)] rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="text-xs font-semibold px-4 py-2 bg-[var(--student-primary-light)] text-[var(--student-primary)] rounded-full hover:opacity-80 transition"
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
}