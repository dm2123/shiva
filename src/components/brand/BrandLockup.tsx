import THEShivaLogo from './THEShivaLogo';

interface BrandLockupProps {
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * THE SHIVA — Brand Lockup
 * Combined logo + wordmark with proper hierarchy
 */
export default function BrandLockup({
  variant = 'horizontal',
  size = 'md',
  className = '',
}: BrandLockupProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <THEShivaLogo size={sizes[size]} variant="icon" />
        <div className="flex flex-col items-center text-center">
          <span className="text-xl font-black tracking-tight text-white">THE SHIVA</span>
          <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-semibold mt-1">
            Learn • Practice • Grow
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <THEShivaLogo size={sizes[size]} variant="full" />
    </div>
  );
}
