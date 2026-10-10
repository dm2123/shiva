-- Offline Downloads Table
-- Run: Get-Content schema_downloads.sql | mysql -u root -p the-shiva

CREATE TABLE IF NOT EXISTS OfflineDownloads (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  contentType ENUM('LECTURE_VIDEO','LECTURE_NOTES','MATERIAL_PDF','MATERIAL_SLIDES','DPP','TEST_PAPER') NOT NULL,
  contentId VARCHAR(36) NOT NULL,
  contentTitle VARCHAR(200) NOT NULL,
  fileUrl VARCHAR(500) NOT NULL,
  fileSizeMB DECIMAL(10,2) DEFAULT 0,
  downloadStatus ENUM('PENDING','DOWNLOADING','COMPLETED','FAILED') DEFAULT 'PENDING',
  localPath VARCHAR(500),
  lastAccessedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  INDEX idx_downloads_student (studentId),
  INDEX idx_downloads_content (contentType, contentId)
);
