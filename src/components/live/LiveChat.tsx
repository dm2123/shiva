'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  userId: string;
  email: string;
  message: string;
  createdAt: string;
}

interface LiveChatProps {
  liveClassId: string;
  userRole: 'TEACHER' | 'STUDENT';
}

export default function LiveChat({ liveClassId, userRole }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef<string>('');

  const fetchMessages = async () => {
    try {
      const base = userRole === 'TEACHER' ? '/api/teacher' : '/api/student';
      const url = lastTimestamp.current
        ? `${base}/live-classes/${liveClassId}/chat?since=${lastTimestamp.current}`
        : `${base}/live-classes/${liveClassId}/chat`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data.messages.length > 0) {
        setMessages(prev => {
          const existing = new Set(prev.map(m => m.id));
          const newMsgs = data.data.messages.filter((m: ChatMessage) => !existing.has(m.id));
          return [...prev, ...newMsgs];
        });
        lastTimestamp.current = data.data.messages[data.data.messages.length - 1].createdAt;
      }
    } catch (err) {
      console.error('Chat fetch error:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [liveClassId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const base = userRole === 'TEACHER' ? '/api/teacher' : '/api/student';
      const res = await fetch(`${base}/live-classes/${liveClassId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white">Live Chat</h3>
        <p className="text-xs text-slate-500">{messages.length} messages</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {msg.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
