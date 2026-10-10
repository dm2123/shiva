import PaymentSettingsForm from './PaymentSettingsForm';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Global System Settings</h1>
        <p className="text-sm text-slate-600">Platform maintenance mode, security policies, and brand settings configuration.</p>
      </div>
      <PaymentSettingsForm />
    </div>
  );
}
