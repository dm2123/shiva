import Image from 'next/image';
import Link from 'next/link';
import { EducatorProfile } from '@/types/educator';

interface EducatorCardProps {
  educator: EducatorProfile;
  variant?: 'default' | 'compact' | 'featured';
  showSocials?: boolean;
  className?: string;
}

/**
 * Educator Card — Full card presentation
 * Used in educator listings, featured sections
 */
export default function EducatorCard({
  educator,
  variant = 'default',
  showSocials = false,
  className = '',
}: EducatorCardProps) {
  const socialLinks = [
    { name: 'YouTube', url: educator.youtubeUrl, icon: '▶' },
    { name: 'Telegram', url: educator.telegramUrl, icon: '✈' },
    { name: 'Facebook', url: educator.facebookUrl, icon: 'f' },
    { name: 'Instagram', url: educator.instagramUrl, icon: '📷' },
    { name: 'Twitter', url: educator.twitterUrl, icon: '🐦' },
  ].filter((link) => link.url);

  if (variant === 'compact') {
    return (
      <Link
        href={`/teachers/${educator.slug}`}
        className={`block shiva-feature-card p-6 hover:border-[#c8a96e]/30 transition-all group ${className}`}
      >
        <div className="flex items-center gap-4">
          {educator.logoUrl ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#c8a96e]/20 group-hover:ring-[#c8a96e]/40 transition-all">
              <Image
                src={educator.logoUrl}
                alt={educator.displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c8a96e] to-[#a07840] flex items-center justify-center text-white font-bold text-2xl">
              {educator.displayName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base truncate group-hover:text-[#c8a96e] transition-colors">
                {educator.displayName}
              </h3>
              {educator.verified && (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {educator.tagline && (
              <p className="text-xs text-slate-400 mb-2">{educator.tagline}</p>
            )}
            {educator.specialties && educator.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {educator.specialties.slice(0, 3).map((specialty) => (
                  <span
                    key={specialty}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#c8a96e]/10 text-[#c8a96e] font-semibold"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant - full card
  return (
    <div className={`shiva-feature-card p-8 flex flex-col gap-5 ${className}`}>
      <div className="flex items-start justify-between">
        {educator.logoUrl ? (
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-[#c8a96e]/20">
            <Image
              src={educator.logoUrl}
              alt={educator.displayName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c8a96e] to-[#a07840] flex items-center justify-center text-white font-bold text-3xl">
            {educator.displayName.charAt(0)}
          </div>
        )}
        {educator.verified && (
          <span className="shiva-capsule shiva-capsule-blue">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-2">{educator.displayName}</h3>
        {educator.tagline && (
          <p className="text-sm text-[#c8a96e] font-semibold mb-3">{educator.tagline}</p>
        )}
        {educator.description && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{educator.description}</p>
        )}
      </div>

      {educator.specialties && educator.specialties.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {educator.specialties.slice(0, 6).map((specialty) => (
              <span
                key={specialty}
                className="shiva-capsule"
                style={{
                  background: 'rgba(200,169,110,0.1)',
                  color: '#c8a96e',
                  borderColor: 'rgba(200,169,110,0.3)',
                }}
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {showSocials && socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              aria-label={link.name}
            >
              {link.icon} {link.name}
            </a>
          ))}
        </div>
      )}

      <Link
        href={`/teachers/${educator.slug}`}
        className="text-sm font-bold text-[#c8a96e] hover:text-[#e8d5a3] flex items-center gap-1 group/link mt-auto"
      >
        View Educator Profile
        <span className="group-hover/link:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  );
}
