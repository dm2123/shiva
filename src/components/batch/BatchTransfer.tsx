'use client';

import { useState, useEffect } from 'react';

interface Batch {
  id: string;
  name: string;
  courseId: string;
}

interface Transfer {
  id: string;
  fromBatchId: string;
  toBatchId: string;
  fromBatchName: string;
  toBatchName: string;
  courseTitle: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function BatchTransfer() {
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [toBatchId, setToBatchId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/student/batch-transfer');
      const data = await res.json();
      if (data.success) {
        setTransfers(data.data.transfers);
      }
    } catch {
      console.error('Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!toBatchId || !reason.trim()) return;
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/student/batch-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromBatchId: currentBatch?.id, toBatchId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Transfer request submitted successfully!');
        setToBatchId('');
        setReason('');
        fetchData();
      } else {
        setMessage(data.error?.message || 'Failed to submit request');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Request Batch Transfer</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Switch to a different batch for the same course.</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Batch</label>
            <select
              value={toBatchId}
              onChange={(e) => setToBatchId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">Select a batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason for Transfer</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why you want to transfer..."
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !toBatchId || !reason.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transfer History</h3>
        {transfers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No transfer requests yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {transfers.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-slate-100 p-3 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t.courseTitle || 'Course'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.fromBatchName} → {t.toBatchName}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[t.status] || 'bg-slate-100 text-slate-800'}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
