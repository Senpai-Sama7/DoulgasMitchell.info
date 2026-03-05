import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  withMiddleware,
  successResponse,
  AuthenticationError,
  ValidationError,
  validateInput,
} from '@/lib/middleware';
import {
  verifyPassword,
  hashPassword,
  validateSession,
} from '@/lib/security';
import { changeAdminPasswordSchema } from '@/lib/validations';

async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;

  if (!token) {
    throw new AuthenticationError('Authentication required');
  }

  const sessionResult = await validateSession(token);
  if (!sessionResult.valid || !sessionResult.userId) {
    throw new AuthenticationError('Authentication required');
  }

  const adminUser = await db.adminUser.findUnique({ where: { id: sessionResult.userId } });
  if (!adminUser) {
    throw new AuthenticationError('Authentication required');
  }

  return adminUser;
}

async function handleChangePassword(request: NextRequest): Promise<NextResponse> {
  const adminUser = await getAuthenticatedUser(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  const data = validateInput(changeAdminPasswordSchema, body);

  const isValid = await verifyPassword(data.currentPassword, adminUser.passwordHash);
  if (!isValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  if (data.currentPassword === data.newPassword) {
    throw new ValidationError('New password must differ from the current password');
  }

  const newHash = await hashPassword(data.newPassword);

  await db.adminUser.update({
    where: { id: adminUser.id },
    data: { passwordHash: newHash },
  });

  return successResponse(undefined, 'Password updated successfully');
}

export const PUT = withMiddleware(handleChangePassword);
