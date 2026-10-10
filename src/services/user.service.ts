import { randomUUID } from 'crypto';
import { UserRole, UserStatus } from '@/types/auth';
import { UserDTO, TeacherProfile, AdminProfile } from '@/types/models';
import { createUser, createTeacherProfile, createAdminProfile } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function provisionTeacherAccount(
  email: string,
  plainPassword: string,
  fullName: string,
  phone: string,
  organizationId: string,
  qualification?: string,
  experienceYears?: number
): Promise<UserDTO> {
  const userId = randomUUID();
  const profileId = randomUUID();
  const passwordHash = await hashPassword(plainPassword);

  const user = await createUser({
    id: userId,
    email,
    passwordHash,
    role: UserRole.TEACHER,
    status: UserStatus.ACTIVE,
    phone,
    phoneVerified: false,
    emailVerified: false,
  });

  const profile: TeacherProfile = await createTeacherProfile({
    id: profileId,
    userId,
    fullName,
    phone,
    organizationId,
    qualification,
    experienceYears,
    status: 'active',
    phoneVerified: false,
    emailVerified: false,
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile,
  };
}

export async function provisionAdminAccount(
  email: string,
  plainPassword: string,
  fullName: string,
  department?: string
): Promise<UserDTO> {
  const userId = randomUUID();
  const profileId = randomUUID();
  const passwordHash = await hashPassword(plainPassword);

  const user = await createUser({
    id: userId,
    email,
    passwordHash,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    phoneVerified: false,
    emailVerified: false,
  });

  const profile: AdminProfile = await createAdminProfile({
    id: profileId,
    userId,
    fullName,
    department,
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    profile,
  };
}
