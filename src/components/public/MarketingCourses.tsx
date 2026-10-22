import Link from 'next/link';
import { listPublicCourses } from '@/services/academic.service';

// MARKETING-A design pass: sirf theme parivar (deep purple / violet / gold) —
// teal/blue/rose ke off-theme gradients hata diye gaye.
const gradients = [
  'from-violet-900/60 to-violet-600/30',
  'from-[#2a1650]/70 to-[#6d28d9]/30',
  'from-purple-900/60 to-purple-600/30',
  'from-[#3b2a10]/60 to-[#f5b942]/25',
  'from-violet-950/70 to-violet-500/25',
  'from-[#2a1650]/60 to-[#f5b942]/20',
];

// NOTE (audit): pehle yahan tags[i % length] se har course par cyclic nakli
// exam tag (SSC/Railway/...) lagta tha jo asal course se match nahi karta tha —
// fake data hone ke kaaran hata diya; ab badge sirf asal price se banta hai.

export default async function MarketingCourses() {
  const courses = await listPublicCourses();

  return (
    <section className="marketing-section relative overflow-hidden">
      <div className="shiva-liquid-section absolute inset-0" aria-hidden="true" />

      <div className="marketing-container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="section-header text-left">
            <span className="section-eyebrow section-eyebrow-violet">Curriculum</span>
            <h2 className="section-title text-white">
              Structured courses for your exam goal.
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#b45309] hover:text-[#92400e] transition-colors group self-start md:self-end"
          >
            View all courses
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="shiva-glass rounded-3xl p-16 text-center space-y-4">
            <div className="text-6xl opacity-30">📚</div>
            <h3 className="text-xl font-bold text-white">No courses published yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Courses are being prepared by our faculty and will appear here when published.
            </p>
          </div>
        ) : (
          <div className="marketing-grid-3">
            {courses.map((course, i) => (
              <div key={course.id} className="curriculum-card group cursor-pointer">
                <div className={`curriculum-card-header bg-gradient-to-br ${gradients[i % gradients.length]}`}>
                  <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                    {course.price > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free'}
                  </p>
                </div>

                <div className="curriculum-card-content">
                  <h3 className="curriculum-card-title">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <span
                    className="curriculum-level-badge self-start"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {course.slug.includes('free') || course.price === 0 ? 'Free Access' : 'Complete Course'}
                  </span>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="curriculum-card-cta mt-auto"
                  >
                    View Course
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}