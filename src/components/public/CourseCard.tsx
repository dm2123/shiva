import { Course } from '@/types/models';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="marketing-card group h-full">
      {/* Card header with gradient */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-lg p-4 mb-4 relative overflow-hidden">
        <div className="liquid-blob w-24 h-24 bg-indigo-500/20 top-[-12px] right-[-12px] rounded-full"></div>
        <div className="flex justify-between items-start mb-3 relative z-10">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
            {course.status}
          </span>
        </div>
        <h3 className="text-base md:text-lg font-bold text-white group-hover:text-indigo-200 transition line-clamp-2 relative z-10 leading-tight">
          {course.title}
        </h3>
      </div>

      {/* Card content */}
      <div className="flex-1 flex flex-col space-y-3">
        <p className="text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Footer with price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide block mb-0.5">
              Course Fee
            </span>
            <span className="text-base md:text-lg font-black text-slate-900">
              {course.price > 0 ? `₹${course.price.toLocaleString('en-IN')}` : 'Free'}
            </span>
          </div>
          <a
            href={`/courses/${course.slug}`}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-sm hover:shadow-md"
          >
            View Course →
          </a>
        </div>
      </div>
    </div>
  );
}
