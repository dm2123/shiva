-- Micro-topic Learning Tables
-- Run: Get-Content schema_topics.sql | mysql -u root -p the-shiva

CREATE TABLE IF NOT EXISTS Topics (
  id VARCHAR(36) PRIMARY KEY,
  chapterId VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  sortOrder INT DEFAULT 0,
  difficulty ENUM('EASY','MEDIUM','HARD') DEFAULT 'MEDIUM',
  estimatedMinutes INT DEFAULT 15,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapterId) REFERENCES Chapters(id) ON DELETE CASCADE,
  INDEX idx_topics_chapter (chapterId)
);

CREATE TABLE IF NOT EXISTS TopicProgress (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  topicId VARCHAR(36) NOT NULL,
  status ENUM('NOT_STARTED','IN_PROGRESS','COMPLETED') DEFAULT 'NOT_STARTED',
  timeSpentMinutes INT DEFAULT 0,
  masteryLevel INT DEFAULT 0, -- 0-100
  completedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (topicId) REFERENCES Topics(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_topic (studentId, topicId)
);
