'use client';

import { useState, useEffect } from 'react';

export default function ReferralCode() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch('/api/student/referrals');
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch referrals error:', err);
      }
      setLoading(false);
    };
    fetchReferrals();
  }, []);

  const copyCode = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyReferral = async () => {
    if (!applyCode.trim()) return;
    setApplying(true);
    setMessage('');
    try {
      const res = await fetch('/api/student/referrals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyCode.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage(`✅ Referral applied! You earned ₹${result.data.rewardAmount}`);
        setApplyCode('');
        // Refresh data
        const refreshRes = await fetch('/api/student/referrals');
        const refreshData = await refreshRes.json();
        if (refreshData.success) setData(refreshData.data);
      } else {
        setMessage(`❌ ${result.error.message}`);
      }
    } catch (err) {
      setMessage('❌ Failed to apply referral');
    }
    setApplying(false);
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* My Referral Code */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Your Referral Code</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-3 font-mono text-lg font-bold text-center">
            {data?.referralCode || 'Loading...'}
          </div>
          <button
            onClick={copyCode}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Share with friends. They get ₹50, you get ₹50!</p>
      </div>

      {/* Apply Code */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Apply Referral Code</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={applyCode}
            onChange={e => setApplyCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
          />
          <button
            onClick={applyReferral}
            disabled={applying || !applyCode.trim()}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {message && <p className="text-sm mt-2">{message}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{data?.totalReferrals || 0}</p>
          <p className="text-sm text-slate-500">Referrals</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">₹{data?.totalEarned || 0}</p>
          <p className="text-sm text-slate-500">Earned</p>
        </div>
      </div>

      {/* Referral History */}
      {data?.referrals && data.referrals.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Referral History</h3>
          <div className="space-y-2">
            {data.referrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                <span className="text-sm text-slate-700 dark:text-slate-300">{r.referredName || r.referredUserId}</span>
                <span className="text-sm font-bold text-green-600">+₹{r.rewardAmount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
