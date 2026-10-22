import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    // Get subjects with low scores (weakness)
    const [weakSubjects]: any = await mysqlPool.query(
      `SELECT s.name AS subject, c.title AS course,
              AVG(a.score) AS avgScore,
              COUNT(a.id) AS attempts
       FROM AssessmentAttempts a
       JOIN Assessments ass ON a.assessmentId = ass.id
       JOIN Courses c ON ass.courseId = c.id
       JOIN Subjects s ON s.courseId = c.id
       WHERE a.studentId = ? AND a.score < 60
       GROUP BY s.name, c.title
       HAVING attempts >= 2
       ORDER BY avgScore ASC
       LIMIT 10`,
      [session.userId]
    );

    // Get recent poor performances
    const [recentPoor]: any = await mysqlPool.query(
      `SELECT ass.title, a.score, a.completedAt, c.title AS courseTitle
       FROM AssessmentAttempts a
       JOIN Assessments ass ON a.assessmentId = ass.id
       JOIN Courses c ON ass.courseId = c.id
       WHERE a.studentId = ? AND a.score < 50
       ORDER BY a.completedAt DESC
       LIMIT 5`,
      [session.userId]
    );

    // Get improvement suggestions
    const [suggestions]: any = await mysqlPool.query(
      `SELECT s.name AS subject, c.title AS course,
              COUNT(l.id) AS totalLectures,
              (SELECT COUNT(*) FROM LectureNotes ln 
               JOIN Lectures l2 ON ln.lectureId = l2.id 
               JOIN Chapters ch2 ON l2.chapterId = ch2.id 
               WHERE ch2.subjectId = s.id AND ln.studentId = ?) AS notesCompleted
       FROM Subjects s
       JOIN Courses c ON s.courseId = c.id
       JOIN StudentEnrollments e ON c.id = e.courseId AND e.studentId = ?
       JOIN Chapters ch ON s.id = ch.subjectId
       JOIN Lectures l ON ch.id = l.chapterId
       GROUP BY s.id, s.name, c.title
       ORDER BY (notesCompleted / totalLectures) ASC
       LIMIT 5`,
      [session.userId, session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        weakSubjects,
        recentPoor,
        suggestions
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
