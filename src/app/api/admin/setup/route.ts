import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DEFAULT_ADMIN_EMAIL } from '@/lib/admin-config';
import { env } from '@/lib/env';
import { countAdminUsers, createAdminUser } from '@/lib/admin-compat';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const adminPassword =
      typeof body.password === 'string' && body.password.trim().length >= 8
        ? body.password.trim()
        : env.ADMIN_PASSWORD;
    const adminEmail =
      typeof body.email === 'string' && body.email.trim()
        ? body.email.trim().toLowerCase()
        : env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const adminName =
      typeof body.name === 'string' && body.name.trim()
        ? body.name.trim()
        : 'Douglas Mitchell';
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Enter a password with at least 8 characters to initialize the admin account.' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingCount = await countAdminUsers();
    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        email: adminEmail
      });
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const admin = await createAdminUser({
      email: adminEmail,
      name: adminName,
      passwordHash,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email: admin?.email || adminEmail
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
