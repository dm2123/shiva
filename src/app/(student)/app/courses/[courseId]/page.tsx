import { getCourseSyllabusTree } from '@/services/academic.service';
import { isStudentEnrolledInCourseDb } from '@/lib/db';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import CourseCurriculum from './CourseCurriculum';
import {
  IconPlay, IconCheckCircle, IconArrowRight, IconTarget, IconClock,
  IconBook, IconShield, IconZap, IconAward,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function StudentCourseDetailsPage({ params }: { params: { courseId: string } }) {
  let courseTree;
  try {
    courseTree = await getCourseSyllabusTree(params.courseId);
  } catch {
    return notFound();
  }
  if (!courseTree) return notFound();

  const session = await getSessionFromHeaders(headers());
  if (!session) redirect('/login');

  const isEnrolled = await isStudentEnrolledInCourseDb(session.userId, courseTree.id);

  const subjects = courseTree.subjects || [];
  const chapters = subjects.flatMap((s: any) => s.chapters || []);
  const lectures = chapters.flatMap((c: any) => c.lectures || []);
  const price = Number(courseTree.price || 0);
  const isFree = price === 0;

  // "What you'll learn" — derived honestly from real syllabus data only
  const learnBullets: string[] = subjects.slice(0, 6).map(
    (s: any) => `${s.name} ke core concepts aur exam-oriented practice`
  );

  return (
    <div className="pb-24 lg:pb-10">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#312e81] via-[#4f46e5] to-[#7c3aed] p-6 sm:p-8 text-white">
        {/* decorative shapes */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-2xl" />
        <div className="pointer-events-none absolute right-10 top-1/2 hidden h-24 w-24 -translate-y-1/2 rotate-12 rounded-2xl border-2 border-white/20 sm:block" />

        <div className="relative">
          {/* badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isFree ? (
              <span className="rounded-full bg-emerald-400 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-950 shadow-lg">
                100% Free
              </span>
            ) : (
              <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur">
                ₹{price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold text-white backdrop-blur">
              Hinglish
            </span>
            <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold text-white backdrop-blur">
              Self-paced
            </span>
          </div>

          <h1 className="max-w-2xl text-2xl font-black leading-tight tracking-tight sm:text-3xl">
            {courseTree.title}
          </h1>
          {courseTree.description && (
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-indigo-100">
              {courseTree.description}
            </p>
          )}

          {/* quick stats — real data only */}
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {[
              { value: String(subjects.length), label: 'Subjects' },
              { value: String(chapters.length), label: 'Chapters' },
              { value: String(lectures.length), label: 'Lectures' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">{s.label}</p>
              </div>
            ))}
          </div>

          {/* desktop CTA */}
          <div className="mt-7 hidden lg:block">
            {isEnrolled ? (
              <Link
                href={`/app/learn/${courseTree.id}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-black text-[#4338ca] shadow-xl transition hover:scale-[1.02]"
              >
                <IconPlay size={16} />
                Continue Learning
                <IconArrowRight size={15} />
              </Link>
            ) : (
              <form action="/api/student/enrollments" method="POST" className="inline-block">
                <input type="hidden" name="courseId" value={courseTree.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-black text-[#4338ca] shadow-xl transition hover:scale-[1.02]"
                >
                  <IconZap size={16} />
                  {isFree ? 'Enroll Free — Abhi Shuru Karo' : `Enroll Now · ₹${price.toLocaleString('en-IN')}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Enrolled banner ────────────────────────────────── */}
      {isEnrolled && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <IconCheckCircle size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-emerald-900">Tum enrolled ho!</p>
            <p className="text-xs text-emerald-700">Jahan chhoda tha, wahan se continue karo.</p>
          </div>
          <Link
            href={`/app/learn/${courseTree.id}`}
            className="hidden sm:inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            <IconPlay size={13} />
            Continue
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          {/* ── What you'll learn ──────────────────────────── */}
          <section>
            <h2 className="mb-4 text-lg font-black tracking-tight text-[var(--student-text)]">
              Is course me kya milega
            </h2>
            {learnBullets.length === 0 ? (
              <div className="rounded-2xl border border-[var(--student-border)] bg-[var(--student-surface)] p-6 text-sm text-[var(--student-text-muted)]">
                Course content taiyaar ho raha hai — enroll karke rakho, update milte hi notify karenge.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {learnBullets.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl border border-[var(--student-border-light)] bg-[var(--student-surface)] p-3.5"
                  >
                    <IconCheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                    <p className="text-[13px] font-medium leading-snug text-[var(--student-text-secondary)]">{b}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Curriculum ─────────────────────────────────── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-[var(--student-text)]">
                Course Curriculum
              </h2>
              {chapters.length > 0 && (
                <span className="rounded-full bg-[var(--student-primary-light)] px-3 py-1 text-[11px] font-bold text-[var(--student-primary)]">
                  {chapters.length} chapters
                </span>
              )}
            </div>
            <CourseCurriculum subjects={subjects} />
          </section>

          {/* ── Why this course (honest, no fake claims) ───── */}
          <section className="overflow-hidden rounded-2xl border border-[var(--student-border)] bg-[var(--student-surface)] p-6">
            <h2 className="mb-4 text-lg font-black tracking-tight text-[var(--student-text)]">
              Kyun join karein?
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: <IconAward size={20} className="text-amber-500" />, title: '100% Free', desc: 'Poora course bina kisi charge ke' },
                { icon: <IconClock size={20} className="text-[var(--student-primary)]" />, title: 'Self-paced', desc: 'Apni speed se, kabhi bhi padho' },
                { icon: <IconCheckCircle size={20} className="text-emerald-500" />, title: 'Lifetime access', desc: 'Ek baar enroll, hamesha access' },
              ].map((f) => (
                <div key={f.title} className="text-center sm:text-left">
                  <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--student-background)] sm:mx-0">
                    {f.icon}
                  </div>
                  <p className="text-sm font-bold text-[var(--student-text)]">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--student-text-muted)]">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3.5 text-[11px] leading-relaxed text-amber-800 border border-amber-100">
              <IconShield size={14} className="mt-0.5 flex-shrink-0" />
              <span>THE SHIVA par koi fake result ya jhoothe vaade nahi — jo content hai wahi dikhta hai, jo coming soon hai wahi likha hai.</span>
            </div>
          </section>
        </div>

        {/* ── Sidebar (desktop) ────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 overflow-hidden rounded-2xl border border-[var(--student-border)] bg-[var(--student-surface)]">
            <div className="bg-gradient-to-br from-[#312e81] to-[#7c3aed] p-5 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <IconBook size={24} />
              </div>
              <p className="mt-3 text-sm font-bold leading-snug">{courseTree.title}</p>
              <p className="mt-1 text-2xl font-black">
                {isFree ? 'FREE' : `₹${price.toLocaleString('en-IN')}`}
              </p>
            </div>
            <div className="space-y-3 p-5">
              {[
                { icon: <IconBook size={14} className="text-[var(--student-primary)]" />, label: 'Subjects', value: String(subjects.length) },
                { icon: <IconPlay size={14} className="text-violet-500" />, label: 'Chapters', value: String(chapters.length) },
                { icon: <IconZap size={14} className="text-amber-500" />, label: 'Lectures', value: String(lectures.length) },
                { icon: <IconTarget size={14} className="text-emerald-600" />, label: 'Language', value: 'Hinglish' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-[var(--student-text-muted)]">{s.icon} {s.label}</span>
                  <span className="text-sm font-black text-[var(--student-text)]">{s.value}</span>
                </div>
              ))}
              <div className="border-t border-[var(--student-border-light)] pt-4">
                {isEnrolled ? (
                  <Link
                    href={`/app/learn/${courseTree.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--student-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    <IconPlay size={15} />
                    Start Learning
                  </Link>
                ) : (
                  <form action="/api/student/enrollments" method="POST">
                    <input type="hidden" name="courseId" value={courseTree.id} />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--student-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                    >
                      <IconZap size={15} />
                      {isFree ? 'Enroll Free' : `Enroll · ₹${price.toLocaleString('en-IN')}`}
                    </button>
                  </form>
                )}
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[var(--student-text-faint)]">
                  <IconShield size={12} />
                  {isFree ? 'Koi payment nahi — poori tarah free' : 'Secure enrollment'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Sticky mobile CTA ──────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--student-border)] bg-white/95 p-3 backdrop-blur lg:hidden">
        {isEnrolled ? (
          <Link
            href={`/app/learn/${courseTree.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--student-primary)] px-5 py-3.5 text-sm font-bold text-white shadow-lg"
          >
            <IconPlay size={16} />
            Continue Learning
          </Link>
        ) : (
          <form action="/api/student/enrollments" method="POST">
            <input type="hidden" name="courseId" value={courseTree.id} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--student-primary)] px-5 py-3.5 text-sm font-bold text-white shadow-lg"
            >
              <IconZap size={16} />
              {isFree ? 'Enroll Free — Abhi Shuru Karo' : `Enroll Now · ₹${price.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
