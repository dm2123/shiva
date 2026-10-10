import Link from 'next/link';
import { EducatorProfile } from '@/types/educator';
import EducatorBadge from './EducatorBadge';

interface CourseInstructorCardProps {
  educator: EducatorProfile;
  variant?: 'default' | 'compact' | 'inline';
  showDescription?: boolean;
  showSocials?: boolean;
  className?: string;
}

/**
 * CourseInstructorCard — Shows educator attribution on course pages
 * Maintains THE SHIVA > Course > Educator hierarchy
 */
export default function CourseInstructorCard({
  educator,
  variant = 'default',
  showDescription = true,
  showSocials = false,
  className = '',
}: CourseInstructorCardProps) {
  const socialLinks = [
    { name: 'YouTube', url: educator.youtubeUrl, icon: '▶' },
    { name: 'Telegram', url: educator.telegramUrl, icon: '✈' },
  ].filter((link) => link.url);

  // Inline variant - minimal for course cards
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <span className="text-slate-500">Instructor:</span>
        <Link href={`/teachers/${educator.slug}`} className="hover:opacity-80 transition-opacity">
          <EducatorBadge educator={educator} size="sm" showVerified={false} />
        </Link>
      </div>
    );
  }

  // Compact variant - for sidebars
  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-xl border border-white/10 bg-white/5 ${className}`}>
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Course Instructor</p>
        <Link href={`/teachers/${educator.slug}`} className="block group">
          <EducatorBadge educator={educator} size="md" showVerified={true} />
          {educator.tagline && (
            <p className="text-xs text-slate-400 mt-2">{educator.tagline}</p>
          )}
        </Link>
        {showSocials && socialLinks.length > 0 && (
          <div className="flex gap-2 mt-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant - full card for course detail pages
  return (
    <div className={`p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Course Instructor</p>
          <Link href={`/teachers/${educator.slug}`} className="block group">
            <EducatorBadge educator={educator} size="lg" showVerified={true} />
          </Link>
        </div>
      </div>

      {educator.tagline && (
        <p className="text-sm font-semibold text-[#c8a96e] mb-3">{educator.tagline}</p>
      )}

      {showDescription && educator.description && (
        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {educator.description}
        </p>
      )}

      {educator.specialties && educator.specialties.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {educator.specialties.slice(0, 4).map((specialty) => (
              <span
                key={specialty}
                className="text-xs px-2 py-1 rounded-full bg-[#c8a96e]/10 text-[#c8a96e] font-semibold"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <Link
          href={`/teachers/${educator.slug}`}
          className="text-xs font-bold text-[#c8a96e] hover:text-[#e8d5a3] transition-colors"
        >
          View Instructor Profile →
        </Link>
        
        {showSocials && socialLinks.length > 0 && (
          <div className="flex gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
