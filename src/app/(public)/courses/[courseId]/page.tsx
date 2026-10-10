import { getCourseSyllabusTree } from '@/services/academic.service';
import { getEducatorById } from '@/services/educator.service';
import EmptyState from '@/components/ui/EmptyState';
import CourseInstructorCard from '@/components/brand/CourseInstructorCard';
import { notFound } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { mysqlPool } from '@/lib/db';

export const revalidate = 0;

export default async function PublicCourseDetailPage({ params }: { params: { courseId: string } }) {
  let courseTree;
  try {
    courseTree = await getCourseSyllabusTree(params.courseId);
  } catch (err) {
    notFound();
  }

  if (!courseTree.isPublished) {
    notFound();
  }

  // Fetch educator if course has one
  let educator = null;
  if (courseTree.educatorId) {
    educator = await getEducatorById(courseTree.educatorId);
  }

  const session = await getSessionFromHeaders(headers()).catch(() => null);
  let isEnrolled = false;
  if (session?.role === 'STUDENT') {
    const [rows]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS c FROM StudentEnrollments WHERE studentId = ? AND courseId = ? AND status = ?',
      [session.userId, courseTree.id, 'ACTIVE']
    );
    isEnrolled = Number(rows?.[0]?.c || 0) > 0;
  }

  const ctaHref = !session
    ? '/register'
    : session.role === 'STUDENT' && isEnrolled
      ? `/app/learn/${courseTree.slug || courseTree.id}`
      : session.role === 'STUDENT'
        ? `/app/courses/${courseTree.slug || courseTree.id}`
        : session.role === 'TEACHER'
          ? '/teacher'
          : '/admin';
  const ctaLabel = !session
    ? 'Enroll Now'
    : session.role === 'STUDENT' && isEnrolled
      ? 'Continue Learning'
      : 'Login & Enroll';

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-2xl shadow-md border border-slate-800">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full mb-3">
              THE SHIVA COURSE
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">{courseTree.title}</h1>
            <p className="text-slate-300 text-sm leading-relaxed">{courseTree.description}</p>
          </div>

          {/* Batch Information Section */}
          {courseTree.batches.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Active & Upcoming Batches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseTree.batches.map((batch) => (
                  <div key={batch.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-sm text-slate-800">{batch.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Starts: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'Immediate'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Syllabus Tree */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Course Syllabus Breakdown</h2>

            {courseTree.subjects.length === 0 ? (
              <EmptyState
                title="Syllabus structure initializing"
                description="Subjects and chapters for this course are currently being published by platform educators."
              />
            ) : (
              <div className="space-y-6">
                {courseTree.subjects.map((subject) => (
                  <div key={subject.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                      <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
                        <span className="text-indigo-400 font-mono text-xs">[{subject.code || 'SUB'}]</span>
                        {subject.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {subject.chapters.length} {subject.chapters.length === 1 ? 'Chapter' : 'Chapters'}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 space-y-4">
                      {subject.chapters.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-2">No chapters published yet under this subject.</p>
                      ) : (
                        subject.chapters.map((chapter) => (
                          <div key={chapter.id} className="bg-white p-4 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-sm text-slate-900 mb-2">{chapter.title}</h4>
                            {chapter.description && (
                              <p className="text-xs text-slate-600 mb-3">{chapter.description}</p>
                            )}

                            <div className="space-y-2 pl-4 border-l-2 border-indigo-200">
                              {chapter.lectures.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic">No lectures listed yet.</p>
                              ) : (
                                chapter.lectures.map((lecture) => (
                                  <div key={lecture.id} className="flex justify-between items-center text-xs py-1">
                                    <span className="text-slate-700 font-medium flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                      {lecture.title}
                                    </span>
                                    {lecture.isPreviewable && (
                                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                        FREE PREVIEW
                                      </span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-lg sticky top-24">
            <span className="text-xs text-indigo-200 font-medium uppercase tracking-wider block mb-1">
              Course Fee
            </span>
            <span className="text-4xl font-extrabold block mb-6">
              {courseTree.price > 0 ? `₹${courseTree.price.toLocaleString('en-IN')}` : 'Free'}
            </span>
            <Link
              href={ctaHref}
              className="block w-full py-3 px-4 bg-white text-indigo-600 hover:bg-indigo-50 text-sm font-bold rounded-lg transition text-center shadow-lg"
            >
              {ctaLabel}
            </Link>
            <p className="text-xs text-indigo-200 mt-4 text-center">
              {session?.role === 'STUDENT' && isEnrolled
                ? 'You are enrolled — pick up where you left off.'
                : 'Join 500+ students learning on THE SHIVA'}
            </p>
          </div>

          {/* Educator Card */}
          {educator && (
            <CourseInstructorCard 
              educator={educator} 
              variant="compact" 
              showSocials={true}
            />
          )}

          {/* Platform Badge */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900 block mb-1">🏆 THE SHIVA Quality</strong>
              All courses on THE SHIVA are vetted for quality, taught by verified educators, and backed by our learning guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
