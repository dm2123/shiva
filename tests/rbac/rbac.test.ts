import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { resetDatabase } from '@/lib/db';
import { clearAllSessions } from '@/lib/redis';
import { registerStudentService, loginService } from '@/services/auth.service';
import { provisionTeacherAccount, provisionAdminAccount } from '@/services/user.service';
import { UserRole } from '@/types/auth';
import { requireRole } from '@/lib/rbac';
import { serializeSessionCookie } from '@/lib/auth';

function createMockRequest(pathname: string, sessionId?: string): NextRequest {
  const headers = new Headers();
  if (sessionId) {
    headers.set('cookie', serializeSessionCookie(sessionId));
  }
  return new NextRequest(`http://localhost:3000${pathname}`, { headers });
}

describe('Strict Role Isolation Security Matrix Test Suite', () => {
  let studentSessionId: string;
  let teacherSessionId: string;
  let adminSessionId: string;

  beforeEach(async () => {
    await resetDatabase();
    await clearAllSessions();

    // 1. Create Student
    const studentRes = await registerStudentService({
      fullName: 'Matrix Student',
      email: 'student.matrix@shiva.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    studentSessionId = studentRes.session.sessionId;

    // 2. Create Teacher
    await provisionTeacherAccount('teacher.matrix@shiva.local', 'TeacherPass123!', 'Matrix Teacher', '+919999999992', 'org-dsa-001');
    const teacherRes = await loginService(
      { email: 'teacher.matrix@shiva.local', password: 'TeacherPass123!' },
      UserRole.TEACHER
    );
    teacherSessionId = teacherRes.session.sessionId;

    // 3. Create Admin
    await provisionAdminAccount('admin.matrix@shiva.local', 'AdminPass123!', 'Matrix Admin', 'IT');
    const adminRes = await loginService(
      { email: 'admin.matrix@shiva.local', password: 'AdminPass123!' },
      UserRole.ADMIN
    );
    adminSessionId = adminRes.session.sessionId;
  });

  // --- MATRIX ROW 1: STUDENT SESSION ---
  describe('STUDENT Session Strict Role Enforcement', () => {
    it('STUDENT: student authentication (/api/student/*) = PASS', async () => {
      const req = createMockRequest('/api/student/auth/me', studentSessionId);
      const session = await requireRole(req, UserRole.STUDENT);
      expect(session.role).toBe(UserRole.STUDENT);
    });

    it('STUDENT: teacher authentication (/api/teacher/*) = FAIL (403 Forbidden)', async () => {
      const req = createMockRequest('/api/teacher/auth/me', studentSessionId);
      await expect(requireRole(req, UserRole.TEACHER)).rejects.toThrow(
        expect.objectContaining({ statusCode: 403, errorCode: 'FORBIDDEN_ROLE' })
      );
    });

    it('STUDENT: admin authentication (/api/admin/*) = FAIL (403 Forbidden)', async () => {
      const req = createMockRequest('/api/admin/auth/me', studentSessionId);
      await expect(requireRole(req, UserRole.ADMIN)).rejects.toThrow(
        expect.objectContaining({ statusCode: 403, errorCode: 'FORBIDDEN_ROLE' })
      );
    });
  });

  // --- MATRIX ROW 2: TEACHER SESSION ---
  describe('TEACHER Session Strict Role Enforcement', () => {
    it('TEACHER: student authentication (/api/student/*) = FAIL (403 Forbidden)', async () => {
      const req = createMockRequest('/api/student/auth/me', teacherSessionId);
      await expect(requireRole(req, UserRole.STUDENT)).rejects.toThrow(
        expect.objectContaining({ statusCode: 403, errorCode: 'FORBIDDEN_ROLE' })
      );
    });

    it('TEACHER: teacher authentication (/api/teacher/*) = PASS', async () => {
      const req = createMockRequest('/api/teacher/auth/me', teacherSessionId);
      const session = await requireRole(req, UserRole.TEACHER);
      expect(session.role).toBe(UserRole.TEACHER);
    });

    it('TEACHER: admin authentication (/api/admin/*) = FAIL (403 Forbidden)', async () => {
      const req = createMockRequest('/api/admin/auth/me', teacherSessionId);
      await expect(requireRole(req, UserRole.ADMIN)).rejects.toThrow(
        expect.objectContaining({ statusCode: 403, errorCode: 'FORBIDDEN_ROLE' })
      );
    });
  });

  // --- MATRIX ROW 3: ADMIN SESSION ---
  describe('ADMIN Session Strict Role Enforcement', () => {
    it('ADMIN: student authentication (/api/student/*) = FAIL (403 Forbidden)', async () => {
      const req = createMockRequest('/api/student/auth/me', adminSessionId);
      await expect(requireRole(req, UserRole.STUDENT)).rejects.toThrow(
        expect.objectContaining({ statusCode: 403, errorCode: 'FORBIDDEN_ROLE' })
      );
    });

    it('ADMIN: teacher authentication (/api/teacher/*) = FAIL (403 Forbidden)', async () => {
      const req = createMockRequest('/api/teacher/auth/me', adminSessionId);
      await expect(requireRole(req, UserRole.TEACHER)).rejects.toThrow(
        expect.objectContaining({ statusCode: 403, errorCode: 'FORBIDDEN_ROLE' })
      );
    });

    it('ADMIN: admin authentication (/api/admin/*) = PASS', async () => {
      const req = createMockRequest('/api/admin/auth/me', adminSessionId);
      const session = await requireRole(req, UserRole.ADMIN);
      expect(session.role).toBe(UserRole.ADMIN);
    });
  });

  // --- UNAUTHENTICATED & MALFORMED REQUESTS ---
  describe('Unauthenticated & Malformed Request Enforcement', () => {
    it('Unauthenticated access = FAIL (401 Unauthorized)', async () => {
      const req = createMockRequest('/api/student/auth/me'); // No cookie
      await expect(requireRole(req, UserRole.STUDENT)).rejects.toThrow(
        expect.objectContaining({ statusCode: 401, errorCode: 'UNAUTHORIZED' })
      );
    });

    it('Malformed / Invalid session ID = FAIL (401 Unauthorized)', async () => {
      const req = createMockRequest('/api/student/auth/me', 'invalid-session-uuid-12345');
      await expect(requireRole(req, UserRole.STUDENT)).rejects.toThrow(
        expect.objectContaining({ statusCode: 401, errorCode: 'UNAUTHORIZED' })
      );
    });
  });
});
