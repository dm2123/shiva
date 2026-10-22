import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UserRole, UserSession } from '@/types/auth';
import { saveSession, getSession, deleteSession } from './redis';
import { headers } from 'next/headers';
import { findUserById } from './db';

const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12;

export async function getAuthUser() {
  const cookieHeader = headers().get('cookie');
  const sessionId = parseSessionCookie(cookieHeader);
  if (!sessionId) return null;
  const session = await validateServerSession(sessionId);
  if (!session) return null;
  return await findUserById(session.userId);
}

export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText || plainText.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  return bcrypt.compare(plainText, hash);
}

export async function createServerSession(
  userId: string,
  role: UserRole,
  email: string,
  ipAddress?: string,
  userAgent?: string,
  ttlSeconds: number = 604800
): Promise<UserSession> {
  const sessionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  const session: UserSession = {
    sessionId,
    userId,
    role,
    email,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ipAddress,
    userAgent,
  };

  await saveSession(session, ttlSeconds);
  return session;
}

export async function validateServerSession(sessionId: string): Promise<UserSession | null> {
  if (!sessionId) return null;
  return getSession(sessionId);
}

export async function revokeServerSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  await deleteSession(sessionId);
}

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookieName = process.env.SESSION_COOKIE_NAME || 'shiva_session_id';
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith(`${cookieName}=`)) {
      return c.substring(cookieName.length + 1);
    }
  }
  return null;
}

export function serializeSessionCookie(sessionId: string, maxAgeSeconds: number = 604800): string {
  const cookieName = process.env.SESSION_COOKIE_NAME || 'shiva_session_id';
  const isProd = process.env.NODE_ENV === 'production';
  return `${cookieName}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${isProd ? '; Secure' : ''}`;
}

export function serializeExpiredSessionCookie(): string {
  const cookieName = process.env.SESSION_COOKIE_NAME || 'shiva_session_id';
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
