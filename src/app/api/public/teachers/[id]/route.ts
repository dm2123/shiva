import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [teachers]: any = await mysqlPool.query(
      `SELECT userId, name, email, bio, qualification AS qualifications, experienceYears AS experience, 
              photoUrl, subjects, slug, status
       FROM TeacherProfiles
       WHERE userId = ?`,
      [params.id]
    );

    if (teachers.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Teacher not found' } }, { status: 404 });
    }

    const teacher = teachers[0];

    // Get courses taught
    const [courses]: any = await mysqlPool.query(
      `SELECT c.id, c.title, c.description, c.courseType, c.difficulty,
              (SELECT COUNT(*) FROM StudentEnrollments WHERE courseId = c.id) AS enrolledStudents
       FROM Courses c
       WHERE c.educatorId = ?
       LIMIT 10`,
      [params.id]
    );

    // Get live classes conducted
    const [liveClasses]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS total, 
              SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed
       FROM LiveClasses WHERE teacherId = ?`,
      [params.id]
    );

    // Get doubt resolution stats
    const [doubtStats]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
              AVG(TIMESTAMPDIFF(MINUTE, createdAt, resolvedAt)) AS avgResponseMinutes
       FROM Doubts WHERE assignedTo = ?`,
      [params.id]
    );

    // Get reviews
    const [reviews]: any = await mysqlPool.query(
      `SELECT cr.*, sp.name AS studentName
       FROM CourseReviews cr
       JOIN StudentProfiles sp ON cr.studentId = sp.userId
       WHERE cr.courseId IN (SELECT id FROM Courses WHERE educatorId = ?)
       ORDER BY cr.createdAt DESC
       LIMIT 5`,
      [params.id]
    );

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        teacher,
        courses,
        liveClasses: liveClasses[0] || { total: 0, completed: 0 },
        doubtStats: doubtStats[0] || { total: 0, resolved: 0, avgResponseMinutes: 0 },
        reviews,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
