-- AI Features + All Missing Feature Tables
-- Run: Get-Content schema_ai_features.sql | mysql -u root -p the_shiva

-- 1. AI Tutor conversations
CREATE TABLE IF NOT EXISTS AiTutorSessions (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  subject VARCHAR(100),
  topic VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS AiTutorMessages (
  id VARCHAR(36) PRIMARY KEY,
  sessionId VARCHAR(36) NOT NULL,
  role ENUM('USER','ASSISTANT') NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES AiTutorSessions(id) ON DELETE CASCADE,
  INDEX idx_ai_session (sessionId)
);

-- 2. AI Study Plans
CREATE TABLE IF NOT EXISTS AiStudyPlans (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  targetExam VARCHAR(100),
  targetDate DATE,
  planData JSON,
  status ENUM('ACTIVE','COMPLETED','ARCHIVED') DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS AiStudyPlanTasks (
  id VARCHAR(36) PRIMARY KEY,
  planId VARCHAR(36) NOT NULL,
  dayNumber INT NOT NULL,
  subject VARCHAR(100),
  topic VARCHAR(255),
  taskType ENUM('STUDY','PRACTICE','REVISION','TEST') DEFAULT 'STUDY',
  durationMinutes INT DEFAULT 60,
  completed TINYINT(1) DEFAULT 0,
  completedAt DATETIME,
  FOREIGN KEY (planId) REFERENCES AiStudyPlans(id) ON DELETE CASCADE
);

-- 3. College Predictor
CREATE TABLE IF NOT EXISTS Colleges (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  type ENUM('IIT','NIT','IIIT','BITS','PRIVATE','STATE') NOT NULL,
  ranking INT,
  courses JSON,
  cutoffData JSON,
  fees DECIMAL(12,2),
  website VARCHAR(500),
  logoUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS CollegePredictions (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  exam VARCHAR(50) NOT NULL,
  examRank INT NOT NULL,
  category VARCHAR(20),
  results JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- 4. Voice Doubt
CREATE TABLE IF NOT EXISTS VoiceDoubts (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  audioUrl VARCHAR(500),
  transcript TEXT,
  subject VARCHAR(100),
  topic VARCHAR(255),
  aiResponse TEXT,
  status ENUM('PENDING','PROCESSED','ESCALATED') DEFAULT 'PENDING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- 5. Video Progress (Resume + Speed)
CREATE TABLE IF NOT EXISTS VideoProgress (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  lectureId VARCHAR(36) NOT NULL,
  positionSeconds INT DEFAULT 0,
  durationSeconds INT DEFAULT 0,
  playbackSpeed DECIMAL(3,1) DEFAULT 1.0,
  lastWatchedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed TINYINT(1) DEFAULT 0,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  FOREIGN KEY (lectureId) REFERENCES Lectures(id),
  UNIQUE KEY unique_student_lecture (studentId, lectureId)
);

-- 6. DPP (Daily Practice Problems)
CREATE TABLE IF NOT EXISTS DppSets (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  dayNumber INT,
  totalQuestions INT DEFAULT 0,
  difficulty ENUM('EASY','MEDIUM','HARD') DEFAULT 'MEDIUM',
  scheduledDate DATE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id)
);

CREATE TABLE IF NOT EXISTS DppQuestions (
  id VARCHAR(36) PRIMARY KEY,
  dppSetId VARCHAR(36) NOT NULL,
  questionText TEXT NOT NULL,
  questionType ENUM('MCQ','NUMERIC','SUBJECTIVE') DEFAULT 'MCQ',
  options JSON,
  correctAnswer TEXT,
  explanation TEXT,
  marks DECIMAL(4,1) DEFAULT 1.0,
  sortOrder INT DEFAULT 0,
  FOREIGN KEY (dppSetId) REFERENCES DppSets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DppAttempts (
  id VARCHAR(36) PRIMARY KEY,
  dppSetId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  answers JSON,
  score DECIMAL(6,2) DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME,
  FOREIGN KEY (dppSetId) REFERENCES DppSets(id),
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- 7. Topic-wise Assignments
CREATE TABLE IF NOT EXISTS Assignments (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  chapterId VARCHAR(36),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  totalMarks DECIMAL(6,2) DEFAULT 100,
  dueDate DATETIME,
  difficulty ENUM('EASY','MEDIUM','HARD') DEFAULT 'MEDIUM',
  type enum('HOMEWORK','CLASSWORK','PRACTICE') DEFAULT 'HOMEWORK',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id)
);

CREATE TABLE IF NOT EXISTS AssignmentSubmissions (
  id VARCHAR(36) PRIMARY KEY,
  assignmentId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  content TEXT,
  fileUrl VARCHAR(500),
  marksObtained DECIMAL(6,2),
  feedback TEXT,
  status ENUM('SUBMITTED','GRADED','RETURNED') DEFAULT 'SUBMITTED',
  submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  gradedAt DATETIME,
  FOREIGN KEY (assignmentId) REFERENCES Assignments(id),
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- 8. PYQ Bank
CREATE TABLE IF NOT EXISTS PyqExams (
  id VARCHAR(36) PRIMARY KEY,
  examName VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  subject VARCHAR(100),
  shift VARCHAR(50),
  totalQuestions INT DEFAULT 0,
  totalMarks INT DEFAULT 0,
  durationMinutes INT DEFAULT 180,
  pdfUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PyqQuestions (
  id VARCHAR(36) PRIMARY KEY,
  examId VARCHAR(36) NOT NULL,
  questionNumber INT NOT NULL,
  questionText TEXT NOT NULL,
  questionType ENUM('MCQ','NUMERIC','SUBJECTIVE') DEFAULT 'MCQ',
  options JSON,
  correctAnswer TEXT,
  solution TEXT,
  marks DECIMAL(4,1) DEFAULT 4.0,
  topic VARCHAR(255),
  difficulty ENUM('EASY','MEDIUM','HARD') DEFAULT 'MEDIUM',
  FOREIGN KEY (examId) REFERENCES PyqExams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PyqAttempts (
  id VARCHAR(36) PRIMARY KEY,
  examId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  answers JSON,
  score DECIMAL(6,2) DEFAULT 0,
  timeTakenSeconds INT DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME,
  FOREIGN KEY (examId) REFERENCES PyqExams(id),
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- 9. Bookmarks/Highlights
CREATE TABLE IF NOT EXISTS ContentBookmarks (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  contentType ENUM('LECTURE','NOTE','DPP','PYQ','ASSIGNMENT') NOT NULL,
  contentId VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  note TEXT,
  highlightColor VARCHAR(20),
  positionSeconds INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  INDEX idx_bookmark_student (studentId),
  INDEX idx_bookmark_content (contentType, contentId)
);

-- 10. Rank Predictor
CREATE TABLE IF NOT EXISTS RankPredictions (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  exam VARCHAR(50) NOT NULL,
  score DECIMAL(6,2),
  percentile DECIMAL(5,2),
  predictedRankMin INT,
  predictedRankMax INT,
  previousYearCutoffs JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- 14. Mock Test with AIR
CREATE TABLE IF NOT EXISTS MockTestLeaderboard (
  id VARCHAR(36) PRIMARY KEY,
  mockTestId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  score DECIMAL(6,2),
  air INT,
  totalParticipants INT DEFAULT 0,
  percentile DECIMAL(5,2),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mockTestId) REFERENCES Tests(id),
  FOREIGN KEY (studentId) REFERENCES Users(id),
  INDEX idx_mock_lb (mockTestId, score DESC)
);

-- 15. Crash Courses
CREATE TABLE IF NOT EXISTS CrashCourses (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  durationDays INT NOT NULL,
  description TEXT,
  schedule JSON,
  startDate DATE,
  endDate DATE,
  status ENUM('UPCOMING','ONGOING','COMPLETED') DEFAULT 'UPCOMING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES Courses(id)
);

-- 17. Live Class Attendance
CREATE TABLE IF NOT EXISTS LiveClassAttendance (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  leftAt DATETIME,
  durationMinutes INT DEFAULT 0,
  cameraOn TINYINT(1) DEFAULT 0,
  FOREIGN KEY (liveClassId) REFERENCES LiveClasses(id),
  FOREIGN KEY (studentId) REFERENCES Users(id),
  UNIQUE KEY unique_attendance (liveClassId, studentId)
);

-- 18. Instructor Rating
CREATE TABLE IF NOT EXISTS InstructorRatings (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  teacherId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  teachingQuality INT DEFAULT 0,
  contentClarity INT DEFAULT 0,
  engagement INT DEFAULT 0,
  overallRating DECIMAL(3,2) DEFAULT 0,
  feedback TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (liveClassId) REFERENCES LiveClasses(id),
  FOREIGN KEY (studentId) REFERENCES Users(id),
  UNIQUE KEY unique_rating (liveClassId, studentId)
);

-- 19. Discussion Thread per Lecture
CREATE TABLE IF NOT EXISTS LectureDiscussions (
  id VARCHAR(36) PRIMARY KEY,
  lectureId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  parentId VARCHAR(36),
  content TEXT NOT NULL,
  timestampSeconds INT,
  upvotes INT DEFAULT 0,
  isResolved TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lectureId) REFERENCES Lectures(id),
  FOREIGN KEY (studentId) REFERENCES Users(id),
  INDEX idx_discussion_lecture (lectureId)
);

-- 20. Batch Transfer
CREATE TABLE IF NOT EXISTS BatchTransfers (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  fromBatchId VARCHAR(36) NOT NULL,
  toBatchId VARCHAR(36) NOT NULL,
  reason TEXT,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  requestedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  processedAt DATETIME,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  FOREIGN KEY (fromBatchId) REFERENCES Batches(id),
  FOREIGN KEY (toBatchId) REFERENCES Batches(id)
);

-- 22. Scholarship Test with Prizes
CREATE TABLE IF NOT EXISTS ScholarshipPrizes (
  id VARCHAR(36) PRIMARY KEY,
  testId VARCHAR(36) NOT NULL,
  rankFrom INT NOT NULL,
  rankTo INT NOT NULL,
  prizeType ENUM('SCHOLARSHIP_PERCENT','CASH','FREE_COURSE') NOT NULL,
  prizeValue DECIMAL(10,2),
  description TEXT,
  FOREIGN KEY (testId) REFERENCES Tests(id)
);

-- 23. Counsellor Chat
CREATE TABLE IF NOT EXISTS CounsellorChats (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  counsellorId VARCHAR(36),
  status ENUM('OPEN','CLOSED') DEFAULT 'OPEN',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS CounsellorMessages (
  id VARCHAR(36) PRIMARY KEY,
  chatId VARCHAR(36) NOT NULL,
  senderId VARCHAR(36) NOT NULL,
  senderRole ENUM('STUDENT','COUNSELLOR','BOT') DEFAULT 'STUDENT',
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chatId) REFERENCES CounsellorChats(id) ON DELETE CASCADE
);

-- 25. Parent Alerts (WhatsApp/SMS logs)
CREATE TABLE IF NOT EXISTS ParentAlerts (
  id VARCHAR(36) PRIMARY KEY,
  parentId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  alertType ENUM('ATTENDANCE','PERFORMANCE','PAYMENT','ASSIGNMENT','LIVE_CLASS') NOT NULL,
  channel ENUM('WHATSAPP','SMS','EMAIL','PUSH') NOT NULL,
  message TEXT NOT NULL,
  status ENUM('SENT','DELIVERED','FAILED') DEFAULT 'SENT',
  sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES Users(id),
  FOREIGN KEY (studentId) REFERENCES Users(id)
);

-- 28. Handwritten Notes Upload
CREATE TABLE IF NOT EXISTS HandwrittenNotes (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  lectureId VARCHAR(36),
  title VARCHAR(255) NOT NULL,
  fileUrl VARCHAR(500) NOT NULL,
  thumbnailUrl VARCHAR(500),
  subject VARCHAR(100),
  topic VARCHAR(255),
  upvotes INT DEFAULT 0,
  isVerified TINYINT(1) DEFAULT 0,
  verifiedBy VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  FOREIGN KEY (lectureId) REFERENCES Lectures(id)
);

-- 29. Peer Study Groups
CREATE TABLE IF NOT EXISTS StudyGroups (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  createdBy VARCHAR(36) NOT NULL,
  courseId VARCHAR(36),
  maxMembers INT DEFAULT 10,
  isPrivate TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS StudyGroupMembers (
  id VARCHAR(36) PRIMARY KEY,
  groupId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  role ENUM('ADMIN','MEMBER') DEFAULT 'MEMBER',
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES StudyGroups(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  UNIQUE KEY unique_group_member (groupId, studentId)
);

CREATE TABLE IF NOT EXISTS StudyGroupMessages (
  id VARCHAR(36) PRIMARY KEY,
  groupId VARCHAR(36) NOT NULL,
  senderId VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  attachmentUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES StudyGroups(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES Users(id)
);

-- 31. National Leaderboard
CREATE TABLE IF NOT EXISTS NationalLeaderboard (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  exam VARCHAR(50) NOT NULL,
  totalScore DECIMAL(10,2) DEFAULT 0,
  testsTaken INT DEFAULT 0,
  avgScore DECIMAL(6,2) DEFAULT 0,
  nationalRank INT,
  stateRank INT,
  cityRank INT,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  INDEX idx_national_rank (exam, totalScore DESC)
);

-- 33. Teacher Verified Notes
CREATE TABLE IF NOT EXISTS VerifiedNotes (
  id VARCHAR(36) PRIMARY KEY,
  lectureId VARCHAR(36) NOT NULL,
  teacherId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  fileUrl VARCHAR(500),
  version INT DEFAULT 1,
  isOfficial TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lectureId) REFERENCES Lectures(id),
  FOREIGN KEY (teacherId) REFERENCES Users(id)
);

-- 34. Session Recording
CREATE TABLE IF NOT EXISTS SessionRecordings (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  videoUrl VARCHAR(500),
  durationSeconds INT DEFAULT 0,
  thumbnailUrl VARCHAR(500),
  highlights JSON,
  viewCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (liveClassId) REFERENCES LiveClasses(id)
);

-- Seed colleges for predictor
INSERT IGNORE INTO Colleges (id, name, city, state, type, ranking, courses, cutoffData, fees) VALUES
('col-001', 'IIT Bombay', 'Mumbai', 'Maharashtra', 'IIT', 1, '["B.Tech CS","B.Tech EE","B.Tech ME"]', '{"JEE Advanced":{"General":100,"OBC":300,"SC":1500,"ST":3000}}', 200000),
('col-002', 'IIT Delhi', 'New Delhi', 'Delhi', 'IIT', 2, '["B.Tech CS","B.Tech EE","B.Tech CE"]', '{"JEE Advanced":{"General":150,"OBC":450,"SC":2000,"ST":4000}}', 200000),
('col-003', 'IIT Madras', 'Chennai', 'Tamil Nadu', 'IIT', 3, '["B.Tech CS","B.Tech EE","B.Tech ME"]', '{"JEE Advanced":{"General":200,"OBC":600,"SC":2500,"ST":5000}}', 200000),
('col-004', 'IIT Kanpur', 'Kanpur', 'Uttar Pradesh', 'IIT', 4, '["B.Tech CS","B.Tech EE"]', '{"JEE Advanced":{"General":300,"OBC":900,"SC":3500,"ST":7000}}', 200000),
('col-005', 'IIT Kharagpur', 'Kharagpur', 'West Bengal', 'IIT', 5, '["B.Tech CS","B.Tech ME","B.Tech CE"]', '{"JEE Advanced":{"General":400,"OBC":1200,"SC":4500,"ST":9000}}', 200000),
('col-006', 'NIT Trichy', 'Tiruchirappalli', 'Tamil Nadu', 'NIT', 10, '["B.Tech CS","B.Tech ECE","B.Tech ME"]', '{"JEE Main":{"General":5000,"OBC":15000,"SC":50000,"ST":75000}}', 150000),
('col-007', 'NIT Warangal', 'Warangal', 'Telangana', 'NIT', 15, '["B.Tech CS","B.Tech ECE"]', '{"JEE Main":{"General":8000,"OBC":24000,"SC":65000,"ST":90000}}', 150000),
('col-008', 'NIT Surathkal', 'Surathkal', 'Karnataka', 'NIT', 12, '["B.Tech CS","B.Tech ECE","B.Tech IT"]', '{"JEE Main":{"General":6000,"OBC":18000,"SC":55000,"ST":80000}}', 150000),
('col-009', 'BITS Pilani', 'Pilani', 'Rajasthan', 'BITS', 20, '["B.E CS","B.E ECE","B.E ME"]', '{"BITSAT":{"General":300,"OBC":null,"SC":null,"ST":null}}', 400000),
('col-010', 'IIIT Hyderabad', 'Hyderabad', 'Telangana', 'IIIT', 8, '["B.Tech CS","B.Tech ECE"]', '{"JEE Main":{"General":3000,"OBC":null,"SC":null,"ST":null}}', 300000),
('col-011', 'DTU Delhi', 'New Delhi', 'Delhi', 'STATE', 25, '["B.Tech CS","B.Tech ECE","B.Tech ME"]', '{"JEE Main":{"General":10000,"OBC":30000,"SC":80000,"ST":100000}}', 180000),
('col-012', 'NSUT Delhi', 'New Delhi', 'Delhi', 'STATE', 28, '["B.Tech CS","B.Tech IT","B.Tech ECE"]', '{"JEE Main":{"General":12000,"OBC":35000,"SC":85000,"ST":110000}}', 180000),
('col-013', 'VIT Vellore', 'Vellore', 'Tamil Nadu', 'PRIVATE', 30, '["B.Tech CS","B.Tech ECE","B.Tech ME"]', '{"VITEEE":{"General":5000,"OBC":null,"SC":null,"ST":null}}', 350000),
('col-014', 'SRM Chennai', 'Chennai', 'Tamil Nadu', 'PRIVATE', 35, '["B.Tech CS","B.Tech ECE"]', '{"SRMJEE":{"General":10000,"OBC":null,"SC":null,"ST":null}}', 350000),
('col-015', 'Manipal Institute', 'Manipal', 'Karnataka', 'PRIVATE', 32, '["B.Tech CS","B.Tech ECE","B.Tech ME"]', '{"MET":{"General":8000,"OBC":null,"SC":null,"ST":null}}', 400000);
