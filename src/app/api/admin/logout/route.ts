import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { validateTrustedOrigin } from '@/lib/request';

// POST /api/admin/logout - Logout user
export async function POST(request: Request) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('admin-session')?.value;
    
    if (token) {
      await deleteSession(token);
    }
    
    // Clear cookie
    cookieStore.delete('admin-session');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
