import mysql from 'mysql2/promise';

// Database connection using environment variables
// Set MYSQL_SSL=true when connecting to a managed cloud database (e.g. TiDB Cloud)
// which requires TLS. Local development stays non-TLS by default.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE || 'the_shiva',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(process.env.MYSQL_SSL === 'true'
    ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
    : {}),
});

export const mysqlPool = pool;

/**
 * Wipe all application tables (FK-safe). Used by the vitest integration suites.
 * Reseeds nothing — callers follow with seed_db.sql or service-level setup.
 */
export async function resetDatabase(): Promise<void> {
  const [tables]: any = await mysqlPool.query('SHOW TABLES');
  const tableNames: string[] = tables.map((t: any) => Object.values(t)[0] as string);
  if (tableNames.length === 0) return;

  await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    for (const name of tableNames) {
      await mysqlPool.query(`TRUNCATE TABLE \`${name}\``);
    }
  } finally {
    await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

// --- AUTH FUNCTIONS ---
export async function findUserByEmail(email: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function findUserByPhone(phone: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Users WHERE phone = ?', [phone]);
  return rows[0] || null;
}

export async function findUserById(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Users WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createUser(u: any) {
  await mysqlPool.query(
    'INSERT INTO Users (id, email, password, role, status, phone, phoneVerified, emailVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [u.id, u.email, u.passwordHash || u.password, u.role, u.status || 'ACTIVE', u.phone || null, !!u.phoneVerified, !!u.emailVerified]
  );
  return u;
}

export async function getStudentProfileByUserId(userId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM StudentProfiles WHERE userId = ?', [userId]);
  return rows[0] || null;
}

export async function getTeacherProfileByUserId(userId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM TeacherProfiles WHERE userId = ?', [userId]);
  return rows[0] || null;
}

export async function getAdminProfileByUserId(userId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM AdminProfiles WHERE userId = ?', [userId]);
  return rows[0] || null;
}

export async function createStudentProfile(p: any) {
  await mysqlPool.query('INSERT INTO StudentProfiles (id, userId, name) VALUES (?, ?, ?)', [p.id, p.userId, p.fullName || p.name]);
  return p;
}

export async function createTeacherProfile(p: any) {
  await mysqlPool.query('INSERT INTO TeacherProfiles (id, userId, name, email) VALUES (?, ?, ?, ?)', [p.id, p.userId, p.fullName || p.name, p.email || null]);
  return p;
}

export async function createAdminProfile(p: any) {
  await mysqlPool.query('INSERT INTO AdminProfiles (id, userId, name) VALUES (?, ?, ?)', [p.id, p.userId, p.fullName || p.name]);
  return p;
}

// --- ACADEMIC FUNCTIONS ---
export async function listCoursesDb(includeUnpublished: boolean = false) {
  try {
    const query = includeUnpublished ? 'SELECT * FROM Courses ORDER BY createdAt DESC' : 'SELECT * FROM Courses WHERE status = "PUBLISHED" ORDER BY createdAt DESC';
    const [rows] = await mysqlPool.query(query);
    return (rows as any[]).map(row => ({ ...row, isPublished: !!row.isPublished }));
  } catch(e) {
    console.error(e);
    return [];
  }
}

export async function createCourseDb(c: any) {
  try {
    const createdAt = c.createdAt ? c.createdAt.slice(0, 19).replace('T', ' ') : null;
    const updatedAt = c.updatedAt ? c.updatedAt.slice(0, 19).replace('T', ' ') : null;
    await mysqlPool.query('INSERT INTO Courses (id, title, slug, description, thumbnailUrl, price, status, isPublished, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [c.id, c.title, c.slug, c.description, c.thumbnailUrl || '', c.price, c.status, c.isPublished ? 1 : 0, createdAt, updatedAt]);
    return c;
  } catch(e) {
    console.error("Course Create Error DB:", e);
    throw e;
  }
}

export async function deleteCourseDb(id: string) {
  try {
    await mysqlPool.query('DELETE FROM Courses WHERE id = ?', [id]);
    return true;
  } catch(e) {
    return false;
  }
}


export async function listAllEducators() {
  const [rows] = await mysqlPool.query('SELECT * FROM TeacherProfiles');
  return (rows as any[]).map(r => ({ ...r, displayName: r.name }));
}

export async function createBatchDb(b: any) {
  await mysqlPool.query('INSERT INTO Batches (id, courseId, teacherId, name, startDate, endDate, status) VALUES (?,?,?,?,?,?,?)',
    [b.id, b.courseId, b.teacherId, b.name, b.startDate, b.endDate, b.status]);
  return b;
}

// --- STATS FUNCTION ---
export async function getPlatformStats() {
  try {
    const [sCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM StudentProfiles');
    const [tCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM TeacherProfiles');
    const [cCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM Courses WHERE isPublished = 1');
    const [eCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM TeacherProfiles WHERE status = "active"');
    
    return {
      students: sCount[0].count || 0,
      teachers: tCount[0].count || 0,
      courses: cCount[0].count || 0,
      educators: eCount[0].count || 0,
    };
  } catch (error) {
    return { students: 0, teachers: 0, courses: 0, educators: 0 };
  }
}

export async function listLiveClassesDb() {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM LiveClasses ORDER BY startTime DESC');
    // Map DB fields to service expected fields
    return rows.map((r: any) => ({
      ...r,
      scheduledStartAt: r.startTime,
      accessType: 'PUBLIC',
      classType: 'REGULAR',
      teacherId: r.teacherId || null,
    }));
  } catch {
    return [];
  }
}

export async function getStudentEnrollmentsByStudentIdDb(studentId: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM StudentEnrollments WHERE studentId = ?', [studentId]);
    return rows || [];
  } catch {
    return [];
  }
}

export async function findCourseByIdDb(id: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM Courses WHERE id = ?', [id]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function findCourseBySlugDb(slug: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM Courses WHERE slug = ?', [slug]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function updateCourseDb(id: string, updates: any) {
  try {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    await mysqlPool.query(`UPDATE Courses SET ${fields} WHERE id = ?`, values);
    return true;
  } catch {
    return false;
  }
}

export async function updateUserDb(id: string, updates: any) {
  try {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    await mysqlPool.query(`UPDATE Users SET ${fields} WHERE id = ?`, values);
    return true;
  } catch {
    return false;
  }
}

// --- TEACHER ASSIGNMENT FUNCTIONS ---
export async function createTeacherAssignmentDb(a: any) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await mysqlPool.query(
    'INSERT INTO TeacherCourseAssignments (id, teacherId, courseId, assignedAt) VALUES (?, ?, ?, ?)',
    [a.id, a.teacherId, a.courseId, now]
  );
  return a;
}

export async function getTeacherAssignmentsDb(teacherId: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM TeacherCourseAssignments WHERE teacherId = ?', [teacherId]);
    return rows || [];
  } catch { return []; }
}

export async function isTeacherAssignedToCourseDb(teacherId: string, courseId: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT id FROM TeacherCourseAssignments WHERE teacherId = ? AND courseId = ?', [teacherId, courseId]);
    return rows.length > 0;
  } catch { return false; }
}

export async function listBatchesByCourseDb(courseId: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM Batches WHERE courseId = ?', [courseId]);
    return rows || [];
  } catch { return []; }
}

// --- ENROLLMENT FUNCTIONS ---
export async function createStudentEnrollmentDb(e: any) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await mysqlPool.query(
    'INSERT INTO StudentEnrollments (id, studentId, courseId, batchId, status, enrolledAt) VALUES (?, ?, ?, ?, ?, ?)',
    [e.id, e.studentId, e.courseId, e.batchId || null, e.status || 'ACTIVE', now]
  );
  return e;
}

export async function getStudentEnrollmentsDb(studentId: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM StudentEnrollments WHERE studentId = ?', [studentId]);
    return (rows || []) as Array<{ id: string; studentId: string; courseId: string; batchId: string | null; status: string; enrolledAt: string }>;
  } catch { return []; }
}

export async function isStudentEnrolledInCourseDb(studentId: string, courseId: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT id FROM StudentEnrollments WHERE studentId = ? AND courseId = ?', [studentId, courseId]);
    return rows.length > 0;
  } catch { return false; }
}

// --- SUBJECT / CHAPTER / LECTURE FUNCTIONS ---
function toSqlDatetime(d: any): string | null {
  if (!d) return null;
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (typeof d === 'string') return d.slice(0, 19).replace('T', ' ');
  return null;
}

export async function createSubjectDb(s: any) {
  await mysqlPool.query(
    'INSERT INTO Subjects (id, courseId, name, code, description, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [s.id, s.courseId, s.name, s.code || null, s.description || null, s.sortOrder || 0, toSqlDatetime(s.createdAt), toSqlDatetime(s.updatedAt)]
  );
  return s;
}
export async function findSubjectByIdDb(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Subjects WHERE id = ?', [id]);
  return rows[0] || null;
}
export async function updateSubjectDb(id: string, u: any) {
  if (Object.keys(u).length === 0) return findSubjectByIdDb(id);
  const fields = Object.keys(u).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(u), id];
  await mysqlPool.query(`UPDATE Subjects SET ${fields} WHERE id = ?`, values);
  return findSubjectByIdDb(id);
}
export async function deleteSubjectDb(id: string) {
  await mysqlPool.query('DELETE FROM Subjects WHERE id = ?', [id]);
  return true;
}
export async function listSubjectsByCourseDb(courseId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Subjects WHERE courseId = ? ORDER BY sortOrder ASC', [courseId]);
  return rows || [];
}

export async function createChapterDb(c: any) {
  await mysqlPool.query(
    'INSERT INTO Chapters (id, subjectId, title, description, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [c.id, c.subjectId, c.title, c.description || null, c.sortOrder || 0, toSqlDatetime(c.createdAt), toSqlDatetime(c.updatedAt)]
  );
  return c;
}
export async function findChapterByIdDb(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Chapters WHERE id = ?', [id]);
  return rows[0] || null;
}
export async function updateChapterDb(id: string, u: any) {
  if (Object.keys(u).length === 0) return findChapterByIdDb(id);
  const fields = Object.keys(u).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(u), id];
  await mysqlPool.query(`UPDATE Chapters SET ${fields} WHERE id = ?`, values);
  return findChapterByIdDb(id);
}
export async function deleteChapterDb(id: string) {
  await mysqlPool.query('DELETE FROM Chapters WHERE id = ?', [id]);
  return true;
}
export async function listChaptersBySubjectDb(subjectId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Chapters WHERE subjectId = ? ORDER BY sortOrder ASC', [subjectId]);
  return rows || [];
}

export async function createLectureDb(l: any) {
  await mysqlPool.query(
    'INSERT INTO Lectures (id, chapterId, title, description, videoUrl, durationSeconds, isPreviewable, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [l.id, l.chapterId, l.title, l.description || null, l.videoUrl || null, l.durationSeconds || 0, l.isPreviewable ? 1 : 0, l.sortOrder || 0, toSqlDatetime(l.createdAt), toSqlDatetime(l.updatedAt)]
  );
  return l;
}
export async function findLectureByIdDb(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Lectures WHERE id = ?', [id]);
  return rows[0] || null;
}
export async function updateLectureDb(id: string, u: any) {
  if (Object.keys(u).length === 0) return findLectureByIdDb(id);
  const fields = Object.keys(u).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(u), id];
  await mysqlPool.query(`UPDATE Lectures SET ${fields} WHERE id = ?`, values);
  return findLectureByIdDb(id);
}
export async function deleteLectureDb(id: string) {
  await mysqlPool.query('DELETE FROM Lectures WHERE id = ?', [id]);
  return true;
}
export async function listLecturesByChapterDb(chapterId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Lectures WHERE chapterId = ? ORDER BY sortOrder ASC', [chapterId]);
  return rows || [];
}

export async function findBatchByIdDb(id: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM Batches WHERE id = ?', [id]);
    return rows[0] || null;
  } catch { return null; }
}

// --- EDUCATOR FUNCTIONS ---
export async function listActiveEducators() {
  const [rows] = await mysqlPool.query('SELECT * FROM TeacherProfiles WHERE status = "active"');
  return (rows as any[]).map(r => ({ ...r, displayName: r.name }));
}

export async function getEducatorById(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM TeacherProfiles WHERE id = ?', [id]);
  const r = rows[0];
  if (!r) return null;
  return { ...r, displayName: r.name };
}

export async function getEducatorBySlug(slug: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM TeacherProfiles WHERE slug = ?', [slug]);
  const r = rows[0];
  if (!r) return null;
  return { ...r, displayName: r.name };
}

// --- ORGANIZATION FUNCTIONS ---
// Stored in-memory (no Organizations table yet)
const _organizations: any[] = [];

export async function createOrganization(org: any) {
  _organizations.push(org);
  return org;
}

export async function listOrganizations() {
  return _organizations;
}

export async function getOrganizationById(id: string) {
  return _organizations.find(o => o.id === id) || null;
}

// --- EDUCATOR PROFILE CRUD ---
const _educatorProfiles: any[] = [];

export async function createEducatorProfile(profile: any) {
  _educatorProfiles.push(profile);
  return profile;
}

// --- LIVE CLASS MYSQL FUNCTIONS ---
export async function createLiveClassDb(lc: any) {
  try {
    const startTime = lc.scheduledStartAt ? lc.scheduledStartAt.toString().slice(0, 19).replace('T', ' ') : null;
    const endTime = lc.scheduledEndAt ? lc.scheduledEndAt.toString().slice(0, 19).replace('T', ' ') : null;
    await mysqlPool.query(
      'INSERT INTO LiveClasses (id, title, description, courseId, batchId, teacherId, status, startTime, endTime, meetingUrl) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [lc.id, lc.title, lc.description || null, lc.courseId || null, lc.batchId || null, lc.teacherId || null, lc.status || 'SCHEDULED', startTime, endTime, lc.meetingUrl || null]
    );
    return lc;
  } catch (e) {
    console.error('createLiveClassDb error:', e);
    throw e;
  }
}

export async function findLiveClassByIdDb(id: string) {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM LiveClasses WHERE id = ?', [id]);
    const r = rows[0];
    if (!r) return null;
    return { ...r, scheduledStartAt: r.startTime, accessType: 'PUBLIC', classType: 'REGULAR' };
  } catch { return null; }
}

export async function updateLiveClassDb(id: string, updates: any) {
  try {
    const dbUpdates: any = { ...updates };
    // Map service field names to DB column names
    if (dbUpdates.scheduledStartAt !== undefined) {
      dbUpdates.startTime = dbUpdates.scheduledStartAt ? dbUpdates.scheduledStartAt.toString().slice(0, 19).replace('T', ' ') : null;
      delete dbUpdates.scheduledStartAt;
    }
    if (dbUpdates.scheduledEndAt !== undefined) {
      dbUpdates.endTime = dbUpdates.scheduledEndAt ? dbUpdates.scheduledEndAt.toString().slice(0, 19).replace('T', ' ') : null;
      delete dbUpdates.scheduledEndAt;
    }
    if (dbUpdates.actualStartedAt !== undefined) {
      dbUpdates.actualStartedAt = dbUpdates.actualStartedAt ? dbUpdates.actualStartedAt.toString().slice(0, 19).replace('T', ' ') : null;
    }
    if (dbUpdates.actualEndedAt !== undefined) {
      dbUpdates.actualEndedAt = dbUpdates.actualEndedAt ? dbUpdates.actualEndedAt.toString().slice(0, 19).replace('T', ' ') : null;
    }
    if (Object.keys(dbUpdates).length === 0) return findLiveClassByIdDb(id);
    const fields = Object.keys(dbUpdates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(dbUpdates), id];
    await mysqlPool.query(`UPDATE LiveClasses SET ${fields} WHERE id = ?`, values);
    return findLiveClassByIdDb(id);
  } catch (e) {
    console.error('updateLiveClassDb error:', e);
    return null;
  }
}

// --- ORDER / PAYMENT FUNCTIONS ---
export async function createOrderDb(order: any) {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await mysqlPool.query(
      'INSERT INTO Orders (id, studentId, courseId, amount, status, createdAt) VALUES (?,?,?,?,?,?)',
      [order.id, order.studentId, order.courseId, order.amount, order.status || 'PENDING', now]
    );
    return order;
  } catch (e) {
    console.error('createOrderDb error:', e);
    throw e;
  }
}

export async function updateOrderDb(id: string, updates: any) {
  try {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    await mysqlPool.query(`UPDATE Orders SET ${fields} WHERE id = ?`, values);
    const [rows]: any = await mysqlPool.query('SELECT * FROM Orders WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (e) {
    console.error('updateOrderDb error:', e);
    return null;
  }
}

export async function listOrdersDb() {
  try {
    const [rows]: any = await mysqlPool.query('SELECT * FROM Orders ORDER BY createdAt DESC');
    return rows || [];
  } catch { return []; }
}

// --- TEST / QUESTION / ASSESSMENT FUNCTIONS ---
export async function createTestDb(test: any) {
  await mysqlPool.query(
    'INSERT INTO Tests (id, title, description, courseId, durationMinutes, totalMarks, passingMarks, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [test.id, test.title, test.description || null, test.courseId, test.durationMinutes || 60, test.totalMarks || 100, test.passingMarks || null, test.status || 'DRAFT']
  );
  return test;
}
export async function listTestsDb() {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Tests ORDER BY createdAt DESC');
  return rows || [];
}
export async function findTestByIdDb(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Tests WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createQuestionDb(q: any) {
  await mysqlPool.query(
    'INSERT INTO Questions (id, chapterId, subjectId, title, type, options, correctAnswer, explanation, difficulty, marks, negativeMarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [q.id, q.chapterId || null, q.subjectId || null, q.title, q.type, q.options ? JSON.stringify(q.options) : null, q.correctAnswer || null, q.explanation || null, q.difficulty || 'MEDIUM', q.marks || 4, q.negativeMarks || 1]
  );
  return q;
}
export async function listQuestionsDb() {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Questions ORDER BY createdAt DESC');
  return rows || [];
}
export async function listQuestionsByChapterDb(chapterId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Questions WHERE chapterId = ? ORDER BY createdAt DESC', [chapterId]);
  return rows || [];
}
export async function findQuestionByIdDb(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Questions WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createAssessmentDb(a: any) {
  await mysqlPool.query(
    'INSERT INTO Assessments (id, courseId, title, description, type, totalMarks, passingMarks, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [a.id, a.courseId, a.title, a.description || null, a.type || 'DPP', a.totalMarks || 100, a.passingMarks || null, toSqlDatetime(a.startTime), toSqlDatetime(a.endTime)]
  );
  return a;
}
export async function listAssessmentsByCourseDb(courseId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Assessments WHERE courseId = ? ORDER BY createdAt DESC', [courseId]);
  return rows || [];
}
export async function findAssessmentByIdDb(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM Assessments WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createAssessmentAttemptDb(attempt: any) {
  await mysqlPool.query(
    'INSERT INTO AssessmentAttempts (id, assessmentId, studentId, score, status, startedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [attempt.id, attempt.assessmentId, attempt.studentId, attempt.score || 0, attempt.status || 'STARTED', toSqlDatetime(attempt.startedAt)]
  );
  return attempt;
}
export async function findAssessmentAttemptDb(id: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM AssessmentAttempts WHERE id = ?', [id]);
  return rows[0] || null;
}
export async function updateAssessmentAttemptDb(id: string, updates: any) {
  const dbUpdates: any = { ...updates };
  if (dbUpdates.startedAt !== undefined) dbUpdates.startedAt = toSqlDatetime(dbUpdates.startedAt);
  if (dbUpdates.completedAt !== undefined) dbUpdates.completedAt = toSqlDatetime(dbUpdates.completedAt);
  if (dbUpdates.assessmentId !== undefined) delete dbUpdates.assessmentId;
  if (dbUpdates.studentId !== undefined) delete dbUpdates.studentId;
  if (Object.keys(dbUpdates).length === 0) return findAssessmentAttemptDb(id);
  const fields = Object.keys(dbUpdates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(dbUpdates), id];
  await mysqlPool.query(`UPDATE AssessmentAttempts SET ${fields} WHERE id = ?`, values);
  return findAssessmentAttemptDb(id);
}

// --- LECTURE PROGRESS ---
export async function saveLectureProgressDb(userId: string, lectureId: string, isCompleted: boolean, positionSeconds: number) {
  const id = `lp-${userId}-${lectureId}`;
  await mysqlPool.query(
    'INSERT INTO LectureProgress (id, studentId, lectureId, isCompleted, positionSeconds) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE isCompleted = ?, positionSeconds = ?',
    [id, userId, lectureId, isCompleted ? 1 : 0, positionSeconds || 0, isCompleted ? 1 : 0, positionSeconds || 0]
  );
  return true;
}

export async function getLectureProgressDb(userId: string, lectureId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM LectureProgress WHERE studentId = ? AND lectureId = ?', [userId, lectureId]);
  return rows[0] || null;
}

// --- PAYMENT CONFIG (in-memory) ---
let _paymentConfig: any = null;

export async function savePaymentConfig(config: any) {
  _paymentConfig = config;
  return config;
}

export async function getPaymentConfig() {
  return _paymentConfig;
}

// --- ASSESSMENT RESPONSES ---
export async function listAssessmentResponsesByAttemptDb(attemptId: string) {
  const [rows]: any = await mysqlPool.query('SELECT * FROM AssessmentResponses WHERE attemptId = ?', [attemptId]);
  return rows || [];
}

export async function updateAssessmentResponseDb(id: string, updates: any) {
  const dbUpdates: any = { ...updates };
  if (dbUpdates.attemptId !== undefined) delete dbUpdates.attemptId;
  if (dbUpdates.questionId !== undefined) delete dbUpdates.questionId;
  if (Object.keys(dbUpdates).length === 0) {
    const [rows]: any = await mysqlPool.query('SELECT * FROM AssessmentResponses WHERE id = ?', [id]);
    return rows[0] || null;
  }
  const fields = Object.keys(dbUpdates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(dbUpdates), id];
  await mysqlPool.query(`UPDATE AssessmentResponses SET ${fields} WHERE id = ?`, values);
  const [rows]: any = await mysqlPool.query('SELECT * FROM AssessmentResponses WHERE id = ?', [id]);
  return rows[0] || null;
}
