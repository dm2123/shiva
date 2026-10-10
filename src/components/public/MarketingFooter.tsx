import Link from 'next/link';
import THEShivaLogo from '@/components/brand/THEShivaLogo';

const footerSections = [
  {
    heading: 'Platform',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'Educators', href: '/teachers' },
      { label: 'Batches', href: '/batches' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    heading: 'Student',
    links: [
      { label: 'Register', href: '/register' },
      { label: 'Student Login', href: '/login' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Faculty',
    links: [
      { label: 'Teacher Portal', href: '/teacher/login' },
      { label: 'Admin Portal', href: '/admin/login' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/8 bg-[#0a0a12]">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c8a96e]/40 to-transparent" />

      <div className="marketing-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10 mb-10">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-4">
            <THEShivaLogo size={36} variant="full" />
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xs">
              Premium digital learning platform for competitive exam preparation. Expert-led courses for SSC, Railway, Banking, Defence, and Teaching exams.
            </p>
            
            {/* Educator Partner */}
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Educator Partner</p>
              <div className="space-y-1.5">
                <Link href="/teachers/delhi-shiksha-academy" className="block text-xs md:text-sm font-semibold text-[#14b8a6] hover:text-[#5eead4] transition-colors">
                  Delhi Shiksha Academy
                </Link>
                <div className="flex gap-2 text-xs">
                  <a href="https://www.youtube.com/@delhishikshaacademy" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-red-500 transition-colors" aria-label="YouTube">▶ YouTube</a>
                  <a href="https://t.me/ajayfamilyofficial" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors" aria-label="Telegram">✈ Telegram</a>
                </div>
              </div>
            </div>
            
            {/* Portal access badges */}
            <div className="flex flex-wrap gap-2 pt-3">
              <Link href="/login" className="text-[10px] font-semibold px-2 py-1 rounded-full border" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.25)' }}>Student Portal</Link>
              <Link href="/teacher/login" className="text-[10px] font-semibold px-2 py-1 rounded-full border" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', borderColor: 'rgba(16,185,129,0.25)' }}>Teacher Portal</Link>
              <Link href="/admin/login" className="text-[10px] font-semibold px-2 py-1 rounded-full border" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', borderColor: 'rgba(239,68,68,0.25)' }}>Admin Portal</Link>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {footerSections.map((section) => (
              <div key={section.heading} className="space-y-3">
                <h4 className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider">{section.heading}</h4>
                <ul className="space-y-1.5 md:space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-slate-500 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            &copy; 2026 THE SHIVA Platform. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built for academic excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
