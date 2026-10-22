import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { parseSessionCookie, validateServerSession } from './auth';
import { UserSession } from '@/types/auth';

export async function getSessionFromHeaders(headersList: ReadonlyHeaders): Promise<UserSession | null> {
  const cookieHeader = headersList.get('cookie');
  const sessionId = parseSessionCookie(cookieHeader);
  if (!sessionId) return null;
  return validateServerSession(sessionId);
}
