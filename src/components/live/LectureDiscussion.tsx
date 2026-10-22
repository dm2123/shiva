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
    <div className="border-l-2 border-[#6d28d9]/30 pl-3 py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[var(--student-text)] text-sm font-semibold">{d.authorName}</span>
        {d.timestampSeconds !== null && (
          <span className="text-[#6d28d9] text-xs bg-[#6d28d9]/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-[#6d28d9]/20">
            {formatTimestamp(d.timestampSeconds)}
          </span>
        )}
        <span className="text-[var(--student-text-faint)] text-xs">{new Date(d.createdAt).toLocaleDateString()}</span>
      </div>

      <p className="text-[var(--student-text-secondary)] text-sm mb-2">{d.content}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setUpvoted(!upvoted)}
          className={`flex items-center gap-1 text-xs transition ${
            upvoted ? 'text-emerald-500' : 'text-[var(--student-text-faint)] hover:text-[var(--student-text-muted)]'
          }`}
        >
          <span className={`text-lg ${upvoted ? 'text-emerald-500' : ''}`}>↑</span>
          {d.upvotes + (upvoted ? 1 : 0)}
        </button>
        {!d.parentId && (
          <button
            onClick={() => onReply(d.id)}
            className="flex items-center gap-1 text-xs text-[var(--student-text-faint)] hover:text-[var(--student-text-muted)]"
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
    <div className="rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] p-4 space-y-4">
      <h3 className="text-[var(--student-text)] font-bold">Discussion</h3>

      {loading ? (
        <p className="text-[var(--student-text-faint)] text-sm">Loading...</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {discussions.length === 0 && (
            <p className="text-[var(--student-text-faint)] text-sm">Abhi koi comment nahi hai. Pehla sawal ya tip tum likho!</p>
          )}
          {discussions.map((d) => (
            <Comment key={d.id} d={d} lectureId={lectureId} onReply={setReplyTo} />
          ))}
        </div>
      )}

      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-[#6d28d9]">
          Replying to comment #{replyTo}
          <button onClick={() => setReplyTo(null)} className="text-[var(--student-text-faint)] hover:text-[var(--student-text)]">
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
          className="flex-1 bg-[var(--student-surface)] border border-[var(--student-border)] rounded-md px-3 py-2 text-[var(--student-text)] text-sm placeholder:text-[var(--student-text-faint)] focus:outline-none focus:border-[#6d28d9]"
          disabled={submitting}
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || submitting}
          className="bg-[#6d28d9] hover:bg-[#2a1650] disabled:opacity-40 text-white p-2 rounded-md transition"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
