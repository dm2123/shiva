'use client';

import { useState } from 'react';
import { ClassroomLayoutType, StudioReadinessState } from '@/types/live-studio';

interface ProductionControlsProps {
   activeLayout: ClassroomLayoutType;
   onLayoutChange: (layout: ClassroomLayoutType) => void;
   media: any; // Using any for brevity here, should be the return type of useLiveStudioMedia
   studioStatus: StudioReadinessState;
   isProcessing: boolean;
   onStart: () => void;
   onEnd: () => void;
}

export default function ProductionControls({ 
   activeLayout, 
   onLayoutChange, 
   media, 
   studioStatus,
   isProcessing,
   onStart,
   onEnd
}: ProductionControlsProps) {
  
  const layouts: { id: ClassroomLayoutType, label: string, icon: string }[] = [
    { id: 'FULL_CAMERA', label: 'Camera', icon: '🎥' },
    { id: 'SPLIT_CAMERA_BOARD', label: 'Split', icon: '◫' },
    { id: 'PIP_BOARD', label: 'Board', icon: '📝' },
    { id: 'PIP_PRESENTATION', label: 'Doc', icon: '📄' },
    { id: 'PIP_SCREEN', label: 'Screen', icon: '💻' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Media Source Toggles */}
      <div className="flex gap-2">
         <button
            onClick={() => media.setMicActive(!media.micActive)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${media.micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30'}`}
         >
            <span>{media.micActive ? '🎙' : '🔇'}</span>
            <span className="hidden lg:inline">{media.micActive ? 'Mic On' : 'Unmute'}</span>
            {media.micActive && (
               <div className="w-10 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-2">
                  <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${Math.min(100, (media.micLevel / 128) * 100)}%` }}></div>
               </div>
            )}
         </button>
         
         <button
            onClick={() => media.setCameraActive(!media.cameraActive)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${media.cameraActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30'}`}
         >
            <span>{media.cameraActive ? '📹' : '📸'}</span>
            <span className="hidden lg:inline">{media.cameraActive ? 'Camera On' : 'Camera Off'}</span>
         </button>

         <button
            onClick={media.toggleScreenShare}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${media.screenActive ? 'bg-[var(--teacher-primary-muted)] text-[var(--teacher-primary)] ring-1 ring-[var(--teacher-primary)]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
         >
            <span>💻</span>
            <span className="hidden lg:inline">{media.screenActive ? 'Stop Share' : 'Share Screen'}</span>
         </button>
      </div>

      <div className="h-px md:h-10 w-full md:w-px bg-slate-800"></div>

      {/* Layout Composition Selectors */}
      <div className="flex gap-2">
         {layouts.map(l => (
           <button
             key={l.id}
             onClick={() => onLayoutChange(l.id)}
             className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${activeLayout === l.id ? 'bg-white/10 text-white shadow-lg border border-white/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
             title={l.label}
           >
              <span className="text-xl mb-1">{l.icon}</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">{l.label}</span>
           </button>
         ))}
      </div>

       <div className="h-px md:h-10 w-full md:w-px bg-slate-800"></div>

       {/* Authoritative Live Controls */}
       <div>
         {(studioStatus === 'READY' || studioStatus === 'STARTING' || studioStatus === 'ERROR') ? (
           <button 
             onClick={onStart}
             disabled={isProcessing || studioStatus === 'STARTING'}
             className="px-8 py-3 bg-[var(--teacher-primary)] hover:brightness-110 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider"
           >
             {studioStatus === 'STARTING' ? 'Starting...' : 'Go Live'}
           </button>
         ) : studioStatus === 'LIVE' || studioStatus === 'ENDING' ? (
           <button 
             onClick={onEnd}
             disabled={isProcessing || studioStatus === 'ENDING'}
             className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 uppercase tracking-wider"
           >
             {studioStatus === 'ENDING' ? 'Ending...' : 'End Class'}
           </button>
         ) : (
           <div className="px-8 py-3 bg-slate-800 text-slate-500 font-bold rounded-xl text-center uppercase tracking-wider">
             Ended
           </div>
         )}
       </div>

    </div>
  );
}
