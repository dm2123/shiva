import Link from 'next/link';
import { listCoursesDb } from '@/lib/db';
import { IconBook } from '@/components/student/ShivaIcons';
import SearchBox from './SearchBox';

export const revalidate = 0;

const QUICK_LINKS = [
  { label: 'My Courses', href: '/app/my-courses' },
  { label: 'Test Series', href: '/app/tests' },
  { label: 'Doubts', href: '/app/doubts' },
  { label: 'Library', href: '/app/ebooks' },
  { label: 'Live Classes', href: '/app/live' },
  { label: 'Batches', href: '/app/batches' },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || '').trim();
  let results: any[] = [];

  if (q) {
    const all = await listCoursesDb(true);
    const ql = q.toLowerCase();
    results = (all || []).filter(
      (c: any) =>
        c.title?.toLowerCase().includes(ql) ||
        c.description?.toLowerCase().includes(ql) ||
        c.slug?.toLowerCase().includes(ql)
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-5 pb-20">
      <SearchBox initial={q} />

      {/* Quick links */}
      {!q && (
        <section>
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="bg-white rounded-2xl border border-gray-200 p-4 text-sm font-semibold text-gray-800 hover:shadow-md transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {q !== '' && (
        <section>
          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="font-semibold text-gray-800">Kuch nahi mila</p>
              <p className="text-[13px] text-gray-500 mt-1">
                &ldquo;{q}&rdquo; ke liye koi course nahi mila. Spelling check karo ya kuch aur try karo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-gray-500">
                {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
              </p>
              {results.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/app/courses/${c.slug || c.id}`}
                  className="block bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <IconBook size={22} className="text-indigo-600" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-[15px] truncate">{c.title}</h3>
                      {c.description && (
                        <p className="text-[12px] text-gray-500 truncate mt-0.5">{c.description}</p>
                      )}
                    </div>
                    <span className="text-[13px] font-bold text-indigo-600 flex-shrink-0">
                      {Number(c.price || 0) === 0 ? 'FREE' : `₹${c.price}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
