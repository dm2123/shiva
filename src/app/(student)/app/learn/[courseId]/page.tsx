import {
  findCourseByIdDb, findCourseBySlugDb, listSubjectsByCourseDb, listChaptersBySubjectDb,
  listLecturesByChapterDb, getLectureProgressDb, isStudentEnrolledInCourseDb,
} from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import LecturePlayer from '@/components/student/LecturePlayer';
import {
  IconArrowLeft, IconBookOpen, IconPlay, IconCheckCircle, IconShield,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function ClassroomPage({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams: { lecture?: string };
}) {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;
  const userId = session.userId;

  const course =
    (await findCourseByIdDb(params.courseId)) ||
    (await findCourseBySlugDb(params.courseId));
  if (!course) {
    notFound();
  }

  const isEnrolled = await isStudentEnrolledInCourseDb(userId, course.id);

  if (!isEnrolled) {
    return (
      <div className="student-card p-8 lg:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
          <IconShield size={22} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-[var(--student-text)]">Enrollment Required</h2>
        <p className="text-sm text-[var(--student-text-muted)] max-w-md mt-2">
          You need to enroll in <b>{course.title}</b> before accessing this classroom.
        </p>
        <Link
          href={`/app/courses/${course.id}`}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Enroll Now
        </Link>
      </div>
    );
  }

  const subjects = await listSubjectsByCourseDb(course.id);

  const hierarchy = await Promise.all((subjects as any[]).map(async (subject: any) => {
    const chapters = await listChaptersBySubjectDb(subject.id);
    const chaptersWithLectures = await Promise.all(chapters.map(async (chapter: any) => {
      const lectures = await listLecturesByChapterDb(chapter.id);
      const lecturesWithProgress = await Promise.all(lectures.map(async (lecture: any) => {
        const progress = await getLectureProgressDb(userId, lecture.id);
        return { ...lecture, progress };
      }));
      return { ...chapter, lectures: lecturesWithProgress };
    }));
    return { ...subject, chapters: chaptersWithLectures };
  }));

  const allLectures = hierarchy.flatMap((s: any) =>
    s.chapters.flatMap((c: any) => c.lectures as any[])
  );

  const selectedLectureId = searchParams?.lecture;
  const selectedLecture = selectedLectureId
    ? allLectures.find((l: any) => l.id === selectedLectureId)
    : null;

  const selectedIndex = selectedLecture ? allLectures.findIndex((l: any) => l.id === selectedLecture.id) : -1;
  const prevLecture = selectedIndex > 0 ? allLectures[selectedIndex - 1] : null;
  const nextLecture = selectedIndex >= 0 && selectedIndex < allLectures.length - 1 ? allLectures[selectedIndex + 1] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-10rem)]">
      <aside className="w-full lg:w-96 flex-shrink-0 student-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[var(--student-border-light)]">
          <Link
            href="/app/courses"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--student-primary)] hover:text-[var(--student-primary-hover)] uppercase tracking-widest mb-2 transition-colors"
          >
            <IconArrowLeft size={12} />
            Back to Courses
          </Link>
          <h2 className="text-sm font-bold text-[var(--student-text)] line-clamp-2 leading-snug">
            {course.title}
          </h2>
          <p className="text-[11px] text-[var(--student-text-faint)] mt-1">
            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} · {allLectures.length} lectures
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {hierarchy.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4">
              <IconBookOpen size={28} className="text-[var(--student-text-faint)] mb-3" />
              <p className="text-xs text-[var(--student-text-muted)] font-medium">No content found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hierarchy.map((subject) => (
                <div key={subject.id}>
                  <h4 className="text-[11px] font-bold text-[var(--student-text-faint)] uppercase tracking-wider mb-2 px-2">{subject.name}</h4>
                  <div className="space-y-1">
                    {subject.chapters.map((chapter: any) => (
                      <div key={chapter.id} className="bg-[var(--student-surface)] rounded-xl border border-[var(--student-border-light)] p-2">
                        <p className="text-[12px] font-semibold text-[var(--student-text)] px-2 mb-2">{chapter.title}</p>
                        <div className="space-y-0.5">
                          {chapter.lectures.map((lecture: any) => (
                            <Link
                              key={lecture.id}
                              href={`/app/learn/${course.id}?lecture=${lecture.id}`}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[12px] ${lecture.id === selectedLectureId ? 'bg-[var(--student-primary-light)] text-[var(--student-primary)]' : lecture.progress?.isCompleted ? 'text-[var(--student-primary)]' : 'text-[var(--student-text-secondary)]'} hover:bg-[var(--student-surface-hover)] transition-colors`}
                            >
                              <IconPlay size={12} className="flex-shrink-0" />
                              <span className="flex-1 truncate">{lecture.title}</span>
                              {lecture.progress?.isCompleted && <IconCheckCircle size={12} />}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 student-card p-6 lg:p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
        {selectedLecture ? (
          <LecturePlayer
            courseId={course.id}
            lecture={{
              id: selectedLecture.id,
              title: selectedLecture.title,
              description: selectedLecture.description,
              videoUrl: selectedLecture.videoUrl,
              durationSeconds: Number(selectedLecture.durationSeconds || 0),
              isCompleted: !!selectedLecture.progress?.isCompleted,
              positionSeconds: Number(selectedLecture.progress?.positionSeconds || 0),
            }}
            prevLectureId={prevLecture?.id ?? null}
            nextLectureId={nextLecture?.id ?? null}
          />
        ) : (
          <StudentEmptyState
            icon={<IconPlay size={24} />}
            title="Select a Lecture"
            description={`Choose a lecture from the syllabus panel to start learning in "${course.title}".`}
            variant="large"
          />
        )}
      </main>
    </div>
  );
}