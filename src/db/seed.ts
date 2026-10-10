import * as db from '@/lib/db';
import { EducatorProfile, Organization } from '@/types/models';
import { EducatorProfile as EducatorProfileType } from '@/types/educator';

/**
 * Seed initial organizations
 */
export async function seedOrganizations() {
  const org: Organization = {
    id: 'org-dsa-001',
    name: 'Delhi Shiksha Academy',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createOrganization(org);
  // Organizations seeded
}

/**
 * Seed Delhi Shiksha Academy educator profile
 */
export async function seedDelhiShikshaAcademy() {
  const educator: Omit<EducatorProfile, 'createdAt' | 'updatedAt'> = {
    id: 'educator-dsa-001',
    displayName: 'Delhi Shiksha Academy',
    slug: 'delhi-shiksha-academy',
    tagline: 'Learn and Grow',
    description: 'Premier coaching institute specializing in SSC, Railway, Banking, Defence, and Teaching exam preparation. Expert faculty with proven track record in competitive exam coaching.',
    logoUrl: '/assets/logo.jpeg', // Using THE SHIVA logo temporarily until educator logo is added
    email: 'delhishikshaacademy@gmail.com',
    website: 'https://delhishikshaacademy.com',
    youtubeUrl: 'https://www.youtube.com/@delhishikshaacademy',
    facebookUrl: 'https://www.facebook.com/profile.php?id=100063859424449',
    facebookPageUrl: 'https://www.facebook.com/5gwifistudy',
    instagramUrl: 'https://www.instagram.com/a.p.sir_maths/',
    telegramUrl: 'https://t.me/ajayfamilyofficial',
    twitterUrl: 'https://twitter.com/APSir6',
    verified: true,
    status: 'ACTIVE',
    specialties: [
      'SSC Preparation',
      'Railway Exams',
      'Banking Exams',
      'Defence Exams',
      'Teaching Exams',
      'Current Affairs',
      'Mathematics',
      'Reasoning',
    ],
    subjects: [
      'Mathematics',
      'Reasoning',
      'General Knowledge',
      'Current Affairs',
      'English',
      'Hindi',
    ],
    examCategories: [
      'SSC CGL',
      'SSC CHSL',
      'SSC GD',
      'SSC MTS',
      'Railway Group D',
      'NTPC',
      'Banking',
      'IBPS',
      'SBI',
      'UP Police',
      'CTET',
      'Super TET',
      'UPSSSC',
      'Lekhpal',
    ],
  };

  await db.createEducatorProfile(educator);
  // Delhi Shiksha Academy educator profile seeded
}

/**
 * Seed Shivajay Sir (Founder) and English Teacher (Faculty)
 */
export async function seedFaculty() {
  const faculty: EducatorProfileType[] = [
    {
      id: 'faculty-shivajay-sir',
      displayName: 'Shivajay Sir (Founder)',
      slug: 'shivajay-sir',
      tagline: '4 Times IIT GATE Qualified',
      description: 'Founder of THE SHIVA. Expert in Quantitative Aptitude and Reasoning with a proven track record of 4 times qualifying IIT GATE.',
      logoUrl: '/assets/shivajay-sir.jpeg', // Needs to be added
      email: 'founder@theshiva.in',
      verified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faculty-english-teacher',
      displayName: 'Priyanka ma’am',
      slug: 'priyanka-mam',
      tagline: 'Master English for Competitive Exams',
      description: 'Expert English language faculty with extensive experience in SSC and Banking exam preparation.',
      logoUrl: '/assets/english-teacher.jpeg', // Needs to be added
      email: 'english@theshiva.in',
      verified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const f of faculty) {
    await db.createEducatorProfile(f);
  }
  // Faculty seeded
}

export async function seedCoursesWithEducators() {

  const educatorId = 'educator-dsa-001';
  
  // Check if educator exists
  const educator = await db.getEducatorById(educatorId);
  if (!educator) {
    // Educator not found, seeding educator first
    await seedDelhiShikshaAcademy();
  }

  // Sample courses with educator attribution
  const courses = [
    {
      id: 'course-ssc-cgl-2024',
      title: 'SSC CGL Complete Course 2024',
      slug: 'ssc-cgl-complete-2024',
      description: 'Comprehensive preparation for SSC CGL exam covering all sections - Quantitative Aptitude, Reasoning, English, and General Awareness.',
      thumbnailUrl: '/assets/courses/ssc-cgl.jpg',
      price: 2999,
      status: 'PUBLISHED' as const,
      isPublished: true,
      educatorId,
    },
    {
      id: 'course-railway-ntpc-2024',
      title: 'Railway NTPC Complete Course',
      slug: 'railway-ntpc-complete-2024',
      description: 'Full-length preparation course for Railway NTPC exam with detailed video lectures, practice tests, and study materials.',
      thumbnailUrl: '/assets/courses/railway-ntpc.jpg',
      price: 1999,
      status: 'PUBLISHED' as const,
      isPublished: true,
      educatorId,
    },
    {
      id: 'course-banking-po-2024',
      title: 'Banking PO Crash Course',
      slug: 'banking-po-crash-2024',
      description: 'Intensive crash course for IBPS PO and SBI PO exams. Covers Quantitative Aptitude, Reasoning, English, and Banking Awareness.',
      thumbnailUrl: '/assets/courses/banking-po.jpg',
      price: 3499,
      status: 'PUBLISHED' as const,
      isPublished: true,
      educatorId,
    },
    {
      id: 'course-ctet-paper-1',
      title: 'CTET Paper 1 Complete Course',
      slug: 'ctet-paper-1-complete',
      description: 'Complete preparation for CTET Paper 1 (Classes I-V) with child development, pedagogy, languages, mathematics, and EVS.',
      thumbnailUrl: '/assets/courses/ctet.jpg',
      price: 1499,
      status: 'PUBLISHED' as const,
      isPublished: true,
      educatorId,
    },
  ];

  for (const course of courses) {
    const existing = await db.findCourseByIdDb(course.id);
    if (!existing) {
      await db.createCourseDb(course);
      console.log(`Seeding course: ${course.title}`);
    }
  }
}

/**
 * Main seed function
 */
export async function runSimulationSeed() {
  // Starting database seeding process
  
  try {
    // Seed Organizations first
    await seedOrganizations();
    
    // Seed Delhi Shiksha Academy
    await seedDelhiShikshaAcademy();
    
    // Seed Faculty
    await seedFaculty();
    
    // Seed courses with educator attribution
    await seedCoursesWithEducators();
    
    // Database seeding completed
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}
