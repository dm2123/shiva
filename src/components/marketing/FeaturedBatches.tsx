import Link from 'next/link';
import type { Course } from '@/types/models';
import CourseCard from '@/components/public/CourseCard';
import SectionHead from './SectionHead';

/**
 * FeaturedBatches — index.html ke "Live & Upcoming Batches" section
 * ka JSX roop, lekin cards HARDCODED NAHI hain: page.tsx server par
 * `listPublicCourses()` se asal published courses laata hai aur yahan
 * maujooda CourseCard (PW anatomy: banner → exam line → title →
 * audience → price + kaala CTA) se render hote hain.
 * HTML me jo do "Coming Soon" hardcoded batch cards the, woh asal
 * DB courses nahi the — isliye yahan sirf asal published courses
 * dikhte hain, koi nakli course/price invent nahi hota.
 */
export default function FeaturedBatches({ courses }: { courses: Course[] }) {
  return (
    <div className="border-y border-[#f3f0ff] bg-white py-[60px]">
      <div className="mx-auto w-full max-w-[1140px] px-5">
        <SectionHead kick="Batches" title="Live & Upcoming Batches">
          <p>
            {courses.length > 0
              ? `${courses.length} published courses live hain — seedha asal catalog se, apne exam ke hisaab se chuno`
              : 'Naye courses taiyaar ho rahe hain — launch ki khabar sabse pehle pao'}
          </p>
        </SectionHead>

        {courses.length === 0 ? (
          <div className="mx-auto max-w-[560px] rounded-[20px] border-[1.5px] border-[#ede9fe] bg-white p-10 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]">
            <h3 className="mb-2 text-[20px] font-extrabold text-[#2a1650]">Courses jald aa rahe hain</h3>
            <p className="mb-5 text-[15px] leading-relaxed text-[#6b7280]">
              Hum naye courses taiyaar kar rahe hain. Free me register karo aur sabse pehle khabar
              pao jab naye courses launch hon.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-full border-2 border-[#111827] bg-[#111827] px-6 py-3 text-sm font-bold shadow-[0_8px_20px_rgba(17,24,39,0.22)] transition hover:bg-black"
            >
              <span className="text-white">Register Free →</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <p className="mt-5 text-center">
              <Link href="/batches" className="text-[14.5px] font-bold text-[#6d28d9]">
                Saare batches dekho →
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
