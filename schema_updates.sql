-- THE SHIVA EdTech Platform - Schema Updates
-- Batch M: All new tables + ALTER TABLE changes
-- Generated: 2026-09-08

-- ======================
-- ALTER EXISTING TABLES
-- ======================

-- Users: referral system + language preference
ALTER TABLE Users ADD COLUMN referralCode VARCHAR(20) DEFAULT NULL;
ALTER TABLE Users ADD COLUMN preferredLanguage VARCHAR(5) DEFAULT 'en';

-- Tests: scholarship support
ALTER TABLE Tests ADD COLUMN isScholarship BOOLEAN DEFAULT FALSE;
ALTER TABLE Tests ADD COLUMN scholarshipReward DECIMAL(10,2) DEFAULT NULL;
ALTER TABLE Tests ADD COLUMN maxParticipants INT DEFAULT NULL;
ALTER TABLE Tests ADD COLUMN participantsCount INT DEFAULT 0;
ALTER TABLE Tests ADD COLUMN scholarshipEndDate DATETIME DEFAULT NULL;

-- Courses: micro-courses + difficulty
ALTER TABLE Courses ADD COLUMN courseType ENUM('FULL','MICRO','CRASH','FREE') DEFAULT 'FULL';
ALTER TABLE Courses ADD COLUMN durationWeeks INT DEFAULT NULL;
ALTER TABLE Courses ADD COLUMN difficulty ENUM('BEGINNER','INTERMEDIATE','ADVANCED') DEFAULT 'INTERMEDIATE';

-- ======================
-- LIVE CLASS ENHANCEMENTS
-- ======================

-- Chat messages during live class
CREATE TABLE IF NOT EXISTS LiveClassMessages (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_liveClassId (liveClassId),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Live class polls
CREATE TABLE IF NOT EXISTS LiveClassPolls (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL COMMENT 'Array of {id, text}',
  createdBy VARCHAR(36) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_liveClassId (liveClassId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Poll responses
CREATE TABLE IF NOT EXISTS LiveClassPollResponses (
  id VARCHAR(36) PRIMARY KEY,
  pollId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  selectedOption INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_poll_user (pollId, userId),
  INDEX idx_pollId (pollId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- LECTURE MATERIALS
-- ======================

-- PDFs, notes, slides per lecture
CREATE TABLE IF NOT EXISTS LectureMaterials (
  id VARCHAR(36) PRIMARY KEY,
  lectureId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  fileUrl TEXT NOT NULL,
  fileType ENUM('PDF','NOTES','SLIDES','DPP','ANSWER_KEY') DEFAULT 'NOTES',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lectureId (lectureId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student annotations per lecture
CREATE TABLE IF NOT EXISTS LectureNotes (
  id VARCHAR(36) PRIMARY KEY,
  lectureId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_lecture_note (lectureId, studentId),
  INDEX idx_lectureId (lectureId),
  INDEX idx_studentId (studentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- GAMIFICATION
-- ======================

-- XP points tracking
CREATE TABLE IF NOT EXISTS StudentXP (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  points INT DEFAULT 0,
  source ENUM('TEST','LECTURE','DPP','STREAK','REFERRAL','DAILY_LOGIN','SCHOLARSHIP') NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_studentId (studentId),
  INDEX idx_source (source),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily engagement streaks
CREATE TABLE IF NOT EXISTS DailyStreaks (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  streakDate DATE NOT NULL,
  loginMinutes INT DEFAULT 0,
  testsCompleted INT DEFAULT 0,
  lecturesWatched INT DEFAULT 0,
  UNIQUE KEY unique_student_date (studentId, streakDate),
  INDEX idx_studentId (studentId),
  INDEX idx_streakDate (streakDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leaderboard cache (materialized view)
CREATE TABLE IF NOT EXISTS LeaderboardCache (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  totalXP INT DEFAULT 0,
  testScore DECIMAL(5,2) DEFAULT 0,
  completionPct DECIMAL(5,2) DEFAULT 0,
  userRank INT DEFAULT 0,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_course_student (courseId, studentId),
  INDEX idx_courseId (courseId),
  INDEX idx_rank (userRank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- WALLET & REFERRALS
-- ======================

-- Student wallet
CREATE TABLE IF NOT EXISTS Wallet (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) UNIQUE NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  totalEarned DECIMAL(10,2) DEFAULT 0,
  totalSpent DECIMAL(10,2) DEFAULT 0,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallet transactions
CREATE TABLE IF NOT EXISTS WalletTransactions (
  id VARCHAR(36) PRIMARY KEY,
  walletId VARCHAR(36) NOT NULL,
  type ENUM('CREDIT','DEBIT') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source ENUM('REFERRAL','SCHOLARSHIP','REFUND','PURCHASE','BONUS') NOT NULL,
  description TEXT,
  referenceId VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_walletId (walletId),
  INDEX idx_type (type),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referral tracking
CREATE TABLE IF NOT EXISTS Referrals (
  id VARCHAR(36) PRIMARY KEY,
  referrerId VARCHAR(36) NOT NULL,
  referredId VARCHAR(36) NOT NULL,
  referralCode VARCHAR(20) NOT NULL,
  status ENUM('PENDING','COMPLETED','EXPIRED') DEFAULT 'PENDING',
  rewardAmount DECIMAL(10,2) DEFAULT 50.00,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_referred (referredId),
  INDEX idx_referrerId (referrerId),
  INDEX idx_referralCode (referralCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- DISCUSSION FORUM
-- ======================

-- Forum posts/threads
CREATE TABLE IF NOT EXISTS ForumPosts (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  authorId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSON DEFAULT NULL,
  upvotes INT DEFAULT 0,
  answersCount INT DEFAULT 0,
  isResolved BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courseId (courseId),
  INDEX idx_authorId (authorId),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forum answers/replies
CREATE TABLE IF NOT EXISTS ForumAnswers (
  id VARCHAR(36) PRIMARY KEY,
  postId VARCHAR(36) NOT NULL,
  authorId VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  isAccepted BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_postId (postId),
  INDEX idx_authorId (authorId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Forum upvotes
CREATE TABLE IF NOT EXISTS ForumUpvotes (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  postId VARCHAR(36) DEFAULT NULL,
  answerId VARCHAR(36) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_post (userId, postId),
  UNIQUE KEY unique_user_answer (userId, answerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- MENTORSHIP
-- ======================

-- Mentorship relationships
CREATE TABLE IF NOT EXISTS Mentorships (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  teacherId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  status ENUM('PENDING','ACTIVE','PAUSED','COMPLETED') DEFAULT 'PENDING',
  startDate DATETIME DEFAULT NULL,
  endDate DATETIME DEFAULT NULL,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_studentId (studentId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mentorship sessions
CREATE TABLE IF NOT EXISTS MentorshipSessions (
  id VARCHAR(36) PRIMARY KEY,
  mentorshipId VARCHAR(36) NOT NULL,
  scheduledAt DATETIME NOT NULL,
  durationMinutes INT DEFAULT 30,
  notes TEXT,
  status ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'SCHEDULED',
  rating INT DEFAULT NULL,
  feedback TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mentorshipId (mentorshipId),
  INDEX idx_scheduledAt (scheduledAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- SUBSCRIPTIONS
-- ======================

-- Subscription plans
CREATE TABLE IF NOT EXISTS SubscriptionPlans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  durationMonths INT DEFAULT 1,
  features JSON NOT NULL COMMENT 'Array of feature strings',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Active subscriptions
CREATE TABLE IF NOT EXISTS Subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  planId VARCHAR(36) NOT NULL,
  status ENUM('ACTIVE','EXPIRED','CANCELLED','PAUSED') DEFAULT 'ACTIVE',
  startDate DATETIME NOT NULL,
  endDate DATETIME NOT NULL,
  paymentId VARCHAR(36) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_studentId (studentId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- MULTI-LANGUAGE
-- ======================

-- Translation strings
CREATE TABLE IF NOT EXISTS Translations (
  id VARCHAR(36) PRIMARY KEY,
  langCode VARCHAR(5) NOT NULL,
  namespace VARCHAR(50) NOT NULL,
  translationKey VARCHAR(100) NOT NULL,
  translationValue TEXT NOT NULL,
  UNIQUE KEY unique_lang_key (langCode, namespace, translationKey),
  INDEX idx_langCode (langCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- NCERT SOLUTIONS
-- ======================

-- NCERT Q&A database
CREATE TABLE IF NOT EXISTS NCERTSolutions (
  id VARCHAR(36) PRIMARY KEY,
  classLevel INT NOT NULL,
  subject VARCHAR(50) NOT NULL,
  chapter VARCHAR(100) NOT NULL,
  questionNumber VARCHAR(20) NOT NULL,
  questionText TEXT NOT NULL,
  solution TEXT NOT NULL,
  videoUrl TEXT DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_classLevel (classLevel),
  INDEX idx_subject (subject),
  INDEX idx_chapter (chapter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- PARENT PORTAL
-- ======================

-- Parent accounts
CREATE TABLE IF NOT EXISTS ParentProfiles (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relationship ENUM('FATHER','MOTHER','GUARDIAN') DEFAULT 'FATHER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parent-student links
CREATE TABLE IF NOT EXISTS ParentStudentLinks (
  id VARCHAR(36) PRIMARY KEY,
  parentId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  UNIQUE KEY unique_parent_student (parentId, studentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- OFFLINE CENTERS
-- ======================

-- Physical learning centers
CREATE TABLE IF NOT EXISTS OfflineCenters (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  capacity INT DEFAULT 0,
  coursesOffered JSON NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_city (city),
  INDEX idx_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Center enrollments
CREATE TABLE IF NOT EXISTS CenterEnrollments (
  id VARCHAR(36) PRIMARY KEY,
  centerId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  UNIQUE KEY unique_center_student (centerId, studentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- INDEXES FOR PERFORMANCE
-- ======================

-- Additional performance indexes
CREATE INDEX idx_live_classes_status ON LiveClasses(status);
CREATE INDEX idx_live_classes_start ON LiveClasses(startTime);
CREATE INDEX idx_student_xp_total ON StudentXP(studentId, points);
CREATE INDEX idx_forum_posts_course ON ForumPosts(courseId, createdAt);
CREATE INDEX idx_forum_answers_post ON ForumAnswers(postId, createdAt);
CREATE INDEX idx_wallet_student ON Wallet(studentId);
CREATE INDEX idx_subscriptions_student ON Subscriptions(studentId, status);
CREATE INDEX idx_ncert_class_subject ON NCERTSolutions(classLevel, subject);
CREATE INDEX idx_parent_student ON ParentStudentLinks(parentId, studentId);
CREATE INDEX idx_center_city ON OfflineCenters(city, isActive);

SELECT 'Schema updates applied successfully!' AS status;
