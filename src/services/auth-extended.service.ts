/**
 * Extended Authentication Service with OTP Support
 * Handles:
 * - Student OTP registration
 * - Student OTP login
 * - Student password reset via OTP
 * - Teacher admin creation
 * - Teacher OTP login
 * - Teacher password management
 */

import { z } from 'zod';
import { randomUUID } from 'crypto';
import { UserRole, UserStatus, UserSession } from '@/types/auth';
import { UserDTO, User } from '@/types/models';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPhone,
  createStudentProfile,
  createTeacherProfile,
  getStudentProfileByUserId,
  getTeacherProfileByUserId,
  updateUserDb,
} from '@/lib/db';
import { hashPassword, verifyPassword, createServerSession } from '@/lib/auth';
import { otpService } from './otp.service';

// ─── VALIDATION SCHEMAS ─────────────────────────────────────────────────────

export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format')
  .or(z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'));

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

// Student Registration via OTP
export const studentOtpRegisterSchema = z.object({
  phone: phoneNumberSchema,
  otpSessionId: z.string().min(1, 'OTP session required'),
  otpCode: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  fullName: z.string().trim().min(2, 'Full name required'),
  email: z.string().email('Invalid email').optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
});

// Student OTP Login
export const studentOtpLoginSchema = z.object({
  phone: phoneNumberSchema,
  otpSessionId: z.string().min(1, 'OTP session required'),
  otpCode: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

// Student Password Login
export const studentPasswordLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

// Forgot Password Request
export const forgotPasswordRequestSchema = z.object({
  identifier: z.string().min(1, 'Email or phone required'), // email or phone
});

// Reset Password via OTP
export const resetPasswordSchema = z.object({
  identifier: z.string().min(1, 'Identifier required'),
  otpSessionId: z.string().min(1, 'OTP session required'),
  otpCode: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Change Password (authenticated user)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Teacher Admin Creation (by admin)
export const adminCreateTeacherSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name required'),
  phone: phoneNumberSchema,
  email: z.string().email('Invalid email').optional(),
  subjects: z.array(z.string()).optional(),
  educatorId: z.string().optional(),
});

// Teacher OTP Login
export const teacherOtpLoginSchema = z.object({
  phone: phoneNumberSchema,
  otpSessionId: z.string().min(1, 'OTP session required'),
  otpCode: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

// Teacher Password Login
export const teacherPasswordLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export type StudentOtpRegisterInput = z.infer<typeof studentOtpRegisterSchema>;
export type StudentOtpLoginInput = z.infer<typeof studentOtpLoginSchema>;
export type StudentPasswordLoginInput = z.infer<typeof studentPasswordLoginSchema>;
export type ForgotPasswordRequestInput = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AdminCreateTeacherInput = z.infer<typeof adminCreateTeacherSchema>;
export type TeacherOtpLoginInput = z.infer<typeof teacherOtpLoginSchema>;
export type TeacherPasswordLoginInput = z.infer<typeof teacherPasswordLoginSchema>;

// ─── STUDENT OTP REGISTRATION ───────────────────────────────────────────────

export async function sendStudentOtpService(phone: string): Promise<{ sessionId: string; message: string }> {
  const validated = phoneNumberSchema.parse(phone);
  
  try {
    otpService.trackLoginAttempt(validated);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  const result = await otpService.generateAndSendOtp(validated, 'phone');
  return {
    sessionId: result.sessionId,
    message: result.message,
  };
}

export async function verifyStudentOtpRegistrationService(
  input: StudentOtpRegisterInput,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserDTO; session: UserSession }> {
  const validated = studentOtpRegisterSchema.parse(input);

  // Verify OTP
  const otpResult = await otpService.verifyOtp(validated.otpSessionId, validated.otpCode);
  if (!otpResult.verified) {
    throw { code: 'INVALID_OTP', message: 'OTP verification failed', statusCode: 401 };
  }

  // Check for duplicate email
  if (validated.email) {
    const existingByEmail = await findUserByEmail(validated.email);
    if (existingByEmail) {
      throw { code: 'DUPLICATE_EMAIL', message: 'Email already registered', statusCode: 409 };
    }
  }

  // Check for duplicate phone
  const existingByPhone = await findUserByPhone(validated.phone);
  if (existingByPhone) {
    throw { code: 'DUPLICATE_PHONE', message: 'Phone already registered', statusCode: 409 };
  }

    // Create user and student profile
    const userId = randomUUID();
    const profileId = randomUUID();
    // Auto-generate password if not provided (phone-based login)
    const passwordHash = await hashPassword(validated.password || validated.phone);

  const user = await createUser({
    id: userId,
    email: validated.email || `student_${randomUUID()}@theshiva.local`,
    passwordHash,
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    phone: validated.phone,
    phoneVerified: true,
    emailVerified: !!validated.email,
  });

  const profile = await createStudentProfile({
    id: profileId,
    userId,
    fullName: validated.fullName,
    phone: validated.phone,
    targetExam: 'General',
    enrolledAt: new Date().toISOString(),
  });

  // Create session
  const session = await createServerSession(userId, UserRole.STUDENT, user.email, ipAddress, userAgent);

  // Consume OTP session (prevent reuse)
  await otpService.consumeOtpSession(validated.otpSessionId);

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile: profile,
  };

  return { user: userDto, session };
}

// ─── STUDENT OTP LOGIN ───────────────────────────────────────────────────────

export async function verifyStudentOtpLoginService(
  input: StudentOtpLoginInput,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserDTO; session: UserSession }> {
  const validated = studentOtpLoginSchema.parse(input);

  // Verify OTP
  const otpResult = await otpService.verifyOtp(validated.otpSessionId, validated.otpCode);
  if (!otpResult.verified) {
    throw { code: 'INVALID_OTP', message: 'OTP verification failed', statusCode: 401 };
  }

  // Find user by phone
  const user = await findUserByPhone(validated.phone);
  if (!user || user.role !== UserRole.STUDENT) {
    throw { code: 'USER_NOT_FOUND', message: 'Student account not found', statusCode: 404 };
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw { code: 'ACCOUNT_INACTIVE', message: 'Account is not active', statusCode: 403 };
  }

  // Create session
  const session = await createServerSession(user.id, user.role, user.email, ipAddress, userAgent);

  // Consume OTP session
  await otpService.consumeOtpSession(validated.otpSessionId);

  // Update last login
  await updateUserDb(user.id, { lastLoginAt: new Date().toISOString() });

  const profile = await getStudentProfileByUserId(user.id);

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile: profile,
  };

  return { user: userDto, session };
}

// ─── STUDENT PASSWORD LOGIN ─────────────────────────────────────────────────

export async function studentPasswordLoginService(
  input: StudentPasswordLoginInput,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserDTO; session: UserSession }> {
  const validated = studentPasswordLoginSchema.parse(input);

  const user = await findUserByEmail(validated.email);
  if (!user || user.role !== UserRole.STUDENT) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw { code: 'ACCOUNT_INACTIVE', message: 'Account is not active', statusCode: 403 };
  }

  const passwordValid = await verifyPassword(validated.password, (user as any).passwordHash || (user as any).password);
  if (!passwordValid) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
  }

  const session = await createServerSession(user.id, user.role, user.email, ipAddress, userAgent);
  await updateUserDb(user.id, { lastLoginAt: new Date().toISOString() });

  const profile = await getStudentProfileByUserId(user.id);

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile: profile,
  };

  return { user: userDto, session };
}

// ─── FORGOT PASSWORD ────────────────────────────────────────────────────────

export async function forgotPasswordRequestService(input: ForgotPasswordRequestInput): Promise<{ sessionId: string; message: string }> {
  const validated = forgotPasswordRequestSchema.parse(input);
  const identifier = validated.identifier.toLowerCase().trim();

  // Find user by email or phone
  let user: User | null = null;
  let contactMethod: 'email' | 'phone' = 'email';

  if (identifier.includes('@')) {
    user = await findUserByEmail(identifier);
    contactMethod = 'email';
  } else {
    user = await findUserByPhone(identifier);
    contactMethod = 'phone';
  }

  if (!user) {
    // Generic message to prevent user enumeration
    throw {
      code: 'FORGOT_PASSWORD_SENT',
      message: 'If an account matches these details, we will send recovery instructions.',
      statusCode: 200, // Return 200 to not reveal if user exists
    };
  }

  try {
    otpService.trackLoginAttempt(contactMethod === 'email' ? user.email : user.phone || user.email);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  const contact = contactMethod === 'email' ? user.email : user.phone;
  if (!contact) {
    throw {
      code: 'NO_CONTACT_METHOD',
      message: 'Account does not have a contact method configured',
      statusCode: 400,
    };
  }

  const result = await otpService.generateAndSendOtp(contact, contactMethod);
  return {
    sessionId: result.sessionId,
    message: result.message,
  };
}

// ─── RESET PASSWORD ─────────────────────────────────────────────────────────

export async function resetPasswordService(input: ResetPasswordInput): Promise<{ success: true; message: string }> {
  const validated = resetPasswordSchema.parse(input);
  const identifier = validated.identifier.toLowerCase().trim();

  // Verify OTP
  const otpResult = await otpService.verifyOtp(validated.otpSessionId, validated.otpCode);
  if (!otpResult.verified) {
    throw { code: 'INVALID_OTP', message: 'OTP verification failed', statusCode: 401 };
  }

  // Find user
  let user: User | null = null;
  if (identifier.includes('@')) {
    user = await findUserByEmail(identifier);
  } else {
    user = await findUserByPhone(identifier);
  }

  if (!user) {
    throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
  }

  // Update password
  const newPasswordHash = await hashPassword(validated.newPassword);
  await updateUserDb(user.id, { passwordHash: newPasswordHash });

  // Consume OTP session
  await otpService.consumeOtpSession(validated.otpSessionId);

  return { success: true, message: 'Password reset successful. Please log in with your new password.' };
}

// ─── CHANGE PASSWORD (Authenticated) ────────────────────────────────────────

export async function changePasswordService(userId: string, input: ChangePasswordInput): Promise<{ success: true; message: string }> {
  const validated = changePasswordSchema.parse(input);

  const user = await findUserById(userId);
  if (!user) {
    throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
  }

  // Verify current password
  const passwordValid = await verifyPassword(validated.currentPassword, user.passwordHash);
  if (!passwordValid) {
    throw { code: 'INVALID_PASSWORD', message: 'Current password is incorrect', statusCode: 401 };
  }

  // Update to new password
  const newPasswordHash = await hashPassword(validated.newPassword);
  await updateUserDb(userId, { passwordHash: newPasswordHash });

  return { success: true, message: 'Password changed successfully' };
}

// ─── TEACHER ADMIN CREATION ─────────────────────────────────────────────────

export async function adminCreateTeacherService(input: AdminCreateTeacherInput): Promise<{ user: UserDTO; temporaryMessage: string }> {
  const validated = adminCreateTeacherSchema.parse(input);

  // Check duplicate email
  if (validated.email) {
    const existingEmail = await findUserByEmail(validated.email);
    if (existingEmail) {
      throw { code: 'DUPLICATE_EMAIL', message: 'Email already registered', statusCode: 409 };
    }
  }

  // Check duplicate phone
  const existingPhone = await findUserByPhone(validated.phone);
  if (existingPhone) {
    throw { code: 'DUPLICATE_PHONE', message: 'Phone already registered', statusCode: 409 };
  }

  // Create temporary password (never shown to admin)
  const tempPassword = randomUUID().substring(0, 16);
  const passwordHash = await hashPassword(tempPassword);

  // Create user account
  const userId = randomUUID();
  const user = await createUser({
    id: userId,
    email: validated.email || `teacher_${randomUUID()}@theshiva.local`,
    passwordHash,
    role: UserRole.TEACHER,
    status: UserStatus.ACTIVE,
    phone: validated.phone,
    phoneVerified: false,
    emailVerified: !!validated.email,
  });

  // Create teacher profile
  const profileId = randomUUID();
  const profile = await createTeacherProfile({
    id: profileId,
    userId,
    fullName: validated.fullName,
    phone: validated.phone,
    email: validated.email,
    subjects: validated.subjects || [],
    educatorId: validated.educatorId,
    status: 'active',
    organizationId: 'default-org-id', // Added missing field
    phoneVerified: false,
    emailVerified: !!validated.email,
  });

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile: profile,
  };

  return {
    user: userDto,
    temporaryMessage: `Teacher account created. Teacher can log in using mobile OTP at /teacher/login`,
  };
}

// ─── TEACHER OTP LOGIN ───────────────────────────────────────────────────────

export async function verifyTeacherOtpLoginService(
  input: TeacherOtpLoginInput,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserDTO; session: UserSession }> {
  const validated = teacherOtpLoginSchema.parse(input);

  // Verify OTP
  const otpResult = await otpService.verifyOtp(validated.otpSessionId, validated.otpCode);
  if (!otpResult.verified) {
    throw { code: 'INVALID_OTP', message: 'OTP verification failed', statusCode: 401 };
  }

  // Find user by phone
  const user = await findUserByPhone(validated.phone);
  if (!user || user.role !== UserRole.TEACHER) {
    throw { code: 'USER_NOT_FOUND', message: 'Teacher account not found', statusCode: 404 };
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw { code: 'ACCOUNT_INACTIVE', message: 'Account is not active', statusCode: 403 };
  }

  // Create session
  const session = await createServerSession(user.id, user.role, user.email, ipAddress, userAgent);

  // Consume OTP session
  await otpService.consumeOtpSession(validated.otpSessionId);

  // Update last login
  await updateUserDb(user.id, { lastLoginAt: new Date().toISOString() });

  const profile = await getTeacherProfileByUserId(user.id);

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile: profile,
  };

  return { user: userDto, session };
}

// ─── TEACHER PASSWORD LOGIN ─────────────────────────────────────────────────

export async function teacherPasswordLoginService(
  input: TeacherPasswordLoginInput,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: UserDTO; session: UserSession }> {
  const validated = teacherPasswordLoginSchema.parse(input);

  const user = await findUserByEmail(validated.email);
  if (!user || user.role !== UserRole.TEACHER) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw { code: 'ACCOUNT_INACTIVE', message: 'Account is not active', statusCode: 403 };
  }

  const passwordValid = await verifyPassword(validated.password, user.passwordHash);
  if (!passwordValid) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
  }

  const session = await createServerSession(user.id, user.role, user.email, ipAddress, userAgent);
  await updateUserDb(user.id, { lastLoginAt: new Date().toISOString() });

  const profile = await getTeacherProfileByUserId(user.id);

  const userDto: UserDTO = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile: profile,
  };

  return { user: userDto, session };
}
