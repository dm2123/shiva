import Image from 'next/image';

interface THEShivaLogoProps {
  size?: number;
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
  priority?: boolean;
}

/**
 * THE SHIVA — Primary Platform Logo
 * Main brand identity across all portals
 */
export default function THEShivaLogo({
  size = 40,
  variant = 'full',
  className = '',
  priority = false,
}: THEShivaLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <Image
          src="/assets/logo.jpeg"
          alt="THE SHIVA"
          fill
          className="object-cover"
          priority={priority}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size }}>
          <Image
            src="/assets/logo.jpeg"
            alt="THE SHIVA"
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
        <span className="text-lg font-black tracking-tight">THE SHIVA</span>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative rounded-full overflow-hidden border-2 border-[#c8a96e]" style={{ width: size, height: size }}>
        <Image
          src="/assets/logo.jpeg"
          alt="THE SHIVA"
          fill
          className="object-cover"
          priority={priority}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-black tracking-tight leading-none">THE SHIVA</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
          Learn • Practice • Grow
        </span>
      </div>
    </div>
  );
}
