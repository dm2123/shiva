import Link from 'next/link';
import { listPublicCourses } from '@/services/academic.service';

const gradients = [
  'from-violet-900/60 to-violet-600/30',
  'from-teal-900/60 to-teal-600/30',
  'from-blue-900/60 to-blue-600/30',
  'from-amber-900/60 to-amber-600/30',
  'from-rose-900/60 to-rose-600/30',
  'from-purple-900/60 to-purple-600/30',
];

const tags = ['SSC', 'Railway', 'Banking', 'Teaching', 'CSAT', 'Foundation'];

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
              Courses built for top results.
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#c8a96e] hover:text-[#e8d5a3] transition-colors group self-start md:self-end"
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
                  <span
                    className="exam-capsule-badge self-start"
                    style={{
                      background: '#c8a96e20',
                      color: '#c8a96e',
                      borderColor: '#c8a96e50',
                    }}
                  >
                    {tags[i % tags.length]}
                  </span>
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