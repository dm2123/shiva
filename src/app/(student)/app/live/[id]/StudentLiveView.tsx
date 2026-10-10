'use client';

import { useState } from 'react';
import LiveStream from '@/components/live/LiveStream';
import LiveChat from '@/components/live/LiveChat';
import LivePolls from '@/components/live/LivePolls';
import HandRaise from '@/components/live/HandRaise';

interface StudentLiveViewProps {
  liveClass: any;
  studentId: string;
  studentEmail: string;
}

export default function StudentLiveView({ liveClass, studentId, studentEmail }: StudentLiveViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'polls' | 'hands'>('chat');
  const roomId = liveClass.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{liveClass.title}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {liveClass.courseTitle}
          {liveClass.status === 'LIVE' && (
            <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {liveClass.status === 'LIVE' ? (
            <LiveStream roomId={roomId} displayName={studentEmail.split('@')[0]} isTeacher={false} />
          ) : (
            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center">
              <div className="text-center">
                {liveClass.status === 'SCHEDULED' ? (
                  <>
                    <p className="text-white text-lg font-bold">Class Not Started Yet</p>
                    <p className="text-slate-400 text-sm mt-2">
                      Scheduled for {new Date(liveClass.startTime).toLocaleString('en-IN')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white text-lg font-bold">Class Has Ended</p>
                    {liveClass.recordingUrl && (
                      <a
                        href={liveClass.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                      >
                        Watch Recording
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['chat', 'polls', 'hands'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'chat' ? 'Chat' : tab === 'polls' ? 'Polls' : 'Hand Raise'}
              </button>
            ))}
          </div>

          <div className="h-96">
            {activeTab === 'chat' && <LiveChat liveClassId={roomId} userRole="STUDENT" />}
            {activeTab === 'polls' && <LivePolls liveClassId={roomId} userRole="STUDENT" />}
            {activeTab === 'hands' && (
              <HandRaise liveClassId={roomId} userRole="STUDENT" userId={studentId} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Class Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{liveClass.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Start Time</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {new Date(liveClass.startTime).toLocaleString('en-IN')}
                </dd>
              </div>
            </dl>
          </div>

          {liveClass.description && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">About</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{liveClass.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
