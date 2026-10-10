'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/student/announcements');
        const data = await res.json();
        if (data.success) {
          const filtered = data.data.announcements.filter(
            (a: Announcement) => !dismissed.includes(a.id)
          );
          setAnnouncements(filtered);
        }
      } catch (err) {
        console.error('Fetch announcements error:', err);
      }
    };
    fetchAnnouncements();
  }, [dismissed]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const dismiss = (id: string) => {
    setDismissed(prev => [...prev, id]);
    setCurrentIndex(0);
  };

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];
  if (!current) return null;

  const priorityColor = {
    HIGH: 'bg-red-600',
    MEDIUM: 'bg-indigo-600',
    LOW: 'bg-blue-600',
  }[current.priority] || 'bg-indigo-600';

  return (
    <div className={`${priorityColor} text-white px-4 py-3 rounded-xl flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">📢</span>
        <div>
          <p className="font-bold text-sm">{current.title}</p>
          <p className="text-xs opacity-90">{current.content}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {announcements.length > 1 && (
          <span className="text-xs opacity-70">
            {currentIndex + 1}/{announcements.length}
          </span>
        )}
        <button
          onClick={() => dismiss(current.id)}
          className="text-white/70 hover:text-white text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}
