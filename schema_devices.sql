-- Multi-device Support Table
-- Run: Get-Content schema_devices.sql | mysql -u root -p the-shiva

CREATE TABLE IF NOT EXISTS UserDevices (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  sessionId VARCHAR(36) NOT NULL,
  deviceType ENUM('WEB','MOBILE','TABLET') DEFAULT 'WEB',
  deviceName VARCHAR(200),
  ipAddress VARCHAR(45),
  userAgent VARCHAR(500),
  lastActiveAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_devices_user (userId),
  INDEX idx_devices_session (sessionId)
);
