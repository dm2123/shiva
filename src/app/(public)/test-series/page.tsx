import Link from 'next/link';
import { listAllTests } from '@/services/test.service';
import { listPublicCourses } from '@/services/academic.service';
import { deriveExamCategory } from '@/components/public/CourseCard';
import TestSeriesPublic, {
  type PublicExamCategory,
  type PublicTestItem,
  type PublicTestKind,
} from '@/components/public/TestSeriesPublic';
import ShivaPromoCarousel from '@/components/public/ShivaPromoCarousel';
import type { Course, Test } from '@/types/models';

export const revalidate = 0;

export const metadata = {
  title: 'Test Series — THE SHIVA',
  description:
    'THE SHIVA Test Series — asal exam pattern par Mock Tests, PYQ aur Practice Tests. Timer, detailed analysis aur leaderboard ke saath apni taiyaari ko number me aanko.',
};

/* ------------------------------------------------------------------ */
/* Asal data — server par fetch hota hai (courses/page.tsx wala hi     */
/* pattern: service layer, koi API route nahi chhua gaya).             */
/*                                                                     */
/* Tests: listAllTests() saare tests laata hai — public page par       */
/* SIRF status === 'PUBLISHED' wale dikhte hain (DRAFT/ARCHIVED kabhi  */
/* nahi). Tests.type / Tests.category asal DB fields hain (service ka  */
/* zod schema aur ensure-test-schema dekh lo) — Test type me ye        */
/* declared nahi hain, isliye yahan safe optional access hai.          */
/*                                                                     */
/* Courses: listPublicCourses() sirf published courses laata hai —     */
/* test ka course naam/slug aur exam categories inhise bante hain.     */
/*                                                                     */
/* HONEST-DATA RULE: Tests ke paas koi price/pass/coupon field hai     */
/* hi nahi, isliye is page par koi Pass card, price ya offer nahi      */
/* hai. Sawalo ki sankhya (question count) Tests table me koi asal     */
/* field nahi hai — isliye woh bhi kahin nahi dikhta.                  */
/* ------------------------------------------------------------------ */

type TestRow = Test & {
  type?: string | null;
  category?: string | null;
};

async function getPublishedTests(): Promise<TestRow[]> {
  try {
    const all = (await listAllTests()) as TestRow[];
    return (all || []).filter((t) => (t.status || '').toUpperCase() === 'PUBLISHED');
  } catch {
    // DB uplabdh na ho to page crash nahi hoga — honest empty state dikhega.
    return [];
  }
}

async function getPublishedCourses(): Promise<Course[]> {
  try {
    return (await listPublicCourses()) || [];
  } catch {
    return [];
  }
}

/* Test ka prakar — asal Tests.type se; na ho to asal Tests.category
   text se; dono na hon to 'general' (category invent nahi hoti). */
function kindOf(test: TestRow): { kind: PublicTestKind; label: string } {
  const raw = String(test.type || test.category || '')
    .trim()
    .toLowerCase();
  if (raw.includes('pyq') || raw.includes('previous')) return { kind: 'pyq', label: 'PYQ Test' };
  if (raw.includes('practice') || raw.includes('dpp')) return { kind: 'practice', label: 'Practice Test' };
  if (raw.includes('mock')) return { kind: 'mock', label: 'Mock Test' };
  return { kind: 'general', label: 'Test' };
}

export default async function PublicTestSeriesPage() {
  const [tests, courses] = await Promise.all([getPublishedTests(), getPublishedCourses()]);

  const courseById = new Map<string, Course>(courses.map((c) => [c.id, c]));

  /* Public test items — sirf asal fields, serialized (client-safe) */
  const items: PublicTestItem[] = tests.map((t) => {
    const course = t.courseId ? courseById.get(t.courseId) : undefined;
    // Exam tag: pehle linked course se, na mile to test ke apne naam se.
    const exam =
      (course ? deriveExamCategory(course) : null) ??
      deriveExamCategory({ title: t.title, slug: '' });
    const { kind, label } = kindOf(t);
    const categoryText = typeof t.category === 'string' ? t.category.trim() : '';

    return {
      id: t.id,
      title: t.title,
      description: t.description?.trim() ? t.description : null,
      durationMinutes: Number(t.durationMinutes) || 0,
      totalMarks: Number(t.totalMarks) || 0,
      passingMarks:
        typeof t.passingMarks === 'number' && t.passingMarks > 0 ? t.passingMarks : null,
      kind,
      kindLabel: label,
      categoryLabel: categoryText ? categoryText : null,
      examId: exam?.id ?? null,
      examLabel: exam?.label ?? null,
      examIcon: exam?.icon ?? null,
      courseTitle: course?.title ?? null,
      courseSlug: course?.slug ?? null,
    };
  });

  /* Exam categories — asal published courses + published tests dono
     ke counts ke saath; jo category data me hai hi nahi, woh nahi dikhti. */
  const categoryMap = new Map<string, PublicExamCategory>();
  const addToCategory = (id: string, label: string, icon: string, field: 'testCount' | 'courseCount') => {
    const entry = categoryMap.get(id) ?? { id, label, icon, testCount: 0, courseCount: 0 };
    entry[field] += 1;
    categoryMap.set(id, entry);
  };
  for (const c of courses) {
    const cat = deriveExamCategory(c);
    if (cat) addToCategory(cat.id, cat.label, cat.icon, 'courseCount');
  }
  for (const item of items) {
    if (item.examId && item.examLabel && item.examIcon) {
      addToCategory(item.examId, item.examLabel, item.examIcon, 'testCount');
    }
  }
  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => b.testCount + b.courseCount - (a.testCount + a.courseCount),
  );

  const mockCount = items.filter((t) => t.kind === 'mock').length;
  const pyqCount = items.filter((t) => t.kind === 'pyq').length;
  const practiceCount = items.filter((t) => t.kind === 'practice').length;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero — safed page, halka pastel purple tint, bada H1 ── */}
      <section
        style={{ background: 'linear-gradient(180deg,#f5f3ff 0%,#ffffff 100%)' }}
        className="px-6 pb-14 pt-14"
      >
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-[13px] font-medium text-slate-400">
            <Link href="/" className="hover:text-[#6d28d9]">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="font-semibold text-slate-600" aria-current="page">
              Test Series
            </span>
          </nav>

          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-[#ede9fe] px-4 py-1.5 text-[13px] font-bold uppercase tracking-wider text-[#6d28d9]">
              Test Series · THE SHIVA
            </span>
            <h1 className="mt-5 text-[42px] font-black leading-[1.12] text-[#2a1650] md:text-[52px]">
              Taiyaari ko <span className="text-[#6d28d9]">Number</span> me Aanko
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 md:text-[17px]">
              SSC, Railway, Banking, Defence aur Teaching exams ke liye asal pattern par
              bane Mock Tests, PYQ aur Practice Tests — timer ke saath do, detailed
              analysis se sudharo, aur leaderboard par apni rank dekho.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-block rounded-full bg-[#111111] px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                Register Free →
              </Link>
              <Link
                href="/app/tests"
                className="inline-block rounded-full border-2 border-[#6d28d9] bg-white px-8 py-3.5 text-sm font-extrabold text-[#6d28d9] transition-all hover:-translate-y-0.5 hover:bg-[#f5f3ff]"
              >
                Tests Dekho
              </Link>
            </div>

            {/* Real counts — sirf asal published data se; data na ho to kuch nahi */}
            {items.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[13px] font-semibold">
                <span className="rounded-full border border-[#ede9fe] bg-white px-4 py-2 text-slate-600 shadow-sm">
                  Kul published tests: <span className="font-extrabold text-[#2a1650]">{items.length}</span>
                </span>
                {mockCount > 0 && (
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-[#6d28d9]">
                    Mock: {mockCount}
                  </span>
                )}
                {pyqCount > 0 && (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700">
                    PYQ: {pyqCount}
                  </span>
                )}
                {practiceCount > 0 && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700">
                    Practice: {practiceCount}
                  </span>
                )}
                {categories.length > 0 && (
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                    {categories.length} exam categories
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Promo carousel — hero ke baad, body sections se pehle ── */}
      <section className="px-6 pb-4 pt-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-[0_12px_32px_rgba(42,22,80,0.14)]">
          <ShivaPromoCarousel />
        </div>
      </section>

      {/* ── Body — quick links, categories, tests, why, FAQ ── */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <TestSeriesPublic tests={items} categories={categories} />
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-br from-[#2a1650] to-[#6d28d9] p-8 text-center md:p-12">
            <h2 className="text-2xl font-extrabold text-white md:text-[28px]">
              Aaj hi apna pehla test do
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-[15px]">
              Free register karo, apne exam ka course chuno aur pehle mock se apni asal
              sthiti jaano — bina andaze ke, pure data ke saath.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-block rounded-full bg-[#111111] px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-black"
              >
                Register Free →
              </Link>
              <Link
                href="/login"
                className="inline-block rounded-full border-2 border-white/60 px-8 py-3.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Login Karo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
