-- 1. Courses Table
CREATE TABLE IF NOT EXISTS Courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  thumbnailUrl VARCHAR(255),
  price DECIMAL(10, 2) DEFAULT 0,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  isPublished BOOLEAN DEFAULT FALSE,
  language VARCHAR(60) DEFAULT NULL,
  validityMonths INT DEFAULT NULL,
  targetAudience TEXT DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. TeacherCourseAssignments Table
CREATE TABLE IF NOT EXISTS TeacherCourseAssignments (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE
);

-- 3. StudentEnrollments Table
CREATE TABLE IF NOT EXISTS StudentEnrollments (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  batchId VARCHAR(36),
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE
);

-- 4. Students Table (Needed for foreign key/joins)
CREATE TABLE IF NOT EXISTS Students (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- Add Teacher to Batches
ALTER TABLE Batches ADD COLUMN IF NOT EXISTS teacherId VARCHAR(36);
-- If you need to enforce teacher foreign key:
-- ALTER TABLE Batches ADD CONSTRAINT fk_batch_teacher FOREIGN KEY (teacherId) REFERENCES TeacherProfiles(id);

