'use client';

import { useState, useEffect } from 'react';
import { safeFetch } from '@/lib/api-client';

export default function PaymentSettingsForm() {
  const [config, setConfig] = useState({ upiId: '', bankAccountNumber: '', ifsc: '', accountHolderName: '' });

  useEffect(() => {
    safeFetch('/api/admin/settings/payment').then(res => {
      if (res.success && res.data) setConfig(res.data);
    });
  }, []);

  const save = async () => {
    await safeFetch('/api/admin/settings/payment', { method: 'POST', body: JSON.stringify(config) });
    alert('Settings saved');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h3 className="font-bold text-slate-900 mb-4">Payment Configuration</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">UPI ID</label>
          <input 
            type="text" 
            value={config.upiId} 
            onChange={(e) => setConfig({...config, upiId: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Account Holder Name</label>
          <input 
            type="text" 
            value={config.accountHolderName} 
            onChange={(e) => setConfig({...config, accountHolderName: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Bank Account Number</label>
          <input 
            type="password" 
            value={config.bankAccountNumber} 
            onChange={(e) => setConfig({...config, bankAccountNumber: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
            placeholder="Enter full account number"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">IFSC Code</label>
          <input 
            type="text" 
            value={config.ifsc} 
            onChange={(e) => setConfig({...config, ifsc: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
          />
        </div>
        <button onClick={save} className="bg-red-950 text-white px-4 py-2 rounded-lg text-sm font-bold">
          Save Configuration
        </button>
      </div>
    </div>
  );
}
