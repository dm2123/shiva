import Link from 'next/link';
import { mysqlPool } from '@/lib/db';

async function getUpcomingBatches() {
  try {
    const [rows]: any = await mysqlPool.query(`
      SELECT b.id, b.name, b.startDate, b.endDate, b.status,
             c.title as courseTitle, c.slug as courseSlug,
             tp.name as teacherName
      FROM Batches b
      LEFT JOIN Courses c ON b.courseId = c.id
      LEFT JOIN TeacherProfiles tp ON b.teacherId = tp.id
      WHERE b.status IN ('UPCOMING', 'ACTIVE')
      ORDER BY b.startDate ASC
      LIMIT 6
    `);
    return rows || [];
  } catch {
    return [];
  }
}

export default async function MarketingBatches() {
  const batches = await getUpcomingBatches();

  if (!batches || batches.length === 0) {
    return (
      <section className="marketing-section-xs relative">
        <div className="marketing-container-narrow">
          <div className="shiva-glass rounded-2xl px-6 py-8 md:px-10 md:py-10 text-center space-y-4 border border-white/10">
            <span className="section-eyebrow inline-block">Batches</span>
            <h2 className="text-xl md:text-2xl font-bold text-white">Upcoming Batches</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              No live batches are published yet. Join THE SHIVA to get notified when enrollment opens.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="marketing-section-xs relative">
      <div className="marketing-container">
        <div className="text-center mb-8 space-y-2">
          <span className="section-eyebrow inline-block">Batches</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Upcoming Batches</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch: any) => (
            <div
              key={batch.id}
              className="shiva-glass rounded-2xl p-5 border border-white/10 space-y-3 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  batch.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {batch.status}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm leading-snug">{batch.name}</h3>
              {batch.courseTitle && (
                <p className="text-slate-400 text-xs">{batch.courseTitle}</p>
              )}
              {batch.teacherName && (
                <p className="text-xs text-[#c8a96e]">Teacher: {batch.teacherName}</p>
              )}
              <div className="text-xs text-slate-500 space-y-0.5 mt-auto pt-2 border-t border-white/10">
                {batch.startDate && (
                  <p>Start: {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
                {batch.endDate && (
                  <p>End: {new Date(batch.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
