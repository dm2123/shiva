import Image from 'next/image';
import Link from 'next/link';
import DemoVideoPlayer from '@/components/common/DemoVideoPlayer';
import { BRAND } from '@/lib/brand';

export default function MarketingFacultySection() {
  const faculties = [
    {
      id: 'shivajay-sir',
      name: 'Shivajay Sir',
      role: 'Founder & Faculty',
      qualification: '4 Times IIT GATE Qualified',
      subject: 'Maths & Science',
      image: '/assets/shivajay-sir.jpeg',
      gradient: 'from-violet-500/20 to-purple-500/20',
      ring: 'ring-violet-500/30'
    },
    {
      id: 'priyanka-mam',
      name: 'Priyanka ma’am',
      role: 'Faculty',
      qualification: 'English Expert',
      subject: 'English Language',
      image: '/assets/english-teacher.jpeg',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      ring: 'ring-blue-500/30'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden shiva-grid">
      <div className="absolute inset-0 bg-[#0a0a12]" aria-hidden="true" />
      <div className="shiva-blob w-[500px] h-[500px] bg-[#c8a96e] top-[-100px] right-[-100px] opacity-10" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="shiva-capsule shiva-capsule-gold">Expert Faculty</span>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Learn from the <span className="text-shiva-gold">Best</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Our experienced and qualified faculty members are dedicated to your success in competitive exams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {faculties.map((faculty) => (
            <div key={faculty.id} className="shiva-glass rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start group hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-[#c8a96e]/10">
              <div className={`relative w-40 h-40 shrink-0 rounded-2xl overflow-hidden ring-1 ${faculty.ring}`}>
                <Image
                  src={faculty.image}
                  alt={faculty.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="text-center md:text-left space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{faculty.name}</h3>
                  <p className="text-[#c8a96e] font-semibold text-sm">{faculty.role}</p>
                </div>
                <div className="space-y-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${faculty.gradient} text-white/90 text-xs font-bold border border-white/10`}>
                    {faculty.qualification}
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Subject: </span>
                    <span className="text-white font-medium text-sm">{faculty.subject}</span>
                  </div>
                </div>
                <Link href={`/teachers`} className="inline-block mt-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
