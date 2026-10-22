-- ============================================================
-- BATCH B: Video Solutions, Battleground, Multi-Child, Exam Mode, etc.
-- ============================================================

-- 1. VIDEO SOLUTIONS
CREATE TABLE IF NOT EXISTS VideoSolutions (
  id VARCHAR(36) PRIMARY KEY,
  questionId VARCHAR(36) NOT NULL,
  videoUrl VARCHAR(500) NOT NULL,
  thumbnailUrl VARCHAR(500),
  durationSeconds INT DEFAULT 0,
  explanation TEXT,
  teacherId VARCHAR(36),
  viewCount INT DEFAULT 0,
  likeCount INT DEFAULT 0,
  language VARCHAR(10) DEFAULT 'en',
  status ENUM('ACTIVE','PROCESSING','FAILED') DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_question (questionId)
);

CREATE TABLE IF NOT EXISTS VideoSolutionViews (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  solutionId VARCHAR(36) NOT NULL,
  watchedSeconds INT DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  viewedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_solution (userId, solutionId)
);

-- 2. BATTLEGROUNDS (competitions)
CREATE TABLE IF NOT EXISTS Battlegrounds (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  courseId VARCHAR(36),
  subjectId VARCHAR(36),
  mode ENUM('SOLO','DUO','SQUAD','BRACKET') DEFAULT 'SOLO',
  questionCount INT DEFAULT 10,
  timeLimitSeconds INT DEFAULT 300,
  entryFeeXP INT DEFAULT 0,
  prizeXP INT DEFAULT 100,
  status ENUM('WAITING','LIVE','FINISHED','CANCELLED') DEFAULT 'WAITING',
  startDate DATETIME,
  endDate DATETIME,
  maxParticipants INT DEFAULT 100,
  currentParticipants INT DEFAULT 0,
  createdBy VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_course (courseId)
);

CREATE TABLE IF NOT EXISTS BattlegroundEntries (
  id VARCHAR(36) PRIMARY KEY,
  battlegroundId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  score INT DEFAULT 0,
  correctAnswers INT DEFAULT 0,
  totalTimeSeconds INT DEFAULT 0,
  `rank` INT DEFAULT 0,
  rewardXP INT DEFAULT 0,
  status ENUM('PLAYING','FINISHED','DISCONNECTED') DEFAULT 'PLAYING',
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  finishedAt DATETIME,
  UNIQUE KEY uk_bg_user (battlegroundId, userId),
  INDEX idx_user (userId)
);

CREATE TABLE IF NOT EXISTS BattlegroundQuestions (
  id VARCHAR(36) PRIMARY KEY,
  battlegroundId VARCHAR(36) NOT NULL,
  questionId VARCHAR(36) NOT NULL,
  sortOrder INT DEFAULT 0,
  FOREIGN KEY (battlegroundId) REFERENCES Battlegrounds(id) ON DELETE CASCADE
);

-- 3. MULTI-CHILD (Parent can link multiple students)
CREATE TABLE IF NOT EXISTS ParentChildLinks (
  id VARCHAR(36) PRIMARY KEY,
  parentId VARCHAR(36) NOT NULL,
  childUserId VARCHAR(36) NOT NULL,
  relationship ENUM('FATHER','MOTHER','GUARDIAN') DEFAULT 'FATHER',
  isPrimary TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_parent_child (parentId, childUserId),
  FOREIGN KEY (parentId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (childUserId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4. TEACHER AVAILABILITY (for mentorship booking)
CREATE TABLE IF NOT EXISTS TeacherAvailability (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  dayOfWeek TINYINT NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  slotDurationMinutes INT DEFAULT 30,
  maxBookingsPerSlot INT DEFAULT 3,
  currentBookings INT DEFAULT 0,
  type ENUM('MENTORSHIP','DOUBT','CAREER_GUIDANCE','GENERAL') DEFAULT 'MENTORSHIP',
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_teacher_day (teacherId, dayOfWeek)
);

-- 5. CONTENT SHARING
CREATE TABLE IF NOT EXISTS ContentShares (
  id VARCHAR(36) PRIMARY KEY,
  sharedBy VARCHAR(36) NOT NULL,
  contentType ENUM('LECTURE','NOTE','DPP','PYQ','EBOOK','FORMULA_SHEET','RECORDING','LINK') NOT NULL,
  contentId VARCHAR(36),
  contentUrl VARCHAR(500),
  title VARCHAR(255),
  message TEXT,
  shareType ENUM('BATCH','STUDY_GROUP','INDIVIDUAL') DEFAULT 'BATCH',
  targetId VARCHAR(36) COMMENT 'batchId or groupId or userId',
  viewCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sharedBy (sharedBy),
  INDEX idx_target (shareType, targetId)
);

CREATE TABLE IF NOT EXISTS ContentShareViews (
  id VARCHAR(36) PRIMARY KEY,
  shareId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  viewedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_share_user (shareId, userId)
);

-- 6. EXAM MODE (proctored exam simulation)
CREATE TABLE IF NOT EXISTS ExamSessions (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  testId VARCHAR(36) NOT NULL,
  mode ENUM('PRACTICE','TIMED','PROCTORED','MOCK') DEFAULT 'TIMED',
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  endsAt DATETIME,
  submittedAt DATETIME,
  totalTimeSeconds INT DEFAULT 0,
  tabSwitchCount INT DEFAULT 0,
  fullscreenExits INT DEFAULT 0,
  faceDetectionEnabled TINYINT(1) DEFAULT 0,
  status ENUM('IN_PROGRESS','SUBMITTED','TIMED_OUT','DISQUALIFIED') DEFAULT 'IN_PROGRESS',
  ipAddress VARCHAR(45),
  userAgent TEXT,
  proctorNotes TEXT,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user_test (userId, testId)
);

-- 7. TEACHER ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS TeacherAnnouncements (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36),
  batchId VARCHAR(36),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
  type ENUM('GENERAL','HOMEWORK','TEST','LIVE_CLASS','RESULTS','IMPORTANT') DEFAULT 'GENERAL',
  targetAudience ENUM('ALL','ENROLLED','BATCH') DEFAULT 'ENROLLED',
  pinToTop TINYINT(1) DEFAULT 0,
  viewCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME,
  INDEX idx_teacher (teacherId),
  INDEX idx_batch (batchId)
);

CREATE TABLE IF NOT EXISTS AnnouncementReads (
  id VARCHAR(36) PRIMARY KEY,
  announcementId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  readAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_announcement_user (announcementId, userId)
);

-- 8. QUIZ BATTLE (real-time 1v1)
CREATE TABLE IF NOT EXISTS QuizBattles (
  id VARCHAR(36) PRIMARY KEY,
  player1Id VARCHAR(36) NOT NULL,
  player2Id VARCHAR(36),
  player1Score INT DEFAULT 0,
  player2Score INT DEFAULT 0,
  player1Time INT DEFAULT 0,
  player2Time INT DEFAULT 0,
  questionCount INT DEFAULT 10,
  currentQuestion INT DEFAULT 0,
  status ENUM('WAITING','PLAYER1_TURN','PLAYER2_TURN','FINISHED') DEFAULT 'WAITING',
  winnerId VARCHAR(36),
  rewardXP INT DEFAULT 50,
  startedAt DATETIME,
  finishedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_player1 (player1Id),
  INDEX idx_player2 (player2Id),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS QuizBattleQuestions (
  id VARCHAR(36) PRIMARY KEY,
  battleId VARCHAR(36) NOT NULL,
  questionId VARCHAR(36) NOT NULL,
  askedTo ENUM('PLAYER1','PLAYER2','BOTH') DEFAULT 'BOTH',
  sortOrder INT DEFAULT 0,
  FOREIGN KEY (battleId) REFERENCES QuizBattles(id) ON DELETE CASCADE
);

-- 9. STUDY STREAK SOCIAL (share streaks)
CREATE TABLE IF NOT EXISTS StreakShares (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  platform ENUM('TWITTER','FACEBOOK','WHATSAPP','INSTAGRAM','COPY_LINK') NOT NULL,
  streakDays INT NOT NULL,
  message TEXT,
  shareUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Seed video solutions
INSERT INTO VideoSolutions (id, questionId, videoUrl, durationSeconds, explanation, teacherId, viewCount, likeCount) VALUES
('vs-001', 'q-001', 'https://demo.the-shiva.com/solutions/q001.mp4', 120, 'Newton is the SI unit of force. 1 Newton = 1 kg·m/s². This is derived from Newton\'s Second Law F=ma.', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 245, 89),
('vs-002', 'q-002', 'https://demo.the-shiva.com/solutions/q002.mp4', 95, 'F=ma is Newton\'s Second Law of Motion. It states that force is directly proportional to acceleration.', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 198, 72),
('vs-003', 'q-003', 'https://demo.the-shiva.com/solutions/q003.mp4', 150, 'g = 9.8 m/s² on Earth\'s surface. This varies slightly with altitude and latitude.', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 312, 110),
('vs-004', 'q-008', 'https://demo.the-shiva.com/solutions/q008.mp4', 180, 'The derivative of sin(x) is cos(x). Using first principles or chain rule.', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 156, 54),
('vs-005', 'q-009', 'https://demo.the-shiva.com/solutions/q009.mp4', 200, 'Integral of 1/x dx = ln|x| + C. This is a fundamental integration formula.', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 189, 67);

-- Seed battlegrounds
INSERT INTO Battlegrounds (id, title, description, courseId, mode, questionCount, timeLimitSeconds, prizeXP, status, startDate, maxParticipants, createdBy) VALUES
('bg-001', 'Physics Speed Challenge', 'Test your physics knowledge against 50 students! Top 3 win bonus XP.', 'course-001', 'SOLO', 15, 600, 200, 'WAITING', DATE_ADD(NOW(), INTERVAL 1 DAY), 50, 'fe9c1178-2ac6-4b80-848f-725ea2945a44'),
('bg-002', 'Chemistry Blitz', 'Quick-fire chemistry questions. 10 questions, 3 minutes!', 'course-002', 'SOLO', 10, 180, 150, 'WAITING', DATE_ADD(NOW(), INTERVAL 2 DAY), 100, 'fe9c1178-2ac6-4b80-848f-725ea2945a44'),
('bg-003', 'Maths Marathon', 'Endurance test - 20 questions, 15 minutes. Prove your calcs!', 'course-003', 'SOLO', 20, 900, 300, 'WAITING', DATE_ADD(NOW(), INTERVAL 3 DAY), 75, 'fe9c1178-2ac6-4b80-848f-725ea2945a44');

-- Seed teacher availability
INSERT INTO TeacherAvailability (id, teacherId, dayOfWeek, startTime, endTime, slotDurationMinutes, maxBookingsPerSlot, type) VALUES
('ta-001', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 1, '16:00:00', '18:00:00', 30, 3, 'MENTORSHIP'),
('ta-002', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 3, '16:00:00', '18:00:00', 30, 3, 'MENTORSHIP'),
('ta-003', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 5, '16:00:00', '17:00:00', 30, 2, 'DOUBT'),
('ta-004', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 6, '10:00:00', '12:00:00', 30, 5, 'CAREER_GUIDANCE');

-- Seed teacher announcements
INSERT INTO TeacherAnnouncements (id, teacherId, courseId, batchId, title, message, priority, type, targetAudience, pinToTop) VALUES
('ann-001', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 'course-001', 'batch-001', 'Important: Unit Test Postponed', 'The Unit Test scheduled for this Saturday has been postponed to next Monday. Please revise accordingly.', 'HIGH', 'TEST', 'ENROLLED', 1),
('ann-002', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 'course-001', 'batch-001', 'New DPP uploaded', 'I have uploaded a new DPP on Thermodynamics. Complete it by Thursday.', 'MEDIUM', 'HOMEWORK', 'ENROLLED', 0),
('ann-003', 'fe9c1178-2ac6-4b80-848f-725ea2945a44', 'course-001', NULL, 'Live Class Schedule Change', 'This week\'s live class will be on Wednesday instead of Tuesday due to a holiday.', 'URGENT', 'LIVE_CLASS', 'ALL', 1);
