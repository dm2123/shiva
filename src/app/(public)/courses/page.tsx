import { listPublicCourses } from '@/services/academic.service';
import Link from 'next/link';

export const revalidate = 0;

export const metadata = {
  title: 'All Courses — THE SHIVA',
  description: 'Browse all published courses for SSC, Railway, Banking, Defence, and Teaching exam preparation.',
};

export default async function PublicCoursesPage() {
  const courses = await listPublicCourses();

  return (
    <div className="min-h-screen relative py-24 px-6 overflow-hidden shiva-liquid-hero">
      {/* Background blobs */}
      <div className="shiva-blob w-[600px] h-[600px] bg-violet-600 top-[-100px] left-[-150px]" aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[500px] h-[500px] bg-blue-500 top-[40%] right-[-100px]" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="shiva-capsule shiva-capsule-violet">Course Catalog</span>
          <h1 className="text-shiva-section text-white">
            All Published<br />
            <span className="text-shiva-gold">Courses</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Explore our full catalog of structured competitive exam courses — SSC, Railway, Banking, Defence, and Teaching — with verified educator partners.
          </p>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="shiva-glass rounded-3xl p-16 text-center space-y-4">
            <div className="text-6xl opacity-30">📚</div>
            <h3 className="text-xl font-bold text-white">No courses published yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Courses are being prepared and will be published soon. Check back later or{' '}
              <Link href="/register" className="text-[#c8a96e] hover:underline font-semibold">register now</Link>{' '}
              to get notified when new courses launch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="shiva-course-card group cursor-pointer">
                {/* Card header */}
                <div className="h-40 bg-gradient-to-br from-violet-900/60 to-violet-600/30 p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 text-7xl opacity-20 select-none" aria-hidden="true">📖</div>
                  <span className="shiva-capsule shiva-capsule-violet self-start">
                    {course.price > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free'}
                  </span>
                  <div className="text-5xl">📖</div>
                </div>

                {/* Card body */}
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#c8a96e] transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  {course.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="shiva-capsule" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>
                      {course.status}
                    </span>
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-1 text-xs font-bold text-[#c8a96e] hover:text-[#e8d5a3] flex items-center gap-1 group/link"
                  >
                    View Course
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
