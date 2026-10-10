import Link from 'next/link';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact — THE SHIVA',
  description: 'Get in touch with THE SHIVA team for inquiries, support, or partnership opportunities.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen relative py-24 px-6 overflow-hidden">
      <div className="shiva-liquid-section absolute inset-0" aria-hidden="true" />
      <div className="shiva-blob w-[600px] h-[600px] bg-blue-600 top-[-100px] right-[-150px]" aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[400px] h-[400px] bg-violet-600 bottom-[-80px] left-[-100px]" aria-hidden="true" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">Get in Touch</span>
          <h1 className="text-shiva-section text-white">
            Contact<br />
            <span className="text-shiva-gold">THE SHIVA</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Have questions, feedback, or partnership inquiries? We&apos;re here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Student Support */}
          <div className="shiva-feature-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 text-2xl">
              👨🎓
            </div>
            <h3 className="text-lg font-bold text-white">Student Support</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Already registered? Access support directly through your student portal after logging in.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#c8a96e] hover:text-[#e8d5a3] group"
            >
              Go to Student Portal
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Teacher Inquiries */}
          <div className="shiva-feature-card p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 text-2xl">
              👨🏫
            </div>
            <h3 className="text-lg font-bold text-white">Faculty Portal</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Teachers are provisioned by administrators. If you&apos;re an assigned educator, access your portal here.
            </p>
            <Link
              href="/teacher/login"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#14b8a6] hover:text-[#2dd4bf] group"
            >
              Teacher Login
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="shiva-glass rounded-3xl p-12 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">General Inquiries</h2>
            <p className="text-sm text-slate-400">
              For business partnerships, institutional collaborations, or general questions.
            </p>
          </div>

          <ContactForm />
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-slate-400">Looking for something else?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="shiva-capsule shiva-capsule-blue">Browse Courses</Link>
            <Link href="/teachers" className="shiva-capsule shiva-capsule-violet">Meet Teachers</Link>
            <Link href="/about" className="shiva-capsule shiva-capsule-gold">About Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
