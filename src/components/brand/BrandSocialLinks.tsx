interface BrandSocialLinksProps {
  links: {
    youtube?: string;
    facebook?: string;
    instagram?: string;
    telegram?: string;
    twitter?: string;
    linkedin?: string;
  };
  variant?: 'default' | 'compact' | 'minimal';
  showLabels?: boolean;
  className?: string;
}

/**
 * THE SHIVA — Brand Social Links Component
 * Reusable social media links for THE SHIVA and educators
 * 
 * Variants:
 * - default: Icons with hover effects
 * - compact: Smaller icons, no labels
 * - minimal: Simple icon list
 */
export default function BrandSocialLinks({
  links,
  variant = 'default',
  showLabels = false,
  className = '',
}: BrandSocialLinksProps) {
  const sizeClasses = {
    default: 'w-10 h-10 text-base',
    compact: 'w-8 h-8 text-sm',
    minimal: 'w-6 h-6 text-xs',
  };

  const socialPlatforms = [
    { key: 'youtube', label: 'YouTube', icon: '▶', color: 'hover:bg-red-500', url: links.youtube },
    { key: 'facebook', label: 'Facebook', icon: 'f', color: 'hover:bg-blue-600', url: links.facebook },
    { key: 'instagram', label: 'Instagram', icon: '📷', color: 'hover:bg-pink-500', url: links.instagram },
    { key: 'telegram', label: 'Telegram', icon: '✈', color: 'hover:bg-blue-400', url: links.telegram },
    { key: 'twitter', label: 'Twitter', icon: '𝕏', color: 'hover:bg-slate-900', url: links.twitter },
    { key: 'linkedin', label: 'LinkedIn', icon: 'in', color: 'hover:bg-blue-700', url: links.linkedin },
  ].filter(platform => platform.url);

  if (socialPlatforms.length === 0) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {socialPlatforms.map((platform) => (
          <a
            key={platform.key}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${sizeClasses[variant]} flex items-center justify-center rounded-full bg-slate-700 text-white transition-colors ${platform.color}`}
            aria-label={platform.label}
          >
            <span className="font-bold">{platform.icon}</span>
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {socialPlatforms.map((platform) => (
          <a
            key={platform.key}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${sizeClasses[variant]} flex items-center justify-center rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white transition-all duration-300 ${platform.color} hover:border-transparent hover:scale-110`}
            aria-label={platform.label}
          >
            <span className="font-bold">{platform.icon}</span>
          </a>
        ))}
      </div>
    );
  }

  // Default variant with optional labels
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {socialPlatforms.map((platform) => (
        <a
          key={platform.key}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
        >
          <div className={`${sizeClasses[variant]} flex items-center justify-center rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white transition-all duration-300 ${platform.color} hover:border-transparent hover:scale-110 hover:shadow-lg group-hover:shadow-${platform.key}/50`}>
            <span className="font-bold">{platform.icon}</span>
          </div>
          {showLabels && (
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              {platform.label}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
