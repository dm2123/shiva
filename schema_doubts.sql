-- Enhanced Doubt Resolution Engine Tables
-- Run: Get-Content schema_doubts.sql | mysql -u root -p the_shiva

-- Add columns to existing Doubts table (ignore errors if already exist)
ALTER TABLE Doubts ADD COLUMN priority ENUM('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM' AFTER status;
ALTER TABLE Doubts ADD COLUMN assignedTo VARCHAR(36) AFTER priority;
ALTER TABLE Doubts ADD COLUMN assignedAt DATETIME AFTER assignedTo;
ALTER TABLE Doubts ADD COLUMN resolvedAt DATETIME AFTER assignedAt;
ALTER TABLE Doubts ADD COLUMN slaDeadline DATETIME AFTER resolvedAt;
ALTER TABLE Doubts ADD COLUMN category ENUM('ACADEMIC','TECHNICAL','BILLING','GENERAL') DEFAULT 'ACADEMIC' AFTER slaDeadline;
ALTER TABLE Doubts ADD COLUMN subject VARCHAR(100) AFTER category;
ALTER TABLE Doubts ADD COLUMN upvotes INT DEFAULT 0 AFTER subject;
ALTER TABLE Doubts ADD COLUMN isPublic TINYINT(1) DEFAULT 1 AFTER upvotes;

-- Doubt Messages (threaded replies)
CREATE TABLE IF NOT EXISTS DoubtMessages (
  id VARCHAR(36) PRIMARY KEY,
  doubtId VARCHAR(36) NOT NULL,
  senderId VARCHAR(36) NOT NULL,
  senderRole ENUM('STUDENT','TEACHER','ADMIN') NOT NULL,
  content TEXT NOT NULL,
  attachmentUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doubtId) REFERENCES Doubts(id) ON DELETE CASCADE,
  INDEX idx_doubt_messages_doubt (doubtId),
  INDEX idx_doubt_messages_sender (senderId)
);

-- Doubt Statistics (aggregated)
CREATE TABLE IF NOT EXISTS DoubtStats (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  totalDoubts INT DEFAULT 0,
  resolvedDoubts INT DEFAULT 0,
  avgResponseMinutes INT DEFAULT 0,
  slaMetPercent DECIMAL(5,2) DEFAULT 0,
  teacherId VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date_teacher (date, teacherId)
);
