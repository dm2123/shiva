// THE SHIVA Platform — Educator/Institute Types

export type EducatorStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface EducatorProfile {
  id: string;
  displayName: string;
  slug: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  email?: string;
  website?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  facebookPageUrl?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
  verified: boolean;
  status: EducatorStatus;
  specialties?: string[];
  subjects?: string[];
  examCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EducatorSocialLinks {
  youtube?: string;
  facebook?: string;
  facebookPage?: string;
  instagram?: string;
  telegram?: string;
  twitter?: string;
  website?: string;
}

export interface EducatorMetadata {
  coursesCount?: number;
  studentsCount?: number;
  rating?: number;
  reviewsCount?: number;
}

export interface EducatorCardProps {
  educator: EducatorProfile;
  showSocials?: boolean;
  showSpecialties?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}
