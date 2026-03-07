import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD not configured' },
        { status: 500 }
      );
    }

    // Check if admin already exists
    const existing = await db.adminUser.findFirst();
    
    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        email: existing.email
      });
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const admin = await db.adminUser.create({
      data: {
        email: 'admin@douglasmitchell.info',
        name: 'Douglas Mitchell',
        passwordHash,
        role: 'admin',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email: admin.email
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
