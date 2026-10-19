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
  IconChevronDown, IconClock, IconAward, IconList,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (s <= 0) return '—';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

function formatTotal(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60);
  if (m < 60) return `~${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `~${h}h` : `~${h}h ${rem}m`;
}

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
      <div className="max-w-[1200px] mx-auto px-4 py-8 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 lg:p-12 text-center text-white shadow-xl">
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-amber-300/20 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <IconShield size={28} className="text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">
              Classroom locked
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight lg:text-3xl">
              Enroll to start learning
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-indigo-100">
              <b className="text-white">{course.title}</b> ki saari lectures, notes aur
              practice material unlock karne ke liye enroll karo.
              {Number(course.price || 0) === 0 ? ' Ye course bilkul FREE hai.' : ''}
            </p>
            <Link
              href={`/app/courses/${course.id}`}
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-black text-indigo-700 shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
            >
              <IconBookOpen size={16} />
              {Number(course.price || 0) === 0 ? 'Enroll FREE Now' : 'View Course & Enroll'}
            </Link>
          </div>
        </div>
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

  // Flat lecture list with global numbering + chapter context
  let counter = 0;
  const allLectures: any[] = [];
  const chaptersMeta = hierarchy.flatMap((s: any) =>
    s.chapters.map((c: any) => {
      const start = counter + 1;
      counter += c.lectures.length;
      c.lectures.forEach((l: any) => {
        allLectures.push({ ...l, chapterTitle: c.title, subjectName: s.name, number: allLectures.length + 1 });
      });
      return { ...c, subjectName: s.name, start, end: counter };
    })
  );

  const totalLectures = allLectures.length;
  const completedLectures = allLectures.filter((l: any) => l.progress?.isCompleted).length;
  const progressPct = totalLectures === 0 ? 0 : Math.round((completedLectures / totalLectures) * 100);
  const totalSeconds = allLectures.reduce((sum: number, l: any) => sum + Number(l.durationSeconds || 0), 0);

  // Honest empty state — no lectures published yet
  if (totalLectures === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8 pb-24">
        <Link
          href={`/app/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <IconArrowLeft size={13} />
          Back to course
        </Link>
        <div className="mt-4">
          <StudentEmptyState
            icon={<IconBookOpen size={26} />}
            title="Lectures coming soon"
            description={`"${course.title}" ka content abhi taiyaar ho raha hai. Jaise hi pehli lecture publish hogi, ye classroom live ho jayega — thoda intezaar karo!`}
            variant="large"
          />
        </div>
      </div>
    );
  }

  const requestedId = searchParams?.lecture;
  const requested = requestedId ? allLectures.find((l: any) => l.id === requestedId) : null;
  const effectiveLecture =
    requested ?? allLectures.find((l: any) => !l.progress?.isCompleted) ?? allLectures[0];

  const selectedIndex = allLectures.findIndex((l: any) => l.id === effectiveLecture.id);
  const prevLecture = selectedIndex > 0 ? allLectures[selectedIndex - 1] : null;
  const nextLecture =
    selectedIndex >= 0 && selectedIndex < allLectures.length - 1
      ? allLectures[selectedIndex + 1]
      : null;

  const lectureHref = (id: string) => `/app/learn/${course.id}?lecture=${id}`;

  return (
    <div className="min-h-screen">
      <style>{`
        .learn-acc summary::-webkit-details-marker { display: none; }
        .learn-acc summary { list-style: none; cursor: pointer; }
        .learn-acc .learn-chev { transition: transform .2s ease; }
        .learn-acc[open] .learn-chev { transform: rotate(180deg); }
      `}</style>

      {/* ── Sticky classroom top bar ─────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-indigo-100/70 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1280px] px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/app/courses/${course.id}`}
              aria-label="Back to course"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
            >
              <IconArrowLeft size={16} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-black text-gray-900">{course.title}</h1>
              <p className="text-[11px] font-medium text-gray-500">
                {completedLectures}/{totalLectures} lectures · {progressPct}% complete
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5">
              <IconAward size={14} className="text-indigo-600" />
              <span className="text-[11px] font-bold text-indigo-700">{progressPct}%</span>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-5 pb-24">
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
          {/* ── Player column ─────────────────────────── */}
          <main className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <LecturePlayer
                courseId={course.id}
                lecture={{
                  id: effectiveLecture.id,
                  title: effectiveLecture.title,
                  description: effectiveLecture.description,
                  videoUrl: effectiveLecture.videoUrl,
                  durationSeconds: Number(effectiveLecture.durationSeconds || 0),
                  isCompleted: !!effectiveLecture.progress?.isCompleted,
                  positionSeconds: Number(effectiveLecture.progress?.positionSeconds || 0),
                }}
                prevLectureId={prevLecture?.id ?? null}
                nextLectureId={nextLecture?.id ?? null}
                nextLectureTitle={nextLecture?.title ?? null}
              />
            </div>

            {/* Lecture context card */}
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
                  Lecture {effectiveLecture.number}
                </span>
                {effectiveLecture.chapterTitle && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600">
                    {effectiveLecture.chapterTitle}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500">
                  <IconClock size={12} />
                  {formatDuration(effectiveLecture.durationSeconds)}
                </span>
              </div>
              {effectiveLecture.description ? (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{effectiveLecture.description}</p>
              ) : (
                <p className="mt-3 text-sm text-gray-400">
                  Is lecture ka description jald add hoga.
                </p>
              )}
            </div>

            {/* Up next */}
            {nextLecture && (
              <Link
                href={lectureHref(nextLecture.id)}
                className="group mt-4 flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow">
                  <IconPlay size={18} className="ml-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">
                    Up next · Lecture {nextLecture.number}
                  </p>
                  <p className="truncate text-sm font-bold text-gray-900 group-hover:text-indigo-700">
                    {nextLecture.title}
                  </p>
                  <p className="text-[11px] text-gray-500">{formatDuration(nextLecture.durationSeconds)}</p>
                </div>
                <IconArrowLeft size={16} className="rotate-180 text-indigo-400 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </main>

          {/* ── Curriculum sidebar ─────────────────────────── */}
          <aside className="min-w-0 lg:sticky lg:top-32">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <IconList size={16} />
                  <h2 className="text-sm font-black tracking-tight">Course Content</h2>
                </div>
                <p className="mt-1 text-[11px] font-medium text-indigo-100">
                  {totalLectures} lectures · {formatTotal(totalSeconds)} · {completedLectures} done
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-3 custom-scrollbar">
                {hierarchy.map((subject: any) => (
                  <div key={subject.id} className="mb-4 last:mb-1">
                    <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                      {subject.name}
                    </p>
                    <div className="space-y-2">
                      {chaptersMeta
                        .filter((c: any) => c.subjectName === subject.name)
                        .map((chapter: any) => {
                          const done = chapter.lectures.filter((l: any) => l.progress?.isCompleted).length;
                          const isOpen = chapter.lectures.some((l: any) => l.id === effectiveLecture.id);
                          return (
                            <details key={chapter.id} open={isOpen} className="learn-acc group rounded-xl border border-gray-100 bg-gray-50/60">
                              <summary className="flex items-center gap-2 px-3 py-2.5">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-black text-indigo-700 shadow-sm">
                                  {chapter.start}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[12.5px] font-bold text-gray-800">
                                    {chapter.title}
                                  </span>
                                  <span className="block text-[10.5px] font-medium text-gray-400">
                                    {done}/{chapter.lectures.length} completed
                                  </span>
                                </span>
                                <IconChevronDown size={15} className="learn-chev shrink-0 text-gray-400" />
                              </summary>
                              <div className="space-y-1 px-2 pb-2">
                                {chapter.lectures.map((lecture: any) => {
                                  const lec = allLectures.find((l: any) => l.id === lecture.id) ?? lecture;
                                  const isActive = lec.id === effectiveLecture.id;
                                  const isDone = !!lec.progress?.isCompleted;
                                  return (
                                    <Link
                                      key={lec.id}
                                      href={lectureHref(lec.id)}
                                      className={`flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors ${
                                        isActive
                                          ? 'bg-indigo-600 text-white shadow'
                                          : 'text-gray-700 hover:bg-white'
                                      }`}
                                    >
                                      <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                          isActive
                                            ? 'bg-white/20 text-white'
                                            : isDone
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : 'bg-indigo-50 text-indigo-600'
                                        }`}
                                      >
                                        {isDone && !isActive ? (
                                          <IconCheckCircle size={15} />
                                        ) : (
                                          <IconPlay size={13} className="ml-px" />
                                        )}
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className={`block truncate text-[12px] font-semibold ${isActive ? 'text-white' : ''}`}>
                                          <span className={`mr-1.5 font-black ${isActive ? 'text-indigo-200' : 'text-gray-300'}`}>
                                            {lec.number}.
                                          </span>
                                          {lec.title}
                                        </span>
                                        <span className={`block text-[10.5px] ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                                          {formatDuration(lec.durationSeconds)}
                                          {isDone && !isActive ? ' · Done' : ''}
                                        </span>
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </details>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
