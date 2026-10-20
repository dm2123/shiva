import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { createServerSession } from '@/lib/auth';
import { serializeSessionCookie } from '@/lib/auth';
import { verifyGoogleIdToken } from '@/lib/google-auth';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ success: false, error: { message: 'Google credential required' } }, { status: 400 });
    }

    // Verify the Google ID token properly: RS256 signature (Google JWKS),
    // issuer, audience (our GOOGLE_CLIENT_ID) and expiry — see @/lib/google-auth.
    let payload;
    try {
      payload = await verifyGoogleIdToken(credential);
    } catch (verifyError: any) {
      return NextResponse.json(
        { success: false, error: { message: verifyError.message || 'Google token verification failed' } },
        { status: 401 }
      );
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || '';
    const picture = payload.picture || '';

    // Check if user exists
    const [existingUsers]: any = await mysqlPool.query(
      `SELECT id, email, role FROM Users WHERE email = ? LIMIT 1`,
      [email]
    );

    let userId: string;

    if (existingUsers.length > 0) {
      // User exists - check if they are a student
      const user = existingUsers[0];
      if (user.role !== 'STUDENT') {
        return NextResponse.json(
          { success: false, error: { message: `This email is registered as ${user.role}. Please use the ${user.role.toLowerCase()} login.` } },
          { status: 400 }
        );
      }
      userId = user.id;

      // Update Google ID if not set
      await mysqlPool.query(
        `UPDATE Users SET googleId = ? WHERE id = ? AND (googleId IS NULL OR googleId = '')`,
        [googleId, userId]
      );
    } else {
      // New user - create account
      userId = uuid();
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await mysqlPool.query(
        `INSERT INTO Users (id, email, fullName, role, status, authProvider, googleId, avatarUrl, createdAt, updatedAt)
         VALUES (?, ?, ?, 'STUDENT', 'ACTIVE', 'GOOGLE', ?, ?, ?, ?)`,
        [userId, email, name, googleId, picture, now, now]
      );

      // Create empty student profile
      await mysqlPool.query(
        `INSERT INTO StudentProfiles (id, userId, createdAt) VALUES (?, ?, ?)`,
        [uuid(), userId, now]
      );
    }

    // Create session
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';
    const session = await createServerSession(userId, 'STUDENT' as any, email, ip, ua);

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: userId, email, role: 'STUDENT', name },
        isNewUser: existingUsers.length === 0,
      }
    });

    response.headers.set('Set-Cookie', serializeSessionCookie(session.sessionId));
    return response;

  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Google authentication failed' } },
      { status: 500 }
    );
  }
}
