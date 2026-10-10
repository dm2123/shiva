import Link from 'next/link';
import {
  mysqlPool,
} from '@/lib/db';

export const revalidate = 0;

export const metadata = {
  title: 'Batches — THE SHIVA',
  description: 'Join organized batches for structured group learning with live classes and peer interaction.',
};

async function getAllBatches() {
  try {
    const [rows]: any = await mysqlPool.query(`
      SELECT b.id, b.name, b.startDate, b.endDate, b.status,
             c.title as courseTitle, c.slug as courseSlug,
             tp.name as teacherName
      FROM Batches b
      LEFT JOIN Courses c ON b.courseId = c.id
      LEFT JOIN TeacherProfiles tp ON b.teacherId = tp.id
      ORDER BY b.startDate ASC
    `);
    return rows || [];
  } catch {
    return [];
  }
}

export default async function PublicBatchesPage() {
  const batches = await getAllBatches();

  return (
    <div className="min-h-screen relative py-24 px-6 overflow-hidden shiva-liquid-hero shiva-grid">
      <div className="shiva-blob w-[600px] h-[600px] bg-violet-600 top-[10%] left-[-150px]" aria-hidden="true" />
      <div className="shiva-blob shiva-blob-2 w-[500px] h-[500px] bg-blue-500 bottom-[10%] right-[-100px]" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="shiva-capsule shiva-capsule-violet">Organized Learning</span>
          <h1 className="text-shiva-section text-white">
            Join a<br />
            <span className="text-shiva-gold">structured batch</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            Learn alongside peers in organized batches with scheduled live classes, shared assignments, and group progress tracking.
          </p>
        </div>

        {batches.length === 0 ? (
          <div className="shiva-glass rounded-3xl p-12 max-w-2xl mx-auto text-center space-y-5">
            <h2 className="text-xl font-bold text-white">No batches published yet</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Batch enrollment will open when administrators publish SSC, Railway, Banking, Defence, or Teaching batches. THE SHIVA does not show invented student counts.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-[#c8a96e] hover:bg-[#e8d5a3] text-[#0a0a12] font-bold text-sm rounded-full shadow-xl shadow-[#c8a96e]/20 hover:shadow-[#c8a96e]/40 transition-all hover:-translate-y-1"
            >
              Register Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch: any) => (
              <div
                key={batch.id}
                className="shiva-glass rounded-2xl p-6 border border-white/10 space-y-4 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    batch.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : batch.status === 'UPCOMING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {batch.status}
                  </span>
                  {batch.courseSlug && (
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">THE SHIVA</span>
                  )}
                </div>

                <h3 className="text-white font-bold text-base leading-snug">{batch.name}</h3>
                {batch.courseTitle && (
                  <p className="text-slate-400 text-xs">{batch.courseTitle}</p>
                )}
                {batch.teacherName && (
                  <p className="text-xs text-[#c8a96e]">Teacher: {batch.teacherName}</p>
                )}

                <div className="text-xs text-slate-500 space-y-0.5 mt-auto pt-3 border-t border-white/10">
                  {batch.startDate && (
                    <p>Start: {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  )}
                  {batch.endDate && (
                    <p>End: {new Date(batch.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  )}
                </div>

                {batch.courseSlug && (
                  <Link
                    href={`/courses/${batch.courseSlug}`}
                    className="text-xs font-bold text-[#c8a96e] hover:text-[#e8d5a3] flex items-center gap-1 group/link mt-1"
                  >
                    View Course
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}