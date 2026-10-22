-- Announcements Table
-- Run: Get-Content schema_announcements.sql | mysql -u root -p the-shiva

CREATE TABLE IF NOT EXISTS Announcements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('BANNER','POPUP','IN_APP','EMAIL') DEFAULT 'IN_APP',
  targetRole ENUM('ALL','STUDENT','TEACHER','ADMIN') DEFAULT 'ALL',
  courseId VARCHAR(36),
  priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  isActive TINYINT(1) DEFAULT 1,
  startsAt DATETIME,
  endsAt DATETIME,
  createdBy VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_announcements_active (isActive, startsAt, endsAt),
  INDEX idx_announcements_target (targetRole)
);
