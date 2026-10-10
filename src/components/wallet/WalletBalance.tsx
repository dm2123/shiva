'use client';

import { useState, useEffect } from 'react';

interface WalletBalanceProps {
  onTopUp?: () => void;
}

export default function WalletBalance({ onTopUp }: WalletBalanceProps) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/student/wallet');
        const data = await res.json();
        if (data.success) setBalance(data.data.balance);
      } catch (err) {
        console.error('Fetch wallet error:', err);
      }
      setLoading(false);
    };
    fetchBalance();
  }, []);

  const topUp = async (amount: number) => {
    try {
      const res = await fetch('/api/student/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.data.newBalance);
        onTopUp?.();
      }
    } catch (err) {
      console.error('Top-up error:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-500">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
      <p className="text-sm opacity-80">Wallet Balance</p>
      <p className="text-4xl font-bold mt-2">₹{balance}</p>
      <div className="flex gap-2 mt-4">
        {[100, 200, 500, 1000].map(amount => (
          <button
            key={amount}
            onClick={() => topUp(amount)}
            className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            +₹{amount}
          </button>
        ))}
      </div>
    </div>
  );
}
