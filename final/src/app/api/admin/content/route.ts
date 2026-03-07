import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAdminContentSnapshot } from '@/lib/content-service';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snapshot = await getAdminContentSnapshot();
  return NextResponse.json({ success: true, ...snapshot });
}
