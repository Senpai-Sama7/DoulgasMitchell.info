import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { DEFAULT_ADMIN_EMAIL } from '@/lib/admin-config';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { countAdminUsers, createAdminUser } from '@/lib/admin-compat';
import { rateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

const adminSetupSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const clientIp = await getClientIp(request);
    const limit = await rateLimit(clientIp, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
      prefix: 'admin-setup',
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many bootstrap attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const rawBody = await readJsonBody<Record<string, unknown>>(request);
    const parsed = adminSetupSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const requestedPassword = parsed.data.password;

    if (requestedPassword.trim().length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters (leading/trailing whitespace is ignored).' },
        { status: 400 }
      );
    }

    const adminEmail = parsed.data.email
      ? parsed.data.email.trim().toLowerCase()
      : env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const adminName = parsed.data.name?.trim() || 'Douglas Mitchell';
    
    const bootstrapAllowed = env.NODE_ENV !== 'production' || env.ALLOW_PUBLIC_ADMIN_SETUP === 'true';

    if (!bootstrapAllowed) {
      return NextResponse.json(
        { error: 'Admin bootstrap is disabled. Enable `ALLOW_PUBLIC_ADMIN_SETUP=true` temporarily if you need first-run setup.' },
        { status: 403 }
      );
    }

    if (env.NODE_ENV === 'production' && !env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Production bootstrap is disabled until ADMIN_PASSWORD is configured on the server.' },
        { status: 503 }
      );
    }

    const adminPassword = env.NODE_ENV === 'production' ? env.ADMIN_PASSWORD : requestedPassword;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Enter a password with at least 8 characters to initialize the admin account.' },
        { status: 400 }
      );
    }

    if (env.NODE_ENV === 'production') {
      const expected = env.ADMIN_PASSWORD ?? '';
      const trimmed = requestedPassword.trim();
      if (
        typeof trimmed !== 'string' ||
        trimmed.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(trimmed), Buffer.from(expected))
      ) {
        return NextResponse.json(
          { error: 'Provided bootstrap secret is invalid.' },
          { status: 403 }
        );
      }
    }

    // Check if admin already exists
    const existingCount = await countAdminUsers();
    if (existingCount > 0) {
      return NextResponse.json({
        error: 'Admin bootstrap is unavailable because an admin account already exists.',
      }, { status: 409 });
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
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      );
    }

    logger.error('Admin setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create admin user',
      },
      { status: 500 }
    );
  }
}
