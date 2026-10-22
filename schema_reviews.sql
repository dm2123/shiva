-- Course Reviews Table
-- Run: Get-Content schema_reviews.sql | mysql -u root -p the-shiva

CREATE TABLE IF NOT EXISTS CourseReviews (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  isVerified TINYINT(1) DEFAULT 0,
  isPublished TINYINT(1) DEFAULT 1,
  upvotes INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES Users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_course_student (courseId, studentId),
  INDEX idx_reviews_course (courseId),
  INDEX idx_reviews_student (studentId),
  INDEX idx_reviews_rating (rating)
);
