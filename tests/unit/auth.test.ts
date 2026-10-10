import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { studentRegisterSchema } from '@/services/auth.service';
import { UserRole } from '@/types/auth';

describe('Unit Tests: Authentication & Password Security', () => {
  it('hashes passwords securely using bcrypt', async () => {
    const plain = 'StrongPass123!';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(hashed.startsWith('$2a$') || hashed.startsWith('$2b$')).toBe(true);

    const isValid = await verifyPassword(plain, hashed);
    expect(isValid).toBe(true);

    const isWrongValid = await verifyPassword('WrongPassword123!', hashed);
    expect(isWrongValid).toBe(false);
  });

  it('rejects short passwords under 8 characters', async () => {

    await expect(hashPassword('short')).rejects.toThrow();
  });

  it('validates student registration payload via Zod schema', () => {
    const validPayload = {
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      targetExam: 'JEE',
    };

    const parsed = studentRegisterSchema.parse(validPayload);
    expect(parsed.email).toBe('student@example.com');
  });

  it('rejects mismatched password and confirmPassword', () => {
    const invalidPayload = {
      fullName: 'Test Student',
      email: 'student@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    };

    expect(() => studentRegisterSchema.parse(invalidPayload)).toThrow();
  });

  it('enforces UserRole ENUM values strictly without Super Admin', () => {
    expect(Object.values(UserRole)).toEqual(['STUDENT', 'TEACHER', 'ADMIN', 'PARENT']);
    expect(UserRole.STUDENT).toBe('STUDENT');
    expect(UserRole.TEACHER).toBe('TEACHER');
    expect(UserRole.ADMIN).toBe('ADMIN');
    expect(UserRole.PARENT).toBe('PARENT');
    expect((UserRole as any).SUPERADMIN).toBeUndefined();
    expect((UserRole as any).SUPER_ADMIN).toBeUndefined();
  });
});
