'use client';

import { useState, useEffect } from 'react';


interface Discussion {
  id: number;
  content: string;
  authorName: string;
  timestampSeconds: number | null;
  upvotes: number;
  replyCount: number;
  parentId?: number;
  replies?: Discussion[];
  createdAt: string;
}

interface Props {
  lectureId: string;
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function Comment({ d, lectureId, onReply }: { d: Discussion; lectureId: string; onReply: (parentId: number) => void }) {
  const [upvoted, setUpvoted] = useState(false);

  return (
    <div className="border-l-2 border-gray-700 pl-3 py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white text-sm font-medium">{d.authorName}</span>
        {d.timestampSeconds !== null && (
          <span className="text-purple-400 text-xs bg-purple-900/30 px-1.5 py-0.5 rounded cursor-pointer hover:bg-purple-800/50">
            {formatTimestamp(d.timestampSeconds)}
          </span>
        )}
        <span className="text-gray-500 text-xs">{new Date(d.createdAt).toLocaleDateString()}</span>
      </div>

      <p className="text-gray-300 text-sm mb-2">{d.content}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setUpvoted(!upvoted)}
          className={`flex items-center gap-1 text-xs transition ${
            upvoted ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className={`text-lg ${upvoted ? 'text-green-400' : ''}`}>↑</span>
          {d.upvotes + (upvoted ? 1 : 0)}
        </button>
        {!d.parentId && (
          <button
            onClick={() => onReply(d.id)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
          >
            💬
            Reply
          </button>
        )}
      </div>

      {d.replies && d.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {d.replies.map((r) => (
            <Comment key={r.id} d={r} lectureId={lectureId} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LectureDiscussion({ lectureId }: Props) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscussions = async () => {
    const res = await fetch(`/api/student/lecture-discussions?lectureId=${lectureId}`);
    const data = await res.json();
    setDiscussions(data.discussions || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscussions();
  }, [lectureId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/student/lecture-discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId,
          content: newComment,
          parentId: replyTo,
        }),
      });
      setNewComment('');
      setReplyTo(null);
      fetchDiscussions();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      <h3 className="text-white font-semibold">Discussion</h3>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {discussions.length === 0 && (
            <p className="text-gray-500 text-sm">No comments yet. Start the discussion!</p>
          )}
          {discussions.map((d) => (
            <Comment key={d.id} d={d} lectureId={lectureId} onReply={setReplyTo} />
          ))}
        </div>
      )}

      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-purple-400">
          Replying to comment #{replyTo}
          <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white">
            Cancel
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
          className="flex-1 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
          disabled={submitting}
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || submitting}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white p-2 rounded-md transition"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
