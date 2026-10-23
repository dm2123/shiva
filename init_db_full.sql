-- THE SHIVA EdTech Platform - Complete MySQL Schema
-- Generated: 2026-09-06
-- Database: the_shiva

-- ======================
-- CORE TABLES
-- ======================

-- Users Table (Authoritative auth source)
CREATE TABLE IF NOT EXISTS Users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
  status ENUM('ACTIVE', 'SUSPENDED', 'DEACTIVATED') DEFAULT 'ACTIVE',
  phone VARCHAR(20) UNIQUE DEFAULT NULL,
  phoneVerified BOOLEAN DEFAULT FALSE,
  emailVerified BOOLEAN DEFAULT FALSE,
  passwordResetToken VARCHAR(255) DEFAULT NULL,
  passwordResetExpiresAt DATETIME DEFAULT NULL,
  lastLoginAt DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Profiles
CREATE TABLE IF NOT EXISTS StudentProfiles (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  avatarUrl VARCHAR(500) DEFAULT NULL,
  targetExam VARCHAR(100) DEFAULT NULL,
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher Profiles
CREATE TABLE IF NOT EXISTS TeacherProfiles (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  photoUrl VARCHAR(500) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  qualification VARCHAR(255) DEFAULT NULL,
  experienceYears INT DEFAULT 0,
  slug VARCHAR(255) UNIQUE DEFAULT NULL,
  subjects JSON DEFAULT NULL COMMENT 'Array of subject strings',
  status ENUM('pending_setup', 'active', 'suspended', 'deactivated') DEFAULT 'active',
  phoneVerified BOOLEAN DEFAULT FALSE,
  emailVerified BOOLEAN DEFAULT FALSE,
  lastLoginAt DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_slug (slug),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Profiles
CREATE TABLE IF NOT EXISTS AdminProfiles (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- ACADEMIC CONTENT
-- ======================

-- Courses Table
CREATE TABLE IF NOT EXISTS Courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  thumbnailUrl VARCHAR(500) DEFAULT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  isPublished BOOLEAN DEFAULT FALSE,
  educatorId VARCHAR(36) DEFAULT NULL COMMENT 'Links to EducatorProfile or TeacherProfile',
  language VARCHAR(60) DEFAULT NULL COMMENT 'Course language, e.g. Hindi + English',
  validityMonths INT DEFAULT NULL COMMENT 'Access duration in months after enrollment',
  targetAudience TEXT DEFAULT NULL COMMENT 'Ye course kiske liye hai — har line ek bullet',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_isPublished (isPublished)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subjects Table
CREATE TABLE IF NOT EXISTS Subjects (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  INDEX idx_courseId (courseId),
  INDEX idx_sortOrder (sortOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chapters Table
CREATE TABLE IF NOT EXISTS Chapters (
  id VARCHAR(36) PRIMARY KEY,
  subjectId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subjectId) REFERENCES Subjects(id) ON DELETE CASCADE,
  INDEX idx_subjectId (subjectId),
  INDEX idx_sortOrder (sortOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lectures Table
CREATE TABLE IF NOT EXISTS Lectures (
  id VARCHAR(36) PRIMARY KEY,
  chapterId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  videoUrl VARCHAR(500) DEFAULT NULL,
  durationSeconds INT DEFAULT 0,
  isPreviewable BOOLEAN DEFAULT FALSE,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chapterId) REFERENCES Chapters(id) ON DELETE CASCADE,
  INDEX idx_chapterId (chapterId),
  INDEX idx_sortOrder (sortOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TEACHER & ENROLLMENT
-- ======================

-- Teacher Course Assignments (Multi-teacher support)
CREATE TABLE IF NOT EXISTS TeacherCourseAssignments (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_teacher_course (teacherId, courseId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_courseId (courseId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Batches Table
CREATE TABLE IF NOT EXISTS Batches (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  teacherId VARCHAR(36) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  startDate DATETIME DEFAULT NULL,
  endDate DATETIME DEFAULT NULL,
  status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') DEFAULT 'UPCOMING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  INDEX idx_courseId (courseId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student Enrollments
CREATE TABLE IF NOT EXISTS StudentEnrollments (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  batchId VARCHAR(36) DEFAULT NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_course (studentId, courseId),
  INDEX idx_studentId (studentId),
  INDEX idx_courseId (courseId),
  INDEX idx_batchId (batchId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- LIVE CLASSES
-- ======================

CREATE TABLE IF NOT EXISTS LiveClasses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  courseId VARCHAR(36) DEFAULT NULL,
  subjectId VARCHAR(36) DEFAULT NULL,
  chapterId VARCHAR(36) DEFAULT NULL,
  batchId VARCHAR(36) DEFAULT NULL,
  teacherId VARCHAR(36) DEFAULT NULL,
  startTime DATETIME NOT NULL COMMENT 'scheduledStartAt',
  endTime DATETIME DEFAULT NULL COMMENT 'scheduledEndAt',
  actualStartedAt DATETIME DEFAULT NULL,
  actualEndedAt DATETIME DEFAULT NULL,
  status ENUM('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED') DEFAULT 'SCHEDULED',
  meetingUrl VARCHAR(500) DEFAULT NULL,
  recordingUrl VARCHAR(500) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courseId (courseId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_status (status),
  INDEX idx_startTime (startTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- ASSESSMENT & TESTING
-- ======================

-- Questions Bank
CREATE TABLE IF NOT EXISTS Questions (
  id VARCHAR(36) PRIMARY KEY,
  chapterId VARCHAR(36) DEFAULT NULL,
  subjectId VARCHAR(36) DEFAULT NULL,
  title TEXT NOT NULL COMMENT 'Question text',
  type ENUM('MCQ', 'MULTIPLE_CORRECT', 'SUBJECTIVE', 'NUMERICAL') NOT NULL,
  options JSON DEFAULT NULL COMMENT 'Array of {id, text, isCorrect}',
  correctAnswer TEXT DEFAULT NULL,
  explanation TEXT DEFAULT NULL,
  difficulty ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
  marks DECIMAL(5, 2) DEFAULT 4.00,
  negativeMarks DECIMAL(5, 2) DEFAULT 1.00,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chapterId (chapterId),
  INDEX idx_subjectId (subjectId),
  INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tests Table
CREATE TABLE IF NOT EXISTS Tests (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  courseId VARCHAR(36) NOT NULL,
  durationMinutes INT DEFAULT 60,
  totalMarks DECIMAL(10, 2) DEFAULT 100.00,
  passingMarks DECIMAL(10, 2) DEFAULT NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  INDEX idx_courseId (courseId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assessments Table (DPP, Assignments, Practice)
CREATE TABLE IF NOT EXISTS Assessments (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  type ENUM('PRACTICE', 'DPP', 'ASSIGNMENT') DEFAULT 'PRACTICE',
  totalMarks DECIMAL(10, 2) DEFAULT 100.00,
  passingMarks DECIMAL(10, 2) DEFAULT NULL,
  startTime DATETIME DEFAULT NULL,
  endTime DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  INDEX idx_courseId (courseId),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assessment Attempts
CREATE TABLE IF NOT EXISTS AssessmentAttempts (
  id VARCHAR(36) PRIMARY KEY,
  assessmentId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  score DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('STARTED', 'COMPLETED', 'EVALUATED') DEFAULT 'STARTED',
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assessmentId (assessmentId),
  INDEX idx_studentId (studentId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assessment Responses
CREATE TABLE IF NOT EXISTS AssessmentResponses (
  id VARCHAR(36) PRIMARY KEY,
  attemptId VARCHAR(36) NOT NULL,
  questionId VARCHAR(36) NOT NULL,
  selectedOptionId VARCHAR(36) DEFAULT NULL,
  answerText TEXT DEFAULT NULL,
  isCorrect BOOLEAN DEFAULT NULL,
  marksObtained DECIMAL(5, 2) DEFAULT 0.00,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (attemptId) REFERENCES AssessmentAttempts(id) ON DELETE CASCADE,
  INDEX idx_attemptId (attemptId),
  INDEX idx_questionId (questionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- PROGRESS TRACKING
-- ======================

CREATE TABLE IF NOT EXISTS LectureProgress (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  lectureId VARCHAR(36) NOT NULL,
  isCompleted BOOLEAN DEFAULT FALSE,
  positionSeconds INT DEFAULT 0,
  lastWatchedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_lecture (studentId, lectureId),
  INDEX idx_studentId (studentId),
  INDEX idx_lectureId (lectureId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- COMMERCE
-- ======================

CREATE TABLE IF NOT EXISTS Orders (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  paymentId VARCHAR(255) DEFAULT NULL COMMENT 'External payment gateway ID',
  paymentMethod VARCHAR(50) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  INDEX idx_studentId (studentId),
  INDEX idx_courseId (courseId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- COMMUNICATION
-- ======================

CREATE TABLE IF NOT EXISTS Notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'WARNING', 'SUCCESS', 'ERROR') DEFAULT 'INFO',
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Doubts (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  chapterId VARCHAR(36) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('OPEN', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
  teacherId VARCHAR(36) DEFAULT NULL,
  teacherResponse TEXT DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  INDEX idx_studentId (studentId),
  INDEX idx_courseId (courseId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- AUDIT & LOGS
-- ======================

CREATE TABLE IF NOT EXISTS AuditLogs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(36) DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entityId VARCHAR(36) DEFAULT NULL,
  details JSON DEFAULT NULL,
  ipAddress VARCHAR(45) DEFAULT NULL,
  userAgent VARCHAR(500) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_entity (entity),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- DEMO DATA NOTICE
-- ======================

-- To seed demo data, run: npm run seed
-- To clear all data (DANGER): TRUNCATE TABLE Users; (cascades to all tables)
