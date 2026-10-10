import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabase } from '@/lib/db';
import { clearAllSessions } from '@/lib/redis';
import { registerStudentService, loginService, logoutService, getCurrentUserService } from '@/services/auth.service';
import { provisionTeacherAccount, provisionAdminAccount } from '@/services/user.service';
import { UserRole } from '@/types/auth';

describe('Integration Tests: Authentication & Session Lifecycle', () => {
  beforeEach(async () => {
    await resetDatabase();
    await clearAllSessions();
  });

  it('allows public self-registration for STUDENT role ONLY', async () => {
    const { user, session } = await registerStudentService({
      fullName: 'Alice Student',
      email: 'alice@shiva.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      targetExam: 'NEET',
    });

    expect(user.email).toBe('alice@shiva.local');
    expect(user.role).toBe(UserRole.STUDENT);
    expect(session.userId).toBe(user.id);
    expect(session.role).toBe(UserRole.STUDENT);

    // Verify password hash is NOT returned in user DTO
    expect((user as any).passwordHash).toBeUndefined();
  });

  it('prevents duplicate student email registrations', async () => {
    await registerStudentService({
      fullName: 'Alice Student',
      email: 'alice@shiva.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    await expect(
      registerStudentService({
        fullName: 'Alice Duplicate',
        email: 'alice@shiva.local',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
    ).rejects.toThrow('DUPLICATE_EMAIL');
  });

  it('authenticates STUDENT login and rejects wrong passwords', async () => {
    await registerStudentService({
      fullName: 'Bob Student',
      email: 'bob@shiva.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    // Valid student login
    const { user, session } = await loginService(
      { email: 'bob@shiva.local', password: 'Password123!' },
      UserRole.STUDENT
    );
    expect(user.id).toBeDefined();
    expect(session.role).toBe(UserRole.STUDENT);

    // Invalid password
    await expect(
      loginService({ email: 'bob@shiva.local', password: 'WrongPassword123!' }, UserRole.STUDENT)
    ).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('rejects student login attempts at TEACHER or ADMIN portals', async () => {
    await registerStudentService({
      fullName: 'Charlie Student',
      email: 'charlie@shiva.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    // Attempt student login at Teacher portal
    await expect(
      loginService({ email: 'charlie@shiva.local', password: 'Password123!' }, UserRole.TEACHER)
    ).rejects.toThrow('INVALID_ROLE_FOR_PORTAL');

    // Attempt student login at Admin portal
    await expect(
      loginService({ email: 'charlie@shiva.local', password: 'Password123!' }, UserRole.ADMIN)
    ).rejects.toThrow('INVALID_ROLE_FOR_PORTAL');
  });

  it('authenticates TEACHER and ADMIN logins cleanly', async () => {
    await provisionTeacherAccount('teacher1@shiva.local', 'Teacher123!', 'Prof. Oak', '+919999999991', 'org-dsa-001');
    await provisionAdminAccount('admin1@shiva.local', 'Admin123!', 'Admin Root', 'IT');

    // Teacher login
    const teacherLogin = await loginService(
      { email: 'teacher1@shiva.local', password: 'Teacher123!' },
      UserRole.TEACHER
    );
    expect(teacherLogin.user.role).toBe(UserRole.TEACHER);

    // Admin login
    const adminLogin = await loginService(
      { email: 'admin1@shiva.local', password: 'Admin123!' },
      UserRole.ADMIN
    );
    expect(adminLogin.user.role).toBe(UserRole.ADMIN);
  });

  it('fetches current user and invalidates session on logout', async () => {
    const { session } = await registerStudentService({
      fullName: 'David Student',
      email: 'david@shiva.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    const userProfile = await getCurrentUserService(session);
    expect(userProfile.email).toBe('david@shiva.local');

    // Execute Logout
    await logoutService(session.sessionId);

    // Session should no longer be valid
    await expect(getCurrentUserService({ ...session, sessionId: session.sessionId })).rejects.toThrow();
  });
});
