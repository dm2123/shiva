'use client';

import { useState, useEffect } from 'react';

interface HandRaiseProps {
  liveClassId: string;
  userRole: 'TEACHER' | 'STUDENT';
  userId: string;
}

export default function HandRaise({ liveClassId, userRole, userId }: HandRaiseProps) {
  const [handRaises, setHandRaises] = useState<string[]>([]);
  const [myHandRaised, setMyHandRaised] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchHandRaises = async () => {
    try {
      const res = await fetch(`/api/teacher/live-classes/${liveClassId}`);
      const data = await res.json();
      if (data.success && data.data.liveClass) {
        const raises = data.data.liveClass.handRaises || [];
        setHandRaises(raises);
        setMyHandRaised(raises.includes(userId));
      }
    } catch (err) {
      console.error('Fetch hand raises error:', err);
    }
  };

  useEffect(() => {
    fetchHandRaises();
    const interval = setInterval(fetchHandRaises, 2000);
    return () => clearInterval(interval);
  }, [liveClassId]);

  const toggleHandRaise = async () => {
    if (toggling || userRole !== 'STUDENT') return;

    setToggling(true);
    try {
      const res = await fetch(`/api/student/live-classes/${liveClassId}/hand-raise`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setHandRaises(data.data.handRaises);
        setMyHandRaised(data.data.handRaised);
      }
    } catch (err) {
      console.error('Toggle hand raise error:', err);
    }
    setToggling(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900 dark:text-white">Hand Raise</h3>
        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
          {handRaises.length} raised
        </span>
      </div>

      {userRole === 'STUDENT' && (
        <button
          onClick={toggleHandRaise}
          disabled={toggling}
          className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
            myHandRaised
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {myHandRaised ? '✋ Hand Raised (tap to lower)' : 'Raise Hand'}
        </button>
      )}

      {userRole === 'TEACHER' && handRaises.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-2">Students with raised hands:</p>
          {handRaises.map(id => (
            <div key={id} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <span className="text-amber-500">✋</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{id}</span>
            </div>
          ))}
        </div>
      )}

      {userRole === 'TEACHER' && handRaises.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-2">No raised hands</p>
      )}

      {userRole === 'STUDENT' && !myHandRaised && handRaises.length === 0 && (
        <p className="text-xs text-slate-500 text-center mt-3">
          Abhi kisi ne hand raise nahi kiya hai. Doubt hai to hand raise karo — teacher ko dikhega.
        </p>
      )}
    </div>
  );
}
