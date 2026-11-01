import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import CounsellorTabs from '@/components/counsellor/CounsellorTabs';

export const revalidate = 0;

export default async function CounsellorPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-[#f5b942]/20 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5b942] px-3 py-1 text-[11px] font-black tracking-widest text-[#2a1650]">
            🧭 CAREER GUIDANCE
          </span>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Counsellor se baat karo
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Exam, course ya career — koi bhi sawal ho, hamari team tumhari madad ke liye hai.
            Chat karo ya callback lo, <b>bilkul free</b>.
          </p>
        </div>
      </div>

      <CounsellorTabs userName={session.email?.split('@')[0] ?? ''} />
    </div>
  );
}
