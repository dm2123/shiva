interface BrandBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'success' | 'info';
  className?: string;
}

/**
 * THE SHIVA — Brand Badge
 * Capsule UI for platform identity markers
 */
export default function BrandBadge({
  children,
  variant = 'default',
  className = '',
}: BrandBadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    gold: 'bg-[#c8a96e]/10 text-[#c8a96e] border-[#c8a96e]/30',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
