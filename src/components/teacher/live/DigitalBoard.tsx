'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BoardDrawingTool, BoardStroke } from '@/types/live-studio';

interface Point { x: number, y: number }

export default function DigitalBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeTool, setActiveTool] = useState<BoardDrawingTool>('PEN');
  const [selectedColor, setSelectedColor] = useState<string>('#ffffff');
  const [lineWidth, setLineWidth] = useState<number>(3);
  
  // High performance refs
  const isDrawing = useRef(false);
  const currentStroke = useRef<Point[]>([]);
  
  // History for Undo/Redo
  const [history, setHistory] = useState<BoardStroke[]>([]);
  const [redoStack, setRedoStack] = useState<BoardStroke[]>([]);

  const colors = ['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];

  const redrawCanvas = useCallback((strokes: BoardStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set base background so exported images aren't transparent black holes
    ctx.fillStyle = '#0f172a'; // slate-900 matching
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.strokeStyle = stroke.tool === 'ERASER' ? '#0f172a' : stroke.color;
      ctx.lineWidth = stroke.tool === 'ERASER' ? stroke.width * 5 : stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
       if (stroke.tool === 'HIGHLIGHTER') {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1.0;
      }
      
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1.0; // Reset
  }, []);

  // Handle Resize safely safely
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redrawCanvas(history);
      }
    };
    
    // Initial size
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [history, redrawCanvas]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pos = getCoordinates(e);
    currentStroke.current = [pos];
    
    // Draw dot for single click
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = activeTool === 'ERASER' ? '#0f172a' : selectedColor;
      const r = activeTool === 'ERASER' ? (lineWidth * 5) / 2 : lineWidth / 2;
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      if (activeTool === 'HIGHLIGHTER') ctx.globalAlpha = 0.4;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    
    const pos = getCoordinates(e);
    const prevPos = currentStroke.current[currentStroke.current.length - 1];
    
    currentStroke.current.push(pos);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && prevPos) {
      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = activeTool === 'ERASER' ? '#0f172a' : selectedColor;
      ctx.lineWidth = activeTool === 'ERASER' ? lineWidth * 5 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (activeTool === 'HIGHLIGHTER') ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (currentStroke.current.length > 0) {
      const newStroke: BoardStroke = {
        id: Date.now().toString(),
        tool: activeTool,
        points: [...currentStroke.current],
        color: selectedColor,
        width: lineWidth
      };
      
      setHistory(prev => [...prev, newStroke]);
      setRedoStack([]); // Clear redo stack on new action
    }
    currentStroke.current = [];
  };

  const undo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const undone = newHistory.pop();
    if (undone) {
      setHistory(newHistory);
      setRedoStack(prev => [...prev, undone]);
      redrawCanvas(newHistory);
    }
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const newRedo = [...redoStack];
    const redone = newRedo.pop();
    if (redone) {
      const newHistory = [...history, redone];
      setHistory(newHistory);
      setRedoStack(newRedo);
      redrawCanvas(newHistory);
    }
  };

  const clearBoard = () => {
    if (confirm('Clear entire board? This action cannot be undone.')) {
      setHistory([]);
      setRedoStack([]);
      redrawCanvas([]);
    }
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `board-snapshot-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    alert('Saved for this studio session (Local Download)');
  };

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      
      {/* The Actual Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="block touch-none cursor-crosshair w-full h-full rounded-2xl"
        style={{ touchAction: 'none' }} 
      />

      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full py-2 px-6 flex items-center gap-3 shadow-2xl z-10 transition-all hover:bg-slate-900">
        
        {/* Tools Section */}
        <div className="flex bg-black/50 rounded-full p-1 border border-white/5">
           <button 
             onClick={() => setActiveTool('PEN')}
             className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${activeTool === 'PEN' ? 'bg-[var(--teacher-primary)] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
             title="Pen"
             aria-label="Pen Tool"
           >
             ✒️
           </button>
           <button 
             onClick={() => setActiveTool('HIGHLIGHTER')}
             className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${activeTool === 'HIGHLIGHTER' ? 'bg-[var(--teacher-primary)] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
             title="Highlighter"
             aria-label="Highlighter Tool"
           >
             🖍
           </button>
           <button 
             onClick={() => setActiveTool('ERASER')}
             className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${activeTool === 'ERASER' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
             title="Eraser"
             aria-label="Eraser Tool"
           >
             ▱
           </button>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        {/* Colors Section */}
        <div className="flex gap-1.5 items-center bg-black/50 rounded-full p-1 border border-white/5">
           {colors.map(color => (
             <button
               key={color}
               onClick={() => { setSelectedColor(color); if(activeTool === 'ERASER') setActiveTool('PEN'); }}
               className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedColor === color && activeTool !== 'ERASER' ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent scale-90 opacity-70 hover:opacity-100 hover:scale-100'}`}
               style={{ backgroundColor: color }}
               aria-label={`Color ${color}`}
             />
           ))}
        </div>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        {/* Action Section */}
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={history.length === 0} className="w-8 h-8 text-slate-400 hover:text-white disabled:opacity-30 transition-all font-bold" title="Undo">↩</button>
          <button onClick={redo} disabled={redoStack.length === 0} className="w-8 h-8 text-slate-400 hover:text-white disabled:opacity-30 transition-all font-bold" title="Redo">↪</button>
          <button onClick={clearBoard} className="w-8 h-8 text-red-400 hover:text-red-300 transition-all font-bold text-xl" title="Clear Board">✖</button>
          <button onClick={saveSnapshot} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-all" title="Save Snapshot">💾 Save</button>
        </div>

      </div>
    </div>
  );
}
