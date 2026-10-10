'use client';

import { useState } from 'react';

interface MentorBookingProps {
  mentorId: string;
  onBooked: () => void;
  onCancel: () => void;
}

export default function MentorBooking({ mentorId, onBooked, onCancel }: MentorBookingProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  const book = async () => {
    if (!date || !time) {
      setError('Select date and time');
      return;
    }

    setBooking(true);
    setError('');
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await fetch('/api/student/mentors/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId, scheduledAt, durationMinutes: duration, notes }),
      });

      const data = await res.json();
      if (data.success) {
        onBooked();
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Booking failed');
    }
    setBooking(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Book a Session</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Duration</label>
        <select
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="What would you like to discuss?"
          className="w-full h-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={book}
          disabled={booking || !date || !time}
          className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {booking ? 'Booking...' : 'Book Session'}
        </button>
      </div>
    </div>
  );
}
