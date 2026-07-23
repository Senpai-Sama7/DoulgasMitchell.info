import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { validateTrustedOrigin } from '@/lib/request';

// POST /api/admin/logout - Logout user
export async function POST(request: Request) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('admin-session')?.value;

    if (token) {
      await deleteSession(token);
    }

    // Clear cookie even when no server-side session record existed
    cookieStore.delete('admin-session');

    return ApiHandler.success(undefined, 'Signed out.');
  } catch (error) {
    return ApiHandler.internalServerError('Logout error', error);
  }
}
