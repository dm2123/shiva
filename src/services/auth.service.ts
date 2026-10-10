import { z } from 'zod';
import { randomUUID } from 'crypto';
import { UserRole, UserStatus, UserSession } from '@/types/auth';
import { UserDTO, StudentProfile, TeacherProfile, AdminProfile } from '@/types/models';
import {
  createUser,
  findUserByEmail,
  findUserById,
  createStudentProfile,
  createTeacherProfile,
  createAdminProfile,
  getStudentProfileByUserId,
  getTeacherProfileByUserId,
  getAdminProfileByUserId,
} from '@/lib/db';
import { hashPassword, verifyPassword, createServerSession, validateServerSession, revokeServerSession } from '@/lib/auth';

export const studentRegisterSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long'),
    email: z.string().trim().toLowerCase().email('Invalid email address format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    targetExam: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export async function registerStudentService(
  input: StudentRegisterInput,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserDTO; session: UserSession }> {
  const validated = studentRegisterSchema.parse(input);

  const existingUser = await findUserByEmail(validated.email);
  if (existingUser) {
    throw new Error('DUPLICATE_EMAIL: An account with this email already exists.');
  }

  const userId = randomUUID();
  const profileId = randomUUID();
  const passwordHash = await hashPassword(validated.password);

  // STRICT RULE: Self-registration ALWAYS sets role = UserRole.STUDENT
  const user = await createUser({
    id: userId,
    email: validated.email,
    passwordHash,
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    phoneVerified: false,
    emailVerified: false,
  });

  const profile: StudentProfile = await createStudentProfile({
    id: profileId,
    userId,
    fullName: validated.fullName,
    targetExam: validated.targetExam || 'General',
    enrolledAt: new Date().toISOString(),
  });

  const session = await createServerSession(userId, UserRole.STUDENT, user.email, ipAddress, userAgent);

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile,
  };

  return { user: userDto, session };
}

export async function loginService(
  input: LoginInput,
  expectedRole: UserRole,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserDTO; session: UserSession }> {
  const validated = loginSchema.parse(input);

  const user = await findUserByEmail(validated.email);
  if (!user) {
    throw new Error('INVALID_CREDENTIALS: User not found.');
  }

  // DB column is `password`; accept either mapped `passwordHash` or raw `password`
  const storedPasswordHash = (user as any).passwordHash || (user as any).password;
  const isPasswordValid = await verifyPassword(validated.password, storedPasswordHash);
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS: Invalid email or password.');
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new Error('ACCOUNT_SUSPENDED: Your account has been suspended. Please contact support.');
  }

  // STRICT RBAC CHECK: Verify database role matches expected portal role
  if (user.role !== expectedRole) {
    throw new Error(
      `INVALID_ROLE_FOR_PORTAL: Account role (${user.role}) is not authorized for ${expectedRole} login.`
    );
  }

  let profile: StudentProfile | TeacherProfile | AdminProfile | null = null;
  if (user.role === UserRole.STUDENT) {
    profile = await getStudentProfileByUserId(user.id);
  } else if (user.role === UserRole.TEACHER) {
    profile = await getTeacherProfileByUserId(user.id);
  } else if (user.role === UserRole.ADMIN) {
    profile = await getAdminProfileByUserId(user.id);
  }

  const session = await createServerSession(user.id, user.role, user.email, ipAddress, userAgent);

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile,
  };

  return { user: userDto, session };
}

export async function getCurrentUserService(session: UserSession): Promise<UserDTO> {
  const activeSession = await validateServerSession(session.sessionId);
  if (!activeSession) {
    throw new Error('INVALID_SESSION: Session has expired or been revoked.');
  }

  const user = await findUserById(activeSession.userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND: User account no longer exists.');
  }

  let profile: StudentProfile | TeacherProfile | AdminProfile | null = null;
  if (user.role === UserRole.STUDENT) {
    profile = await getStudentProfileByUserId(user.id);
  } else if (user.role === UserRole.TEACHER) {
    profile = await getTeacherProfileByUserId(user.id);
  } else if (user.role === UserRole.ADMIN) {
    profile = await getAdminProfileByUserId(user.id);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile,
  };
}

export async function logoutService(sessionId: string): Promise<void> {
  await revokeServerSession(sessionId);
}
