import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import NCERTBrowser from '@/components/ncert/NCERTBrowser';

export const revalidate = 0;

export default async function NCERTPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1650] via-[#4c1d95] to-[#6d28d9] p-6 md:p-10 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-[#f5b942]/20 blur-2xl" aria-hidden="true" />
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5b942] mb-2">Board Foundation</p>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">NCERT Solutions</h1>
          <p className="text-sm md:text-base text-violet-100/90 mt-2 max-w-lg leading-relaxed">
            Class aur subject choose karo — har chapter ke solutions ek jagah, step by step.
          </p>
        </div>
      </div>

      <NCERTBrowser />
    </div>
  );
}
