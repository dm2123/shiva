import { NextRequest } from 'next/server';
import { UserRole, UserSession } from '@/types/auth';
import { parseSessionCookie, validateServerSession } from './auth';
import { createApiError } from './utils';

export class AuthError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode: number = 401, errorCode: string = 'UNAUTHORIZED', details?: any) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  const cookieHeader = req.headers.get('cookie');
  const sessionId = parseSessionCookie(cookieHeader);
  if (!sessionId) return null;
  return validateServerSession(sessionId);
}

export async function requireAuth(req: NextRequest): Promise<UserSession> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    throw new AuthError('Authentication required. Please log in.', 401, 'UNAUTHORIZED');
  }
  return session;
}

export async function requireRole(req: NextRequest, requiredRole: UserRole): Promise<UserSession> {
  const session = await requireAuth(req);
  if (session.role !== requiredRole) {
    throw new AuthError(
      `Access denied. Required role: ${requiredRole}. Active session role: ${session.role}.`,
      403,
      'FORBIDDEN_ROLE'
    );
  }
  return session;
}

export async function requireRoleOneOf(req: NextRequest, allowedRoles: UserRole[]): Promise<UserSession> {
  const session = await requireAuth(req);
  if (!allowedRoles.includes(session.role)) {
    throw new AuthError(
      `Access denied. Authorized roles: ${allowedRoles.join(', ')}. Active session role: ${session.role}.`,
      403,
      'FORBIDDEN_ROLE'
    );
  }
  return session;
}
