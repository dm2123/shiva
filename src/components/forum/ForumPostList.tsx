'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  courseId: string;
  tags: string;
  createdAt: string;
  answerCount: number;
  upvoteCount: number;
}

interface ForumPostListProps {
  courseId?: string;
}

export default function ForumPostList({ courseId }: ForumPostListProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (courseId) params.set('courseId', courseId);

      const res = await fetch(`/api/student/forum?${params.toString()}`);
      const data = await res.json();
      if (data.success) setPosts(data.data.posts);
    } catch (err) {
      console.error('Fetch posts error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [courseId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading discussions...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search discussions..."
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Search
        </button>
      </form>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No discussions yet. Start one!</p>
        </div>
      ) : (
        posts.map(post => (
          <Link
            key={post.id}
            href={`/app/forum/${post.id}`}
            className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="text-center min-w-[60px]">
                <p className="text-2xl font-bold text-indigo-600">{post.upvoteCount}</p>
                <p className="text-xs text-slate-500">votes</p>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{post.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>By {post.authorName}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('en-IN')}</span>
                  <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {post.answerCount} answers
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
