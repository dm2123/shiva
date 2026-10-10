-- ============================================================
-- REMAINING FEATURES: Tracker 360, Offline PWA, Student Search
-- ============================================================

-- 1. TRACKER 360 - Personalized Study Planner
CREATE TABLE IF NOT EXISTS Tracker360Plans (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'My Study Plan',
  targetExam VARCHAR(100),
  examDate DATE,
  pace ENUM('AGGRESSIVE', 'MODERATE', 'RELAXED') DEFAULT 'MODERATE',
  totalDays INT DEFAULT 90,
  preferredPhysicsTeacherId VARCHAR(36),
  preferredChemistryTeacherId VARCHAR(36),
  preferredMathsTeacherId VARCHAR(36),
  dailyStudyHours DECIMAL(3,1) DEFAULT 6.0,
  status ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED') DEFAULT 'ACTIVE',
  startDate DATE,
  endDate DATE,
  completionPercent DECIMAL(5,2) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user_status (userId, status)
);

CREATE TABLE IF NOT EXISTS Tracker360DailyTasks (
  id VARCHAR(36) PRIMARY KEY,
  planId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  taskDate DATE NOT NULL,
  subjectId VARCHAR(36),
  chapterId VARCHAR(36),
  topic VARCHAR(255),
  taskType ENUM('STUDY', 'PRACTICE', 'REVISION', 'TEST', 'DPP', 'PYQ') DEFAULT 'STUDY',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimatedMinutes INT DEFAULT 60,
  actualMinutes INT DEFAULT 0,
  status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED') DEFAULT 'PENDING',
  completionPercent INT DEFAULT 0,
  lectureId VARCHAR(36),
  assignmentId VARCHAR(36),
  dppId VARCHAR(36),
  notes TEXT,
  completedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (planId) REFERENCES Tracker360Plans(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user_date (userId, taskDate),
  INDEX idx_plan_date (planId, taskDate),
  INDEX idx_user_status (userId, status)
);

CREATE TABLE IF NOT EXISTS Tracker360WeeklyReview (
  id VARCHAR(36) PRIMARY KEY,
  planId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  weekStart DATE NOT NULL,
  weekEnd DATE NOT NULL,
  tasksPlanned INT DEFAULT 0,
  tasksCompleted INT DEFAULT 0,
  tasksSkipped INT DEFAULT 0,
  totalStudyMinutes INT DEFAULT 0,
  avgDailyMinutes INT DEFAULT 0,
  subjectsCovered JSON,
  weakAreas JSON,
  strengths JSON,
  streakDays INT DEFAULT 0,
  rating INT DEFAULT 0 COMMENT '1-5 self rating',
  notes TEXT,
  aiRecommendation TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_plan_week (planId, weekStart)
);

-- 2. OFFLINE DOWNLOAD TRACKING (already created in batch A, just ensure indexes)
-- OfflineContent table already exists

-- 3. STUDENT SEARCH (enhanced index for search)
CREATE TABLE IF NOT EXISTS StudentSearchIndex (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  studentProfileId VARCHAR(36),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  targetExam VARCHAR(100),
  batchName VARCHAR(255),
  courseName VARCHAR(255),
  enrollmentStatus VARCHAR(50),
  lastActiveAt DATETIME,
  totalXP INT DEFAULT 0,
  currentStreak INT DEFAULT 0,
  avgTestScore DECIMAL(5,2) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user (userId),
  FULLTEXT INDEX ft_search (name, email, targetExam)
);

-- Seed Tracker 360 demo data
INSERT INTO Tracker360Plans (id, userId, name, targetExam, examDate, pace, totalDays, dailyStudyHours, status, startDate, endDate, completionPercent) VALUES
('tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', 'JEE 2027 Master Plan', 'JEE Main', '2027-01-15', 'MODERATE', 120, 7.0, 'ACTIVE', '2026-06-01', '2026-09-28', 35.50);

INSERT INTO Tracker360DailyTasks (id, planId, userId, taskDate, subjectId, chapterId, topic, taskType, title, estimatedMinutes, status, completionPercent) VALUES
('t360task-001', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', CURDATE(), 'subject-001', 'chapter-001', 'Newton Laws', 'STUDY', 'Study Newton Laws of Motion', 90, 'COMPLETED', 100),
('t360task-002', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', CURDATE(), 'subject-001', 'chapter-001', 'Newton Laws', 'PRACTICE', 'Practice 20 MCQs on Newton Laws', 60, 'IN_PROGRESS', 50),
('t360task-003', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'subject-002', 'chapter-005', 'Mole Concept', 'STUDY', 'Study Mole Concept & Stoichiometry', 90, 'PENDING', 0),
('t360task-004', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'subject-004', 'chapter-010', 'Derivatives', 'REVISION', 'Revise Calculus Formulas', 45, 'PENDING', 0),
('t360task-005', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'subject-001', 'chapter-002', 'Thermodynamics', 'DPP', 'Solve DPP: Thermodynamics', 60, 'PENDING', 0),
('t360task-006', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'subject-001', 'chapter-001', 'Newton Laws', 'PYQ', 'Solve JEE Main PYQs: Mechanics', 90, 'PENDING', 0),
('t360task-007', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'subject-004', 'chapter-010', 'Integrals', 'TEST', 'Take Mini Test: Calculus', 60, 'PENDING', 0),
('t360task-008', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'subject-002', 'chapter-005', 'Solutions', 'STUDY', 'Study Solutions & Colligative Properties', 90, 'PENDING', 0);

INSERT INTO Tracker360WeeklyReview (id, planId, userId, weekStart, weekEnd, tasksPlanned, tasksCompleted, tasksSkipped, totalStudyMinutes, avgDailyMinutes, streakDays, rating, aiRecommendation) VALUES
('twr-001', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', '2026-09-01', '2026-09-07', 14, 11, 1, 2520, 360, 6, 4, 'Great consistency! Focus more on Chemistry revision. Consider adding 30 mins of PYQ practice daily.'),
('twr-002', 'tracker-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', '2026-09-08', '2026-09-14', 14, 12, 0, 2700, 386, 7, 5, 'Excellent week! All subjects covered evenly. Try solving 5 extra numericals daily for Physics.');

-- Seed student search index
INSERT INTO StudentSearchIndex (id, userId, name, email, targetExam, enrollmentStatus, totalXP, currentStreak, avgTestScore) VALUES
('ssi-001', '5033c428-d119-4db6-97d7-e61f9a641f2b', 'Aditya Kumar', 'aditya.kumar@example.com', 'JEE Main', 'ACTIVE', 2450, 12, 78.50);
