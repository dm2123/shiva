-- Batch Schedule / Timetable Tables
-- Run: Get-Content schema_timetable.sql | mysql -u root -p the-shiva

CREATE TABLE IF NOT EXISTS BatchSchedule (
  id VARCHAR(36) PRIMARY KEY,
  batchId VARCHAR(36) NOT NULL,
  dayOfWeek TINYINT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  subjectId VARCHAR(36),
  teacherId VARCHAR(36),
  lectureType ENUM('LECTURE','DOUBT','TEST','REVISION') DEFAULT 'LECTURE',
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batchId) REFERENCES Batches(id) ON DELETE CASCADE,
  INDEX idx_schedule_batch (batchId),
  INDEX idx_schedule_day (dayOfWeek)
);

-- Weekly Progress Tracking
CREATE TABLE IF NOT EXISTS BatchProgress (
  id VARCHAR(36) PRIMARY KEY,
  batchId VARCHAR(36) NOT NULL,
  weekNumber INT NOT NULL,
  totalLectures INT DEFAULT 0,
  completedLectures INT DEFAULT 0,
  totalTests INT DEFAULT 0,
  completedTests INT DEFAULT 0,
  startDate DATE,
  endDate DATE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batchId) REFERENCES Batches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_batch_week (batchId, weekNumber)
);
