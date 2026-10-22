'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LiveClass } from '@/types/models';
import { useLiveStudioMedia } from '@/hooks/useLiveStudioMedia';
import { IconRadio } from '@/components/teacher/TeacherIcons';
import { StudioReadinessState, ClassroomLayoutType } from '@/types/live-studio';
import DigitalBoard from '@/components/teacher/live/DigitalBoard';
import ClassroomLayout from '@/components/teacher/live/ClassroomLayout';
import PresentationView from '@/components/teacher/live/PresentationView';
import ProductionControls from '@/components/teacher/live/ProductionControls';
import LiveChat from '@/components/live/LiveChat';
import LivePolls from '@/components/live/LivePolls';
import HandRaise from '@/components/live/HandRaise';

type SidePanel = 'chat' | 'polls' | 'hands' | 'attendance' | 'info';

export default function LiveStudioClient({ liveClass }: { liveClass: LiveClass }) {
  const router = useRouter();
  const media = useLiveStudioMedia();
  const [studioStatus, setStudioStatus] = useState<StudioReadinessState>(
    liveClass.status === 'LIVE' ? 'LIVE' : liveClass.status === 'ENDED' ? 'ENDED' : 'READY'
  );
  const [activeLayout, setActiveLayout] = useState<ClassroomLayoutType>('PIP_BOARD');
  const [sidePanel, setSidePanel] = useState<SidePanel>('chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const handleStartClass = async () => {
    try {
      setIsProcessing(true);
      setStudioStatus('STARTING');
      setApiError(null);
      const res = await fetch(`/api/teacher/live-classes/${liveClass.id}/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start');
      setStudioStatus('LIVE');
    } catch (err: any) {
      setApiError(err.message);
      setStudioStatus('ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndClass = async () => {
    if (!confirm('End this live class?')) return;
    try {
      setIsProcessing(true);
      setStudioStatus('ENDING');
      setApiError(null);
      const res = await fetch(`/api/teacher/live-classes/${liveClass.id}/end`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to end');
      setStudioStatus('ENDED');
    } catch (err: any) {
      setApiError(err.message);
      setStudioStatus('ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(`/api/teacher/live-classes/${liveClass.id}`);
      const data = await res.json();
      setAttendance(data.data?.attendance || []);
    } catch {}
    setLoadingAttendance(false);
  };

  const statusColor = studioStatus === 'LIVE' ? 'bg-red-500' : studioStatus === 'ENDED' ? 'bg-slate-500' : 'bg-emerald-500';

  return (
    <div className="flex flex-col h-screen bg-[#050508] text-slate-300 overflow-hidden">

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0a0a12]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push('/teacher/live-classes')}
            className="text-slate-500 hover:text-white transition-colors text-sm font-medium shrink-0">
            ← Back
          </button>
          <div className="h-5 w-px bg-slate-800 shrink-0"></div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{liveClass.title}</h1>
            <p className="text-[10px] text-slate-500 truncate">{liveClass.classType} • {liveClass.accessType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            studioStatus === 'LIVE' ? 'bg-red-500/20 text-red-500' :
            studioStatus === 'ENDED' ? 'bg-slate-800 text-slate-400' :
            'bg-emerald-500/20 text-emerald-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${statusColor} ${studioStatus === 'LIVE' ? 'animate-pulse' : ''}`}></span>
            {studioStatus}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Video + Controls */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Video Area */}
          <div className="flex-1 relative bg-black min-h-0">
            <ClassroomLayout
              layout={activeLayout}
              cameraPreview={
                <div className="relative w-full h-full bg-slate-900">
                  <video ref={media.videoRef} autoPlay playsInline muted
                    className={`w-full h-full object-cover ${(media.cameraActive || media.screenActive) ? 'opacity-100' : 'opacity-0'}`} />
                  {!(media.cameraActive || media.screenActive) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                      <IconRadio size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-semibold">Camera is off</p>
                    </div>
                  )}
                </div>
              }
              boardView={<DigitalBoard />}
              screenShareView={
                media.screenActive ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <p className="text-slate-400 font-semibold animate-pulse">Screen sharing...</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-600">
                    <p>Start screen share</p>
                  </div>
                )
              }
              presentationView={<PresentationView />}
            />
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 p-3 bg-[#0a0a12] border-t border-slate-800">
            <ProductionControls
              activeLayout={activeLayout}
              onLayoutChange={setActiveLayout}
              media={media}
              studioStatus={studioStatus}
              isProcessing={isProcessing}
              onStart={handleStartClass}
              onEnd={handleEndClass}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-slate-800 bg-[#0a0a12] flex flex-col flex-shrink-0">

          {/* Side Panel Tabs */}
          <div className="flex border-b border-slate-800 flex-shrink-0">
            {[
              { id: 'chat' as SidePanel, label: 'Chat', icon: '💬' },
              { id: 'polls' as SidePanel, label: 'Polls', icon: '📊' },
              { id: 'hands' as SidePanel, label: 'Hands', icon: '✋' },
              { id: 'attendance' as SidePanel, label: 'People', icon: '👥' },
              { id: 'info' as SidePanel, label: 'Info', icon: 'ℹ️' },
            ].map(tab => (
              <button key={tab.id} onClick={() => {
                setSidePanel(tab.id);
                if (tab.id === 'attendance') loadAttendance();
              }}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  sidePanel === tab.id
                    ? 'text-white border-b-2 border-teal-500 bg-white/5'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                <span className="mr-1">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Side Panel Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            {sidePanel === 'chat' && (
              <div className="h-full">
                <LiveChat liveClassId={liveClass.id} userRole="TEACHER" />
              </div>
            )}
            {sidePanel === 'polls' && (
              <div className="h-full overflow-y-auto">
                <LivePolls liveClassId={liveClass.id} userRole="TEACHER" />
              </div>
            )}
            {sidePanel === 'hands' && (
              <div className="h-full overflow-y-auto p-4">
                <HandRaise liveClassId={liveClass.id} userRole="TEACHER" userId={liveClass.teacherId || ''} />
              </div>
            )}
            {sidePanel === 'attendance' && (
              <div className="h-full overflow-y-auto p-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Attendees ({attendance.length})
                </h3>
                {loadingAttendance ? (
                  <p className="text-xs text-slate-500 animate-pulse">Loading...</p>
                ) : attendance.length === 0 ? (
                  <p className="text-xs text-slate-500">No attendees yet</p>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-xs font-bold text-teal-400">
                          {(a.studentName || a.studentId || 'S')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{a.studentName || a.studentId}</p>
                          <p className="text-[10px] text-slate-500">{a.durationMinutes || 0} min • {a.cameraOn ? '📷 On' : '📷 Off'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {sidePanel === 'info' && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Class Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500">Title</p>
                      <p className="text-xs text-white font-medium">{liveClass.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Type</p>
                      <span className="inline-block px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-white uppercase">{liveClass.classType}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Access</p>
                      <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold uppercase">{liveClass.accessType}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Scheduled</p>
                      <p className="text-xs text-white">{new Date(liveClass.scheduledStartAt).toLocaleString('en-IN')}</p>
                    </div>
                    {liveClass.meetingUrl && (
                      <div>
                        <p className="text-[10px] text-slate-500">Meeting URL</p>
                        <a href={liveClass.meetingUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-teal-400 hover:underline break-all">{liveClass.meetingUrl}</a>
                      </div>
                    )}
                  </div>
                </div>
                {apiError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] text-red-400">{apiError}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
