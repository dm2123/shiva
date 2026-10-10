import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEducatorBySlug } from '@/services/educator.service';
import BrandBadge from '@/components/brand/BrandBadge';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const educator = await getEducatorBySlug(params.slug);
  
  if (!educator) {
    return {
      title: 'Educator Not Found — THE SHIVA',
    };
  }

  return {
    title: `${educator.displayName} — Educator at THE SHIVA`,
    description: educator.description || `Expert educator ${educator.displayName} on THE SHIVA platform`,
    openGraph: {
      title: `${educator.displayName} — THE SHIVA`,
      description: educator.description || '',
      images: educator.logoUrl ? [{ url: educator.logoUrl }] : [],
    },
  };
}

export default async function EducatorDetailPage({ params }: PageProps) {
  const educator = await getEducatorBySlug(params.slug);

  if (!educator) {
    notFound();
  }

  const socialLinks = [
    { name: 'YouTube', url: educator.youtubeUrl, icon: '▶', color: 'text-red-500' },
    { name: 'Telegram', url: educator.telegramUrl, icon: '✈', color: 'text-blue-400' },
    { name: 'Facebook', url: educator.facebookUrl, icon: 'f', color: 'text-blue-600' },
    { name: 'Instagram', url: educator.instagramUrl, icon: '📷', color: 'text-pink-500' },
    { name: 'Twitter/X', url: educator.twitterUrl, icon: '𝕏', color: 'text-slate-300' },
    { name: 'Website', url: educator.website, icon: '🌐', color: 'text-emerald-500' },
  ].filter((link) => link.url);

  return (
    <div className="min-h-screen py-20">
      <div className="shiva-container">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link href="/teachers" className="hover:text-white transition-colors">Educators</Link></li>
            <li>/</li>
            <li className="text-white font-semibold">{educator.displayName}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="shiva-feature-card p-10 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              {educator.logoUrl ? (
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-[#c8a96e]/30">
                  <Image
                    src={educator.logoUrl}
                    alt={educator.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#c8a96e] to-[#a07840] flex items-center justify-center text-white font-bold text-5xl ring-4 ring-[#c8a96e]/30">
                  {educator.displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-4xl font-black text-white">{educator.displayName}</h1>
                {educator.verified && (
                  <BrandBadge variant="info">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Educator
                  </BrandBadge>
                )}
              </div>

              {educator.tagline && (
                <p className="text-lg text-[#c8a96e] font-bold mb-4">{educator.tagline}</p>
              )}

              {educator.description && (
                <p className="text-base text-slate-300 leading-relaxed mb-6">
                  {educator.description}
                </p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-lg font-semibold text-sm bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 ${link.color}`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Specialties */}
            {educator.specialties && educator.specialties.length > 0 && (
              <div className="shiva-feature-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Teaching Specialties</h2>
                <div className="flex flex-wrap gap-3">
                  {educator.specialties.map((specialty) => (
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

            {/* Exam Categories */}
            {educator.examCategories && educator.examCategories.length > 0 && (
              <div className="shiva-feature-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Exam Categories</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {educator.examCategories.map((category) => (
                    <div
                      key={category}
                      className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm"
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subjects */}
            {educator.subjects && educator.subjects.length > 0 && (
              <div className="shiva-feature-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Subjects Taught</h2>
                <div className="flex flex-wrap gap-3">
                  {educator.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 font-semibold text-sm border border-violet-500/30"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="shiva-feature-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {educator.email && (
                  <div>
                    <p className="text-slate-500 uppercase font-bold text-xs mb-1">Email</p>
                    <a
                      href={`mailto:${educator.email}`}
                      className="text-[#c8a96e] hover:text-[#e8d5a3] transition-colors break-all"
                    >
                      {educator.email}
                    </a>
                  </div>
                )}
                {educator.website && (
                  <div>
                    <p className="text-slate-500 uppercase font-bold text-xs mb-1">Website</p>
                    <a
                      href={educator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c8a96e] hover:text-[#e8d5a3] transition-colors break-all"
                    >
                      {educator.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Notice */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#c8a96e]/10 to-transparent border border-[#c8a96e]/20">
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-white block mb-2">Part of THE SHIVA Platform</strong>
                {educator.displayName} is a verified educator partner on THE SHIVA, India&apos;s premium digital learning platform for competitive exam preparation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
