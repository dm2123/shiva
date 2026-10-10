-- THE SHIVA EdTech Platform - Feature Seed Data
-- Batch M: Translations, Plans, Centers, NCERT samples

-- ======================
-- TRANSLATIONS (English + Hindi base)
-- ======================

-- Common translations
INSERT INTO Translations (id, langCode, namespace, translationKey, translationValue) VALUES
('trans-001', 'en', 'common', 'home', 'Home'),
('trans-002', 'en', 'common', 'courses', 'Courses'),
('trans-003', 'en', 'common', 'live_classes', 'Live Classes'),
('trans-004', 'en', 'common', 'tests', 'Tests'),
('trans-005', 'en', 'common', 'doubts', 'Doubts'),
('trans-006', 'en', 'common', 'leaderboard', 'Leaderboard'),
('trans-007', 'en', 'common', 'wallet', 'Wallet'),
('trans-008', 'en', 'common', 'profile', 'Profile'),
('trans-009', 'en', 'common', 'settings', 'Settings'),
('trans-010', 'en', 'common', 'notifications', 'Notifications'),
('trans-011', 'en', 'common', 'logout', 'Logout'),
('trans-012', 'en', 'common', 'login', 'Login'),
('trans-013', 'en', 'common', 'register', 'Register'),
('trans-014', 'en', 'common', 'search', 'Search'),
('trans-015', 'en', 'common', 'filter', 'Filter'),
('trans-016', 'en', 'common', 'sort', 'Sort'),
('trans-017', 'en', 'common', 'save', 'Save'),
('trans-018', 'en', 'common', 'cancel', 'Cancel'),
('trans-019', 'en', 'common', 'delete', 'Delete'),
('trans-020', 'en', 'common', 'edit', 'Edit'),
('trans-021', 'en', 'common', 'submit', 'Submit'),
('trans-022', 'en', 'common', 'loading', 'Loading...'),
('trans-023', 'en', 'common', 'error', 'Error'),
('trans-024', 'en', 'common', 'success', 'Success'),
('trans-025', 'en', 'common', 'back', 'Back'),
('trans-026', 'en', 'common', 'next', 'Next'),
('trans-027', 'en', 'common', 'previous', 'Previous'),
('trans-028', 'en', 'common', 'of', 'of'),
('trans-029', 'en', 'common', 'total', 'Total'),
('trans-030', 'en', 'common', 'view_all', 'View All');

-- Hindi translations
INSERT INTO Translations (id, langCode, namespace, translationKey, translationValue) VALUES
('trans-101', 'hi', 'common', 'home', 'होम'),
('trans-102', 'hi', 'common', 'courses', 'कोर्स'),
('trans-103', 'hi', 'common', 'live_classes', 'लाइव क्लास'),
('trans-104', 'hi', 'common', 'tests', 'टेस्ट'),
('trans-105', 'hi', 'common', 'doubts', 'शंकाएं'),
('trans-106', 'hi', 'common', 'leaderboard', 'लीडरबोर्ड'),
('trans-107', 'hi', 'common', 'wallet', 'वॉलेट'),
('trans-108', 'hi', 'common', 'profile', 'प्रोफाइल'),
('trans-109', 'hi', 'common', 'settings', 'सेटिंग्स'),
('trans-110', 'hi', 'common', 'notifications', 'सूचनाएं'),
('trans-111', 'hi', 'common', 'logout', 'लॉग आउट'),
('trans-112', 'hi', 'common', 'login', 'लॉग इन'),
('trans-113', 'hi', 'common', 'register', 'रजिस्टर'),
('trans-114', 'hi', 'common', 'search', 'खोजें'),
('trans-115', 'hi', 'common', 'filter', 'फ़िल्टर'),
('trans-116', 'hi', 'common', 'sort', 'क्रमबद्ध करें'),
('trans-117', 'hi', 'common', 'save', 'सहेजें'),
('trans-118', 'hi', 'common', 'cancel', 'रद्द करें'),
('trans-119', 'hi', 'common', 'delete', 'हटाएं'),
('trans-120', 'hi', 'common', 'edit', 'संपादित करें'),
('trans-121', 'hi', 'common', 'submit', 'जमा करें'),
('trans-122', 'hi', 'common', 'loading', 'लोड हो रहा है...'),
('trans-123', 'hi', 'common', 'error', 'त्रुटि'),
('trans-124', 'hi', 'common', 'success', 'सफल'),
('trans-125', 'hi', 'common', 'back', 'वापस'),
('trans-126', 'hi', 'common', 'next', 'अगला'),
('trans-127', 'hi', 'common', 'previous', 'पिछला'),
('trans-128', 'hi', 'common', 'of', 'का'),
('trans-129', 'hi', 'common', 'total', 'कुल'),
('trans-130', 'hi', 'common', 'view_all', 'सभी देखें');

-- Student portal translations (English)
INSERT INTO Translations (id, langCode, namespace, translationKey, translationValue) VALUES
('trans-201', 'en', 'student', 'my_courses', 'My Courses'),
('trans-202', 'en', 'student', 'enrolled_courses', 'Enrolled Courses'),
('trans-203', 'en', 'student', 'continue_learning', 'Continue Learning'),
('trans-204', 'en', 'student', 'start_learning', 'Start Learning'),
('trans-205', 'en', 'student', 'watch_lecture', 'Watch Lecture'),
('trans-206', 'en', 'student', 'take_test', 'Take Test'),
('trans-207', 'en', 'student', 'ask_doubt', 'Ask Doubt'),
('trans-208', 'en', 'student', 'view_results', 'View Results'),
('trans-209', 'en', 'student', 'your_score', 'Your Score'),
('trans-210', 'en', 'student', 'time_remaining', 'Time Remaining'),
('trans-211', 'en', 'student', 'submit_test', 'Submit Test'),
('trans-212', 'en', 'student', 'test_complete', 'Test Complete'),
('trans-213', 'en', 'student', 'correct_answers', 'Correct Answers'),
('trans-214', 'en', 'student', 'incorrect_answers', 'Incorrect Answers'),
('trans-215', 'en', 'student', 'skip_questions', 'Skipped Questions'),
('trans-216', 'en', 'student', 'marks_obtained', 'Marks Obtained'),
('trans-217', 'en', 'student', 'total_marks', 'Total Marks'),
('trans-218', 'en', 'student', 'passing_marks', 'Passing Marks'),
('trans-219', 'en', 'student', 'download_notes', 'Download Notes'),
('trans-220', 'en', 'student', 'view_solution', 'View Solution');

-- Student portal translations (Hindi)
INSERT INTO Translations (id, langCode, namespace, translationKey, translationValue) VALUES
('trans-301', 'hi', 'student', 'my_courses', 'मेरे कोर्स'),
('trans-302', 'hi', 'student', 'enrolled_courses', 'एनरोल्ड कोर्स'),
('trans-303', 'hi', 'student', 'continue_learning', 'सीखना जारी रखें'),
('trans-304', 'hi', 'student', 'start_learning', 'सीखना शुरू करें'),
('trans-305', 'hi', 'student', 'watch_lecture', 'लेक्चर देखें'),
('trans-306', 'hi', 'student', 'take_test', 'टेस्ट दें'),
('trans-307', 'hi', 'student', 'ask_doubt', 'शंका पूछें'),
('trans-308', 'hi', 'student', 'view_results', 'परिणाम देखें'),
('trans-309', 'hi', 'student', 'your_score', 'आपका स्कोर'),
('trans-310', 'hi', 'student', 'time_remaining', 'समय शेष'),
('trans-311', 'hi', 'student', 'submit_test', 'टेस्ट जमा करें'),
('trans-312', 'hi', 'student', 'test_complete', 'टेस्ट पूर्ण'),
('trans-313', 'hi', 'student', 'correct_answers', 'सही उत्तर'),
('trans-314', 'hi', 'student', 'incorrect_answers', 'गलत उत्तर'),
('trans-315', 'hi', 'student', 'skip_questions', 'छोड़े गए प्रश्न'),
('trans-316', 'hi', 'student', 'marks_obtained', 'प्राप्त अंक'),
('trans-317', 'hi', 'student', 'total_marks', 'कुल अंक'),
('trans-318', 'hi', 'student', 'passing_marks', 'उत्तीर्ण अंक'),
('trans-319', 'hi', 'student', 'download_notes', 'नोट्स डाउनलोड करें'),
('trans-320', 'hi', 'student', 'view_solution', 'हल देखें');

-- ======================
-- SUBSCRIPTION PLANS
-- ======================

INSERT INTO SubscriptionPlans (id, name, description, price, durationMonths, features) VALUES
('plan-001', 'Basic', 'Access to recorded lectures and practice tests', 299.00, 1, '["Recorded Lectures","Practice Tests","Doubt Support","Mobile Access"]'),
('plan-002', 'Standard', 'Live classes + all basic features', 599.00, 1, '["Live Classes","Recorded Lectures","Practice Tests","Doubt Support","Notes Download","Priority Support"]'),
('plan-003', 'Premium', 'Complete package with mentorship', 999.00, 1, '["Live Classes","Recorded Lectures","Practice Tests","Doubt Support","Notes Download","1:1 Mentorship","Scholarship Tests","Certificate"]'),
('plan-004', 'Annual Basic', '12 months basic access', 2999.00, 12, '["Recorded Lectures","Practice Tests","Doubt Support","Mobile Access"]'),
('plan-005', 'Annual Premium', '12 months complete access', 9999.00, 12, '["Live Classes","Recorded Lectures","Practice Tests","Doubt Support","Notes Download","1:1 Mentorship","Scholarship Tests","Certificate","Offline Center Access"]');

-- ======================
-- OFFLINE CENTERS
-- ======================

INSERT INTO OfflineCenters (id, name, address, city, state, pincode, phone, capacity, coursesOffered) VALUES
('center-001', 'THE SHIVA Delhi Center', '45 Rajouri Garden, Near Metro Station', 'New Delhi', 'Delhi', '110027', '9999999001', 200, '["course-001","course-002"]'),
('center-002', 'THE SHIVA Lucknow Center', '123 Hazratganj, Opposite Lemon Tree', 'Lucknow', 'Uttar Pradesh', '226001', '9999999002', 150, '["course-001","course-003"]'),
('center-003', 'THE SHIVA Patna Center', '78 Boring Road, Near Gandhi Maidan', 'Patna', 'Bihar', '800001', '9999999003', 180, '["course-002","course-004"]'),
('center-004', 'THE SHIVA Jaipur Center', '56 Malviya Nagar, Near Maharani College', 'Jaipur', 'Rajasthan', '302017', '9999999004', 120, '["course-003","course-005"]'),
('center-005', 'THE SHIVA Kolkata Center', '34 Salt Lake, Sector V', 'Kolkata', 'West Bengal', '700091', '9999999005', 160, '["course-001","course-005"]');

-- ======================
-- SAMPLE NCERT DATA (Maths Class 10)
-- ======================

INSERT INTO NCERTSolutions (id, classLevel, subject, chapter, questionNumber, questionText, solution) VALUES
('ncert-001', 10, 'Mathematics', 'Real Numbers', '1.1', 'Express 6 as a rational number.', '6 can be written as 6/1, which is a rational number of the form p/q where q ≠ 0.'),
('ncert-002', 10, 'Mathematics', 'Real Numbers', '1.2', 'Express 0.99999... as a rational number.', 'Let x = 0.99999... Then 10x = 9.99999... Subtracting: 9x = 9, so x = 1. Therefore 0.99999... = 1.'),
('ncert-003', 10, 'Mathematics', 'Polynomials', '2.1', 'Find the zeroes of the polynomial x² - 5x + 6.', 'x² - 5x + 6 = (x - 2)(x - 3). Zeroes are x = 2 and x = 3.'),
('ncert-004', 10, 'Mathematics', 'Polynomials', '2.2', 'Find the zeroes of 2x² - 3x - 2.', '2x² - 3x - 2 = (2x + 1)(x - 2). Zeroes are x = -1/2 and x = 2.'),
('ncert-005', 10, 'Mathematics', 'Pair of Linear Equations', '3.1', 'Solve: x + y = 5 and 2x - y = 1.', 'Adding both equations: 3x = 6, so x = 2. Then y = 5 - 2 = 3. Solution: (2, 3).'),
('ncert-006', 10, 'Mathematics', 'Quadratic Equations', '4.1', 'Check if x² - 4x + 4 = 0 has real roots.', 'Discriminant D = b² - 4ac = 16 - 16 = 0. Since D = 0, the equation has two equal real roots. x = 2.'),
('ncert-007', 10, 'Science', 'Chemical Reactions', '1.1', 'Why should a magnesium ribbon be cleaned before burning?', 'Magnesium ribbon should be cleaned to remove the protective layer of magnesium oxide (MgO) that forms on its surface due to exposure to air. This ensures proper burning.'),
('ncert-008', 10, 'Science', 'Acids Bases Salts', '2.1', 'What happens when dilute HCl is added to zinc granules?', 'Zn + 2HCl → ZnCl₂ + H₂. Zinc reacts with dilute hydrochloric acid to form zinc chloride and hydrogen gas. Hydrogen gas burns with a pop sound.'),
('ncert-009', 10, 'English', 'First Flight', '1.1', 'What is the central theme of "A Letter to God"?', 'The central theme is faith and human nature. It shows how Lencho had unwavering faith in God, and how the postmaster and others showed kindness despite the misunderstanding.'),
('ncert-010', 10, 'Hindi', 'Kshitij', '1.1', '"मानवीय करुणा की द्वीप" कहानी का मुख्य संदेश क्या है?', 'इस कहानी का मुख्य संदेश यह है कि मानवता सबसे बड़ा धर्म है। किसी भी परिस्थिति में इंसानियत को नहीं भूलना चाहिए।');

SELECT 'Feature seed data inserted successfully!' AS status;
