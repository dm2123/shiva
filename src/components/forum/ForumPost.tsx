'use client';

import { useState, useEffect } from 'react';

interface ForumPostData {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  upvoteCount: number;
}

interface ForumAnswer {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  upvoteCount: number;
}

interface ForumPostProps {
  postId: string;
}

export default function ForumPost({ postId }: ForumPostProps) {
  const [post, setPost] = useState<ForumPostData | null>(null);
  const [answers, setAnswers] = useState<ForumAnswer[]>([]);
  const [myUpvotes, setMyUpvotes] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/student/forum/${postId}`);
      const data = await res.json();
      if (data.success) {
        setPost(data.data.post);
        setAnswers(data.data.answers);
        setMyUpvotes(data.data.myUpvotes);
      }
    } catch (err) {
      console.error('Fetch post error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPost(); }, [postId]);

  const submitAnswer = async () => {
    if (!newAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/forum/${postId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newAnswer.trim() }),
      });
      if (res.ok) {
        setNewAnswer('');
        fetchPost();
      }
    } catch (err) {
      console.error('Submit answer error:', err);
    }
    setSubmitting(false);
  };

  const toggleUpvote = async (answerId?: string) => {
    try {
      await fetch(`/api/student/forum/${postId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId }),
      });
      fetchPost();
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const isUpvoted = (id: string) => myUpvotes.some(u => u.postId === id || u.answerId === id);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center py-8 text-slate-500">Post not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Post */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => toggleUpvote()}
            className={`flex flex-col items-center min-w-[50px] p-2 rounded-lg transition-colors ${
              isUpvoted(post.id)
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span className="text-xl">▲</span>
            <span className="text-sm font-bold">{post.upvoteCount}</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{post.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              By {post.authorName} • {new Date(post.createdAt).toLocaleString('en-IN')}
            </p>
            <p className="mt-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        <div className="space-y-4">
          {answers.map(answer => (
            <div key={answer.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleUpvote(answer.id)}
                  className={`flex flex-col items-center min-w-[40px] p-1 rounded transition-colors ${
                    isUpvoted(answer.id)
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span>▲</span>
                  <span className="text-xs font-bold">{answer.upvoteCount}</span>
                </button>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{answer.content}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    By {answer.authorName} • {new Date(answer.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Your Answer</h3>
        <textarea
          value={newAnswer}
          onChange={e => setNewAnswer(e.target.value)}
          placeholder="Write your answer..."
          className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
        />
        <button
          onClick={submitAnswer}
          disabled={submitting || !newAnswer.trim()}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Answer'}
        </button>
      </div>
    </div>
  );
}
