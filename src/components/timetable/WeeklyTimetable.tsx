'use client';

import { useState, useEffect } from 'react';

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  lectureType: string;
}

interface WeeklyTimetableProps {
  batchId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyTimetable({ batchId }: WeeklyTimetableProps) {
  const [timetable, setTimetable] = useState<Record<number, Schedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/student/batches/${batchId}/schedule`);
        const data = await res.json();
        if (data.success) setTimetable(data.data.timetable);
      } catch (err) {
        console.error('Fetch schedule error:', err);
      }
      setLoading(false);
    };
    fetchSchedule();
  }, [batchId]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading timetable...</div>;

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'LECTURE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DOUBT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'TEST': return 'bg-red-100 text-red-700 border-red-200';
      case 'REVISION': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Day Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {DAYS.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
              selectedDay === i
                ? 'bg-indigo-600 text-white'
                : timetable[i]?.length
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-50 text-slate-400'
            }`}
          >
            {day.slice(0, 3)}
            {timetable[i]?.length ? (
              <span className="ml-1 text-xs">({timetable[i].length})</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Day's Schedule */}
      <div className="space-y-3">
        {timetable[selectedDay]?.length === 0 || !timetable[selectedDay] ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No classes on {DAYS[selectedDay]}</p>
          </div>
        ) : (
          timetable[selectedDay].map((cls) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor(cls.lectureType)}`}>
                      {cls.lectureType}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {cls.subjectName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{cls.teacherName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatTime(cls.startTime)}
                  </p>
                  <p className="text-xs text-slate-500">to {formatTime(cls.endTime)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
