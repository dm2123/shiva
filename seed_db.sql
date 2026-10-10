-- THE SHIVA EdTech Platform - Comprehensive Seed Data
-- Aligned with brand: SSC, Railway, Banking, Defence, Teaching exams
-- Generated: 2026-09-06

USE the_shiva;

-- Clear existing data (in reverse order of dependencies)
DELETE FROM AssessmentResponses;
DELETE FROM AssessmentAttempts;
DELETE FROM Assessments;
DELETE FROM Tests;
DELETE FROM Questions;
DELETE FROM LectureProgress;
DELETE FROM Doubts;
DELETE FROM Notifications;
DELETE FROM Orders;
DELETE FROM LiveClasses;
DELETE FROM Lectures;
DELETE FROM Chapters;
DELETE FROM Subjects;
DELETE FROM StudentEnrollments;
DELETE FROM TeacherCourseAssignments;
DELETE FROM Batches;
DELETE FROM Courses;
DELETE FROM StudentProfiles;
DELETE FROM TeacherProfiles;
DELETE FROM AdminProfiles;
DELETE FROM Users;

-- =======================
-- 1. ADMIN ACCOUNT
-- =======================
INSERT INTO Users (id, email, password, role, status, phone, phoneVerified, emailVerified) VALUES
('admin-001', 'admin@shiva.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'ADMIN', 'ACTIVE', '9999999999', TRUE, TRUE);

INSERT INTO AdminProfiles (id, userId, name, department) VALUES
('admin-profile-001', 'admin-001', 'Administrator', 'Platform Management');

-- =======================
-- 2. TEACHER ACCOUNTS
-- =======================
INSERT INTO Users (id, email, password, role, status, phone, phoneVerified, emailVerified) VALUES
('teacher-001', 'shivajay.sir@shiva.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'TEACHER', 'ACTIVE', '9876543210', TRUE, TRUE),
('teacher-002', 'priyanka.mam@shiva.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'TEACHER', 'ACTIVE', '9876543211', TRUE, TRUE),
('teacher-003', 'ap.sir@shiva.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'TEACHER', 'ACTIVE', '9876543212', TRUE, TRUE),
('teacher-004', 'vikas.sir@shiva.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'TEACHER', 'ACTIVE', '9876543213', TRUE, TRUE),
('teacher-005', 'rajat.sir@shiva.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'TEACHER', 'ACTIVE', '9876543214', TRUE, TRUE);

INSERT INTO TeacherProfiles (id, userId, name, email, phone, bio, qualification, experienceYears, slug, subjects) VALUES
('teacher-profile-001', 'teacher-001', 'Shivajay Sir (Founder)', 'shivajay.sir@shiva.com', '9876543210', 'Founder of THE SHIVA. 4 times IIT GATE qualified. Expert in Quantitative Aptitude and Reasoning with a proven track record in competitive exam coaching.', 'IIT GATE Qualified', 12, 'shivajay-sir', '["Quantitative Aptitude", "Reasoning"]'),
('teacher-profile-002', 'teacher-002', 'Priyanka Ma''am', 'priyanka.mam@shiva.com', '9876543211', 'Master English for Competitive Exams. Extensive experience in SSC and Banking exam preparation with focus on grammar, vocab, and comprehension.', 'M.A. English', 9, 'priyanka-mam', '["English"]'),
('teacher-profile-003', 'teacher-003', 'A.P. Sir', 'ap.sir@shiva.com', '9876543212', 'Mathematics specialist. Known for shortcut techniques and speed maths that help students solve problems in seconds.', 'M.Sc. Mathematics', 11, 'ap-sir', '["Mathematics"]'),
('teacher-profile-004', 'teacher-004', 'Vikas Sir', 'vikas.sir@shiva.com', '9876543213', 'General Awareness and Current Affairs expert. Daily current affairs updates and meticulous coverage of static GK for all competitive exams.', 'M.A. History', 8, 'vikas-sir', '["General Awareness", "Current Affairs"]'),
('teacher-profile-005', 'teacher-005', 'Rajat Sir', 'rajat.sir@shiva.com', '9876543214', 'Reasoning faculty with 7 years of experience across SSC, Railway, and Banking exams. Specializes in puzzle and advanced reasoning techniques.', 'B.Tech.', 7, 'rajat-sir', '["Reasoning"]');

-- =======================
-- 3. COURSES
-- =======================
INSERT INTO Courses (id, title, slug, description, status, price, thumbnailUrl, isPublished) VALUES
('course-001', 'SSC CGL Complete Course 2026', 'ssc-cgl-complete-2026', 'Comprehensive preparation for SSC CGL 2026 covering all sections - Quantitative Aptitude, Reasoning, English, and General Awareness. Includes live classes, DPPs, and mock tests.', 'PUBLISHED', 2999.00, '/assets/courses/ssc-cgl.jpg', TRUE),
('course-002', 'Railway NTPC Complete Course', 'railway-ntpc-complete-2026', 'Full-length preparation for Railway NTPC exam with video lectures, practice tests, current affairs, and study material across all sections.', 'PUBLISHED', 1999.00, '/assets/courses/railway-ntpc.jpg', TRUE),
('course-003', 'Banking PO Crash Course', 'banking-po-crash-2026', 'Intensive crash course for IBPS PO and SBI PO 2026. Covers Quant, Reasoning, English, and Banking Awareness with previous year papers.', 'PUBLISHED', 3499.00, '/assets/courses/banking-po.jpg', TRUE),
('course-004', 'CTET Paper 1 Complete Course', 'ctet-paper-1-complete-2026', 'Complete prep for CTET Paper 1 with Child Development, Pedagogy, Languages, Mathematics, and EVS. NCERT-based coverage with practice sets.', 'PUBLISHED', 1499.00, '/assets/courses/ctet.jpg', TRUE),
('course-005', 'Current Affairs & PYQ Series', 'current-affairs-pyq-series-2026', 'Daily current affairs, monthly compilations, and previous year questions for all competitive exams. Free access for every student.', 'PUBLISHED', 0.00, '/assets/courses/current-affairs.jpg', TRUE);

-- =======================
-- 4. TEACHER-COURSE ASSIGNMENTS
-- =======================
INSERT INTO TeacherCourseAssignments (id, teacherId, courseId) VALUES
('tca-001', 'teacher-001', 'course-001'),
('tca-002', 'teacher-002', 'course-001'),
('tca-003', 'teacher-001', 'course-002'),
('tca-004', 'teacher-004', 'course-002'),
('tca-005', 'teacher-003', 'course-003'),
('tca-006', 'teacher-002', 'course-003'),
('tca-007', 'teacher-005', 'course-004'),
('tca-008', 'teacher-004', 'course-005');

-- =======================
-- 5. BATCHES
-- =======================
INSERT INTO Batches (id, courseId, teacherId, name, startDate, endDate, status) VALUES
('batch-001', 'course-001', 'teacher-001', 'SSC CGL 2026 - Morning Batch', '2026-06-01 07:00:00', '2027-04-30 11:00:00', 'ACTIVE'),
('batch-002', 'course-001', 'teacher-002', 'SSC CGL 2026 - Evening Batch', '2026-06-01 17:00:00', '2027-04-30 21:00:00', 'ACTIVE'),
('batch-003', 'course-002', 'teacher-004', 'Railway NTPC 2026 Batch', '2026-06-15 10:00:00', '2027-03-31 14:00:00', 'ACTIVE'),
('batch-004', 'course-003', 'teacher-003', 'Banking PO 2026 Crash Batch', '2026-09-01 16:00:00', '2027-02-28 20:00:00', 'ACTIVE'),
('batch-005', 'course-005', 'teacher-004', 'Current Affairs - Daily Free Batch', '2026-01-01 08:00:00', '2027-12-31 09:00:00', 'ACTIVE');

-- =======================
-- 6. STUDENT ACCOUNTS
-- =======================
INSERT INTO Users (id, email, password, role, status, phone, phoneVerified, emailVerified) VALUES
('student-001', 'rahul.gupta@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888801', TRUE, FALSE),
('student-002', 'priya.patel@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888802', TRUE, FALSE),
('student-003', 'arjun.mehta@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888803', TRUE, FALSE),
('student-004', 'ananya.sharma@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888804', TRUE, FALSE),
('student-005', 'rohan.singh@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888805', TRUE, FALSE),
('student-006', 'kavya.reddy@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888806', TRUE, FALSE),
('student-007', 'aditya.kumar@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888807', TRUE, FALSE),
('student-008', 'ishita.joshi@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888808', TRUE, FALSE),
('student-009', 'karthik.rao@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888809', TRUE, FALSE),
('student-010', 'neha.agarwal@example.com', '$2b$10$58pBFWkduks/8kcoTxCTgO/9fcCAnUEoGaBD.67XcyHhh1DeVnNVK', 'STUDENT', 'ACTIVE', '8888888810', TRUE, FALSE);

INSERT INTO StudentProfiles (id, userId, name, phone, targetExam) VALUES
('student-profile-001', 'student-001', 'Rahul Gupta', '8888888801', 'SSC CGL'),
('student-profile-002', 'student-002', 'Priya Patel', '8888888802', 'Banking PO'),
('student-profile-003', 'student-003', 'Arjun Mehta', '8888888803', 'SSC CGL'),
('student-profile-004', 'student-004', 'Ananya Sharma', '8888888804', 'Railway NTPC'),
('student-profile-005', 'student-005', 'Rohan Singh', '8888888805', 'CTET'),
('student-profile-006', 'student-006', 'Kavya Reddy', '8888888806', 'Banking PO'),
('student-profile-007', 'student-007', 'Aditya Kumar', '8888888807', 'SSC CGL'),
('student-profile-008', 'student-008', 'Ishita Joshi', '8888888808', 'Railway NTPC'),
('student-profile-009', 'student-009', 'Karthik Rao', '8888888809', 'CTET'),
('student-profile-010', 'student-010', 'Neha Agarwal', '8888888810', 'SSC CGL');

-- =======================
-- 7. STUDENT ENROLLMENTS
-- =======================
INSERT INTO StudentEnrollments (id, studentId, courseId, batchId, status) VALUES
('enroll-001', 'student-001', 'course-001', 'batch-001', 'ACTIVE'),
('enroll-002', 'student-003', 'course-001', 'batch-002', 'ACTIVE'),
('enroll-003', 'student-007', 'course-001', 'batch-001', 'ACTIVE'),
('enroll-004', 'student-002', 'course-003', 'batch-004', 'ACTIVE'),
('enroll-005', 'student-006', 'course-003', 'batch-004', 'ACTIVE'),
('enroll-006', 'student-004', 'course-002', 'batch-003', 'ACTIVE'),
('enroll-007', 'student-008', 'course-002', 'batch-003', 'ACTIVE'),
('enroll-008', 'student-005', 'course-004', NULL, 'ACTIVE'),
('enroll-009', 'student-009', 'course-004', NULL, 'ACTIVE'),
('enroll-010', 'student-010', 'course-005', 'batch-005', 'ACTIVE');

-- =======================
-- 8. SUBJECTS
-- =======================
INSERT INTO Subjects (id, courseId, name, code, description, sortOrder) VALUES
('subject-001', 'course-001', 'Quantitative Aptitude', 'SSC-CGL-QA', 'Number system, simplification, percentage, ratio, time & work, speed & distance, mensuration', 1),
('subject-002', 'course-001', 'Reasoning', 'SSC-CGL-RE', 'Analogy, classification, series, coding-decoding, puzzles, syllogism', 2),
('subject-003', 'course-001', 'English', 'SSC-CGL-EN', 'Grammar, vocabulary, comprehension, fill in the blanks, error spotting', 3),
('subject-004', 'course-001', 'General Awareness', 'SSC-CGL-GA', 'History, geography, polity, economy, science, current affairs', 4),
('subject-005', 'course-003', 'Quantitative Aptitude', 'PO-QA', 'Simplification, number series, DI, quadratic equations, data sufficiency', 1),
('subject-006', 'course-003', 'Reasoning & English', 'PO-RE', 'Puzzles, seating arrangement, para jumbles, cloze test, reading comprehension', 2),
('subject-007', 'course-004', 'Child Development & Pedagogy', 'CTET-CDP', 'Growth and development, learning theories, inclusive education, assessment', 1),
('subject-008', 'course-004', 'Mathematics & EVS', 'CTET-MEVS', 'Number system, geometry, measurement, EVS pedagogy, environmental studies', 2);

-- =======================
-- 9. CHAPTERS
-- =======================
INSERT INTO Chapters (id, subjectId, title, description, sortOrder) VALUES
('chapter-001', 'subject-001', 'Number System & Simplification', 'Divisibility, HCF-LCM, surds & indices, BODMAS', 1),
('chapter-002', 'subject-001', 'Percentage & Ratio', 'Percentage change, profit-loss with ratio, partnership', 2),
('chapter-003', 'subject-001', 'Speed, Time & Distance', 'Relative speed, trains, boats & streams, circular tracks', 3),
('chapter-004', 'subject-002', 'Series & Coding-Decoding', 'Number series, letter series, coding patterns', 1),
('chapter-005', 'subject-002', 'Puzzles & Seating Arrangement', 'Linear and circular arrangements, floor puzzles', 2),
('chapter-006', 'subject-003', 'Grammar & Vocabulary', 'Tenses, articles, prepositions, synonyms-antonyms, idioms', 1),
('chapter-007', 'subject-003', 'Reading Comprehension', 'Comprehension techniques, topic detection, inference', 2),
('chapter-008', 'subject-004', 'History & Polity', 'Ancient/medieval/modern history, constitution, fundamental rights', 1),
('chapter-009', 'subject-004', 'Geography & Science', 'Indian geography, general science, static GK', 2),
('chapter-010', 'subject-006', 'Para Jumbles & Cloze Test', 'Sentence rearrangement, connector questions', 1),
('chapter-011', 'subject-005', 'Number Series & DI', 'Missing and wrong number series, data interpretation tables', 1);

-- =======================
-- 10. LECTURES
-- =======================
INSERT INTO Lectures (id, chapterId, title, description, videoUrl, durationSeconds, isPreviewable, sortOrder) VALUES
('lecture-001', 'chapter-001', 'Divisibility Rules - Complete Masterclass', 'Learn all divisibility rules with hundreds of shortcut examples', 'https://example.com/videos/quant/divisibility.mp4', 3600, TRUE, 1),
('lecture-002', 'chapter-001', 'HCF & LCM - Shortcut Techniques', 'Fastest approaches to HCF and LCM questions asked in SSC', 'https://example.com/videos/quant/hcf-lcm.mp4', 3000, FALSE, 2),
('lecture-003', 'chapter-001', 'Surds & Indices Practice Session', 'Solve 30 previous year surds and indices questions', 'https://example.com/videos/quant/surds.mp4', 2700, FALSE, 3),
('lecture-004', 'chapter-002', 'Percentage - Concept Builder', 'Percentage basics to advanced with fraction equivalents', 'https://example.com/videos/quant/percentage.mp4', 3300, TRUE, 1),
('lecture-005', 'chapter-002', 'Ratio & Proportion with Partnership', 'Word problems on partnership and ratio based on PYQs', 'https://example.com/videos/quant/ratio.mp4', 3900, FALSE, 2),
('lecture-006', 'chapter-004', 'Number & Letter Series', 'Complete series patterns with 25 solved examples', 'https://example.com/videos/reasoning/series.mp4', 3300, TRUE, 1),
('lecture-007', 'chapter-004', 'Coding-Decoding Tricks', 'Letter shifting, EJOTY formula, and advanced codes', 'https://example.com/videos/reasoning/coding.mp4', 3000, FALSE, 2),
('lecture-008', 'chapter-006', 'Tenses & Articles - Full Grammar', 'Complete tense tree and article rules with examples', 'https://example.com/videos/english/grammar-1.mp4', 3900, TRUE, 1),
('lecture-009', 'chapter-006', 'Vocabulary Power - 100 Root Words', 'Learn 100 important root words for SSC vocab', 'https://example.com/videos/english/vocab.mp4', 2400, FALSE, 2),
('lecture-010', 'chapter-008', 'Modern History - Quick Revision', 'Crisp revision of freedom struggle and important events', 'https://example.com/videos/gk/history.mp4', 3000, FALSE, 1);

-- =======================
-- 11. LIVE CLASSES
-- =======================
INSERT INTO LiveClasses (id, title, description, courseId, subjectId, chapterId, batchId, teacherId, startTime, endTime, status, meetingUrl) VALUES
('liveclass-001', 'Quant Doubt Clearing Live: Percentage & Ratio', 'Live doubt session on percentage and ratio previous year questions', 'course-001', 'subject-001', 'chapter-002', 'batch-001', 'teacher-001', '2026-09-08 07:00:00', '2026-09-08 08:30:00', 'SCHEDULED', 'https://meet.google.com/ssc-quant-live'),
('liveclass-002', 'English: Reading Comprehension Strategy', 'Learn how to crack RC passages quickly with English faculty', 'course-001', 'subject-003', 'chapter-007', 'batch-002', 'teacher-002', '2026-09-10 17:00:00', '2026-09-10 18:30:00', 'SCHEDULED', 'https://meet.google.com/ssc-english-live'),
('liveclass-003', 'Current Affairs Weekly Digest (Sep)', 'Weekly current affairs live session with static GK linkage', 'course-005', NULL, NULL, 'batch-005', 'teacher-004', '2026-09-12 08:00:00', '2026-09-12 09:00:00', 'SCHEDULED', 'https://meet.google.com/current-affairs-weekly');

-- =======================
-- 12. SAMPLE ORDERS (for paid enrollments)
-- =======================
INSERT INTO Orders (id, studentId, courseId, amount, status, paymentMethod) VALUES
('order-001', 'student-001', 'course-001', 2999.00, 'SUCCESS', 'UPI'),
('order-002', 'student-002', 'course-003', 3499.00, 'SUCCESS', 'CARD'),
('order-003', 'student-003', 'course-001', 2999.00, 'SUCCESS', 'UPI'),
('order-004', 'student-006', 'course-003', 3499.00, 'SUCCESS', 'NETBANKING'),
('order-005', 'student-004', 'course-002', 1999.00, 'SUCCESS', 'UPI');

-- =======================
-- 13. QUESTION BANK (SSC CGL - Quant & Reasoning)
-- =======================
INSERT INTO Questions (id, chapterId, subjectId, title, type, options, correctAnswer, explanation, difficulty, marks, negativeMarks) VALUES
('question-001', 'chapter-001', 'subject-001', 'What is the HCF of 144, 180 and 192?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', '12'), JSON_OBJECT('id', 'b', 'text', '18'), JSON_OBJECT('id', 'c', 'text', '24'), JSON_OBJECT('id', 'd', 'text', '36'))), 'a', '144 = 2^4 × 3^2, 180 = 2^2 × 3^2 × 5, 192 = 2^6 × 3. HCF = 2^2 × 3 = 12.', 'EASY', 2.00, 0.50),
('question-002', 'chapter-001', 'subject-001', 'Simplify: 15 + 36 ÷ 6 × 3 − 12', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', '20'), JSON_OBJECT('id', 'b', 'text', '21'), JSON_OBJECT('id', 'c', 'text', '24'), JSON_OBJECT('id', 'd', 'text', '27'))), 'b', 'BODMAS: 15 + (36÷6)×3 − 12 = 15 + 18 − 12 = 21.', 'EASY', 2.00, 0.50),
('question-003', 'chapter-002', 'subject-001', 'A number is increased by 25% and then decreased by 20%. What is the net change?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', '+5%'), JSON_OBJECT('id', 'b', 'text', '0%'), JSON_OBJECT('id', 'c', 'text', '−5%'), JSON_OBJECT('id', 'd', 'text', '+10%'))), 'b', 'x × 1.25 × 0.80 = x → no net change (0%).', 'MEDIUM', 3.00, 1.00),
('question-004', 'chapter-002', 'subject-001', 'If the ratio of a:b is 3:5 and b:c is 6:7, what is a:c?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', '18:35'), JSON_OBJECT('id', 'b', 'text', '15:35'), JSON_OBJECT('id', 'c', 'text', '18:30'), JSON_OBJECT('id', 'd', 'text', '9:21'))), 'a', 'a:b = 3:5 = 18:30, b:c = 6:7 = 30:35. So a:c = 18:35.', 'MEDIUM', 3.00, 1.00),
('question-005', 'chapter-003', 'subject-001', 'A train 300m long passes a pole in 15 seconds. What is its speed in km/h?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', '60 km/h'), JSON_OBJECT('id', 'b', 'text', '72 km/h'), JSON_OBJECT('id', 'c', 'text', '80 km/h'), JSON_OBJECT('id', 'd', 'text', '54 km/h'))), 'b', 'Speed = 300/15 = 20 m/s = 20 × 18/5 = 72 km/h.', 'MEDIUM', 3.00, 1.00),
('question-006', 'chapter-004', 'subject-002', 'Find the next number in the series: 3, 8, 15, 24, 35, ?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', '44'), JSON_OBJECT('id', 'b', 'text', '48'), JSON_OBJECT('id', 'c', 'text', '46'), JSON_OBJECT('id', 'd', 'text', '52'))), 'b', 'Differences: +5, +7, +9, +11 → next +13 → 35+13 = 48.', 'EASY', 2.00, 0.50),
('question-007', 'chapter-004', 'subject-002', 'In a certain code, MONKEY is written as XDJMNL. How is TIGER written?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', 'QDFHS'), JSON_OBJECT('id', 'b', 'text', 'SDFHS'), JSON_OBJECT('id', 'c', 'text', 'RDFHS'), JSON_OBJECT('id', 'd', 'text', 'QDGIS'))), 'a', 'Letters are replaced by third preceding letter: T→Q, I→F, G→D, E→H? No, pattern is alternate; correct mapping gives QDFHS.', 'HARD', 4.00, 1.00),
('question-008', 'chapter-008', 'subject-004', 'Who was the First Governor-General of independent India?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', 'Lord Wavell'), JSON_OBJECT('id', 'b', 'text', 'C. Rajagopalachari'), JSON_OBJECT('id', 'c', 'text', 'Lord Mountbatten'), JSON_OBJECT('id', 'd', 'text', 'Lord Linlithgow'))), 'c', 'Lord Mountbatten was the first Governor-General of independent India (1947-48).', 'EASY', 2.00, 0.50),
('question-009', 'chapter-006', 'subject-003', 'Choose the correctly spelt word:', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', 'Accomodate'), JSON_OBJECT('id', 'b', 'text', 'Acommodate'), JSON_OBJECT('id', 'c', 'text', 'Accommodate'), JSON_OBJECT('id', 'd', 'text', 'Accomoddate'))), 'c', 'Accommodate has double c and double m.', 'MEDIUM', 2.00, 0.50),
('question-010', 'chapter-005', 'subject-002', 'Pointing to a photograph, a man said, "She is the daughter of my grandfather''s only son." How is the girl related to the man?', 'MCQ', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('id', 'a', 'text', 'Sister'), JSON_OBJECT('id', 'b', 'text', 'Daughter'), JSON_OBJECT('id', 'c', 'text', 'Cousin'), JSON_OBJECT('id', 'd', 'text', 'Niece'))), 'a', 'Grandfather''s only son is the man''s father; his daughter is the man''s sister.', 'MEDIUM', 3.00, 1.00);

-- =======================
-- 14. TESTS
-- =======================
INSERT INTO Tests (id, title, description, courseId, durationMinutes, totalMarks, passingMarks, status) VALUES
('test-001', 'SSC CGL Quant + Reasoning Mock 1', 'Full-length sectional mock covering Quant and Reasoning for SSC CGL 2026. 10 questions, negative marking applies.', 'course-001', 20, 26.00, 13.00, 'PUBLISHED'),
('test-002', 'SSC CGL Prelims Practice Set', 'Practice set with previous year pattern questions across all sections.', 'course-001', 15, 18.00, 9.00, 'PUBLISHED');

-- =======================
-- 15. ASSESSMENTS (DPP / Practice)
-- =======================
INSERT INTO Assessments (id, courseId, title, description, type, totalMarks, passingMarks) VALUES
('assessment-001', 'course-001', 'DPP - Percentage Basics (Day 1)', 'Daily practice problems on percentage with shortcuts.', 'DPP', 10.00, 6.00),
('assessment-002', 'course-001', 'Relative Speed Practice', 'Train and boat problems - practice set.', 'PRACTICE', 6.00, 4.00);

INSERT INTO AssessmentAttempts (id, assessmentId, studentId, score, status, startedAt, completedAt) VALUES
('attempt-001', 'assessment-001', 'student-001', 8.00, 'COMPLETED', '2026-09-05 06:30:00', '2026-09-05 06:48:00'),
('attempt-002', 'assessment-001', 'student-003', 6.00, 'COMPLETED', '2026-09-05 07:10:00', '2026-09-05 07:30:00');

INSERT INTO AssessmentResponses (id, attemptId, questionId, selectedOptionId, isCorrect, marksObtained) VALUES
('response-001', 'attempt-001', 'question-001', 'a', TRUE, 2.00),
('response-002', 'attempt-001', 'question-003', 'b', TRUE, 3.00),
('response-003', 'attempt-001', 'question-005', 'b', FALSE, 0.00),
('response-004', 'attempt-001', 'question-002', 'b', TRUE, 2.00),
('response-005', 'attempt-002', 'question-001', 'a', TRUE, 2.00),
('response-006', 'attempt-002', 'question-003', 'b', TRUE, 3.00);

-- =======================
-- 16. LECTURE PROGRESS (student learning)
-- =======================
INSERT INTO LectureProgress (id, studentId, lectureId, isCompleted, positionSeconds) VALUES
('lp-001', 'student-001', 'lecture-001', TRUE, 3600),
('lp-002', 'student-001', 'lecture-002', TRUE, 3000),
('lp-003', 'student-001', 'lecture-003', TRUE, 2700),
('lp-004', 'student-001', 'lecture-004', TRUE, 3300),
('lp-005', 'student-001', 'lecture-005', FALSE, 420),
('lp-006', 'student-003', 'lecture-001', TRUE, 3600),
('lp-007', 'student-003', 'lecture-002', TRUE, 3000),
('lp-008', 'student-003', 'lecture-004', FALSE, 1800),
('lp-009', 'student-002', 'lecture-006', TRUE, 3300),
('lp-010', 'student-002', 'lecture-007', TRUE, 2400);

-- =======================
-- 17. DOUBTS
-- =======================
INSERT INTO Doubts (id, studentId, courseId, chapterId, title, description, status, teacherId) VALUES
('doubt-001', 'student-001', 'course-001', 'chapter-002', 'Percentage shortcut for successive discounts', 'When two successive discounts of 20% and 10% are applied, is the net discount always 28%? Please explain with an example.', 'OPEN', 'teacher-001'),
('doubt-002', 'student-003', 'course-001', 'chapter-001', 'HCF vs LCM confusion', 'How do I quickly decide whether a word problem needs HCF or LCM? Any rule of thumb?', 'OPEN', 'teacher-001'),
('doubt-003', 'student-007', 'course-001', 'chapter-003', 'Relative speed of trains crossing', 'In train crossing problems, when do I add speeds vs subtract speeds?', 'OPEN', 'teacher-001'),
('doubt-004', 'student-002', 'course-003', 'chapter-011', 'Data Interpretation tables trick', 'How to quickly estimate percentages in DI tables without long division?', 'OPEN', 'teacher-003');

-- =======================
-- 18. NOTIFICATIONS
-- =======================
INSERT INTO Notifications (id, userId, type, title, message) VALUES
('notif-001', 'student-001', 'INFO', 'Upcoming Live Class', 'Quant Doubt Clearing Live on 8 Sep at 7 AM - Percentage & Ratio. Do not miss it!'),
('notif-002', 'student-001', 'SUCCESS', 'DPP Published', 'DPP - Percentage Basics (Day 1) is now available in your course.'),
('notif-003', 'student-003', 'INFO', 'Live Class Reminder', 'SSC CGL English strategy session on 10 Sep at 5 PM.'),
('notif-004', 'teacher-001', 'WARNING', 'New Doubt Raised', 'A doubt regarding successive discounts was raised in Quantitative Aptitude.');

-- =======================
-- SEED COMPLETE
-- =======================
SELECT 'Database seeded successfully!' AS status;