const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@theshiva.in';

const POLICY_LINKS = [
  { label: 'About Us', path: '/about', description: 'Institution story & mission' },
  { label: 'Privacy Policy', path: '/privacy', description: 'Data handling & user rights' },
  { label: 'Terms of Service', path: '/terms', description: 'Platform usage terms' },
  { label: 'Contact Us', path: '/contact', description: 'Reach the support desk' },
];

export default function AdminSocialSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Social & Institutional Metadata</h1>
        <p className="text-sm text-slate-600">Public-facing support channels and legal policy references used across the platform.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Support & Branding</h2>
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
            <dt className="text-slate-500">Platform Name</dt>
            <dd className="font-bold text-slate-900">The Shiva</dd>
          </div>
          <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
            <dt className="text-slate-500">Support Email</dt>
            <dd className="font-bold text-slate-900">{SUPPORT_EMAIL}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Legal & Policy Pages</h2>
        <div className="space-y-3">
          {POLICY_LINKS.map((p) => (
            <a
              key={p.path}
              href={p.path}
              className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors group"
            >
              <div>
                <span className="font-bold text-slate-900 text-sm group-hover:text-red-900 transition-colors">{p.label}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{p.description}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{p.path}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}