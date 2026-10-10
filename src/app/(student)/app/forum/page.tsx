import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import ForumPostList from '@/components/forum/ForumPostList';
import ForumCreatePost from '@/components/forum/ForumCreatePost';

export const revalidate = 0;

export default async function ForumPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Discussion Forum</h1>
        <p className="text-slate-500 mt-1">Ask questions, help others, learn together</p>
      </div>
      <ForumCreatePost />
      <ForumPostList />
    </div>
  );
}
