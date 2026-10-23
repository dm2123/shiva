import { UserRole, UserStatus } from './auth';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  // Mobile authentication
  phone?: string;
  phoneVerified: boolean;
  // Email verification
  emailVerified: boolean;
  // Password reset / account recovery
  passwordResetToken?: string;
  passwordResetExpiresAt?: string;
  // Last login tracking
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  targetExam?: string;
  enrolledAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  bio?: string;
  qualification?: string;
  experienceYears?: number;
  educatorId?: string;
  organizationId: string; // Foreign key to Organization
  subjects?: string[];
  status: 'pending_setup' | 'active' | 'suspended' | 'deactivated';
  phoneVerified: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  department?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  profile: StudentProfile | TeacherProfile | AdminProfile | null;
}

// Academic Domain Models (Phase 3)

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  status: CourseStatus;
  isPublished: boolean;
  educatorId?: string; // Links to EducatorProfile
  /** e.g. "Hindi + English" — dikhta hai course detail par; na ho to app chip chhupata hai. */
  language?: string;
  /** Enrollment ke baad kitne mahine tak access rahega; na ho to validity nahi dikhti. */
  validityMonths?: number;
  /** "Ye course kiske liye hai" — har line ek bullet (admin form me \n se alag). */
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  code?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lecture {
  id: string;
  chapterId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  durationSeconds?: number;
  isPreviewable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  courseId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  educatorId?: string; // Links to EducatorProfile
  createdAt: string;
  updatedAt: string;
}

export interface TeacherCourseAssignment {
  id: string;
  teacherId: string;
  courseId: string;
  assignedAt: string;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  batchId?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  enrolledAt: string;
}

// Content Models
export interface Note {
  id: string;
  chapterId: string;
  title: string;
  contentUrl?: string; // S3 link or similar
  content?: string; // inline rich text
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type AssessmentType = 'PRACTICE' | 'DPP' | 'ASSIGNMENT';

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type: AssessmentType;
  totalMarks: number;
  passingMarks?: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  status: 'STARTED' | 'COMPLETED' | 'EVALUATED';
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResponse {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string; // For MCQ/MultipleCorrect
  answerText?: string; // For Numerical/Subjective
  isCorrect?: boolean;
  marksObtained: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  chapterId?: string; // Optional, can be in a global questions bank
  subjectId?: string;
  title: string; // The question text
  type: 'MCQ' | 'MULTIPLE_CORRECT' | 'SUBJECTIVE' | 'NUMERICAL';
  options?: any; // JSON string or array of objects with id, text, isCorrect
  correctAnswer?: string; 
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  negativeMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  subjectId?: string;
  chapterId?: string;
  batchId?: string;
  teacherId: string;
  organizationId?: string;
  
  scheduledStartAt: string;
  scheduledEndAt: string;
  actualStartedAt?: string | null;
  actualEndedAt?: string | null;
  
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  classType: 'REGULAR' | 'DEMO' | 'REVISION' | 'DPP' | 'DOUBT_SESSION' | 'SPECIAL';
  accessType: 'PUBLIC' | 'ENROLLED' | 'BATCH_ONLY';
  meetingUrl?: string;
  recordingUrl?: string;
  recordingStatus?: 'PENDING' | 'AVAILABLE' | 'UNAVAILABLE';

  createdAt: string;
  updatedAt: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  courseId: string;
  chapterId?: string;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  teacherId?: string; // Who resolved it
  teacherResponse?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Foundation
export interface Order {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Educator Profile Model (Phase 2)
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

export interface StudentLectureProgress {
  id: string;
  studentId: string;
  lectureId: string;
  isCompleted: boolean;
  positionSeconds: number;
  lastWatchedAt: string;
}
