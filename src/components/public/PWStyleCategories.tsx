'use client';

import Link from 'next/link';

const CATEGORIES = [
  {
    title: 'SSC',
    exams: ['CGL', 'CHSL', 'MTS', 'GD'],
    icon: '🏛️',
    href: '/courses?exam=ssc',
  },
  {
    title: 'Railway',
    exams: ['NTPC', 'Group D', 'ALP'],
    icon: '🚂',
    href: '/courses?exam=railway',
  },
  {
    title: 'Banking',
    exams: ['IBPS PO', 'SBI Clerk', 'RBI'],
    icon: '🏦',
    href: '/courses?exam=banking',
  },
  {
    title: 'Defence',
    exams: ['Agniveer', 'NDA', 'CDS'],
    icon: '🎖️',
    href: '/courses?exam=defence',
  },
];

export default function PWStyleCategories() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-center text-2xl font-extrabold mb-2">Apna Exam Chuno</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Har exam ke liye dedicated batches aur study material
        </p>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="block bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {cat.exams.map((exam) => (
                      <span
                        key={exam}
                        className="text-xs border border-gray-200 px-3 py-1.5 rounded-full text-gray-600"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    Explore →
                  </span>
                </div>
                <span className="text-5xl opacity-90">{cat.icon}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
