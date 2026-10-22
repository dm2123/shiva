'use client';



interface StudyGroup {
  id: number;
  name: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: number;
  creatorName?: string;
  courseTitle?: string;
}

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoin: (groupId: number) => void;
  joining?: boolean;
}

export default function StudyGroupCard({ group, onJoin, joining }: StudyGroupCardProps) {
  const isFull = group.memberCount >= group.maxMembers;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
        {group.isPrivate ? (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Private</span>
        ) : (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Public</span>
        )}
      </div>

      {group.courseTitle && (
        <p className="text-sm text-gray-600 mb-2">Course: {group.courseTitle}</p>
      )}

      <p className="text-sm text-gray-500 mb-1">Created by {group.creatorName}</p>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(group.memberCount / group.maxMembers) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">
          {group.memberCount}/{group.maxMembers} members
        </span>
      </div>

      <button
        onClick={() => onJoin(group.id)}
        disabled={isFull || joining}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {joining ? 'Joining...' : isFull ? 'Group Full' : 'Join Group'}
      </button>
    </div>
  );
}
