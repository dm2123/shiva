import Image from 'next/image';
import Link from 'next/link';
import ShivaIcon from '@/components/public/ShivaIcon';
import DemoVideoPlayer from '@/components/common/DemoVideoPlayer';
import { BRAND } from '@/lib/brand';

export const metadata = {
  title: 'About — THE SHIVA',
  description: 'Learn about THE SHIVA — a purpose-built digital learning platform for competitive exam preparation.',
};

export default function AboutPage() {
  const values = [
    { icon: '🎯', title: 'Purpose-Built', desc: 'Every feature designed specifically for competitive exam preparation — not a generic LMS.' },
    { icon: '👨🏫', title: 'Expert Faculty', desc: 'Teachers are provisioned by admins and assigned to courses — ensuring quality and accountability.' },
    { icon: '🔒', title: 'Strict RBAC', desc: 'Student, Teacher, and Admin portals are completely isolated for privacy and focus.' },
    { icon: '📊', title: 'Data-Driven', desc: 'Track progress across every subject, chapter, and test to identify strengths and gaps.' },
    { icon: '🎥', title: 'Hybrid Learning', desc: 'Combine live classes with on-demand lectures, practice tests, and doubt resolution.' },
    { icon: '🏆', title: 'Results-Focused', desc: 'Built around proven exam patterns — SSC, Railway, Banking, Defence, Teaching — with adaptive practice and analytics.' },
  ];

  return (
    <div className="min-h-screen relative py-24 px-6 overflow-hidden">
      <div className="shiva-liquid-section absolute inset-0" aria-hidden="true" />
      <div className="shiva-blob w-[600px] h-[600px] bg-violet-600 top-[-100px] left-[-100px]" aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[500px] h-[500px] bg-[#c8a96e] bottom-[-100px] right-[-100px]" aria-hidden="true" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-6">
          <ShivaIcon size={80} animated variant="gold" className="mx-auto" />
          <span className="shiva-capsule shiva-capsule-gold">About</span>
          <h1 className="text-shiva-section text-white">
            THE SHIVA<br />
            <span className="text-shiva-gold">Competitive Learning Platform</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            A focused digital learning ecosystem built specifically for competitive exam candidates — SSC, Railway, Banking, Defence, and Teaching exams.
          </p>
        </div>

        {/* Founder Section */}
        <div className="shiva-glass rounded-3xl p-12 mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Meet the Founder</h2>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-shiva-gold">Shivajay Sir</h3>
              <p className="text-sm font-medium text-slate-300">Founder, THE SHIVA</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30">
                4 Times IIT GATE Qualified
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              Founder of THE SHIVA. Expert in Quantitative Aptitude and Reasoning with a proven track record. Dedicated to providing top-quality education and guidance to all competitive exam candidates.
            </p>
            <div className="pt-4">
              <p className="text-slate-400 font-medium text-sm mb-4">Watch Shivajay Sir&apos;s Demo Class</p>
              <DemoVideoPlayer 
                src={BRAND.demoVideoUrl}
                poster="/assets/demo-poster.jpg" 
                title="Teaching Demo"
              />
            </div>
          </div>
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:max-w-none rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
            {/* Real Founder Photo */}
            <Image 
              src="/assets/shivajay-sir.jpeg" 
              alt="Shivajay Sir"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Story */}
        <div className="shiva-glass rounded-3xl p-12 space-y-6">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed">
            THE SHIVA was created to solve a fundamental problem: most learning platforms are generic tools built for any type of education. We believe competitive exam preparation deserves a purpose-built solution.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Every feature — from the academic hierarchy (Course → Subject → Chapter → Lecture) to the test format, doubt system, and analytics — is designed around the specific needs of SSC, Railway, Banking, Defence, and Teaching exam candidates.
          </p>
          <p className="text-slate-300 leading-relaxed">
            We don&apos;t operate as a marketplace. Teachers are carefully selected and assigned by administrators to ensure quality control and institutional accountability. Students get a curated, cohesive learning experience — not a chaotic collection of disconnected content.
          </p>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="shiva-feature-card p-8 text-center space-y-4">
                <div className="text-5xl">{v.icon}</div>
                <h3 className="text-base font-bold text-white">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center shiva-glass rounded-3xl p-12">
          <h3 className="text-xl font-bold text-white mb-4">Ready to experience focused learning?</h3>
          <p className="text-slate-400 mb-6">Register as a student on THE SHIVA and access structured competitive exam preparation when courses are published.</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-[#c8a96e] hover:bg-[#e8d5a3] text-[#0a0a12] font-bold text-sm rounded-full shadow-xl shadow-[#c8a96e]/20 hover:shadow-[#c8a96e]/40 transition-all hover:-translate-y-1"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
