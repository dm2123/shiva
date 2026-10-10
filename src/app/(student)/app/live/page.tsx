import StudentEmptyState from '@/components/student/StudentEmptyState';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconRadio } from '@/components/student/StudentIcons';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { listStudentLiveClasses } from '@/services/live-class.service';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function LiveClassesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  const liveClasses = await listStudentLiveClasses(session.userId);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Live Classes"
        description="Join live streaming sessions with your instructors in real-time."
      />
      {liveClasses.length === 0 ? (
        <StudentEmptyState
          icon={<IconRadio size={24} />}
          title="No Active Streams"
          description="There are no live classes scheduled at this moment for your enrolled courses. Check back later."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map(lc => (
            <div key={lc.id} className="shiva-student-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm ${lc.status === 'LIVE' ? 'bg-red-500/20 text-red-400' : lc.status === 'ENDED' ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {lc.status}
                     </span>
                     <span className="text-[10px] px-2 py-1 bg-white/5 rounded-sm text-slate-400 uppercase font-bold">
                       {lc.classType}
                     </span>
                   </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{lc.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{new Date(lc.scheduledStartAt).toLocaleString()}</p>
                {lc.description && <p className="text-sm text-slate-500 line-clamp-2">{lc.description}</p>}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                 <Link href={`#`} className={`text-sm font-semibold ${lc.status === 'LIVE' ? 'text-shiva-blue hover:text-blue-400' : 'text-slate-500 cursor-not-allowed'}`}>
                   {lc.status === 'LIVE' ? 'Join Class Studio' : 'Unavailable'}
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
