import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import ScholarshipList from '@/components/student/ScholarshipList';

export const revalidate = 0;

export default async function ScholarshipsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black tracking-widest text-white backdrop-blur">
            🎓 SCHOLARSHIP TESTS
          </span>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Test do, scholarship jeeto
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Scholarship test me achha score lao aur course fees par <b>100% tak</b> ki
            scholarship pao. Koi alag form nahi — bas test do.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold text-white">
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">✅ Bilkul free attempt</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">✅ Turant result</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">✅ Sabhi students ke liye</span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { n: '1', t: 'Test chuno', d: 'Neeche diye gaye tests me se koi ek chuno.' },
          { n: '2', t: 'Test do', d: 'Tay time me test complete karo.' },
          { n: '3', t: 'Scholarship pao', d: 'Score ke hisaab se fees par chhoot.' },
        ].map((s) => (
          <div key={s.n} className="student-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--student-primary-light)] text-sm font-black text-[var(--student-primary)]">
              {s.n}
            </div>
            <p className="mt-2 text-sm font-bold text-[var(--student-text)]">{s.t}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--student-text-muted)]">{s.d}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-[17px] font-bold text-[var(--student-text)]">Available tests</h2>
        <ScholarshipList />
      </div>
    </div>
  );
}
