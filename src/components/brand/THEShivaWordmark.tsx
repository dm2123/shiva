/**
 * THE SHIVA — Brand Wordmark
 * Text-only brand identity
 */
export default function THEShivaWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-base font-black tracking-tight text-white leading-none">THE SHIVA</span>
      <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold mt-1">
        Learn • Practice • Grow
      </span>
    </div>
  );
}
