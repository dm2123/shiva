import Image from 'next/image';
import BrandSocialLinks from './BrandSocialLinks';
import { EducatorProfile } from '@/types/educator';

interface EducatorIdentityProps {
  educator: EducatorProfile;
  variant?: 'inline' | 'card' | 'full';
  showSocials?: boolean;
  showBio?: boolean;
  className?: string;
}

/**
 * EducatorIdentity Component
 * Standalone educator identity display
 * 
 * Variants:
 * - inline: Compact horizontal layout
 * - card: Card-style with background
 * - full: Complete profile display
 */
export default function EducatorIdentity({
  educator,
  variant = 'inline',
  showSocials = true,
  showBio = false,
  className = '',
}: EducatorIdentityProps) {
  const socialLinks = {
    youtube: educator.youtubeUrl,
    facebook: educator.facebookUrl || educator.facebookPageUrl,
    instagram: educator.instagramUrl,
    telegram: educator.telegramUrl,
    twitter: educator.twitterUrl,
  };
  const bio = educator.description;
  const logo = educator.logoUrl;

  const hasSocials = Object.values(socialLinks).some(link => link);

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Logo */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
          <Image
            src={logo || '/assets/logo.jpeg'}
            alt={educator.displayName}
            fill
            className="object-cover"
          />
        </div>

        {/* Name + Verified */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            {educator.displayName}
          </span>
          {educator.verified && (
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          )}
        </div>

        {/* Tagline */}
        {educator.tagline && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            · {educator.tagline}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 ${className}`}>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 ring-2 ring-teal-500/50">
            <Image
              src={logo || '/assets/logo.jpeg'}
              alt={educator.displayName}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                {educator.displayName}
              </h3>
              {educator.verified && (
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            
            {educator.tagline && (
              <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-2">
                {educator.tagline}
              </p>
            )}

            {showBio && bio && (
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {bio}
              </p>
            )}

            {showSocials && hasSocials && (
              <div className="mt-3">
                <BrandSocialLinks links={socialLinks} variant="compact" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-6">
        {/* Logo */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 ring-4 ring-teal-500/30 shadow-xl shadow-teal-500/20">
          <Image
            src={logo || '/assets/logo.jpeg'}
            alt={educator.displayName}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              {educator.displayName}
            </h2>
            {educator.verified && (
              <svg className="w-7 h-7 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            )}
          </div>
          
          {educator.tagline && (
            <p className="text-lg text-teal-600 dark:text-teal-400 font-bold mb-3">
              {educator.tagline}
            </p>
          )}

          {showSocials && hasSocials && (
            <BrandSocialLinks links={socialLinks} variant="default" />
          )}
        </div>
      </div>

      {/* Bio */}
      {showBio && bio && (
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {bio}
          </p>
        </div>
      )}

      {/* Contact */}
      {(educator.email || educator.website) && (
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {educator.email && (
            <a
              href={`mailto:${educator.email}`}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              📧 {educator.email}
            </a>
          )}
          {educator.website && (
            <a
              href={educator.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              🌐 {educator.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
