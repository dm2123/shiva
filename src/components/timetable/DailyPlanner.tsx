'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Class {
  id: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  lectureType: string;
  liveClassId: string | null;
  liveStatus: string | null;
}

interface DailyPlannerProps {
  batchId: string;
}

export default function DailyPlanner({ batchId }: DailyPlannerProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await fetch(`/api/student/batches/${batchId}/today`);
        const data = await res.json();
        if (data.success) setClasses(data.data.classes);
      } catch (err) {
        console.error('Fetch today error:', err);
      }
      setLoading(false);
    };
    fetchToday();
  }, [batchId]);

  if (loading) return <div className="text-center py-4 text-slate-500">Loading...</div>;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const getStatus = (cls: Class) => {
    const [sh, sm] = cls.startTime.split(':').map(Number);
    const [eh, em] = cls.endTime.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (currentMinutes >= start && currentMinutes <= end) return 'LIVE';
    if (currentMinutes < start) return 'UPCOMING';
    return 'COMPLETED';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="font-bold text-slate-900 dark:text-white mb-3">Today&apos;s Schedule</h3>
      {classes.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No classes today</p>
      ) : (
        <div className="space-y-2">
          {classes.map(cls => {
            const status = getStatus(cls);
            return (
              <div key={cls.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                status === 'LIVE' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' :
                status === 'COMPLETED' ? 'bg-slate-50 dark:bg-slate-700 opacity-60' :
                'bg-white dark:bg-slate-800'
              }`}>
                <div className="text-center min-w-[50px]">
                  <p className="text-xs text-slate-500">{formatTime(cls.startTime)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{cls.subjectName}</p>
                  <p className="text-xs text-slate-500">{cls.teacherName}</p>
                </div>
                {status === 'LIVE' && cls.liveClassId && (
                  <Link
                    href={`/app/live/${cls.liveClassId}`}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                  >
                    Join
                  </Link>
                )}
                {status === 'UPCOMING' && (
                  <span className="text-xs text-blue-600 font-medium">Upcoming</span>
                )}
                {status === 'COMPLETED' && (
                  <span className="text-xs text-slate-400">Done</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
