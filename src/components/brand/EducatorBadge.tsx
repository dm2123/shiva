import Image from 'next/image';
import Link from 'next/link';
import { EducatorProfile } from '@/types/educator';

interface EducatorBadgeProps {
  educator: EducatorProfile;
  showVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Educator Badge — Small identity marker
 * Shows educator logo + name in compact form
 */
export default function EducatorBadge({
  educator,
  showVerified = true,
  size = 'md',
  className = '',
}: EducatorBadgeProps) {
  const sizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {educator.logoUrl ? (
        <div
          className="relative rounded-full overflow-hidden ring-2 ring-[#c8a96e]/20"
          style={{ width: sizes[size], height: sizes[size] }}
        >
          <Image
            src={educator.logoUrl}
            alt={educator.displayName}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="rounded-full bg-gradient-to-br from-[#c8a96e] to-[#a07840] flex items-center justify-center text-white font-bold"
          style={{ width: sizes[size], height: sizes[size], fontSize: sizes[size] / 2.5 }}
        >
          {educator.displayName.charAt(0)}
        </div>
      )}
      <span className={`font-semibold text-slate-700 ${textSizes[size]}`}>
        {educator.displayName}
      </span>
      {showVerified && educator.verified && (
        <svg
          className="w-4 h-4 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-label="Verified educator"
        >
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}
