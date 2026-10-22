'use client';

import { ReactNode } from 'react';
import { ClassroomLayoutType } from '@/types/live-studio';

interface ClassroomLayoutProps {
  layout: ClassroomLayoutType;
  cameraPreview: ReactNode;
  boardView?: ReactNode;
  screenShareView?: ReactNode;
  presentationView?: ReactNode;
}

export default function ClassroomLayout({ 
  layout, 
  cameraPreview, 
  boardView, 
  screenShareView, 
  presentationView 
}: ClassroomLayoutProps) {
  
  // Renders the fullscreen subject based on layout
  const renderMainView = () => {
    switch (layout) {
      case 'FULL_CAMERA':
      case 'PIP_BOARD':
      case 'PIP_SCREEN':
      case 'PIP_PRESENTATION':
        return cameraPreview;
      case 'FULL_BOARD':
        return boardView;
      case 'FULL_SCREEN':
        return screenShareView;
      case 'FULL_PRESENTATION':
        return presentationView;
      case 'SPLIT_CAMERA_BOARD':
        return (
          <div className="flex h-full w-full gap-4">
             <div className="flex-1 min-w-0 rounded-xl overflow-hidden bg-black/50 border border-white/10 relative">
               {boardView}
             </div>
             <div className="w-[30%] min-w-[280px] rounded-xl overflow-hidden bg-black relative shadow-2xl">
               {cameraPreview}
             </div>
          </div>
        );
      default:
        // Default PIP handling where the non-camera is primary
        if (layout === 'PIP_BOARD') return boardView; // Wait, handled above? Let's fix PIP views
        return (
           <div className="flex h-full items-center justify-center text-slate-500">
              Select a valid layout
           </div>
        );
    }
  };

  // Proper PIP / Main handling logic
  const renderLayout = () => {
     if (layout === 'FULL_CAMERA') {
       return <div className="absolute inset-0 z-0">{cameraPreview}</div>;
     }
     
     if (layout === 'FULL_BOARD') {
       return <div className="absolute inset-0 z-0">{boardView}</div>;
     }

     if (layout === 'FULL_SCREEN') {
       return <div className="absolute inset-0 z-0">{screenShareView}</div>;
     }

     if (layout === 'FULL_PRESENTATION') {
       return <div className="absolute inset-0 z-0">{presentationView}</div>;
     }

     if (layout === 'PIP_BOARD') {
        return (
          <>
            <div className="absolute inset-0 z-0 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-inner">{boardView}</div>
            <div className="absolute bottom-6 right-6 w-64 aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 z-10 transition-transform hover:scale-105">
               {cameraPreview}
            </div>
          </>
        )
     }

     if (layout === 'PIP_SCREEN') {
        return (
          <>
            <div className="absolute inset-0 z-0 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-inner">{screenShareView}</div>
            <div className="absolute bottom-6 right-6 w-64 aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 z-10 transition-transform hover:scale-105">
               {cameraPreview}
            </div>
          </>
        )
     }

     if (layout === 'PIP_PRESENTATION') {
        return (
          <>
            <div className="absolute inset-0 z-0 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-inner">{presentationView}</div>
            <div className="absolute bottom-6 right-6 w-64 aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 z-10 transition-transform hover:scale-105">
               {cameraPreview}
            </div>
          </>
        )
     }

     if (layout === 'SPLIT_CAMERA_BOARD') {
        return (
          <div className="absolute inset-0 flex flex-col md:flex-row gap-4 p-4 z-0">
             <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner shadow-black/50">
               {boardView}
             </div>
             <div className="w-full md:w-[35%] bg-black rounded-2xl overflow-hidden relative shadow-xl">
               {cameraPreview}
             </div>
          </div>
        )
     }

     return <div className="absolute inset-0 z-0 flex items-center justify-center text-slate-500">Layout not recognized</div>;
  };

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
       {renderLayout()}
    </div>
  );
}
