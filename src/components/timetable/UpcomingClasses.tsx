'use client';

import { useState, useEffect } from 'react';

interface UpcomingDay {
  date: string;
  dayOfWeek: number;
  classes: Array<{
    id: string;
    startTime: string;
    endTime: string;
    subjectName: string;
    teacherName: string;
    lectureType: string;
  }>;
}

interface UpcomingClassesProps {
  batchId: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function UpcomingClasses({ batchId }: UpcomingClassesProps) {
  const [upcoming, setUpcoming] = useState<UpcomingDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await fetch(`/api/student/batches/${batchId}/upcoming`);
        const data = await res.json();
        if (data.success) setUpcoming(data.data.upcoming);
      } catch (err) {
        console.error('Fetch upcoming error:', err);
      }
      setLoading(false);
    };
    fetchUpcoming();
  }, [batchId]);

  if (loading) return <div className="text-center py-4 text-slate-500">Loading...</div>;

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-bold text-slate-900 dark:text-white mb-3">Upcoming Week</h3>
      {upcoming.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No upcoming classes</p>
      ) : (
        <div className="space-y-4">
          {upcoming.map(day => (
            <div key={day.date}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {DAYS[day.dayOfWeek]}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="space-y-1 ml-4">
                {day.classes.map(cls => (
                  <div key={cls.id} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 w-16">{formatTime(cls.startTime)}</span>
                    <span className="text-slate-700 dark:text-slate-300">{cls.subjectName}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
