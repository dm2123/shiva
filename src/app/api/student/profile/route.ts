import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool, getStudentProfileByUserId } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { ensureStudentProfileSchema } from '@/lib/ensure-student-profile-schema';
import { randomUUID } from 'crypto';
import { z } from 'zod';

/**
 * GET /api/student/profile
 *
 * Profile summary for the student app (Profile tab): the student's own
 * account + profile row, plus real activity counts — enrolled courses
 * (StudentEnrollments) and completed test attempts (AssessmentAttempts).
 * This route did not exist before (the app got a 404 HTML page and hid
 * its stats cards); every number here comes from the live tables.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const userId = session.userId;

    const [userRows]: any = await mysqlPool.query(
      `SELECT u.id, u.email, u.role, u.status, u.createdAt,
              sp.name AS name, sp.targetExam AS targetExam,
              sp.avatarUrl AS avatarUrl, sp.phone AS phone
       FROM Users u
       LEFT JOIN StudentProfiles sp ON sp.userId = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );
    const user = userRows?.[0];
    if (!user) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Student not found.'), { status: 404 });
    }

    let enrolledCourses = 0;
    try {
      const [rows]: any = await mysqlPool.query(
        'SELECT COUNT(*) AS n FROM StudentEnrollments WHERE studentId = ?',
        [userId]
      );
      enrolledCourses = Number(rows?.[0]?.n) || 0;
    } catch {
      /* count is best-effort */
    }

    let testsAttempted = 0;
    try {
      const [rows]: any = await mysqlPool.query(
        `SELECT COUNT(*) AS n FROM AssessmentAttempts
         WHERE studentId = ? AND status IN ('COMPLETED', 'EVALUATED')`,
        [userId]
      );
      testsAttempted = Number(rows?.[0]?.n) || 0;
    } catch {
      /* count is best-effort */
    }

    return NextResponse.json(
      createApiResponse({
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        targetExam: user.targetExam || undefined,
        avatarUrl: user.avatarUrl || undefined,
        phone: user.phone || undefined,
        role: user.role,
        memberSince: user.createdAt,
        enrolledCourses,
        testsAttempted,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch profile.'),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/student/profile — student apni profile khud update kare.
 *
 * Pehle update ka koi rasta hi nahi tha: StudentProfiles sirf
 * registration / Google sign-in par banta tha aur profile page ke
 * saare fields view-only the. Ab student sirf ye teen fields badal
 * sakta hai:
 * - fullName  → StudentProfiles.name (registration yahi likhta hai;
 *               Users table me name column hai hi nahi)
 * - targetExam → StudentProfiles.targetExam
 * - avatarUrl → StudentProfiles.avatarUrl (empty string = avatar hatao)
 *
 * Email / phone / role yahan se NAHI badalte — wo jaan-boojh kar
 * is route ke scope se bahar hain.
 */

const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long').max(100).optional(),
    targetExam: z.string().trim().min(2, 'Target exam must be at least 2 characters long').max(100).optional(),
    avatarUrl: z
      .union([z.string().trim().url('Avatar URL must be a valid URL').max(500), z.literal('')])
      .optional(),
  })
  .refine((d) => d.fullName !== undefined || d.targetExam !== undefined || d.avatarUrl !== undefined, {
    message: 'At least one field (fullName, targetExam, avatarUrl) is required',
  });

export async function PUT(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    // Self-heal: purane DBs par StudentProfiles table/columns missing
    // ho sakte hain — write se pehle pakka kar lo.
    await ensureStudentProfileSchema();

    const parsed = updateProfileSchema.safeParse(await req.json());
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'Input validation failed.', details), { status: 400 });
    }
    const { fullName, targetExam, avatarUrl } = parsed.data;

    const existing = await getStudentProfileByUserId(session.userId);

    if (!existing) {
      // Profile row hi nahi hai (kuch purane/Google accounts aise ho
      // sakte hain) — update ki jagah asal data se row bana do, taaki
      // student atak na jaye. Naam na diya ho to email ke local-part
      // se bharo (profile page ka display fallback bhi yahi hai).
      const fallbackName = fullName || session.email?.split('@')[0] || 'Student';
      await mysqlPool.query(
        `INSERT INTO StudentProfiles (id, userId, name, targetExam, avatarUrl, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          session.userId,
          fallbackName,
          targetExam ?? null,
          avatarUrl ? avatarUrl : null,
          session.email || null,
        ]
      );
    } else {
      const sets: string[] = [];
      const values: any[] = [];
      if (fullName !== undefined) { sets.push('name = ?'); values.push(fullName); }
      if (targetExam !== undefined) { sets.push('targetExam = ?'); values.push(targetExam); }
      if (avatarUrl !== undefined) { sets.push('avatarUrl = ?'); values.push(avatarUrl === '' ? null : avatarUrl); }
      values.push(session.userId);
      await mysqlPool.query(`UPDATE StudentProfiles SET ${sets.join(', ')} WHERE userId = ?`, values);
    }

    const profile = await getStudentProfileByUserId(session.userId);
    return NextResponse.json(createApiResponse({ profile }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to update profile.'),
      { status: 500 }
    );
  }
}
