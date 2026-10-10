'use client';

interface Props {
  present: number;
  total: number;
}

export default function AttendanceTracker({ present, total }: Props) {
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  const isGood = percent >= 75;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`} />
      <div className="flex-1">
        <p className="text-white text-sm font-medium">Attendance</p>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className={`text-lg font-bold ${isGood ? 'text-green-400' : 'text-red-400'}`}>
        {percent}%
      </span>
    </div>
  );
}
