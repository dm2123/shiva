'use client';

import { useState } from 'react';

export default function PresentationView() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFileUrl(url);
    }
  };

  if (!fileUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl">
         <div className="text-4xl mb-4 text-slate-600">📄</div>
         <h3 className="text-lg font-bold text-slate-300 mb-2">Presentation Source</h3>
         <p className="text-sm text-slate-500 max-w-sm text-center mb-6">
           Select a local PDF or Presentation image. 
           (Cloud synchronization is a Phase 04 infrastructure task.)
         </p>
         
         <label className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer rounded-lg font-semibold transition-colors">
            Browse Files
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
         </label>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative rounded-xl overflow-hidden group">
      <object data={fileUrl} className="w-full h-full" type="application/pdf">
        <iframe src={fileUrl} className="w-full h-full border-0" title="Presentation">
          <p>Your browser does not support PDFs. <a href={fileUrl}>Download the PDF</a>.</p>
        </iframe>
      </object>
      
      {/* Overlay controls - only visible on hover to not distract from presentation */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/10 shadow-xl">
         <button 
           onClick={() => setFileUrl(null)} 
           className="text-xs font-bold text-white px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded"
         >
           Close File
         </button>
      </div>
    </div>
  );
}
