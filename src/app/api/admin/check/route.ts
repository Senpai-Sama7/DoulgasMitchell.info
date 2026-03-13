import { NextResponse } from 'next/server';
import { countAdminUsers } from '@/lib/admin-compat';

export async function GET() {
  try {
    const count = await countAdminUsers();
    return NextResponse.json({ 
      success: true, 
      adminCount: count,
      dbConnected: true
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dbConnected: false
    }, { status: 500 });
  }
}
