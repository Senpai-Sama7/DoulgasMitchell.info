import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const count = await db.adminUser.count();
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
