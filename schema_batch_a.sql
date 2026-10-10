-- ============================================================
-- BATCH A: Push Notifications, Teacher Schedule, Teacher Perf, Streak+, Question Bank
-- ============================================================

-- 1. PUSH NOTIFICATION SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS PushSubscriptions (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  authKey VARCHAR(255) NOT NULL,
  userAgent VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_endpoint (userId, endpoint(200)),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 2. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS NotificationPreferences (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  liveClassAlerts TINYINT(1) DEFAULT 1,
  testAlerts TINYINT(1) DEFAULT 1,
  assignmentAlerts TINYINT(1) DEFAULT 1,
  doubtAlerts TINYINT(1) DEFAULT 1,
  announcementAlerts TINYINT(1) DEFAULT 1,
  streakReminders TINYINT(1) DEFAULT 1,
  weeklyReport TINYINT(1) DEFAULT 1,
  emailNotifications TINYINT(1) DEFAULT 1,
  smsNotifications TINYINT(1) DEFAULT 0,
  pushEnabled TINYINT(1) DEFAULT 1,
  quietHoursStart TIME DEFAULT '22:00:00',
  quietHoursEnd TIME DEFAULT '07:00:00',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user (userId),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 3. NOTIFICATION LOG (track sent notifications)
CREATE TABLE IF NOT EXISTS NotificationLog (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  type ENUM('LIVE_CLASS', 'TEST', 'ASSIGNMENT', 'DOUBT', 'ANNOUNCEMENT', 'STREAK', 'WEEKLY_REPORT', 'SYSTEM') NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSON,
  channel ENUM('PUSH', 'EMAIL', 'SMS', 'IN_APP') DEFAULT 'PUSH',
  status ENUM('SENT', 'DELIVERED', 'FAILED', 'READ') DEFAULT 'SENT',
  readAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user_type (userId, type),
  INDEX idx_user_status (userId, status)
);

-- 4. TEACHER WEEKLY SCHEDULE
CREATE TABLE IF NOT EXISTS TeacherSchedule (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36),
  batchId VARCHAR(36),
  subjectId VARCHAR(36),
  dayOfWeek TINYINT NOT NULL COMMENT '0=Sun,1=Mon,...,6=Sat',
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  room VARCHAR(100),
  type ENUM('LECTURE', 'LIVE_CLASS', 'DOUBT_SESSION', 'TEST', 'MEETING') DEFAULT 'LECTURE',
  title VARCHAR(255),
  status ENUM('ACTIVE', 'CANCELLED', 'COMPLETED') DEFAULT 'ACTIVE',
  recurring TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacherId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_teacher_day (teacherId, dayOfWeek)
);

-- 5. TEACHER PERFORMANCE METRICS
CREATE TABLE IF NOT EXISTS TeacherPerformance (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  weekStart DATE NOT NULL,
  weekEnd DATE NOT NULL,
  classesScheduled INT DEFAULT 0,
  classesConducted INT DEFAULT 0,
  classesCancelled INT DEFAULT 0,
  totalStudentsEnrolled INT DEFAULT 0,
  avgAttendancePercent DECIMAL(5,2) DEFAULT 0,
  avgPollParticipation DECIMAL(5,2) DEFAULT 0,
  avgDoubtResolutionMinutes INT DEFAULT 0,
  doubtsResolved INT DEFAULT 0,
  avgStudentRating DECIMAL(3,2) DEFAULT 0,
  totalRatings INT DEFAULT 0,
  liveClassHours DECIMAL(5,2) DEFAULT 0,
  studentsHelped INT DEFAULT 0,
  engagementScore DECIMAL(5,2) DEFAULT 0 COMMENT 'Composite 0-100 score',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_teacher_week (teacherId, weekStart),
  FOREIGN KEY (teacherId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 6. ENHANCED STREAKS (daily check-in with rewards)
CREATE TABLE IF NOT EXISTS StreakRewards (
  id VARCHAR(36) PRIMARY KEY,
  streakDays INT NOT NULL,
  rewardType ENUM('XP', 'BADGE', 'DISCOUNT', 'PREMIUM_DAYS') NOT NULL,
  rewardValue INT NOT NULL COMMENT 'XP amount or days or percent',
  rewardName VARCHAR(100) NOT NULL,
  badgeIcon VARCHAR(50),
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. QUESTION BANK ENHANCEMENTS
CREATE TABLE IF NOT EXISTS QuestionTags (
  id VARCHAR(36) PRIMARY KEY,
  questionId VARCHAR(36) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  FOREIGN KEY (questionId) REFERENCES Questions(id) ON DELETE CASCADE,
  INDEX idx_question_tag (questionId, tag),
  INDEX idx_tag (tag)
);

CREATE TABLE IF NOT EXISTS QuestionDifficulty (
  id VARCHAR(36) PRIMARY KEY,
  questionId VARCHAR(36) NOT NULL,
  difficulty ENUM('EASY', 'MEDIUM', 'HARD', 'VERY_HARD') DEFAULT 'MEDIUM',
  estimatedTimeSeconds INT DEFAULT 60,
  correctRate DECIMAL(5,2) DEFAULT 0 COMMENT 'Percent who got it right',
  avgTimeSeconds DECIMAL(6,2) DEFAULT 0,
  totalAttempts INT DEFAULT 0,
  FOREIGN KEY (questionId) REFERENCES Questions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_question (questionId)
);

-- 8. E-BOOKS / DIGITAL BOOKS
CREATE TABLE IF NOT EXISTS EBooks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  description TEXT,
  coverUrl VARCHAR(500),
  fileUrl VARCHAR(500) NOT NULL,
  fileSizeMB DECIMAL(6,2),
  pageCount INT,
  courseId VARCHAR(36),
  subjectId VARCHAR(36),
  category ENUM('TEXTBOOK', 'REFERENCE', 'FORMULA_SHEET', 'SHORT_NOTES', 'PRACTICE') DEFAULT 'TEXTBOOK',
  difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
  language VARCHAR(10) DEFAULT 'en',
  isFree TINYINT(1) DEFAULT 0,
  downloadCount INT DEFAULT 0,
  status ENUM('ACTIVE', 'DRAFT', 'ARCHIVED') DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_course (courseId),
  INDEX idx_subject (subjectId),
  INDEX idx_category (category)
);

CREATE TABLE IF NOT EXISTS EBookProgress (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  ebookId VARCHAR(36) NOT NULL,
  currentPage INT DEFAULT 0,
  totalPages INT DEFAULT 0,
  highlights JSON COMMENT 'Array of {page, text, color}',
  bookmarks JSON COMMENT 'Array of {page, label}',
  lastReadAt DATETIME,
  completed TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_book (userId, ebookId),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (ebookId) REFERENCES EBooks(id) ON DELETE CASCADE
);

-- 9. FORMULA SHEETS
CREATE TABLE IF NOT EXISTS FormulaSheets (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subjectId VARCHAR(36),
  courseId VARCHAR(36),
  chapterId VARCHAR(36),
  content JSON NOT NULL COMMENT 'Array of {topic, formulas: [{name, formula, description}]}',
  pdfUrl VARCHAR(500),
  difficulty ENUM('JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'FOUNDATION') DEFAULT 'JEE_MAIN',
  language VARCHAR(10) DEFAULT 'en',
  downloadCount INT DEFAULT 0,
  status ENUM('ACTIVE', 'DRAFT') DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subject (subjectId),
  INDEX idx_chapter (chapterId)
);

-- 10. OFFLINE DOWNLOAD TRACKING (enhanced)
CREATE TABLE IF NOT EXISTS OfflineContent (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  contentType ENUM('LECTURE_VIDEO', 'LECTURE_NOTES', 'DPP', 'PYQ', 'EBOOK', 'FORMULA_SHEET', 'RECORDING') NOT NULL,
  contentId VARCHAR(36) NOT NULL,
  fileSizeMB DECIMAL(6,2) DEFAULT 0,
  downloadStatus ENUM('PENDING', 'DOWNLOADING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  localPath VARCHAR(500),
  expiresAt DATETIME,
  lastAccessedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_content (userId, contentType, contentId),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user_status (userId, downloadStatus)
);

-- Seed streak rewards
INSERT INTO StreakRewards (id, streakDays, rewardType, rewardValue, rewardName, badgeIcon, description) VALUES
('streak-reward-1', 3, 'XP', 50, '3-Day Streak', '🔥', 'Login 3 days in a row for 50 XP'),
('streak-reward-2', 7, 'XP', 150, 'Week Warrior', '⚡', '7-day streak for 150 XP'),
('streak-reward-3', 7, 'BADGE', 1, 'Week Warrior Badge', '🏅', 'Unlock the Week Warrior badge'),
('streak-reward-4', 14, 'XP', 300, 'Fortnight Fighter', '💎', '14-day streak for 300 XP'),
('streak-reward-5', 21, 'XP', 500, 'Triple Threat', '👑', '21-day streak for 500 XP'),
('streak-reward-6', 21, 'BADGE', 1, 'Triple Threat Badge', '🏆', 'Unlock the Triple Threat badge'),
('streak-reward-7', 30, 'XP', 1000, 'Monthly Master', '🌟', '30-day streak for 1000 XP'),
('streak-reward-8', 30, 'BADGE', 1, 'Monthly Master Badge', '🎖️', 'Unlock the Monthly Master badge'),
('streak-reward-9', 30, 'PREMIUM_DAYS', 7, '7-Day Premium', '⭐', 'Get 7 days premium free'),
('streak-reward-10', 60, 'XP', 2500, 'Streak Legend', '🔥', '60-day streak for 2500 XP'),
('streak-reward-11', 90, 'XP', 5000, 'Streak God', 'immortal', '90-day streak for 5000 XP'),
('streak-reward-12', 90, 'BADGE', 1, 'Immortal Streak Badge', '♾️', 'The rarest badge - 90 days');

-- Seed teacher schedules
INSERT INTO TeacherSchedule (id, teacherId, courseId, batchId, subjectId, dayOfWeek, startTime, endTime, room, type, title) VALUES
('tsch-001', 'teacher-001', 'course-001', 'batch-001', 'subject-001', 1, '09:00:00', '10:30:00', 'Room 101', 'LECTURE', 'Physics: Mechanics'),
('tsch-002', 'teacher-001', 'course-001', 'batch-001', 'subject-001', 3, '09:00:00', '10:30:00', 'Room 101', 'LECTURE', 'Physics: Thermodynamics'),
('tsch-003', 'teacher-001', 'course-001', 'batch-001', 'subject-001', 5, '09:00:00', '10:30:00', 'Room 101', 'LECTURE', 'Physics: Waves'),
('tsch-004', 'teacher-002', 'course-001', 'batch-002', 'subject-003', 2, '11:00:00', '12:30:00', 'Room 102', 'LECTURE', 'English: Grammar'),
('tsch-005', 'teacher-002', 'course-001', 'batch-002', 'subject-003', 4, '11:00:00', '12:30:00', 'Room 102', 'LECTURE', 'English: Literature'),
('tsch-006', 'teacher-002', 'course-001', 'batch-002', 'subject-003', 6, '10:00:00', '11:00:00', 'Online', 'DOUBT_SESSION', 'English: Doubt Clearing'),
('tsch-007', 'teacher-003', 'course-002', 'batch-003', 'subject-002', 1, '14:00:00', '15:30:00', 'Room 103', 'LECTURE', 'Chemistry: Organic'),
('tsch-008', 'teacher-003', 'course-002', 'batch-003', 'subject-002', 3, '14:00:00', '15:30:00', 'Room 103', 'LECTURE', 'Chemistry: Inorganic'),
('tsch-009', 'teacher-003', 'course-002', 'batch-003', 'subject-002', 5, '14:00:00', '15:30:00', 'Room 103', 'LECTURE', 'Chemistry: Physical'),
('tsch-010', 'teacher-004', 'course-003', 'batch-004', 'subject-004', 2, '16:00:00', '17:30:00', 'Room 104', 'LECTURE', 'Maths: Algebra'),
('tsch-011', 'teacher-004', 'course-003', 'batch-004', 'subject-004', 4, '16:00:00', '17:30:00', 'Room 104', 'LECTURE', 'Maths: Calculus'),
('tsch-012', 'teacher-004', 'course-003', 'batch-004', 'subject-004', 6, '15:00:00', '16:00:00', 'Online', 'TEST', 'Maths: Weekly Test');

-- Seed formula sheets
INSERT INTO FormulaSheets (id, title, subjectId, courseId, chapterId, content, difficulty) VALUES
('fs-001', 'Physics: Mechanics Formulas', 'subject-001', 'course-001', 'chapter-001',
 '[{"topic":"Newton Laws","formulas":[{"name":"Second Law","formula":"F = ma","description":"Force equals mass times acceleration"},{"name":"Momentum","formula":"p = mv","description":"Momentum equals mass times velocity"},{"name":"Impulse","formula":"J = FΔt = Δp","description":"Impulse equals change in momentum"}]},{"topic":"Work Energy Power","formulas":[{"name":"Work","formula":"W = Fd cos θ","description":"Work done by a force"},{"name":"Kinetic Energy","formula":"KE = ½mv²","description":"Energy of motion"},{"name":"Power","formula":"P = W/t = Fv","description":"Rate of doing work"}]}]',
 'JEE_MAIN'),
('fs-002', 'Chemistry: Physical Chemistry Formulas', 'subject-002', 'course-002', 'chapter-005',
 '[{"topic":"Mole Concept","formulas":[{"name":"Moles","formula":"n = m/M","description":"Number of moles equals mass divided by molar mass"},{"name":"Molarity","formula":"M = n/V","description":"Moles of solute per liter of solution"}]},{"topic":"Thermodynamics","formulas":[{"name":"Gibbs Free Energy","formula":"ΔG = ΔH - TΔS","description":"Spontaneity criterion"},{"name":"Enthalpy","formula":"ΔH = qP","description":"Heat at constant pressure"}]}]',
 'JEE_MAIN'),
('fs-003', 'Maths: Calculus Formulas', 'subject-004', 'course-003', 'chapter-010',
 '[{"topic":"Derivatives","formulas":[{"name":"Power Rule","formula":"d/dx(xⁿ) = nxⁿ⁻¹","description":"Derivative of x to the power n"},{"name":"Chain Rule","formula":"d/dx[f(g(x))] = f\u2019(g(x))·g\u2019(x)","description":"Derivative of composite function"},{"name":"Product Rule","formula":"d/dx(fg) = f\u2019g + fg\u2019","description":"Derivative of product"}]},{"topic":"Integrals","formulas":[{"name":"Power Rule","formula":"∫xⁿdx = xⁿ⁺¹/(n+1) + C","description":"Integral of x to the power n"},{"name":"By Parts","formula":"∫u dv = uv - ∫v du","description":"Integration by parts formula"}]}]',
 'JEE_MAIN');

-- Seed e-books
INSERT INTO EBooks (id, title, author, description, coverUrl, fileUrl, fileSizeMB, pageCount, courseId, subjectId, category, difficulty, isFree) VALUES
('ebook-001', 'Physics Foundation Notes', 'THE SHIVA Faculty', 'Comprehensive physics notes covering mechanics, thermodynamics, and electromagnetism for JEE/NEET preparation.', '/covers/physics.jpg', '/books/physics-foundation.pdf', 12.5, 250, 'course-001', 'subject-001', 'TEXTBOOK', 'INTERMEDIATE', 1),
('ebook-002', 'Chemistry Quick Revision', 'THE SHIVA Faculty', 'Short notes and formulas for quick revision of physical, organic, and inorganic chemistry.', '/covers/chemistry.jpg', '/books/chemistry-revision.pdf', 8.3, 180, 'course-002', 'subject-002', 'SHORT_NOTES', 'INTERMEDIATE', 1),
('ebook-003', 'Maths Formula Handbook', 'THE SHIVA Faculty', 'Complete formula handbook for JEE Maths covering algebra, calculus, coordinate geometry, and more.', '/covers/maths.jpg', '/books/maths-formulas.pdf', 5.7, 120, 'course-003', 'subject-004', 'FORMULA_SHEET', 'ADVANCED', 1),
('ebook-004', 'JEE Main PYQ Solutions 2024', 'THE SHIVA Faculty', 'Solutions to all JEE Main 2024 questions with detailed explanations and video links.', '/covers/jee-pyq.jpg', '/books/jee-main-2024.pdf', 15.2, 320, NULL, NULL, 'PRACTICE', 'ADVANCED', 0),
('ebook-005', 'NEET Biology Notes', 'THE SHIVA Faculty', 'Complete biology notes for NEET covering all 38 chapters with diagrams and mnemonics.', '/covers/biology.jpg', '/books/neet-biology.pdf', 18.9, 400, 'course-004', 'subject-005', 'TEXTBOOK', 'INTERMEDIATE', 1);
