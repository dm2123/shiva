'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface BrandLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'full';
  text?: string;
  className?: string;
}

/**
 * THE SHIVA — Brand Loader Component
 * Loading spinner with brand identity
 * 
 * Variants:
 * - default: Logo with spinning ring
 * - minimal: Simple spinner only
 * - full: Logo + text + spinner
 */
export default function BrandLoader({
  size = 'md',
  variant = 'default',
  text = 'Loading...',
  className = '',
}: BrandLoaderProps) {
  const logoRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  const spinnerSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  useEffect(() => {
    // Pulse animation on mount
    if (logoRef.current) {
      logoRef.current.style.animation = 'shiva-pulse 2s ease-in-out infinite';
    }
  }, []);

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${spinnerSizeClasses[size]} relative`}>
          <div className="absolute inset-0 border-4 border-gold/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-gold rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
        {/* Logo with spinning ring */}
        <div className="relative">
          <div className={`${spinnerSizeClasses[size]} absolute inset-0 -m-4`}>
            <div className="absolute inset-0 border-4 border-gold/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-gold border-r-gold/50 rounded-full animate-spin"></div>
          </div>
          <div ref={logoRef} className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-slate-900/50 backdrop-blur-sm p-2`}>
            <Image
              src="/assets/logo.jpeg"
              alt="THE SHIVA"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold">
            THE SHIVA
          </h2>
          {text && (
            <p className={`${textSizeClasses[size]} text-slate-400 font-medium`}>
              {text}
            </p>
          )}
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${spinnerSizeClasses[size]} absolute inset-0 -m-2`}>
          <div className="absolute inset-0 border-3 border-gold/20 rounded-full"></div>
          <div className="absolute inset-0 border-3 border-transparent border-t-gold border-r-gold/60 rounded-full animate-spin"></div>
        </div>
        <div ref={logoRef} className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-slate-900/30 backdrop-blur-sm p-1.5`}>
          <Image
            src="/assets/logo.jpeg"
            alt="THE SHIVA"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

// Add to globals.css if not present:
/*
@keyframes shiva-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
*/
