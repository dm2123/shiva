'use client';

import { useEffect, useRef } from 'react';

interface LiveStreamProps {
  roomId: string;
  displayName: string;
  isTeacher: boolean;
}

export default function LiveStream({ roomId, displayName, isTeacher }: LiveStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;

    script.onload = () => {
      const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
      if (!JitsiMeetExternalAPI || !containerRef.current) return;

      const api = new JitsiMeetExternalAPI('meet.jit.si', {
        roomName: `shiva-${roomId}`,
        parentNode: containerRef.current,
        userInfo: {
          displayName: displayName,
        },
        configOverwrite: {
          startWithAudioMuted: !isTeacher,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          toolbarButtons: [
            'microphone',
            'camera',
            'desktop',
            'chat',
            'raisehand',
            'settings',
            'fullscreen',
            'endmeeting',
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: '#0f172a',
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        },
      });

      api.addEventListener('readyToClose', () => {
        // Class ended
      });

      return () => api.dispose();
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [roomId, displayName, isTeacher]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold text-white bg-red-500/80 px-2 py-0.5 rounded">LIVE</span>
      </div>
    </div>
  );
}
