'use client';

import { useParams } from 'next/navigation';
import ForumPost from '@/components/forum/ForumPost';
import Link from 'next/link';

export default function ForumPostPage() {
  const params = useParams();
  const postId = params.id as string;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/app/forum" className="text-indigo-600 hover:underline text-sm">
        ← Back to Forum
      </Link>
      <ForumPost postId={postId} />
    </div>
  );
}
