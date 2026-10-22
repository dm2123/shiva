import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { createServerSession } from '@/lib/auth';
import { serializeSessionCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { verifyGoogleIdToken } from '@/lib/google-auth';
import { ensureGoogleUsersColumns } from '@/lib/ensure-google-schema';
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

    // The Users table may predate Google Sign-In (no googleId / authProvider /
    // avatarUrl columns). Make sure they exist before touching them — this
    // adds the missing columns on first use and never throws; the returned
    // set tells us which optional columns are safe to use. (Previously this
    // route failed here with "Unknown column 'googleid' in 'where clause'".)
    const userCols = await ensureGoogleUsersColumns();

    // Check if user exists (Google accounts are matched by verified email)
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

      // Link the Google ID to the existing account (best effort — only when
      // the column exists, and a failure here must never block the login).
      if (userCols.has('googleId')) {
        try {
          await mysqlPool.query(
            `UPDATE Users SET googleId = ? WHERE id = ? AND (googleId IS NULL OR googleId = '')`,
            [googleId, userId]
          );
        } catch (linkError: any) {
          console.error('[google-auth] googleId link failed:', linkError?.message);
        }
      }
    } else {
      // New user - create account with the same base columns as email
      // registration (see createUser in @/lib/db). Name lives on the
      // student profile, not on Users. Google-only columns are added to
      // the INSERT only when they actually exist in the table.
      userId = uuid();
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Users.password is NOT NULL, but a Google user has no password.
      // Store a bcrypt hash of a random secret: password login stays
      // impossible until the user sets a real password via forgot-password.
      const randomPasswordHash = await hashPassword(uuid() + uuid());

      const cols: string[] = ['id', 'email', 'password', 'role', 'status', 'emailVerified'];
      const vals: any[] = [userId, email, randomPasswordHash, 'STUDENT', 'ACTIVE', 1];
      if (userCols.has('authProvider')) { cols.push('authProvider'); vals.push('GOOGLE'); }
      if (userCols.has('googleId')) { cols.push('googleId'); vals.push(googleId); }
      if (userCols.has('avatarUrl')) { cols.push('avatarUrl'); vals.push(picture || null); }
      if (userCols.has('fullName')) { cols.push('fullName'); vals.push(name); }

      await mysqlPool.query(
        `INSERT INTO Users (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
        vals
      );

      // Create the student profile (same shape as email registration).
      // avatarUrl exists on StudentProfiles in the base schema, but fall
      // back to the minimal insert if it somehow does not.
      try {
        await mysqlPool.query(
          `INSERT INTO StudentProfiles (id, userId, name, avatarUrl) VALUES (?, ?, ?, ?)`,
          [uuid(), userId, name, picture || null]
        );
      } catch {
        await mysqlPool.query(
          `INSERT INTO StudentProfiles (id, userId, name) VALUES (?, ?, ?)`,
          [uuid(), userId, name]
        );
      }
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
