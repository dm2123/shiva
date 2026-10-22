import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const [reviews]: any = await mysqlPool.query(
      `SELECT cr.*, sp.name AS studentName,
              (SELECT COUNT(*) FROM CourseReviews WHERE courseId = cr.courseId) AS totalReviews,
              (SELECT AVG(rating) FROM CourseReviews WHERE courseId = cr.courseId) AS avgRating
       FROM CourseReviews cr
       JOIN StudentProfiles sp ON cr.studentId = sp.userId
       WHERE cr.courseId = ? AND cr.isPublished = 1
       ORDER BY cr.createdAt DESC
       LIMIT ? OFFSET ?`,
      [params.id, limit, offset]
    );

    const [stats]: any = await mysqlPool.query(
      `SELECT 
        COUNT(*) AS totalReviews,
        COALESCE(AVG(rating), 0) AS avgRating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS fiveStar,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS fourStar,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS threeStar,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS twoStar,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS oneStar
       FROM CourseReviews WHERE courseId = ? AND isPublished = 1`,
      [params.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: stats[0] || { totalReviews: 0, avgRating: 0, fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
