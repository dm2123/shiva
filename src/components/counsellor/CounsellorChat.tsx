'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  senderType: 'student' | 'counsellor' | 'bot';
  content: string;
  createdAt: string;
}

interface Chat {
  id: string;
  status: string;
}

export default function CounsellorChat() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function startChat() {
    try {
      const res = await fetch('/api/student/counsellor', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const chatId = data.data.chatId;
        setChat({ id: chatId, status: 'OPEN' });
        loadMessages(chatId);
      }
    } catch {
      console.error('Failed to start chat');
    }
  }

  async function loadMessages(chatId: string) {
    try {
      const res = await fetch(`/api/student/counsellor/${chatId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch {
      console.error('Failed to load messages');
    }
  }

  async function handleSend() {
    if (!input.trim() || !chat || sending) return;
    setSending(true);

    const content = input.trim();
    setInput('');

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderType: 'student',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/student/counsellor/${chat.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        loadMessages(chat.id);
      }
    } catch {
      console.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[600px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">C</div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Counsellor</h3>
            <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                msg.senderType === 'student'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
              }`}
            >
              <p>{msg.content}</p>
              <p className={`mt-1 text-[10px] ${msg.senderType === 'student' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
